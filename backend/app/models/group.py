"""
Models for group data structures
"""


from app.models.group_user import GroupUser
from app.models.punishment_type import PunishmentTypeRead
from app.types import GroupId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class GroupBase(BaseModel):
    name: str
    name_short: str
    rules: str
    ow_group_id: int | None
    image: str


class Group(GroupBase):
    group_id: GroupId
    punishment_types: list[PunishmentTypeRead]
    members: list[GroupUser]


class GroupCreate(GroupBase):
    pass
