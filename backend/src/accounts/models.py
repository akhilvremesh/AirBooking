from django.contrib.auth.models import (
    AbstractUser,
    UserManager as DjangoUserManager,
)
from django.db import models

class AirBookingUserManager(DjangoUserManager):
    def create_superuser(
        self,
        username,
        email=None,
        password=None,
        **extra_fields,
    ):
        extra_fields.setdefault("approval_status", "approved")
        return super().create_superuser(
            username,
            email,
            password,
            **extra_fields,
        )


class User(AbstractUser):
    objects = AirBookingUserManager()

    class ApprovalStatus:
        PENDING = "pending"
        APPROVED = "approved"
        REJECTED = "rejected"

    email = models.EmailField(unique=True)
    approval_status = models.CharField(
        max_length=10,
        choices=[
            (ApprovalStatus.PENDING, "Pending"),
            (ApprovalStatus.APPROVED, "Approved"),
            (ApprovalStatus.REJECTED, "Rejected"),
        ],
        default=ApprovalStatus.PENDING,
    )

    def __str__(self):
        return self.username