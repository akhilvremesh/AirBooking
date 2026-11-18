from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "approval_status",
        )
        read_only_fields = ("id", "approval_status")

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)




class ApprovedTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        token_data = super().validate(attrs)

        if self.user.approval_status == User.ApprovalStatus.PENDING:
            raise AuthenticationFailed(
                "Your account is pending admin approval."
            )

        if self.user.approval_status == User.ApprovalStatus.REJECTED:
            raise AuthenticationFailed(
                "Your account registration was rejected."
            )

        return token_data