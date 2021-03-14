from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PunishmentTypeBase(BaseModel):
    name: str
    value: int
    logoUrl: str


class PunishmentTypeCreate(PunishmentTypeBase):
    pass


class PunishmentType(PunishmentTypeBase):
    id: int

    class Config:
        orm_mode = True


class PunishmentBase(BaseModel):
    reason: str


class PunishmentCreate(PunishmentBase):
    punishmentType_id: int


class Punishment(PunishmentBase):
    id: int
    givenTo_id: int
    verifiedBy: Optional[int]
    verifiedTime: Optional[str]
    givenTime: datetime

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    name: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    active: bool
    punishments: List[Punishment] = []
    debt: int = 0
    totalPaid: int = 0

    class Config:
        orm_mode = True


class GroupBase(BaseModel):
    name: str
    logoUrl: str


class GroupCreate(GroupBase):
    pass


class Group(GroupBase):
    id: int
    members: List[User]
    punishmentTypes: List[PunishmentType]

    class Config:
        orm_mode = True
