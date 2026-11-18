from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail


@shared_task
def send_account_activated_email(user_id):
    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return "User not found"

    if user.approval_status != User.ApprovalStatus.APPROVED:
        return "User is not approved"

    send_mail(
        subject="Your AirBooking account is activated",
        message=(
            f"Hi {user.first_name or user.username},\n\n"
            "Your AirBooking account has been approved. "
            "You can now sign in.\n\n"
            "The AirBooking team"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )

    return "Activation email sent"