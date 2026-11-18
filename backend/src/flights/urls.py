from django.urls import path

from .views import FlightDetailView, FlightSearchView


urlpatterns = [
    path("search/", FlightSearchView.as_view(), name="flight-search"),
    path("<int:pk>/", FlightDetailView.as_view(), name="flight-detail"),
]