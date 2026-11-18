from django.urls import path

from .views import FlightDetailView, FlightLiveStatusView, FlightSearchView


urlpatterns = [
    path("search/", FlightSearchView.as_view(), name="flight-search"),
    path(
        "<int:pk>/live-status/",
        FlightLiveStatusView.as_view(),
        name="flight-live-status",
    ),
    path("<int:pk>/", FlightDetailView.as_view(), name="flight-detail"),
]