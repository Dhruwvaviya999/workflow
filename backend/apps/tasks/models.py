"""
Task model.

A Task belongs to a Project. We also denormalize `workspace` onto the Task:
it's always equal to project.workspace, but storing it directly makes
workspace-scoped queries and permission checks a single, index-friendly hop
(no join through Project on every list/filter).
"""
from django.conf import settings
from django.db import models

from apps.common.models import AuthoredModel
from apps.projects.models import Project
from apps.workspaces.models import Workspace


class TaskStatus(models.TextChoices):
    TODO = "todo", "To do"
    IN_PROGRESS = "in_progress", "In progress"
    REVIEW = "review", "Review"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class TaskPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


class Task(AuthoredModel):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    # Denormalized from project for fast scoping/filtering (kept in sync in save).
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO
    )
    priority = models.CharField(
        max_length=20, choices=TaskPriority.choices, default=TaskPriority.MEDIUM
    )

    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reported_tasks",
    )

    due_date = models.DateField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    estimated_hours = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    # Free-form labels, stored as a JSON list of strings (DB-agnostic).
    labels = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["workspace", "status"]),
            models.Index(fields=["project", "status"]),
            models.Index(fields=["assignee"]),
            models.Index(fields=["due_date"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Guarantee the denormalized workspace always matches the project.
        if self.project_id:
            self.workspace_id = self.project.workspace_id
        super().save(*args, **kwargs)
