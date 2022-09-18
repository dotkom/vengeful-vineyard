"""
Punishment endpoints
"""

from app.api import Request
from app.models.punishment import PunishmentOut
from app.types import PunishmentId
from fastapi import APIRouter

router = APIRouter(prefix="/punishment", tags=["Punishment"])


@router.delete("/{punishment_id}", tags=["Punishment"])
async def delete_punishment(request: Request, punishment_id: PunishmentId) -> None:
    """
    Endpoint to delete a punishment.
    """
    app = request.app
    await app.db.delete_punishment(punishment_id)


@router.post("/{punishment_id}/verify", tags=["Punishment"])
async def verify_punishment(
    request: Request, punishment_id: PunishmentId
) -> PunishmentOut:
    """
    Endpoint to mark a punishment as verified (paid/done).
    """
    app = request.app
    return await app.db.verify_punishment(punishment_id)
