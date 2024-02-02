"""
Models for group join request data structures.
"""

import datetime

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import GroupId, UserId


class BaseGroupInvite(BaseModel):
    group_id: GroupId
    user_id: UserId


class GroupInviteCreate(BaseGroupInvite):
    pass


class GroupInvite(BaseGroupInvite):
    created_at: datetime.datetime
    created_by: UserId


class GroupInviteWithMetadata(BaseModel):
    invite: GroupInvite
    created_by_name: str
    group_name: str

