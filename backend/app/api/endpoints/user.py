"""
User endpoints
"""

from typing import Any

from app import db
from app.models.user import User, UserCreate
from app.types import UserId
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/user", tags=["User"])


@router.get("")
async def get_users() -> dict[str, list[Any]]:
    """
    Endpoint to get all users on the system.
    """
    conn = db.get_instance()
    db_users = conn.execute("""SELECT * FROM users""")
    users = list(map(dict, db_users))
    return {"users": users}


@router.post("")
async def post_user(user: UserCreate) -> dict[str, int]:
    """
    Endpoint to create a user.
    """
    return await db.insert_user(user)


@router.get("/{user_id}")
async def get_user(user_id: UserId) -> User:
    """
    Endpoint to get a specific user.
    """
    return await db.get_user(user_id, punishments=True)


@router.get("/{user_id}/group", tags=["User"])
async def get_user_groups(user_id: UserId) -> dict[str, Any]:
    """
    Endpoint to get all groups a user is a member of.
    """
    conn = db.get_instance()
    groups = conn.execute(
        """SELECT group_members.group_id, name from group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           WHERE group_members.user_id = :user_id""",
        {"user_id": user_id},
    ).fetchall()
    if groups is None:
        raise HTTPException(status_code=500, detail="User groups could not be found")

    return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}
