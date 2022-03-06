"""
Models for user data structures
"""

from datetime import datetime

from app.models.punishment import PunishmentOut
from app.types import OwId, UserId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str


class User(UserBase):
    ow_id: OwId | None
    user_id: UserId
    active: bool
    punishments: list[PunishmentOut] | None
    last_logged_in: datetime | None


class UserCreate(UserBase):
    ow_id: OwId | None
