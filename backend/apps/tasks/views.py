"""Task API."""
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.mixins import AuditUpdateMixin
from apps.workspaces.scoping import WorkspaceScopedViewSet

from .filters import TaskFilter
from .models import Task
from .serializers import (
    TaskAssignSerializer,
    TaskSerializer,
    TaskStatusSerializer,
    TaskWriteSerializer,
)


class TaskViewSet(AuditUpdateMixin, WorkspaceScopedViewSet):
    """
    /tasks/

    list     — tasks in the caller's workspaces
               (filter by ?workspace=slug, ?project=<id>, ?status=, ?priority=,
                ?assignee=<id>, ?due_before=, ?due_after=; ?search=, ?ordering=)
    create   — any workspace member (reporter defaults to the caller)
    update   — any member
    destroy  — any member (tasks are cheap; not admin-gated)
    assign   — PATCH /tasks/{id}/assign/  { assignee_id }
    status   — PATCH /tasks/{id}/status/  { status }
    """

    queryset = Task.objects.select_related(
        "project", "workspace", "assignee", "reporter", "created_by", "updated_by"
    )

    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "due_date", "priority", "status"]
    ordering = ["-created_at"]

    # Members manage their own tasks freely; nothing is admin-only here.
    admin_actions = set()

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return TaskWriteSerializer
        if self.action == "assign":
            return TaskAssignSerializer
        if self.action == "set_status":
            return TaskStatusSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        self.require_membership(project.workspace)
        serializer.save(
            reporter=self.request.user,
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        self.perform_create(write)
        read = TaskSerializer(
            self.get_queryset().get(pk=write.instance.pk),
            context=self.get_serializer_context(),
        )
        return Response(read.data, status=201)

    def _read_response(self, task):
        serializer = TaskSerializer(
            self.get_queryset().get(pk=task.pk),
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def assign(self, request, pk=None):
        task = self.get_object()
        serializer = TaskAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.assignee_id = serializer.validated_data["assignee_id"]
        task.updated_by = request.user
        task.save(update_fields=["assignee", "updated_by", "updated_at"])
        return self._read_response(task)

    @action(detail=True, methods=["patch"], url_path="status")
    def set_status(self, request, pk=None):
        task = self.get_object()
        serializer = TaskStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.status = serializer.validated_data["status"]
        task.updated_by = request.user
        task.save(update_fields=["status", "updated_by", "updated_at"])
        return self._read_response(task)
