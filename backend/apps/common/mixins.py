"""Reusable DRF viewset mixins."""


class AuditUpdateMixin:
    """
    Stamps `updated_by` with the request user on every update.

    Create-time stamping (created_by/updated_by + resource-specific fields like
    owner/reporter/uploaded_by) is done in each viewset's perform_create, since
    those extras vary per resource.
    """

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
