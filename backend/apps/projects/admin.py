from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "workspace", "status", "archived", "owner", "created_at")
    list_filter = ("status", "archived")
    search_fields = ("name", "slug", "workspace__name")
    autocomplete_fields = ("workspace", "owner", "created_by", "updated_by")
    readonly_fields = ("created_at", "updated_at")
