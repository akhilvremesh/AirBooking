from django.urls import path

from .admin_views import (
    AdminFlightDetailView,
    AdminFlightListCreateView,
    FlightStatusUpdateView,
)


urlpatterns = [
    path(
        "flights/",
        AdminFlightListCreateView.as_view(),
        name="admin-flight-list-create",
    ),
    path(
        "flights/<int:pk>/",
        AdminFlightDetailView.as_view(),
        name="admin-flight-detail",
    ),
    path(
        "flights/<int:pk>/status/",
        FlightStatusUpdateView.as_view(),
        name="admin-flight-status",
    ),
]