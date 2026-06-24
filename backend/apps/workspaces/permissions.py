"""
Workspace access control.

Enforced on the backend (never trust the frontend). Object-level checks read
the requesting user's Membership for the workspace in question.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Membership, WorkspaceRole


def get_membership(user, workspace):
    """Return the user's Membership for a workspace, or None."""
    if not user or not user.is_authenticated:
        return None
    return Membership.objects.filter(workspace=workspace, user=user).first()


class IsWorkspaceMember(BasePermission):
    """
    Read access for any member; write access only for admins/owners.

    - Safe methods (GET/HEAD/OPTIONS): any member of the workspace.
    - Unsafe methods (PATCH/PUT/DELETE): owner or admin only.
    """

    message = "You do not have permission to access this workspace."

    def has_object_permission(self, request, view, obj):
        membership = get_membership(request.user, obj)
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}


class IsWorkspaceOwner(BasePermission):
    """Only the workspace owner (used for destructive actions like delete)."""

    message = "Only the workspace owner can perform this action."

    def has_object_permission(self, request, view, obj):
        membership = get_membership(request.user, obj)
        return membership is not None and membership.role == WorkspaceRole.OWNER
