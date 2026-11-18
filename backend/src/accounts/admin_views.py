from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .admin_serializers import AdminUserSerializer
from .services import approve_user, reject_user


User = get_user_model()

MANAGEABLE_USERS = User.objects.filter(
    is_staff=False,
    is_superuser=False,
)


class PendingUserListView(ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return MANAGEABLE_USERS.filter(
            approval_status=User.ApprovalStatus.PENDING
        ).order_by("date_joined")


class ApproveUserView(GenericAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(MANAGEABLE_USERS, pk=pk)
        user = approve_user(user)
        return Response(self.get_serializer(user).data)


class RejectUserView(GenericAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(MANAGEABLE_USERS, pk=pk)
        user = reject_user(user)
        return Response(self.get_serializer(user).data)