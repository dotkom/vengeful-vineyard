"""
Punishment endpoints
"""

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.types import PunishmentId
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
