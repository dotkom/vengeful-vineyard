from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

from rest_framework import viewsets
from apps.punishment_system.models import PunishmentType, Punishment
from vengeful_vineyard.serializers import  GroupSerializer

User = get_user_model()

class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
