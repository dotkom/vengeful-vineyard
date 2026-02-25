"""
Models for group data structures
"""


from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.models.group_user import GroupUser
from app.models.punishment_type import PunishmentTypeRead
from app.models.user import User
from app.types import GroupId, InviteCode, PermissionPrivilege


class GroupBase(BaseModel):
    name: str
    name_short: str


class GroupCreateMinified(GroupBase):
    pass


class GroupCreate(GroupBase):
    rules: str = ""
    ow_group_id: Optional[str] = None
    image: str = ""

    @classmethod
    def from_minified(cls, group: GroupCreateMinified) -> "GroupCreate":
        return cls(
            name=group.name,
            name_short=group.name_short,
            rules="",
            ow_group_id=None,
            image="",
        )


class GroupPublic(GroupBase):
    group_id: GroupId
    name: str
    name_short: str
    image: str = ""
    is_official: bool = False
    is_member: bool = False
    invite_code: Optional[InviteCode] = None

class GroupSearchResult(GroupCreateMinified):
    group_id: GroupId


class Group(GroupCreate):
    group_id: GroupId
    punishment_types: dict[str, PunishmentTypeRead] = {}
    members: list[GroupUser] = []
    former_members: list[GroupUser] = []
    join_requests: list[User] = []
    roles: list[tuple[str, PermissionPrivilege]] = []
    permissions: dict[PermissionPrivilege, list[PermissionPrivilege]] = {}
    invite_code: Optional[InviteCode] = None


class UserWithGroups(User):
    groups: list[Group]


class InviteCodePatch(BaseModel):
    invite_code: Optional[InviteCode] = None