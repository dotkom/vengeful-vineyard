"""
Models for group join request data structures.
"""

import datetime

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import GroupId, UserId


class BaseGroupJoinRequest(BaseModel):
    group_id: GroupId
    user_id: UserId


class GroupJoinRequestCreate(BaseGroupJoinRequest):
    pass


class GroupJoinRequest(BaseGroupJoinRequest):
    created_at: datetime.datetime
