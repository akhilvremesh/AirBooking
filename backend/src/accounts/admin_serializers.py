from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "approval_status",
            "date_joined",
        )
        read_only_fields = fields