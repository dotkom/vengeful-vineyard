from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser, UserManager
from django.db.models import Prefetch, Sum, Case, When, F, Q, DecimalField, FilteredRelation

class LeaderBoardManager(models.Manager):

    def of_group(self, group_name, active_only=True):
        punishments_in_group = Punishment.objects.filter((Q(active=True) | Q(active = active_only)), group__name=group_name)
        users_in_group = self.filter(vineyardgroup__name=group_name)
        user_punishments_in_group = users_in_group.prefetch_related(Prefetch("punishments", queryset=punishments_in_group)                         #remove not relevant punishments from the attribute (not field) "punishments"(punishments not in group)
        ).annotate(punishments_in_group_sum=Sum(                                                                                                                           #for each user, annotate the sum of punishments to the attribute "punishments_in_group_sum"
            Case(
                When(Q(punishments__group__name=group_name) & (Q(punishments__active=True) | Q(punishments__active = active_only)), then=F('punishments__type__value')),   #for each relevant punishment, add its value to the sum
                default=0,                                                                                                                                                 #for each irrelevant punishment, add 0 to the sum
                output_field=DecimalField()))
        ).order_by("punishments_in_group_sum")

        #the "(Q(punishments__active=True) | Q(punishments__active = active_only))"-expression is disgusting, but it works:
        #if active_only is True then it becomes:  (Q(punishments__active=True) | (Q(punishments__active=True)))  == Q(punishments__active=True)
        #if active_only is False then it becomes: (Q(punishments__active=True) | (Q(punishments__active=False))) == Q(True)

        return user_punishments_in_group

# Create your models here.

class VineyardUser(AbstractUser):
    objects = UserManager()
    leaderboard = LeaderBoardManager()
    @property
    def name(self):
        return self.first_name + " " + self.last_name
User = get_user_model()

class PunishmentType(models.Model):
    name = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    #image = models.ImageField(upload_to="upload/")
    def __str__(self):
        return f'Name: {self.name} Value: {self.value}'

class VineyardGroup(models.Model):
    name = models.CharField(max_length=30, unique=True)
    users = models.ManyToManyField(to=User)
    def __str__(self):
        return self.name

class Punishment(models.Model):
    type = models.ForeignKey(PunishmentType, on_delete=models.CASCADE)
    to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="punishments")
    giver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="punishments_given")
    group = models.ForeignKey(VineyardGroup, on_delete=models.CASCADE)
    reason = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True, blank=True)
    active = models.BooleanField(default=True)
    def __str__(self):
        return self.reason