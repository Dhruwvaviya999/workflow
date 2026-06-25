"""
Root URL configuration.

All API routes are versioned under /api/v1/. Each app owns its own urls.py
which is included here, keeping this file thin.
"""
from django.conf import settings
from django.conf.urls.static import static
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

    # Business modules (all workspace-scoped).
    path("projects/", include("apps.projects.urls")),
    path("tasks/", include("apps.tasks.urls")),
    path("documents/", include("apps.documents.urls")),
    path("dashboard/", include("apps.dashboard.urls")),

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

# Serve uploaded media via Django in development only. In production this is
# handled by the storage backend (S3/Cloudinary) or the web server.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
