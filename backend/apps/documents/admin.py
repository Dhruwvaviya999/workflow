from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "workspace", "project", "file_type", "file_size", "created_at")
    list_filter = ("file_type",)
    search_fields = ("title", "description", "workspace__name")
    autocomplete_fields = ("workspace", "project", "uploaded_by")
    readonly_fields = ("file_type", "file_size", "created_at", "updated_at")
