from django.urls import path

from .admin_views import AdminBookingStatsView


urlpatterns = [
    path(
        "bookings/stats/",
        AdminBookingStatsView.as_view(),
        name="admin-booking-stats",
    ),
]