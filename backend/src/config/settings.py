import os
from pathlib import Path
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


# BASE_DIR is backend/src.
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR.parent

# Load private local settings from backend/.env.
load_dotenv(BACKEND_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "replace-this-with-a-local-secret":
    raise ImproperlyConfigured(
        "Set a private SECRET_KEY in backend/.env before running Django."
    )

DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
    if host.strip()
]


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "accounts",
    "flights",
    "bookings",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


AUTH_USER_MODEL = "accounts.User"


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


# Print emails in the backend terminal during local development.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "no-reply@airbooking.local"


# Celery will use Redis when the broker is available.
CELERY_BROKER_URL = os.getenv(
    "CELERY_BROKER_URL",
    "redis://127.0.0.1:6379/0",
)
CELERY_RESULT_BACKEND = os.getenv(
    "CELERY_RESULT_BACKEND",
    "redis://127.0.0.1:6379/1",
)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_ALWAYS_EAGER = (
    os.getenv("CELERY_TASK_ALWAYS_EAGER", "false").lower() == "true"
)
CELERY_TASK_EAGER_PROPAGATES = True