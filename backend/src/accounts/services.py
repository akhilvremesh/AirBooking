from django.contrib.auth import get_user_model
from django.db import transaction
from django.conf import settings
from .tasks import send_account_activated_email

def _send_activation_email(user_id):
    if settings.CELERY_TASK_ALWAYS_EAGER:
        send_account_activated_email.apply(args=(user_id,), throw=True)
    else:
        send_account_activated_email.delay(user_id)
        
def approve_user(user):
    if user.approval_status == user.ApprovalStatus.APPROVED:
        return user

    with transaction.atomic():
        user.approval_status = user.ApprovalStatus.APPROVED
        user.save(update_fields=["approval_status"])

        transaction.on_commit(
            lambda: _send_activation_email(user.pk)
        )

    return user