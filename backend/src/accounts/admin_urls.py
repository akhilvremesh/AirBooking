from django.urls import path

from .admin_views import (
    ApproveUserView,
    PendingUserListView,
    RejectUserView,
)


urlpatterns = [
    path("users/pending/", PendingUserListView.as_view(), name="pending-users"),
    path(
        "users/<int:pk>/approve/",
        ApproveUserView.as_view(),
        name="approve-user",
    ),
    path(
        "users/<int:pk>/reject/",
        RejectUserView.as_view(),
        name="reject-user",
    ),
]