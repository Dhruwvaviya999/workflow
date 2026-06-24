"""Core, non-feature endpoints (health checks, service metadata)."""
from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Lightweight liveness/readiness probe.

    Public (no auth) so load balancers and uptime monitors can hit it.
    Confirms the process is up and the database is reachable.
    """

    permission_classes = [AllowAny]
    authentication_classes: list = []

    @extend_schema(
        summary="Health check",
        description="Returns service status and database connectivity.",
        responses={200: None, 503: None},
        tags=["core"],
    )
    def get(self, request):
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
        except Exception:  # noqa: BLE001 - report any DB failure as unhealthy
            db_ok = False

        payload = {
            "status": "ok" if db_ok else "degraded",
            "service": "ai-workflow-api",
            "version": "1.0.0",
            "database": "ok" if db_ok else "unavailable",
        }
        http_status = (
            status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        )
        return Response(payload, status=http_status)
