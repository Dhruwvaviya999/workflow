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
