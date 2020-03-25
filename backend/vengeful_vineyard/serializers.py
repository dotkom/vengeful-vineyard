from django.contrib.auth.models import User, Group
from rest_framework import serializers
from apps.punishment_system.models import Punishment, PunishmentType


class UserSerializer(serializers.HyperlinkedModelSerializer):
    vineyardgroup_set = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = User
        fields = ['username', 'groups', 'vineyardgroup_set']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['name']
