"""
Models for betting data structures.
"""

import datetime
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import VersusBetId, GroupId, UserId, PunishmentTypeId

class VersusBetBase(BaseModel):
    description: str
    creator_user_id: UserId
    creator_group_id: GroupId
    other_user_id: UserId
    other_group_id: GroupId
    punishment_type_id: PunishmentTypeId
    amount: int
    winner_user_id: Optional[UserId] = None
    accepted_at: Optional[datetime.datetime] = None
    settled_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

class VersusBetCreate(VersusBetBase):
    pass

class VersusBetRead(VersusBetBase):
    id: VersusBetId

class VersusBet(VersusBetRead):
    # creator: User
    pass