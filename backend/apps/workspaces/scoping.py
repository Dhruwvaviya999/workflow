"""
Reusable workspace-scoping primitives.

Every workspace-scoped feature (projects, tasks, documents) shares the same
two concerns:

1. A user may only ever see rows belonging to a workspace they're a member of.
2. Reads are open to any member; some writes are restricted to admins/owners.

This module centralizes both so feature apps stay tiny and consistent.
"""
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated

from .models import Membership, WorkspaceRole


def get_membership(user, workspace):
    """Return the user's Membership for a workspace, or None."""
    if workspace is None or not user or not user.is_authenticated:
        return None
    return Membership.objects.filter(workspace=workspace, user=user).first()


def is_admin_or_owner(user, workspace):
    membership = get_membership(user, workspace)
    return membership is not None and membership.role in {
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
    }


class IsWorkspaceMemberForObject(BasePermission):
    """Object-level: any member of the row's workspace may access it."""

    message = "You must be a member of this workspace."

    def has_object_permission(self, request, view, obj):
        return get_membership(request.user, getattr(obj, "workspace", None)) is not None


class IsWorkspaceAdminForObject(BasePermission):
    """Object-level: only owners/admins of the row's workspace (destructive ops)."""

    message = "Only workspace owners or admins can perform this action."

    def has_object_permission(self, request, view, obj):
        # Reads still allowed for any member; restriction applies to writes.
        if request.method in SAFE_METHODS:
            return get_membership(request.user, getattr(obj, "workspace", None)) is not None
        return is_admin_or_owner(request.user, getattr(obj, "workspace", None))


class WorkspaceScopedViewSet(viewsets.ModelViewSet):
    """
    Base viewset for workspace-scoped resources.

    Subclasses set:
      - queryset / serializer_class (as usual)
      - workspace_path: ORM lookup from the model to its workspace's members
        (default "workspace__memberships__user")
      - admin_actions: action names that require owner/admin (default {"destroy"})

    It guarantees tenant isolation via get_queryset and applies the right
    permission class per action.
    """

    workspace_path = "workspace__memberships__user"
    admin_actions = {"destroy"}

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(**{self.workspace_path: self.request.user})
            .distinct()
        )

    def get_permissions(self):
        if self.action in self.admin_actions:
            return [IsAuthenticated(), IsWorkspaceAdminForObject()]
        return [IsAuthenticated(), IsWorkspaceMemberForObject()]

    def require_membership(self, workspace, admin_only=False):
        """Guard used in perform_create where there's no object yet."""
        if admin_only:
            if not is_admin_or_owner(self.request.user, workspace):
                raise PermissionDenied(
                    "Only workspace owners or admins can do this."
                )
        elif get_membership(self.request.user, workspace) is None:
            raise PermissionDenied("You must be a member of this workspace.")
