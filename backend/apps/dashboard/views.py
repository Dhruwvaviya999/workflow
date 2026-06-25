"""
Dashboard summary endpoint.

GET /api/v1/dashboard/?workspace=<slug>

Returns aggregate counts + recent items for a single workspace. Uses a small,
fixed number of queries (conditional aggregation) rather than counting in
Python, so it stays cheap as data grows.
"""
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documents.models import Document
from apps.projects.models import Project, ProjectStatus
from apps.projects.serializers import ProjectSerializer
from apps.tasks.models import Task, TaskStatus
from apps.tasks.serializers import TaskSerializer
from apps.workspaces.models import Workspace
from apps.workspaces.scoping import get_membership

OPEN_TASK_STATUSES = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
]


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="workspace",
                required=True,
                type=str,
                description="Workspace slug to summarize.",
            )
        ],
        responses={200: None},
        tags=["dashboard"],
    )
    def get(self, request):
        slug = request.query_params.get("workspace")
        if not slug:
            raise ValidationError({"workspace": "This query parameter is required."})

        workspace = Workspace.objects.filter(slug=slug).first()
        if workspace is None or get_membership(request.user, workspace) is None:
            # Same 404 whether it doesn't exist or you can't see it.
            raise NotFound("Workspace not found.")

        today = timezone.now().date()

        # --- Projects (one query, conditional aggregation) ---
        # NB: aggregate aliases must NOT match a model field used inside their
        # own filter (e.g. "archived"), or Django resolves the field name to
        # the aggregate and raises FieldError.
        project_stats = Project.objects.filter(workspace=workspace).aggregate(
            total=Count("id"),
            archived_count=Count("id", filter=Q(archived=True)),
            active_count=Count(
                "id",
                filter=Q(archived=False, status=ProjectStatus.ACTIVE),
            ),
        )

        # --- Tasks (one query) ---
        task_stats = Task.objects.filter(workspace=workspace).aggregate(
            total=Count("id"),
            completed=Count("id", filter=Q(status=TaskStatus.COMPLETED)),
            pending=Count("id", filter=Q(status__in=OPEN_TASK_STATUSES)),
            overdue=Count(
                "id",
                filter=Q(due_date__lt=today, status__in=OPEN_TASK_STATUSES),
            ),
        )

        documents_uploaded = Document.objects.filter(workspace=workspace).count()

        recent_projects = (
            Project.objects.filter(workspace=workspace)
            .select_related("workspace", "owner", "created_by", "updated_by")
            .annotate(task_count=Count("tasks", distinct=True))
            .order_by("-created_at")[:5]
        )
        recent_tasks = (
            Task.objects.filter(workspace=workspace)
            .select_related("project", "workspace", "assignee", "reporter")
            .order_by("-created_at")[:5]
        )

        ctx = {"request": request}
        return Response(
            {
                "workspace": workspace.slug,
                "projects": {
                    "total": project_stats["total"],
                    "active": project_stats["active_count"],
                    "archived": project_stats["archived_count"],
                },
                "tasks": {
                    "total": task_stats["total"],
                    "completed": task_stats["completed"],
                    "pending": task_stats["pending"],
                    "overdue": task_stats["overdue"],
                },
                "documents": {"total": documents_uploaded},
                "recent_projects": ProjectSerializer(
                    recent_projects, many=True, context=ctx
                ).data,
                "recent_tasks": TaskSerializer(
                    recent_tasks, many=True, context=ctx
                ).data,
            }
        )
