"""Document routes (mounted under /api/v1/documents/)."""
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet

app_name = "documents"

router = DefaultRouter()
router.register("", DocumentViewSet, basename="document")

urlpatterns = router.urls
