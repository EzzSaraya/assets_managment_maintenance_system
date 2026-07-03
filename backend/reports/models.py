from django.conf import settings
from django.db import models

from assets.models import Asset
from maintenance.models import MaintenanceSchedule
from work_orders.models import WorkOrder


class MaintenanceHistory(models.Model):
    class MaintenanceType(models.TextChoices):
        PREVENTIVE = "PREVENTIVE", "Preventive"
        CORRECTIVE = "CORRECTIVE", "Corrective"
        INSPECTION = "INSPECTION", "Inspection"
        EMERGENCY = "EMERGENCY", "Emergency"

    history_code = models.CharField(max_length=50, unique=True)

    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="maintenance_history"
    )

    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="maintenance_history"
    )

    maintenance_schedule = models.ForeignKey(
        MaintenanceSchedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="maintenance_history"
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_maintenance_history"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.CORRECTIVE
    )

    completion_date = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    downtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    result_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-completion_date", "-created_at"]

    def __str__(self):
        return f"{self.history_code} - {self.title}"