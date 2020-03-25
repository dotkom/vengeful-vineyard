from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import PunishmentType, Punishment, VineyardGroup
from vengeful_vineyard.serializers import UserSerializer, GroupSerializer

class PunishmentSerializer(serializers.HyperlinkedModelSerializer):
    to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    #giver = serializers.PrimaryKeyRelatedField(read_only=True)              once authentication scheme is set, giver can be set to request.user,
    giver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())# but is manually set so far.
    group = serializers.SlugRelatedField(slug_field='name', queryset=VineyardGroup.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset=PunishmentType.objects.all())
    class Meta:
        model = Punishment
        fields = ['type', 'to', 'giver', 'group', 'reason', 'date']



class PunishmentTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PunishmentType
        fields = ['name','value']

class VineyardGroupSerializer(serializers.HyperlinkedModelSerializer):
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = VineyardGroup
        fields = ['name', 'users']
        lookup_field = 'name'