"""
Some newtype definitions for extra type safety
"""

from typing import Optional, TypedDict
from uuid import UUID

from pydantic import BaseModel


class OWUserId(str):
    pass


class OWGroupUserId(str):
    pass


class UserId(UUID):
    pass


class GroupId(UUID):
    pass


class PunishmentId(UUID):
    pass


class PunishmentTypeId(UUID):
    pass


class PaidPunishmentLogId(UUID):
    pass


class GroupEventId(UUID):
    pass


class PunishmentReactionId(UUID):
    pass


class PermissionPrivilege(str):
    pass


class InsertOrUpdateUser(TypedDict):
    id: UserId
    action: str


class InsertOrUpdateGroup(TypedDict):
    id: GroupId
    action: str


class InviteCode(str):
    pass


class OWSyncUser(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str


class OWSyncGroupMember(OWSyncUser):
    roles: list[str]
    has_active_membership: bool


class OWSyncGroup(BaseModel):
    slug: str
    name: str
    type: str
    abbreviation: str
    imageUrl: Optional[str]
