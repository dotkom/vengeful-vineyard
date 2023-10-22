"""
Models for punishment type data structures
"""
from typing import Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from app.types import PunishmentTypeId


class PunishmentTypeBase(BaseModel):
    name: str
    value: int
    logo_url: str


class PunishmentTypeCreate(PunishmentTypeBase):
    pass


class PunishmentTypeRead(PunishmentTypeBase):
    punishment_type_id: PunishmentTypeId
