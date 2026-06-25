"""Task serializers (read / write / assign / status)."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.projects.models import Project
from apps.workspaces.models import Membership

from .models import Task, TaskPriority, TaskStatus


class ProjectBriefSerializer(serializers.ModelSerializer):
    """Minimal project info embedded in task reads."""

    class Meta:
        model = Project
        fields = ("id", "name", "slug")


class TaskSerializer(serializers.ModelSerializer):
    """Read representation."""

    project = ProjectBriefSerializer(read_only=True)
    workspace = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    assignee = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "workspace",
            "title",
            "description",
            "status",
            "priority",
            "assignee",
            "reporter",
            "due_date",
            "start_date",
            "estimated_hours",
            "labels",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class TaskWriteSerializer(serializers.ModelSerializer):
    """Create/update. `project` is required on create and immutable after."""

    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    assignee_id = serializers.UUIDField(
        required=False, allow_null=True, write_only=True
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "title",
            "description",
            "status",
            "priority",
            "assignee_id",
            "due_date",
            "start_date",
            "estimated_hours",
            "labels",
        )
        read_only_fields = ("id",)

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_estimated_hours(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Estimated hours cannot be negative.")
        return value

    def validate_labels(self, value):
        if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
            raise serializers.ValidationError("Labels must be a list of strings.")
        return value

    def validate(self, attrs):
        # project is immutable on update.
        if self.instance is not None:
            attrs.pop("project", None)

        project = attrs.get("project") or getattr(self.instance, "project", None)

        # due_date must not precede start_date when both are provided.
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        due = attrs.get("due_date", getattr(self.instance, "due_date", None))
        if start and due and due < start:
            raise serializers.ValidationError(
                {"due_date": "Due date cannot be before the start date."}
            )

        # An assignee must be a member of the task's workspace.
        assignee_id = attrs.get("assignee_id", serializers.empty)
        if assignee_id not in (serializers.empty, None) and project is not None:
            is_member = Membership.objects.filter(
                workspace=project.workspace, user_id=assignee_id
            ).exists()
            if not is_member:
                raise serializers.ValidationError(
                    {"assignee_id": "Assignee must be a member of the workspace."}
                )
        return attrs

    # Note: `assignee_id` maps straight onto the Task.assignee FK column, so
    # ModelSerializer's default create/update handle it without extra code.


class TaskAssignSerializer(serializers.Serializer):
    """Body for the assign action: { "assignee_id": "<uuid|null>" }."""

    assignee_id = serializers.UUIDField(allow_null=True)


class TaskStatusSerializer(serializers.Serializer):
    """Body for the status action: { "status": "in_progress" }."""

    status = serializers.ChoiceField(choices=TaskStatus.choices)
