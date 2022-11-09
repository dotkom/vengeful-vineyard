"""
Models for punishment data structures
"""

from datetime import datetime
from typing import Optional

from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class PunishmentBase(BaseModel):
    punishment_type_id: PunishmentTypeId
    reason: str
    amount: int


class PunishmentCreate(PunishmentBase):
    pass


class PunishmentOut(PunishmentCreate):
    punishment_id: PunishmentId
    created_time: datetime
    created_by: UserId
    verified_time: Optional[datetime]
    verified_by: Optional[UserId]


class PunishmentRead(PunishmentOut):
    group_id: GroupId
    user_id: UserId


class PunishmentStreaks(BaseModel):
    current_streak: int
    longest_streak: int
    current_inverse_streak: int
    longest_inverse_streak: int
