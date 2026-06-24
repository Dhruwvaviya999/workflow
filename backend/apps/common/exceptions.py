"""
Project-wide DRF exception handler.

Wraps DRF's default handler so every error response shares one predictable
shape, which keeps the frontend error handling simple:

    {
        "error": {
            "status_code": 400,
            "type": "ValidationError",
            "detail": { ... }   # field errors or a message
        }
    }
"""
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    # DRF didn't handle it (e.g. an unexpected 500) — let Django deal with it.
    if response is None:
        return response

    response.data = {
        "error": {
            "status_code": response.status_code,
            "type": exc.__class__.__name__,
            "detail": response.data,
        }
    }
    return response
