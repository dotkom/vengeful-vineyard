"""
Models for group data structures
"""


from app.models.punishment_type import PunishmentTypeRead
from app.models.user import User
from app.types import GroupId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class GroupBase(BaseModel):
    name: str
    rules: str


class Group(GroupBase):
    group_id: GroupId
    punishment_types: list[PunishmentTypeRead]
    members: list[User]


class GroupCreate(GroupBase):
    pass
