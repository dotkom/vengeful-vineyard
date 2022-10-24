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
async def delete_punishment(request: Request, punishment_id: PunishmentId) -> None:
    """
    Endpoint to delete a punishment.
    """
    app = request.app
    try:
        await app.db.delete_punishment(punishment_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=404, detail="The punishment could not be found."
        ) from exc


@router.post("/{punishment_id}/verify", tags=["Punishment"])
async def verify_punishment(
    request: Request, punishment_id: PunishmentId
) -> PunishmentOut:
    """
    Endpoint to mark a punishment as verified (paid/done).
    """
    app = request.app
    try:
        return await app.db.verify_punishment(punishment_id)
    except NotFound as exc:
        raise HTTPException(
            status_code=404, detail="The punishment could not be found."
        ) from exc
