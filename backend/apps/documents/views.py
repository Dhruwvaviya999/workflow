"""Document API (upload / list / update / delete / download)."""
from django.http import FileResponse, Http404
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.workspaces.scoping import WorkspaceScopedViewSet

from .filters import DocumentFilter
from .models import Document
from .serializers import DocumentSerializer, DocumentWriteSerializer


class DocumentViewSet(WorkspaceScopedViewSet):
    """
    /documents/

    list     — documents in the caller's workspaces
               (filter by ?workspace=slug, ?project=slug, ?file_type=pdf)
    create   — upload (multipart/form-data) — any workspace member
    update   — metadata only (title/description/project) — any member
    destroy  — owner/admin only
    download — GET /documents/{id}/download/ — streams the file
    """

    queryset = Document.objects.select_related(
        "workspace", "project", "uploaded_by"
    )
    parser_classes = [MultiPartParser, FormParser]

    filterset_class = DocumentFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "title", "file_size"]
    ordering = ["-created_at"]

    # Deleting a document is owner/admin-only.
    admin_actions = {"destroy"}

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return DocumentWriteSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        workspace = serializer.validated_data["workspace"]
        self.require_membership(workspace)
        serializer.save(uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        self.perform_create(write)
        read = DocumentSerializer(
            self.get_queryset().get(pk=write.instance.pk),
            context=self.get_serializer_context(),
        )
        return Response(read.data, status=201)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        document = self.get_object()  # enforces membership via object permission
        if not document.file:
            raise Http404("No file attached to this document.")
        response = FileResponse(document.file.open("rb"), as_attachment=True)
        return response
