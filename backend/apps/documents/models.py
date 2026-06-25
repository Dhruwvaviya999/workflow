"""
Document model + file storage.

Files are saved through Django's storage API (FileField), so moving to S3 or
Cloudinary later is purely a settings change (STORAGES["default"]) — this model
and its views don't change. `file_type` and `file_size` are derived from the
uploaded file on save, so the frontend can render/filter without touching the
blob. AI processing is intentionally NOT part of this phase.
"""
import os

from django.conf import settings
from django.db import models

from apps.common.models import BaseModel
from apps.projects.models import Project
from apps.workspaces.models import Workspace


def document_upload_path(instance, filename):
    """Namespace uploads per workspace: documents/<workspace_id>/<filename>."""
    return f"documents/{instance.workspace_id}/{filename}"


class Document(BaseModel):
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    # Optional link to a project; a document can be workspace-level.
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    file = models.FileField(upload_to=document_upload_path)
    # Lowercase extension without the dot, e.g. "pdf"; derived on save.
    file_type = models.CharField(max_length=30, blank=True)
    file_size = models.BigIntegerField(default=0)  # bytes

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_documents",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["workspace", "file_type"]),
            models.Index(fields=["project"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            ext = os.path.splitext(self.file.name)[1].lstrip(".").lower()
            self.file_type = ext[:30]
            try:
                self.file_size = self.file.size
            except (ValueError, OSError):
                # File already persisted / not re-uploaded — keep existing size.
                pass
        super().save(*args, **kwargs)
