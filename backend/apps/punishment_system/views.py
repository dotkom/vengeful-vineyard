from django.shortcuts import render
from rest_framework import viewsets
from .models import PunishmentType, Punishment, VineyardGroup

from .serializers import PunishmentTypeSerializer, PunishmentSerializer, VineyardGroupSerializer

# Create your views here.
class PunishmentTypeViewSet(viewsets.ModelViewSet):
    queryset = PunishmentType.objects.all().order_by('value')
    serializer_class = PunishmentTypeSerializer

class PunishmentViewSet(viewsets.ModelViewSet):
    queryset = Punishment.objects.all().order_by('-date')
    serializer_class = PunishmentSerializer

class VineyardGroupViewSet(viewsets.ModelViewSet):
    queryset = VineyardGroup.objects.all()
    serializer_class = VineyardGroupSerializer