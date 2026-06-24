"""
Workspace + membership models.

This is the multi-tenant backbone of the product. Every future feature
(projects, tasks, documents, comments, activity logs, AI summaries) will be
scoped to a Workspace via a ForeignKey, and access will be gated through
Membership. Designing this cleanly now keeps later phases unblocked.
"""
from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.common.models import BaseModel


class WorkspaceRole(models.TextChoices):
    """Roles a user can hold within a single workspace."""

    OWNER = "owner", "Owner"
    ADMIN = "admin", "Admin"
    MEMBER = "member", "Member"


class Workspace(BaseModel):
    """A tenant container that owns all workspace-scoped data."""

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="owned_workspaces",
    )
    # Convenience M2M; the source of truth for access is the Membership table.
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="Membership",
        related_name="workspaces",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        base = slugify(self.name) or "workspace"
        slug = base
        counter = 2
        while Workspace.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base}-{counter}"
            counter += 1
        return slug


class Membership(BaseModel):
    """Join table linking a user to a workspace with a role."""

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    role = models.CharField(
        max_length=20,
        choices=WorkspaceRole.choices,
        default=WorkspaceRole.MEMBER,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "user"],
                name="unique_workspace_membership",
            )
        ]

    def __str__(self):
        return f"{self.user} @ {self.workspace} ({self.role})"

    @property
    def is_owner(self):
        return self.role == WorkspaceRole.OWNER

    @property
    def is_admin(self):
        return self.role in {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}
