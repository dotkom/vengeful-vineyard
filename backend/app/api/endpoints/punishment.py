"""
Punishment endpoints
"""

from emoji import is_emoji
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.punishment_reaction import (
    PunishmentReactionCreate,
    PunishmentReactionRead,
)
from app.models.user import LogPunishmentOut
from app.utils.pagination import Page, Pagination
from app.types import PunishmentId

router = APIRouter(
    prefix="/punishments",
    tags=["Punishments"],
    route_class=APIRoute,
)


@router.get(
    "/log",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def get_punishments_log(
    request: Request,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[LogPunishmentOut]:
    """
    Endpoint to get all punishments.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_in_any_ow_group = await app.db.groups.is_in_any_ow_group(user_id, conn=conn)
        if not is_in_any_ow_group:
            raise HTTPException(
                status_code=403, detail="Du har ikke tilgang til denne ressursen"
            )

        pagination = Pagination[LogPunishmentOut](
            request=request,
            total_coro=app.db.punishments.get_all_count,  # use partial with group_id if you want to filter by group
            results_coro=app.db.punishments.get_all,  # use partial with group_id if you want to filter by group
            page=page,
            page_size=page_size,
        )
        return await pagination.paginate(conn=conn)


@router.post(
    "/{punishment_id}/reactions",
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
            await app.db.punishments.get(punishment_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Straffen ble ikke funnet"
            ) from exc

        if not is_emoji(punishment_reaction.emoji):
            raise HTTPException(
                status_code=400,
                detail="Emojien er ugyldig",
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
    "/{punishment_id}/reactions",
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
            raise HTTPException(
                status_code=404, detail="Straffen ble ikke funnet"
            ) from exc

        try:
            punishment_reaction = (
                await app.db.punishments.get_punishment_reaction_for_user(
                    punishment.punishment_id, user_id, conn=conn
                )
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Reaksjonen ble ikke funnet"
            ) from exc

        # Shouldn't ever get here anyways if above checks pass
        if punishment_reaction.created_by != user_id:
            raise HTTPException(
                status_code=403,
                detail="Du kan ikke slette andres reaksjoner",
            )

        await app.db.punishment_reactions.delete(
            punishment_reaction.punishment_reaction_id,
            conn=conn,
        )
