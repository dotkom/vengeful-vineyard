"""
Models for group data structures
"""


from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.models.group_user import GroupUser
from app.models.punishment_type import PunishmentTypeRead
from app.models.user import User
from app.types import GroupId


class GroupBase(BaseModel):
    name: str
    name_short: str
    rules: str
    ow_group_id: Optional[int]
    image: str


class Group(GroupBase):
    group_id: GroupId
    punishment_types: list[PunishmentTypeRead] = []
    members: list[GroupUser] = []


class GroupCreate(GroupBase):
    pass


class UserWithGroups(User):
    groups: list[Group]
