from datetime import datetime
from typing import List

from pydantic import BaseModel

from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId

"""
Create* are used to describe the JSON body of POST requests
Without "Create" describes the response from GET requests
"""


class CreatePunishmentType(BaseModel):
    name: str
    value: int
    logo_url: str


class PunishmentType(CreatePunishmentType):
    punishment_type_id: PunishmentTypeId


class CreatePunishment(BaseModel):
    punishment_type: PunishmentTypeId
    reason: str


class Punishment(CreatePunishment):
    punishment_id: PunishmentId
    group_id: GroupId
    user_id: UserId
    verified_time: datetime
    verified_by: UserId
    created_time: datetime


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    email: str


class User(CreateUser):
    user_id: UserId
    active: bool
    punishments: List[Punishment]


class CreateGroup(BaseModel):
    name: str
    rules: str


class Group(CreateGroup):
    group_id: GroupId
    punishment_types: List[PunishmentType]
