"""
Models for group user data structures. Group users contains field from both
the table 'group_members' and 'users'.
"""

from typing import Optional

from app.types import GroupId, OWGroupUserId

from .punishment import PunishmentOut
from .user import User


class BaseGroupUser(User):
    ow_group_user_id: Optional[OWGroupUserId] = None
    punishments: list[PunishmentOut] = []
    active: bool = True
    group_id: GroupId


class GroupUser(BaseGroupUser):
    pass
