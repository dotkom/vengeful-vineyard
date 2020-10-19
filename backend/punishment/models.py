from django.db import models

# Create your models here.
class Punishment(models.Model):
    iden = models.PositiveIntegerField()
    pris = models.IntegerField()
    name = models.CharField(max_length=100)
    image = models.TextField()