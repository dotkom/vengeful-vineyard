"""
Models for user data structures
"""

from app.models.punishment import PunishmentOut
from app.types import UserId
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class UserBase(BaseModel):
    ow_user_id: int
    first_name: str
    last_name: str
    email: str | None


class CreatedUserBase(UserBase):
    user_id: UserId
    active: bool = True


class User(CreatedUserBase):
    punishments: list[PunishmentOut] | None


class UserCreate(UserBase):
    pass


class UserUpdate(CreatedUserBase):
    pass
