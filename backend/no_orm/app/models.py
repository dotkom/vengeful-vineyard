from typing import List

from pydantic import BaseModel


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    active: bool


class User(CreateUser):
    user_id: int


class CreatePunishmentType(BaseModel):
    name: str
    value: int
    logo_url: str


class PunishmentType(CreatePunishmentType):
    punishment_type_id: int


class CreatePunishment(BaseModel):
    punishment_type: int
    reason: str


class Punishment(CreatePunishment):
    punishment_id: int
    group_id: int
    user_id: int


class CreateGroup(BaseModel):
    name: str
    rules: str


class Group(CreateGroup):
    group_id: int
    punishment_types: List[PunishmentType]
