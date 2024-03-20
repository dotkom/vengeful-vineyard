"""
Models for punishment data structures
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.models.punishment_reaction import PunishmentReactionRead
from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId


class PunishmentBase(BaseModel):
    punishment_type_id: PunishmentTypeId
    reason: str
    reason_hidden: bool
    amount: int
    legacy: bool = False


class PunishmentCreate(PunishmentBase):
    pass


class PunishmentOut(PunishmentCreate):
    punishment_id: PunishmentId
    group_id: Optional[
        GroupId
    ]  # Optional because we dont want this information on wall of shame
    created_at: datetime
    created_by: UserId
    created_by_name: str
    paid: bool
    paid_at: Optional[datetime]
    marked_paid_by: Optional[UserId]
    reactions: list[PunishmentReactionRead] = []


class PunishmentRead(PunishmentOut):
    group_id: GroupId
    user_id: UserId


class PunishmentStreaks(BaseModel):
    current_streak: int
    longest_streak: int
    current_inverse_streak: int
    longest_inverse_streak: int


class TotalPunishmentValue(BaseModel):
    total_value: int
    total_paid_value: int
