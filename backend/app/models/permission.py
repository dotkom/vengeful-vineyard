"""
Models for permissions
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import GroupId, PermissionPrivilege, UserId


class GroupMemberPermissionBase(BaseModel):
    group_id: GroupId
    user_id: UserId
    privilege: PermissionPrivilege
    created_by: Optional[UserId] = None


class GroupMemberPermissionCreate(GroupMemberPermissionBase):
    pass


class GroupMemberPermissionRead(GroupMemberPermissionBase):
    created_at: datetime
    updated_at: datetime
