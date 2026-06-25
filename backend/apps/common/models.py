"""
Reusable abstract base models.

Every future feature model (workspaces, projects, tasks, documents...) should
inherit from TimeStampedModel so created/updated tracking is consistent and
free.
"""
import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Adds self-managing created_at / updated_at timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class UUIDModel(models.Model):
    """Uses a non-sequential UUID primary key (safer to expose in URLs)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel):
    """Convenience base: UUID primary key + timestamps."""

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class AuthoredModel(BaseModel):
    """
    BaseModel + audit columns tracking who created/last-updated the row.

    The viewsets (via AuditMixin) populate these automatically from the
    request user, so feature code never sets them by hand.
    """

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    updated_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]
