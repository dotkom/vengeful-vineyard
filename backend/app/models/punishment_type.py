"""
Models for punishment type data structures
"""

from app.types import PunishmentTypeId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class PunishmentTypeBase(BaseModel):
    name: str
    value: int
    logo_url: str


class PunishmentTypeCreate(PunishmentTypeBase):
    pass


class PunishmentTypeRead(PunishmentTypeBase):
    punishment_type_id: PunishmentTypeId
