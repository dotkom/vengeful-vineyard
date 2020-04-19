from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PunishmentType, Punishment, VineyardGroup, VineyardUser
from vengeful_vineyard.serializers import GroupSerializer
User = get_user_model()

class VineyardUserSerializer(serializers.HyperlinkedModelSerializer):
    vineyardgroup_set = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = VineyardUser
        fields = ['id', 'username', 'groups', 'vineyardgroup_set']

class PunishmentSerializer(serializers.HyperlinkedModelSerializer):
    to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    #giver = serializers.PrimaryKeyRelatedField(read_only=True)              once authentication scheme is set, giver can be set to request.user,
    giver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())# but is manually set so far.
    group = serializers.SlugRelatedField(slug_field='name', queryset=VineyardGroup.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset=PunishmentType.objects.all())
    class Meta:
        model = Punishment
        fields = ['type', 'to', 'giver', 'group', 'reason', 'date', 'active']



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


class LeaderboardSerializer(serializers.HyperlinkedModelSerializer):
    punishments = PunishmentSerializer(many=True)
    punishments_in_group_sum = serializers.SerializerMethodField("get_punishments_in_group_sum")
    class Meta:
        model = User
        fields = ['id', 'name', 'punishments_in_group_sum', 'punishments']

    def get_punishments_in_group_sum(self, obj):
        return obj.punishments_in_group_sum