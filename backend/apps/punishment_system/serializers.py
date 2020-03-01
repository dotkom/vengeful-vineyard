from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import PunishmentType, Punishment, VineyardGroup
from vengeful_vineyard.serializers import UserSerializer, GroupSerializer

class PunishmentSerializer(serializers.HyperlinkedModelSerializer):
    to = UserSerializer()
    giver = UserSerializer()
    group = GroupSerializer()

    class Meta:
        model = Punishment
        fields = ['url', 'type', 'to', 'giver', 'group', 'reason', 'date']

class PunishmentTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PunishmentType
        fields = ['url','name','value']

class VineyardGroupSerializer(serializers.HyperlinkedModelSerializer):
    users = UserSerializer()
    class Meta:
        model = VineyardGroup
        fields = ['name', 'users']

