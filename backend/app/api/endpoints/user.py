"""
User endpoints
"""

from typing import Any

from app.api import APIRoute, Request
from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.user import User, UserCreate
from app.types import UserId
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/user",
    tags=["User"],
    route_class=APIRoute,
)


@router.get("")
async def get_users(request: Request) -> dict[str, list[Any]]:
    """
    Endpoint to get all users on the system.
    """
    app = request.app
    return await app.db.get_raw_users()


@router.post("")  # TODO?: Remove?
async def post_user(request: Request, user: UserCreate) -> dict[str, int | None]:
    """
    Endpoint to create a user.
    """
    app = request.app
    try:
        data = await app.db.insert_user(user)
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc
    else:
        return {"id": data["id"]}


@router.get("/{user_id}")
async def get_user(request: Request, user_id: UserId) -> User:
    """
    Endpoint to get a specific user.
    """
    app = request.app
    try:
        return await app.db.get_user(user_id, punishments=True)
    except NotFound as exc:
        raise HTTPException(status_code=404, detail="User not found") from exc


@router.get("/{user_id}/group", tags=["User"])
async def get_user_groups(request: Request, user_id: UserId) -> list[dict[str, Any]]:
    """
    Endpoint to get all groups a user is a member of.
    """
    app = request.app
    try:
        return await app.db.get_user_groups(user_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=500, detail="User groups could not be found"
        ) from exc  # TODO?: 500?
