"""Document serializers (read / write/upload)."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.projects.models import Project
from apps.workspaces.models import Workspace

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Read representation. `file` is exposed as an absolute URL."""

    uploaded_by = UserSerializer(read_only=True)
    workspace = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    project = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "workspace",
            "project",
            "title",
            "description",
            "file_url",
            "file_type",
            "file_size",
            "uploaded_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


class DocumentWriteSerializer(serializers.ModelSerializer):
    """
    Multipart upload serializer.

    `workspace` (slug) is required on create. `project` (slug, optional) must
    belong to the same workspace. On update the file/workspace are immutable;
    only metadata (title/description/project) changes.
    """

    workspace = serializers.SlugRelatedField(
        slug_field="slug", queryset=Workspace.objects.all(), required=False
    )
    project = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Project.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Document
        fields = ("id", "workspace", "project", "title", "description", "file")
        read_only_fields = ("id",)

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate(self, attrs):
        is_create = self.instance is None

        if is_create:
            if not attrs.get("workspace"):
                raise serializers.ValidationError(
                    {"workspace": "This field is required."}
                )
            if not attrs.get("file"):
                raise serializers.ValidationError(
                    {"file": "A file is required."}
                )
        else:
            # Immutable on update.
            attrs.pop("workspace", None)
            attrs.pop("file", None)

        workspace = attrs.get("workspace") or getattr(self.instance, "workspace", None)
        project = attrs.get("project", serializers.empty)
        if project not in (serializers.empty, None) and workspace is not None:
            if project.workspace_id != workspace.id:
                raise serializers.ValidationError(
                    {"project": "Project must belong to the same workspace."}
                )
        return attrs
