from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "user",
        "flight",
        "seats",
        "total_price",
        "status",
        "payment_status",
        "created_at",
    )
    list_filter = ("status", "payment_status", "created_at")
    search_fields = (
        "reference",
        "user__username",
        "user__email",
        "flight__flight_number",
    )
    readonly_fields = ("reference", "created_at")