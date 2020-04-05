from django.contrib import admin
from .models import VineyardUser, PunishmentType, VineyardGroup, Punishment
# Register your models here.
admin.site.register(VineyardUser)
admin.site.register(PunishmentType)
admin.site.register(VineyardGroup)
admin.site.register(Punishment)