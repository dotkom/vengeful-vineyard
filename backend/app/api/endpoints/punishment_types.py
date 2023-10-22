from fastapi import APIRouter, Depends, HTTPException

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.types import GroupId, PunishmentTypeId

router = APIRouter(
    prefix="/group/{group_id}/punishment_types",
    tags=["Punishment Types"],
    route_class=APIRoute,
)


@router.get("/", tags=["Punishment Types"], dependencies=[Depends(oidc)])
async def get_punishment_types(
    request: Request,
    group_id: GroupId,
) -> list[PunishmentTypeRead]:
    """
    Endpoint to get all punishment types for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            res = await app.db.groups.is_in_group(
                user_id,
                group_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc

        if not res:
            raise HTTPException(status_code=403, detail="User is not in group")

        punishment_types = await app.db.punishment_types.get_all(group_id, conn=conn)

        return punishment_types


@router.get(
    "/{punishment_type_id}", tags=["Punishment Types"], dependencies=[Depends(oidc)]
)
async def get_punishment_type(
    request: Request,
    punishment_type_id: PunishmentTypeId,
    group_id: GroupId,
) -> PunishmentTypeRead:
    """
    Endpoint to get a punishment type.
    """

    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment_type: PunishmentTypeRead = await app.db.punishment_types.get(
                punishment_type_id, conn=conn
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Punishment type not found"
            ) from exc

        try:
            res = await app.db.groups.is_in_group(
                user_id,
                group_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc

        if not res:
            raise HTTPException(
                status_code=403,
                detail="You are not in the group for this punishment type",
            )

        return punishment_type


@router.delete(
    "/{punishment_type_id}", tags=["Punishment Types"], dependencies=[Depends(oidc)]
)
async def delete_punishment_type(
    request: Request,
    punishment_type_id: PunishmentTypeId,
    group_id: GroupId,
) -> None:
    """
    Endpoint to delete a punishment type.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment_type: PunishmentTypeRead = await app.db.punishment_types.get(
                punishment_type_id, conn=conn
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Punishment type not found"
            ) from exc

        try:
            res = await app.db.groups.is_in_group(
                user_id,
                group_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc

        if not res:
            raise HTTPException(
                status_code=403,
                detail="You are not in the group for this punishment type",
            )

        await app.db.punishment_types.delete(
            punishment_type_id=punishment_type_id,
            conn=conn,
        )


@router.post(
    "/{punishment_type_id}", tags=["Punishment Types"], dependencies=[Depends(oidc)]
)
async def post_punishment_type(
    request: Request,
    group_id: GroupId,
    punishment_type: PunishmentTypeCreate,
) -> PunishmentTypeRead:
    """
    Endpoint to create a punishment type.
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
                detail="You are not in the group for this punishment type",
            )

        return await app.db.punishment_types.insert(
            group_id=group_id,
            punishment_type=punishment_type,
            conn=conn,
        )


@router.put(
    "/{punishment_type_id}", tags=["Punishment Types"], dependencies=[Depends(oidc)]
)
async def put_punishment_type(
    request: Request,
    punishment_type_id: PunishmentTypeId,
    new_punishment_type: PunishmentTypeCreate,
    group_id: GroupId,
) -> PunishmentTypeRead:
    """
    Endpoint to update a punishment type.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment_type: PunishmentTypeRead = await app.db.punishment_types.get(
                punishment_type_id, conn=conn
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Punishment type not found"
            ) from exc

        try:
            res = await app.db.groups.is_in_group(
                user_id,
                group_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Group not found") from exc

        if not res:
            raise HTTPException(
                status_code=403,
                detail="You are not in the group for this punishment type",
            )

        return await app.db.punishment_types.update(
            punishment_type_id=punishment_type_id,
            punishment_type=new_punishment_type,
            conn=conn,
        )
