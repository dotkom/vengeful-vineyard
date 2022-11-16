"""
User endpoints
"""

from typing import Any, Optional

from app.api import APIRoute, Request
from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group import Group
from app.models.user import LeaderboardUser, User, UserCreate
from app.types import UserId
from app.utils.pagination import Page, Pagination
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/user",
    tags=["User"],
    route_class=APIRoute,
)


@router.get(
    "/leaderboard",
    response_model=Page[LeaderboardUser],
)
async def get_leadeboard(
    request: Request,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[LeaderboardUser]:
    app = request.app

    pagination = Pagination[LeaderboardUser](
        request=request,
        total_coro=app.db.users.get_count,
        results_coro=app.db.users.get_leaderboard,
        page=page,
        page_size=page_size,
    )
    return await pagination.paginate()


# @router.get("")  # Disabled
async def get_users(request: Request) -> dict[str, list[Any]]:
    """
    Endpoint to get all users on the system.
    """
    app = request.app
    return await app.db.users.get_all_raw()


# @router.post("")  # Disabled
async def post_user(
    request: Request,
    user: UserCreate,
) -> dict[str, Optional[int]]:
    """
    Endpoint to create a user.
    """
    app = request.app
    try:
        data = await app.db.users.insert(user)
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc
    else:
        return {"id": data["id"]}


@router.get(
    "/{user_id}",
    response_model=User,
)
async def get_user(request: Request, user_id: UserId) -> User:
    """
    Endpoint to get a specific user.
    """
    app = request.app
    try:
        return await app.db.users.get(user_id)
    except NotFound as exc:
        raise HTTPException(status_code=404, detail="User not found") from exc


@router.get(
    "/{user_id}/group",
    tags=["User"],
    response_model=Group,
)
async def get_user_groups(request: Request, user_id: UserId) -> list[Group]:
    """
    Endpoint to get all groups a user is a member of.
    """
    app = request.app
    try:
        return await app.db.users.get_groups(user_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=404, detail="User groups could not be found"
        ) from exc
