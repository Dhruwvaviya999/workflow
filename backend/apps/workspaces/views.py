"""Workspace API — CRUD scoped to the requesting user's memberships."""
from django.db import transaction
from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Membership, Workspace, WorkspaceRole
from .permissions import IsWorkspaceMember, IsWorkspaceOwner
from .serializers import (
    MembershipSerializer,
    WorkspaceCreateSerializer,
    WorkspaceSerializer,
)


class WorkspaceViewSet(viewsets.ModelViewSet):
    """
    /workspaces/

    list    — workspaces the current user belongs to
    create  — create a workspace (caller becomes OWNER)
    retrieve/update — members read; owners/admins write
    destroy — owner only
    members — list members of a workspace
    """

    lookup_field = "slug"

    def get_queryset(self):
        # Only ever expose workspaces the user is a member of (multi-tenant
        # isolation). Prefetch memberships+users to keep serialization cheap.
        user = self.request.user
        return (
            Workspace.objects.filter(memberships__user=user)
            .select_related("owner")
            .prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=Membership.objects.select_related("user"),
                )
            )
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "create":
            return WorkspaceCreateSerializer
        return WorkspaceSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsWorkspaceOwner()]
        if self.action in {"retrieve", "update", "partial_update", "members"}:
            return [IsAuthenticated(), IsWorkspaceMember()]
        # list / create only need authentication.
        return [IsAuthenticated()]

    @transaction.atomic
    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        # Creator is automatically the owner-member.
        Membership.objects.create(
            workspace=workspace,
            user=self.request.user,
            role=WorkspaceRole.OWNER,
        )

    def create(self, request, *args, **kwargs):
        # Create with the write serializer, then echo the full read shape.
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        self.perform_create(write)
        read = WorkspaceSerializer(write.instance, context=self.get_serializer_context())
        headers = self.get_success_headers(read.data)
        return Response(read.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["get"])
    def members(self, request, slug=None):
        workspace = self.get_object()  # runs IsWorkspaceMember check
        qs = workspace.memberships.select_related("user").all()
        serializer = MembershipSerializer(qs, many=True, context=self.get_serializer_context())
        return Response(serializer.data)
