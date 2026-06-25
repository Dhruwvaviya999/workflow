"""
Project model.

A Project is the first workspace-scoped business object. Tasks (next module)
hang off Projects; Documents may optionally reference a Project. Slugs are
unique *within* a workspace, so two workspaces can both have a "website"
project.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from apps.common.models import AuthoredModel
from apps.workspaces.models import Workspace


class ProjectStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    ON_HOLD = "on_hold", "On hold"
    COMPLETED = "completed", "Completed"


class Project(AuthoredModel):
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, blank=True)
    description = models.TextField(blank=True)
    # Hex color used by the UI for visual grouping, e.g. "#4f46e5".
    color = models.CharField(max_length=9, blank=True, default="#6366f1")
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.ACTIVE,
    )
    archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="owned_projects",
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "slug"],
                name="unique_project_slug_per_workspace",
            )
        ]
        indexes = [
            models.Index(fields=["workspace", "status"]),
            models.Index(fields=["workspace", "archived"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        base = slugify(self.name) or "project"
        slug = base
        counter = 2
        siblings = Project.objects.filter(workspace=self.workspace).exclude(pk=self.pk)
        while siblings.filter(slug=slug).exists():
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    def set_archived(self, archived: bool):
        self.archived = archived
        self.archived_at = timezone.now() if archived else None
