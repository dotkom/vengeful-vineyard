"""
Models for punishment type data structures
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import PunishmentTypeId, UserId


class PunishmentTypeBase(BaseModel):
    name: str
    value: int
    emoji: str


class PunishmentTypeCreate(PunishmentTypeBase):
    pass


class PunishmentTypeRead(PunishmentTypeBase):
    punishment_type_id: PunishmentTypeId
    created_at: datetime
    created_by: Optional[UserId]
    updated_at: datetime
