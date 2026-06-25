"""Task routes (mounted under /api/v1/tasks/)."""
from rest_framework.routers import DefaultRouter

from .views import TaskViewSet

app_name = "tasks"

router = DefaultRouter()
router.register("", TaskViewSet, basename="task")

urlpatterns = router.urls
