"""
Group endpoints
"""

from typing import Any

from app.api import APIRoute, Request
from app.exceptions import (
    DatabaseIntegrityException,
    NotFound,
    PunishmentTypeNotExists,
    UserNotInGroup,
)
from app.models.group import Group, GroupCreate
from app.models.group_member import GroupMemberCreate
from app.models.punishment import PunishmentCreate
from app.models.punishment_type import PunishmentTypeCreate
from app.models.user import User
from app.types import GroupId, OWGroupUserId, PunishmentTypeId, UserId
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/group",
    tags=["Group"],
    route_class=APIRoute,
)


@router.get("/me")
async def get_my_groups(
    request: Request,
    wait_for_updates: bool = True,
) -> list[dict[str, Any]]:
    app = request.app
    request.raise_if_missing_authorization()

    access_token = request.access_token
    if access_token is None:
        raise HTTPException(status_code=401, detail="Invalid access token")

    try:
        user_id, ow_user_id = await app.ow_sync.sync_for_access_token(access_token)
    except NotFound as exc:
        raise HTTPException(status_code=401, detail="Invalid access token") from exc

    await app.ow_sync.sync_for_user(
        ow_user_id,
        user_id,
        wait_for_updates=wait_for_updates,
    )

    groups = await app.db.get_user_groups(user_id)
    return groups


@router.get("/{group_id}/user/{user_id}")
async def get_group_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> User:
    """
    Endpoint to get a user in the context of a group.
    """
    app = request.app
    try:
        return await app.db.get_group_user(group_id, user_id, punishments=True)
    except NotFound as exc:
        raise HTTPException(status_code=404, detail="User not found") from exc
    except UserNotInGroup as exc:
        raise HTTPException(
            status_code=404, detail="User is not in the specified group"
        ) from exc


@router.get("/{group_id}")
async def get_group(request: Request, group_id: GroupId) -> Group:
    """
    Endpoint to get a specific group.
    """
    app = request.app
    try:
        return await app.db.get_group(group_id)
    except NotFound as exc:
        raise HTTPException(status_code=404, detail="Group not found") from exc


@router.post("")
async def post_group(
    request: Request,
    group: GroupCreate,
) -> dict[str, int | None]:
    """
    Endpoint to create a new group.
    """
    app = request.app
    try:
        data = await app.db.insert_group(group)
        return {"id": data["id"]}
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc


@router.post("/{group_id}/punishmentType")
async def add_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type: PunishmentTypeCreate,
) -> dict[str, int]:
    """
    Endpoint to create a custom punishment type for a group.
    """
    app = request.app
    try:
        return await app.db.insert_punishment_type(group_id, punishment_type)
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc


@router.delete("/{group_id}/punishmentType/{punishment_type_id}")
async def delete_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type_id: PunishmentTypeId,
) -> None:
    """
    Endpoint to remove a custom punishment type for a group.
    """
    app = request.app
    try:
        await app.db.delete_punishment_type(group_id, punishment_type_id)
    except PunishmentTypeNotExists as exc:
        raise HTTPException(
            status_code=400,
            detail="The punishment type does not exist in the group's context",
        ) from exc


@router.post("/{group_id}/user/{user_id}")
async def add_user_to_group(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    ow_group_user_id: OWGroupUserId | None = None,
) -> dict[str, GroupId | UserId]:
    """
    Endpoint to add a user to a group.
    """
    app = request.app

    if ow_group_user_id is None:
        try:
            group = await app.db.get_group(group_id)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc
        else:
            if group.ow_group_id is not None:
                raise HTTPException(
                    status_code=400,
                    detail="ow_group_user_id is required to join this group",
                )

    try:
        return await app.db.insert_user_in_group(
            GroupMemberCreate(
                group_id=group_id,
                user_id=user_id,
                ow_group_user_id=ow_group_user_id,
            )
        )
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc
    except NotFound as exc:
        raise HTTPException(
            status_code=404,
            detail="Could not find the specified group",
        ) from exc


@router.post("/{group_id}/user/{user_id}/punishment")
async def add_punishment(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    punishments: list[PunishmentCreate],
) -> dict[str, list[int]]:
    """
    Endpoint to add a punishment to a user in the context of a specific group.
    """
    app = request.app
    try:
        return await app.db.insert_punishments(group_id, user_id, punishments)
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc
    except PunishmentTypeNotExists as exc:
        raise HTTPException(status_code=400, **exc.kwargs) from exc
