"""Project serializers (read / write)."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.workspaces.models import Workspace

from .models import Project, ProjectStatus


class ProjectSerializer(serializers.ModelSerializer):
    """Read representation returned by list/retrieve."""

    owner = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    workspace = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "workspace",
            "name",
            "slug",
            "description",
            "color",
            "status",
            "archived",
            "archived_at",
            "owner",
            "created_by",
            "updated_by",
            "task_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ProjectWriteSerializer(serializers.ModelSerializer):
    """
    Create/update serializer.

    On create, `workspace` (a slug) is required and the caller's membership is
    checked in the view. On update, workspace is immutable.
    """

    workspace = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Workspace.objects.all(),
        required=False,
    )

    class Meta:
        model = Project
        fields = ("id", "workspace", "name", "description", "color", "status")
        read_only_fields = ("id",)

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be empty.")
        return value

    def validate_status(self, value):
        if value not in ProjectStatus.values:
            raise serializers.ValidationError("Invalid status.")
        return value

    def validate(self, attrs):
        if self.instance is None:
            # Create: workspace is required.
            if not attrs.get("workspace"):
                raise serializers.ValidationError(
                    {"workspace": "This field is required."}
                )
        else:
            # Update: workspace is immutable.
            attrs.pop("workspace", None)
        return attrs
