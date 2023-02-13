"""
Models for paid punishments logs data structures
"""

from datetime import datetime

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import GroupId, PunishmentId, UserId


class PaidPunishmentsLogBase(BaseModel):
    value: int


class PaidPunishmentsLogCreate(PaidPunishmentsLogBase):
    pass


class PaidPunishmentsLogOut(PaidPunishmentsLogCreate):
    user_id: UserId
    group_id: GroupId


class PaidPunishmentsLogRead(PaidPunishmentsLogOut):
    paid_punishment_log_id: PunishmentId
    created_at: datetime
    created_by: UserId
