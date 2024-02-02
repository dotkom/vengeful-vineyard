"""
Models for group data structures
"""


from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.models.group_invites import GroupInvite, GroupInviteWithMetadata
from app.models.group_user import GroupUser
from app.models.punishment_type import PunishmentTypeRead
from app.models.user import User
from app.types import GroupId, PermissionPrivilege


class GroupBase(BaseModel):
    name: str
    name_short: str


class GroupCreateMinified(GroupBase):
    pass


class GroupCreate(GroupBase):
    rules: str = ""
    ow_group_id: Optional[int] = None
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


class GroupSearchResult(GroupCreateMinified):
    group_id: GroupId


class Group(GroupCreate):
    group_id: GroupId
    punishment_types: list[PunishmentTypeRead] = []
    members: list[GroupUser] = []
    invites: Optional[list[GroupInvite]] = []
    roles: list[tuple[str, PermissionPrivilege]] = []
    permissions: dict[PermissionPrivilege, list[PermissionPrivilege]] = {}


class UserWithGroupsAndInvites(User):
    groups: Optional[list[Group]] = []
    invites: Optional[list[GroupInviteWithMetadata]] = []


