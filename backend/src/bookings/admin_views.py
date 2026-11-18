from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from flights.models import Flight

from .models import Booking


User = get_user_model()


class AdminBookingStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        booking_counts = Booking.objects.aggregate(
            total=Count("id"),
            confirmed=Count(
                "id",
                filter=Q(status=Booking.Status.CONFIRMED),
            ),
            pending=Count(
                "id",
                filter=Q(status=Booking.Status.PENDING),
            ),
            cancelled=Count(
                "id",
                filter=Q(status=Booking.Status.CANCELLED),
            ),
        )

        revenue = Booking.objects.filter(
            status=Booking.Status.CONFIRMED,
            payment_status=Booking.PaymentStatus.PAID,
        ).aggregate(total=Sum("total_price"))["total"]

        return Response(
            {
                "users": User.objects.count(),
                "pending_users": User.objects.filter(
                    approval_status=User.ApprovalStatus.PENDING,
                    is_staff=False,
                    is_superuser=False,
                ).count(),
                "flights": Flight.objects.count(),
                "bookings": booking_counts,
                "paid_revenue": revenue or Decimal("0.00"),
            }
        )