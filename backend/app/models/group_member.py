"""
Models for group member data structures. Group members only contain fields
from the table 'group_members'.
"""

import datetime
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import GroupId, OWGroupUserId, UserId


class BaseGroupMember(BaseModel):
    group_id: GroupId
    user_id: UserId
    ow_group_user_id: Optional[OWGroupUserId] = None
    active: bool = True


class GroupMember(BaseGroupMember):
    added_at: datetime.datetime


class GroupMemberCreate(BaseGroupMember):
    pass


class GroupMemberUpdate(BaseGroupMember):
    pass
