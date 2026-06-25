"""django-filter FilterSet for tasks."""
import django_filters as filters

from .models import Task


class TaskFilter(filters.FilterSet):
    workspace = filters.CharFilter(field_name="workspace__slug")
    project = filters.UUIDFilter(field_name="project__id")
    status = filters.CharFilter(field_name="status")
    priority = filters.CharFilter(field_name="priority")
    assignee = filters.UUIDFilter(field_name="assignee__id")
    # Date range helpers: ?due_before=2026-07-01&due_after=2026-06-01
    due_before = filters.DateFilter(field_name="due_date", lookup_expr="lte")
    due_after = filters.DateFilter(field_name="due_date", lookup_expr="gte")

    class Meta:
        model = Task
        fields = [
            "workspace",
            "project",
            "status",
            "priority",
            "assignee",
            "due_before",
            "due_after",
        ]
