from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class PunishmentType(models.Model):
    name = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    #image = models.ImageField(upload_to="upload/")
    def __str__(self):
        return f'Name: {self.name} Value: {self.value}'

class VineyardGroup(models.Model):
    name = models.CharField(max_length=30)
    users = models.ManyToManyField(to=User)
    def __str__(self):
        return self.name

class Punishment(models.Model):
    type = models.ForeignKey(PunishmentType, on_delete=models.CASCADE)
    to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="punishments")
    giver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="punishments_given")
    group = models.ForeignKey(VineyardGroup, on_delete=models.CASCADE)
    reason = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True, blank=True)
    def __str__(self):
        return self.reason