"""
Some newtype definitions for extra type safety
"""


from typing import TypedDict


class OWUserId(int):
    pass


class OWGroupUserId(int):
    pass


class UserId(str):
    pass


class GroupId(str):
    pass


class PunishmentId(str):
    pass


class PunishmentTypeId(str):
    pass


class PaidPunishmentLogId(str):
    pass


class GroupEventId(str):
    pass


class PunishmentReactionId(str):
    pass


class InsertOrUpdateUser(TypedDict):
    id: UserId
    action: str


class InsertOrUpdateGroup(TypedDict):
    id: GroupId
    action: str
