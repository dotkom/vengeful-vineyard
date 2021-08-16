# -*- coding: utf-8 -*-
"""
Create* are used to describe the JSON body of POST requests
Without "Create" describes the response from GET requests
"""

from datetime import datetime
from typing import List, Optional

from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class CreatePunishmentType(BaseModel):
    name: str
    value: int
    logo_url: str


class PunishmentType(CreatePunishmentType):
    punishment_type_id: PunishmentTypeId


class CreatePunishment(BaseModel):
    punishment_type: PunishmentTypeId
    reason: str
    amount: int


class PunishmentOut(CreatePunishment):
    punishment_id: PunishmentId
    created_time: datetime
    verified_time: Optional[datetime]
    verified_by: Optional[UserId]


class PunishmentDb(PunishmentOut):
    group_id: GroupId
    user_id: UserId


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    email: str


class User(CreateUser):
    user_id: UserId
    active: bool
    punishments: Optional[List[PunishmentOut]]


class CreateGroup(BaseModel):
    name: str
    rules: str


class Group(CreateGroup):
    group_id: GroupId
    punishment_types: List[PunishmentType]
    members: List[User]
