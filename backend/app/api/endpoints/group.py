"""
Group endpoints
"""

from functools import partial
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api import APIRoute, Request, oidc
from app.exceptions import DatabaseIntegrityException, NotFound, PunishmentTypeNotExists
from app.models.group import Group, GroupCreate
from app.models.group_event import GroupEvent, GroupEventCreate
from app.models.group_member import GroupMemberCreate
from app.models.group_user import GroupUser
from app.models.punishment import (
    PunishmentCreate,
    PunishmentStreaks,
    TotalPunishmentValue,
)
from app.models.punishment_type import PunishmentTypeCreate
from app.types import (
    GroupEventId,
    GroupId,
    OWGroupUserId,
    PunishmentId,
    PunishmentTypeId,
    UserId,
)
from app.utils.pagination import Page, Pagination

router = APIRouter(
    prefix="/group",
    tags=["Group"],
    route_class=APIRoute,
)


@router.get(
    "/me",
    response_model=list[Group],
    dependencies=[Depends(oidc)],
)
async def get_my_groups(
    request: Request,
    wait_for_updates: bool = Query(title="Wait for updates", default=True),
    optimistic: bool = Query(title="Optimistic", default=False),
) -> list[Group]:
    app = request.app
    access_token = request.raise_if_missing_authorization()

    if access_token is None:
        raise HTTPException(status_code=401, detail="Invalid access token")

    try:
        user_id, ow_user_id = await app.ow_sync.sync_for_access_token(access_token)
    except NotFound as exc:
        raise HTTPException(status_code=401, detail="Invalid access token") from exc

    if not optimistic:
        await app.ow_sync.sync_for_user(
            ow_user_id,
            user_id,
            wait_for_updates=wait_for_updates,
        )

    groups = await app.db.users.get_groups(user_id)
    return groups


@router.get(
    "/{group_id}/user/{user_id}",
    response_model=GroupUser,
)
async def get_group_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> GroupUser:
    """
    Endpoint to get a user in the context of a group.
    """
    app = request.app
    try:
        ret = await app.db.group_users.get(group_id, user_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=404, detail="User not found or not in group"
        ) from exc

    assert isinstance(ret, GroupUser)
    return ret


@router.get(
    "/{group_id}/user/{user_id}/punishmentStreaks",
    response_model=PunishmentStreaks,
)
async def get_group_user_punishment_streaks(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> PunishmentStreaks:
    """
    Endpoint to get a user's punishment streaks in the context of a group.
    """
    app = request.app
    try:
        return await app.db.group_members.get_punishment_streaks(group_id, user_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=404, detail="User not found or not in group"
        ) from exc


@router.get(
    "/{group_id}/users",
    response_model=list[GroupUser],
)
async def get_group_users(request: Request, group_id: GroupId) -> list[GroupUser]:
    """
    Endpoint to get all users in a group.
    """
    app = request.app

    return await app.db.group_users.get_all(group_id)


@router.get(
    "/{group_id}",
    response_model=Group,
)
async def get_group(request: Request, group_id: GroupId) -> Group:
    """
    Endpoint to get a specific group.
    """
    app = request.app
    try:
        return await app.db.groups.get(group_id)
    except NotFound as exc:
        raise HTTPException(status_code=404, detail="Group not found") from exc


# @router.post("")  # Disabled
async def post_group(
    request: Request,
    group: GroupCreate,
) -> dict[str, Optional[GroupId]]:
    """
    Endpoint to create a new group.
    """
    app = request.app
    try:
        data = await app.db.groups.insert(group)
        return {"id": data["id"]}
    except DatabaseIntegrityException as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc


@router.post(
    "/{group_id}/punishmentType",
    dependencies=[Depends(oidc)],
)
async def add_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type: PunishmentTypeCreate,
) -> dict[str, int]:
    """
    Endpoint to create a custom punishment type for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        try:
            return await app.db.punishment_types.insert(
                group_id,
                punishment_type,
                conn=conn,
            )
        except DatabaseIntegrityException as exc:
            raise HTTPException(status_code=400, detail=exc.detail) from exc


@router.delete(
    "/{group_id}/punishmentType/{punishment_type_id}",
    dependencies=[Depends(oidc)],
)
async def delete_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type_id: PunishmentTypeId,
) -> None:
    """
    Endpoint to remove a custom punishment type for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        try:
            await app.db.punishment_types.delete(
                group_id,
                punishment_type_id,
                conn=conn,
            )
        except PunishmentTypeNotExists as exc:
            raise HTTPException(
                status_code=400,
                detail="The punishment type does not exist in the group's context",
            ) from exc


# @router.post("/{group_id}/user/{user_id}")  # Disabled
async def add_user_to_group(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    ow_group_user_id: Optional[OWGroupUserId] = None,
) -> dict[str, Union[GroupId, UserId]]:
    """
    Endpoint to add a user to a group.
    """
    app = request.app

    if ow_group_user_id is None:
        try:
            group = await app.db.groups.get(group_id)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc

        if group.ow_group_id is not None:
            raise HTTPException(
                status_code=400,
                detail="ow_group_user_id is required to join this group",
            )

    try:
        return await app.db.groups.insert_member(
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


@router.post(
    "/{group_id}/user/{user_id}/punishment",
    dependencies=[Depends(oidc)],
)
async def add_punishment(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    punishments: list[PunishmentCreate],
) -> dict[str, list[PunishmentId]]:
    """
    Endpoint to add a punishment to a user in the context of a specific group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    created_by, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        await app.permission_manager.raise_if_missing_permission(
            group_id,
            created_by,
            "group.add_punishment",
            conn=conn,
        )

        res = await app.db.groups.is_in_group(
            created_by,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=400,
                detail="The user is not a member of the group",
            )

        try:
            return await app.db.punishments.insert_multiple(
                group_id,
                user_id,
                created_by,
                punishments,
                conn=conn,
            )
        except DatabaseIntegrityException as exc:
            raise HTTPException(status_code=400, detail=exc.detail) from exc
        except PunishmentTypeNotExists as exc:
            raise HTTPException(status_code=400, **exc.kwargs) from exc


@router.post(
    "/{group_id}/punishments/paid",
    dependencies=[Depends(oidc)],
)
async def post_mark_punishments_as_paid(
    request: Request,
    group_id: GroupId,
    punishment_ids: list[PunishmentId],
) -> None:
    """
    Endpoint to mark punishments as paid.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        try:
            await app.db.punishments.mark_multiple_as_paid(
                group_id,
                punishment_ids,
                user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="One or more of the punishments could not be found in this groups context",
            ) from exc


@router.post(
    "/{group_id}/punishments/unpaid",
    dependencies=[Depends(oidc)],
)
async def post_mark_punishments_as_unpaid(
    request: Request,
    group_id: GroupId,
    punishment_ids: list[PunishmentId],
) -> None:
    """
    Endpoint to mark punishments as unpaid.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        try:
            await app.db.punishments.mark_multiple_as_unpaid(
                group_id,
                punishment_ids,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="One or more of the punishments could not be found in this groups context",
            ) from exc


@router.post(
    "/{group_id}/user/{user_id}/punishments/paid/all",
    dependencies=[Depends(oidc)],
)
async def post_mark_all_punishments_as_paid_for_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    """
    Endpoint to mark all punishments as paid for a given user.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            requester_user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action",
            )

        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=400,
                detail="The user is not a member of the group",
            )

        try:
            await app.db.punishments.mark_all_punishments_as_paid_for_user(
                group_id,
                user_id,
                requester_user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="No unpaid punishments found",
            ) from exc


@router.get(
    "/{group_id}/events",
    dependencies=[Depends(oidc)],
    response_model=Page[GroupEvent],
)
async def get_group_events(
    request: Request,
    group_id: GroupId,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[GroupEvent]:
    """
    Endpoint to get the events of a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to view this information.",
            )

    pagination = Pagination[GroupEvent](
        request=request,
        total_coro=partial(app.db.group_events.get_count, group_id),
        results_coro=partial(app.db.group_events.get_all_with_offset, group_id),
        page=page,
        page_size=page_size,
    )
    return await pagination.paginate()


@router.post(
    "/{group_id}/events",
    dependencies=[Depends(oidc)],
)
async def post_group_event(
    request: Request, group_id: GroupId, event: GroupEventCreate
) -> dict[str, GroupEventId]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    if event.end_time is not None:
        if event.start_time >= event.end_time:
            raise HTTPException(
                status_code=400,
                detail="The start time must be before the end time",
            )

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action.",
            )

        res = await app.db.group_events.exists_between(
            group_id,
            event.start_time,
            event.end_time,
            conn=conn,
        )
        if res:
            raise HTTPException(
                status_code=400,
                detail="There is already an event in this time frame",
            )

        return await app.db.group_events.insert(
            group_id,
            event,
            user_id,
            conn=conn,
        )


@router.delete(
    "/{group_id}/events/{event_id}",
    dependencies=[Depends(oidc)],
)
async def delete_group_event(
    request: Request, group_id: GroupId, event_id: GroupEventId
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action.",
            )

        await app.db.group_events.delete(
            event_id,
            conn=conn,
        )


@router.get(
    "/{group_id}/totalPunishmentValue",
    dependencies=[Depends(oidc)],
    response_model=TotalPunishmentValue,
)
async def total_punishment_value(
    request: Request,
    group_id: GroupId,
) -> TotalPunishmentValue:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to view this information.",
            )

        return await app.db.groups.get_total_punishment_value(
            group_id,
            conn=conn,
        )
