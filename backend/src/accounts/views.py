from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    ApprovedTokenObtainPairSerializer,
    RegisterSerializer,
)


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = ApprovedTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]