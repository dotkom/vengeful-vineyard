"""
Punishment endpoints
"""

from app.api import APIRoute, Request
from app.exceptions import NotFound
from app.models.punishment import PunishmentOut
from app.types import PunishmentId
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/punishment",
    tags=["Punishment"],
    route_class=APIRoute,
)


@router.delete("/{punishment_id}", tags=["Punishment"])
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
            punishment = await app.db.get_punishment(punishment_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Punishment not found") from exc

        if punishment.user_id == user_id:
            # Can't delete your own punishment if you didn't create it
            if punishment.created_by != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You cannot delete this punishment",
                )

        await app.db.delete_punishment(
            punishment_id,
            conn=conn,
        )


@router.post("/{punishment_id}/verify", tags=["Punishment"])
async def verify_punishment(
    request: Request,
    punishment_id: PunishmentId,
) -> PunishmentOut:
    """
    Endpoint to mark a punishment as verified (paid/done).
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment = await app.db.get_punishment(
                punishment_id=punishment_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="The punishment could not be found."
            ) from exc

        res = await app.db.is_in_group(
            user_id=user_id,
            group_id=punishment.group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(status_code=403, detail="You are not in the group")

        if punishment.verified_by is not None:
            raise HTTPException(
                status_code=400, detail="The punishment is already verified."
            )

        if punishment.user_id == user_id:
            raise HTTPException(
                status_code=403, detail="You can't verify your own punishment."
            )

        return await app.db.verify_punishment(
            punishment_id=punishment_id,
            verified_by=user_id,
            conn=conn,
        )
