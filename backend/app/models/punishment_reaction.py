"""
Models for paid punishments logs data structures
"""

from datetime import datetime

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import PunishmentId, PunishmentReactionId, UserId


class PunishmentReactionBase(BaseModel):
    emoji: str


class PunishmentReactionCreate(PunishmentReactionBase):
    pass


class PunishmentReactionOut(PunishmentReactionCreate):
    punishment_reaction_id: PunishmentReactionId
    punishment_id: PunishmentId
    created_by: UserId
    created_at: datetime


class PunishmentReactionRead(PunishmentReactionOut):
    pass
