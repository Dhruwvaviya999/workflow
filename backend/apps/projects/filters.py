"""django-filter FilterSet for projects."""
import django_filters as filters

from .models import Project


class ProjectFilter(filters.FilterSet):
    # Scope a listing to a single workspace by slug: ?workspace=acme-inc
    workspace = filters.CharFilter(field_name="workspace__slug")
    status = filters.CharFilter(field_name="status")
    archived = filters.BooleanFilter(field_name="archived")
    owner = filters.UUIDFilter(field_name="owner__id")

    class Meta:
        model = Project
        fields = ["workspace", "status", "archived", "owner"]
