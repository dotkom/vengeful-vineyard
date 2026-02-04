"""
Models for group user data structures. Group users contains field from both
the table 'group_members' and 'users'.
"""

import datetime
from typing import Optional

from app.types import GroupId, OWGroupUserId, PermissionPrivilege

from .punishment import PunishmentOut
from .user import User


class BaseGroupUser(User):
    ow_group_user_id: Optional[OWGroupUserId] = None
    punishments: list[PunishmentOut] = []
    active: bool = True
    inactive_at: Optional[datetime.datetime] = None
    group_id: GroupId
    permissions: list[PermissionPrivilege] = []


class GroupUser(BaseGroupUser):
    pass
