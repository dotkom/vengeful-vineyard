"""
Models for user data structures
"""

from app.models.punishment import PunishmentOut
from app.types import UserId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str


class User(UserBase):
    user_id: UserId
    active: bool
    punishments: list[PunishmentOut] | None


class UserCreate(UserBase):
    pass
