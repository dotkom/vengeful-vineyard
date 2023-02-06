"""
Punishment endpoints
"""

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.punishment import PunishmentOut
from app.types import GroupId, PunishmentId, UserId
from app.models.paid_punishment_log import PaidPunishmentsLogCreate
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(
    prefix="/punishment",
    tags=["Punishment"],
    route_class=APIRoute,
)


@router.delete(
    "/{punishment_id}",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def delete_punishment(
    request: Request,
    punishment_id: PunishmentId,
) -> None:
    """
    Endpoint to delete a punishment.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment = await app.db.punishments.get(punishment_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Punishment not found") from exc

        if punishment.user_id == user_id:
            # Can't delete your own punishment if you didn't create it
            if punishment.created_by != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You cannot delete this punishment",
                )

        await app.db.punishments.delete(
            punishment_id,
            conn=conn,
        )


@router.get(
    "/{group_id}/{user_id}/paid/logs",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def get_paid_punishments_logs(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
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
                detail="You must be a member of the group to perform this action.",
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

        value = await app.db.paid_punishments_logs.get_all_for_user(
            group_id,
            user_id,
            conn=conn,
        )
        return value


@router.get(
    "/{group_id}/{user_id}/paid/totalPaid",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def get_paid_punishments_total_paid(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
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
                detail="You must be a member of the group to perform this action.",
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

        value = await app.db.paid_punishments_logs.get_total_paid(
            group_id,
            user_id,
            conn=conn,
        )
        return value


@router.get(
    "/{group_id}/{user_id}/paid/totalUnpaid",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def get_paid_punishments_total_unpaid(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
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
                detail="You must be a member of the group to perform this action.",
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

        value = await app.db.paid_punishments_logs.get_total_unpaid(
            group_id,
            user_id,
            conn=conn,
        )
        return value


@router.post(
    "/{group_id}/{user_id}/paid",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def post_paid_punishments_logs(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    paid_punishments_logs: list[PaidPunishmentsLogCreate]
) -> None:
    """
    Endpoint to create a paid punishment log entry.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    for row in paid_punishments_logs:
        if not (0 <= row.value):
            raise HTTPException(
                status_code=400,
                detail="Value must be a positive integer",
            )

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            requester_user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="You must be a member of the group to perform this action.",
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

        await app.db.paid_punishments_logs.insert_multiple(
            group_id,
            user_id,
            paid_punishments_logs,
            requester_user_id,
            conn=conn,
        )


# @router.post(
#     "/{punishment_id}/verify",
#     tags=["Punishment"],
#     response_model=PunishmentOut,
#     dependencies=[Depends(oidc)],
# )
# async def verify_punishment(
#     request: Request,
#     punishment_id: PunishmentId,
# ) -> PunishmentOut:
#     """
#     Endpoint to mark a punishment as verified (paid/done).
#     """
#     access_token = request.raise_if_missing_authorization()

#     app = request.app
#     user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

#     async with app.db.pool.acquire() as conn:
#         try:
#             punishment = await app.db.punishments.get(
#                 punishment_id=punishment_id,
#                 conn=conn,
#             )
#         except NotFound as exc:
#             raise HTTPException(
#                 status_code=404, detail="The punishment could not be found."
#             ) from exc

#         res = await app.db.groups.is_in_group(
#             user_id=user_id,
#             group_id=punishment.group_id,
#             conn=conn,
#         )
#         if not res:
#             raise HTTPException(status_code=403, detail="You are not in the group")

#         if punishment.verified_by is not None:
#             raise HTTPException(
#                 status_code=400, detail="The punishment is already verified."
#             )

#         if punishment.user_id == user_id:
#             raise HTTPException(
#                 status_code=403, detail="You can't verify your own punishment."
#             )

#         return await app.db.punishments.verify(
#             punishment_id=punishment_id,
#             verified_by=user_id,
#             conn=conn,
#         )
