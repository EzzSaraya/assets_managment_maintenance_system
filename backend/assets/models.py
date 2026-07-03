from django.db import models


class Asset(models.Model):
    class Category(models.TextChoices):
        EQUIPMENT = "EQUIPMENT", "Equipment"
        VEHICLE = "VEHICLE", "Vehicle"
        IT = "IT", "IT Asset"
        FURNITURE = "FURNITURE", "Furniture"
        BUILDING = "BUILDING", "Building"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        UNDER_MAINTENANCE = "UNDER_MAINTENANCE", "Under Maintenance"
        INACTIVE = "INACTIVE", "Inactive"
        RETIRED = "RETIRED", "Retired"

    asset_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.EQUIPMENT
    )
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    location = models.CharField(max_length=150)
    manufacturer = models.CharField(max_length=150, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["asset_code"]

    def __str__(self):
        return f"{self.asset_code} - {self.name}"