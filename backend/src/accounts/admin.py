from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "approval_status",
        "is_staff",
    )
    list_filter = (
        "approval_status",
        "is_staff",
        "is_superuser",
    )

    fieldsets = UserAdmin.fieldsets + (
        ("Account approval", {"fields": ("approval_status",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Account approval", {"fields": ("approval_status",)}),
    )