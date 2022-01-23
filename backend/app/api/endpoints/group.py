"""
Group endpoints
"""

from app import db
from app.models.group import Group, GroupCreate
from app.models.punishment import PunishmentCreate
from app.models.punishment_type import PunishmentTypeCreate
from app.models.user import User
from app.types import GroupId, UserId
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/group", tags=["Group"])


@router.get("/{group_id}/user/{user_id}")
async def get_group_user(group_id: GroupId, user_id: UserId) -> User:
    """
    Endpoint to get a user in the context of a group.
    """
    return await db.get_group_user(group_id, user_id, punishments=True)


@router.get("/{group_id}")
async def get_group(group_id: GroupId) -> Group:
    """
    Endpoint to get a specific group.
    """
    conn = db.get_instance()
    db_group = conn.execute(
        """SELECT * FROM groups
           WHERE groups.group_id = :group_id""",
        {"group_id": group_id},
    ).fetchone()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    group = dict(db_group)
    group["punishment_types"] = await db.get_punishment_types(group_id)
    group["members"] = await db.get_group_users(group_id)
    return Group(**dict(group))


@router.post("")
async def post_group(group: GroupCreate) -> dict[str, int]:
    """
    Endpoint to create a new group.
    """
    return await db.insert_group(group)


@router.post("/{group_id}/punishmentType")
async def add_punishment_type_to_group(
    group_id: GroupId, punishment_type: PunishmentTypeCreate
) -> dict[str, int]:
    """
    Endpoint to create a custom punishment type for a group.
    """
    return await db.insert_punishment_type(group_id, punishment_type)


@router.post("/{group_id}/user/{user_id}")
async def add_user_to_group(group_id: GroupId, user_id: UserId) -> dict[str, int]:
    """
    Endpoint to add a user to a group.
    """
    return await db.insert_user_in_group(group_id, user_id)


@router.post("/{group_id}/user/{user_id}/punishment")
async def add_punishment(
    group_id: GroupId, user_id: UserId, punishments: list[PunishmentCreate]
) -> dict[str, list[int]]:
    """
    Endpoint to add a punishment to a user in the context of a specific group.
    """
    return await db.insert_punishments(group_id, user_id, punishments)
