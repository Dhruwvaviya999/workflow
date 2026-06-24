"""Development settings — local machine defaults."""
from .base import *  # noqa: F401,F403

DEBUG = True

# Convenient during local dev; tighten in production.
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# Verbose console logging while developing.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
