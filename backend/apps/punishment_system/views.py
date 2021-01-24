from django.shortcuts import render
from rest_framework import viewsets, mixins
from .models import PunishmentType, Punishment, VineyardGroup
from .serializers import (
    PunishmentTypeSerializer,
    PunishmentSerializer,
    VineyardGroupSerializer,
)

# Create your views here.
class PunishmentTypeViewSet(viewsets.ModelViewSet, mixins.RetrieveModelMixin):

    queryset = PunishmentType.objects.all().order_by("value")
    serializer_class = PunishmentTypeSerializer


class PunishmentViewSet(viewsets.ModelViewSet):
    queryset = Punishment.objects.all().order_by("-created")
    serializer_class = PunishmentSerializer
    # def preform_create(self, serializer):         authentication scheme needed for request.user
    #    serializer.save(giver=self.request.user)


class VineyardGroupViewSet(viewsets.ModelViewSet):
    queryset = VineyardGroup.objects.all()
    serializer_class = VineyardGroupSerializer
    lookup_field = "name"
