"""
Punishment endpoints
"""

from app import db
from app.models.punishment import PunishmentOut
from app.types import PunishmentId
from fastapi import APIRouter

router = APIRouter(prefix="/punishment", tags=["Punishment"])


@router.delete("/{punishment_id}", tags=["Punishment"])
async def delete_punishment(punishment_id: PunishmentId) -> None:
    """
    Endpoint to delete a punishment.
    """
    await db.delete_punishment(punishment_id)


@router.post("/{punishment_id}/verify", tags=["Punishment"])
async def verify_punishment(punishment_id: PunishmentId) -> PunishmentOut:
    """
    Endpoint to mark a punishment as verified (paid/done).
    """
    return await db.verify_punishment(punishment_id)
