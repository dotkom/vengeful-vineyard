"""
Some newtype definitions for extra type safety
"""


from typing import TypedDict
from uuid import UUID


class OWUserId(int):
    pass


class OWGroupUserId(int):
    pass


class UserId(UUID):
    pass


class GroupId(UUID):
    pass


class PunishmentId(UUID):
    pass


class PunishmentTypeId(UUID):
    pass


class PaidPunishmentLogId(UUID):
    pass


class GroupEventId(UUID):
    pass


class PunishmentReactionId(UUID):
    pass


class PermissionPrivilege(str):
    pass


class InsertOrUpdateUser(TypedDict):
    id: UserId
    action: str


class InsertOrUpdateGroup(TypedDict):
    id: GroupId
    action: str
