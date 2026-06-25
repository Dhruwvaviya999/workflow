"""django-filter FilterSet for documents."""
import django_filters as filters

from .models import Document


class DocumentFilter(filters.FilterSet):
    workspace = filters.CharFilter(field_name="workspace__slug")
    project = filters.CharFilter(field_name="project__slug")
    file_type = filters.CharFilter(field_name="file_type", lookup_expr="iexact")

    class Meta:
        model = Document
        fields = ["workspace", "project", "file_type"]
