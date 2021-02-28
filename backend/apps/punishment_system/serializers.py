from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import PunishmentType, Punishment, VineyardGroup
from vengeful_vineyard.serializers import UserSerializer, GroupSerializer


class PunishmentSerializer(serializers.HyperlinkedModelSerializer):
    to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    # giver = serializers.PrimaryKeyRelatedField(read_only=True)              once authentication scheme is set, giver can be set to request.user,
    giver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )  # but is manually set so far.
    group = serializers.SlugRelatedField(
        slug_field="name", queryset=VineyardGroup.objects.all()
    )
    type = serializers.PrimaryKeyRelatedField(queryset=PunishmentType.objects.all())

    def validate(self, data):
        group = VineyardGroup.objects.get(name=data["group"])
        groupMembers = group.users.all()
        if data["giver"] not in groupMembers or data["to"] not in groupMembers:
            raise serializers.ValidationError("Giver and receiver of punishments must be in the same group!")
        return data

    class Meta:
        model = Punishment
        fields = [
            "type",
            "to",
            "giver",
            "group",
            "reason",
            "created",
            "verifier",
            "verifiedDate",
        ]

class PunishmentTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PunishmentType
        fields = ["name", "value", "imageurl"]


class VineyardGroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = VineyardGroup
        fields = ["name", "users", "public", "rulesurl", "logourl", "admins"]
        lookup_field = "name"
