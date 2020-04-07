from django.contrib.auth.models import User, Group
from rest_framework import serializers
from apps.punishment_system.models import Punishment, PunishmentType


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['name']
