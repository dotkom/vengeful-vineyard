"""
Punishment endpoints
"""

from emoji import is_emoji
from fastapi import APIRouter, Depends, HTTPException

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.punishment_reaction import (
    PunishmentReactionCreate,
    PunishmentReactionRead,
)
from app.types import PunishmentId

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


@router.post(
    "/{punishment_id}/reaction",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def post_punishment_reaction(
    request: Request,
    punishment_id: PunishmentId,
    punishment_reaction: PunishmentReactionCreate,
) -> PunishmentReactionRead:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment = await app.db.punishments.get(punishment_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Punishment not found") from exc

        group_id = punishment.group_id

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

        if not is_emoji(punishment_reaction.emoji):
            raise HTTPException(
                status_code=400,
                detail="Emoji is invalid.",
            )

        try:
            reaction = await app.db.punishments.get_punishment_reaction_for_user(
                punishment_id=punishment_id,
                user_id=user_id,
                conn=conn,
            )
        except NotFound:
            pass
        else:
            await app.db.punishment_reactions.delete(
                punishment_reaction_id=reaction.punishment_reaction_id,
                conn=conn,
            )

        res_punishment_reaction = await app.db.punishment_reactions.insert(
            punishment_id,
            user_id,
            punishment_reaction,
            conn=conn,
        )

        return res_punishment_reaction


@router.delete(
    "/{punishment_id}/reaction",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def delete_punishment_reaction(
    request: Request,
    punishment_id: PunishmentId,
) -> None:
    """
    Endpoint to delete a punishment reaction.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            punishment = await app.db.punishments.get(punishment_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(status_code=404, detail="Punishment not found") from exc

        try:
            punishment_reaction = (
                await app.db.punishments.get_punishment_reaction_for_user(
                    punishment.punishment_id, user_id, conn=conn
                )
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Punishment reaction not found"
            ) from exc

        # Shouldn't ever get here anyways if above checks pass
        if punishment_reaction.created_by != user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot delete this punishment reaction",
            )

        await app.db.punishment_reactions.delete(
            punishment_reaction.punishment_reaction_id,
            conn=conn,
        )
