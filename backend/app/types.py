"""
Some newtype definitions for extra type safety
"""


from typing import TypedDict


class UserId(int):
    pass


class OWUserId(int):
    pass


class GroupId(int):
    pass


class OWGroupUserId(int):
    pass


class PunishmentId(int):
    pass


class PunishmentTypeId(int):
    pass


class GroupEventId(int):
    pass


class InsertOrUpdateUser(TypedDict):
    id: UserId
    action: str


class InsertOrUpdateGroup(TypedDict):
    id: GroupId
    action: str
