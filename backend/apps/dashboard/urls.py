"""Dashboard routes (mounted under /api/v1/dashboard/)."""
from django.urls import path

from .views import DashboardView

app_name = "dashboard"

urlpatterns = [
    path("", DashboardView.as_view(), name="summary"),
]
