from django.db import models

# Create your models here.
class PunishmentType(models.Model):
    name = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f'Name: {self.name} Value: {self.value}'