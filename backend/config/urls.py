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
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# Everything the API exposes lives under this prefix.
api_v1_patterns = [
    # Health check + future core endpoints.
    path("", include("apps.core.urls")),

    # JWT auth foundation (login / refresh / verify).
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # account-specific endpoints will be added in Phase 2.
    path("", include("apps.accounts.urls")),

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
