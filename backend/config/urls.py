"""
Root URL configuration.

All API routes are versioned under /api/v1/. Each app owns its own urls.py
which is included here, keeping this file thin.
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

# Everything the API exposes lives under this prefix.
api_v1_patterns = [
    # Health check + future core endpoints.
    path("", include("apps.core.urls")),

    # Auth: register / login / logout / refresh / verify / me.
    path("auth/", include("apps.accounts.urls")),

    # Workspaces + memberships.
    path("workspaces/", include("apps.workspaces.urls")),

    # OpenAPI schema + Swagger docs.
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]
