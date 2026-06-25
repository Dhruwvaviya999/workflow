"""Project API."""
from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.mixins import AuditUpdateMixin
from apps.workspaces.scoping import WorkspaceScopedViewSet

from .filters import ProjectFilter
from .models import Project
from .serializers import ProjectSerializer, ProjectWriteSerializer


class ProjectViewSet(AuditUpdateMixin, WorkspaceScopedViewSet):
    """
    /projects/

    list      — projects in the caller's workspaces (filter by ?workspace=slug)
    create    — any workspace member
    retrieve  — any member
    update    — any member
    destroy   — owner/admin only
    archive   — owner/admin only (POST /projects/{id}/archive/)
    unarchive — owner/admin only (POST /projects/{id}/unarchive/)
    """

    queryset = Project.objects.select_related(
        "workspace", "owner", "created_by", "updated_by"
    ).annotate(task_count=Count("tasks", distinct=True))

    filterset_class = ProjectFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "updated_at", "name", "status"]
    ordering = ["-created_at"]

    # archive/unarchive are restricted alongside destroy.
    admin_actions = {"destroy", "archive", "unarchive"}

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProjectWriteSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        workspace = serializer.validated_data["workspace"]
        self.require_membership(workspace)
        serializer.save(
            owner=self.request.user,
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        self.perform_create(write)
        read = ProjectSerializer(
            self.get_queryset().get(pk=write.instance.pk),
            context=self.get_serializer_context(),
        )
        return Response(read.data, status=201)

    def _set_archived(self, request, archived):
        project = self.get_object()
        project.set_archived(archived)
        project.updated_by = request.user
        project.save(update_fields=["archived", "archived_at", "updated_by", "updated_at"])
        serializer = ProjectSerializer(
            self.get_queryset().get(pk=project.pk),
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        return self._set_archived(request, True)

    @action(detail=True, methods=["post"])
    def unarchive(self, request, pk=None):
        return self._set_archived(request, False)
