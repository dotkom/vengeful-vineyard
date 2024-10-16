"""
User endpoints
"""

from app.models.punishment import LeaderboardPunishmentRead
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.group import UserWithGroups
from app.models.user import MinifiedLeaderboardUser
from app.utils.pagination import Page, Pagination
from app.types import UserId

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    route_class=APIRoute,
)


@router.get(
    "/me",
    response_model=UserWithGroups,
    dependencies=[Depends(oidc)],
)
async def get_me(
    request: Request,
    include_groups: bool = Query(title="Include groups", default=True),
    wait_for_updates: bool = Query(title="Wait for updates", default=True),
    optimistic: bool = Query(title="Optimistic", default=False),
) -> UserWithGroups:
    app = request.app
    access_token = request.raise_if_missing_authorization()

    if access_token is None:
        raise HTTPException(status_code=401, detail="Ugyldig access token")

    try:
        user_id, ow_user_id = await app.ow_sync.sync_for_access_token(access_token)
    except NotFound as exc:
        raise HTTPException(status_code=401, detail="Ugyldig access token") from exc

    if not optimistic:
        await app.ow_sync.sync_for_user(
            ow_user_id,
            user_id,
            wait_for_updates=wait_for_updates,
        )

    async with app.db.pool.acquire() as conn:
        groups = []
        if include_groups:
            groups = await app.db.users.get_groups(user_id, conn=conn)

        user = await app.db.users.get(user_id=user_id, conn=conn)

        return UserWithGroups(
            groups=groups,
            **dict(user),
        )


@router.get(
    "/leaderboard",
    response_model=Page[MinifiedLeaderboardUser],
    dependencies=[Depends(oidc)],
)
async def get_leadeboard(
    request: Request,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[MinifiedLeaderboardUser]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        # is_in_any_ow_group = await app.db.groups.is_in_any_ow_group(user_id, conn=conn)
        # if not is_in_any_ow_group:
        #     raise HTTPException(
        #         status_code=403, detail="Du har ikke tilgang til denne ressursen"
        #     )

        pagination = Pagination[MinifiedLeaderboardUser](
            request=request,
            total_coro=app.db.users.get_leaderboard_count,
            # results_coro=app.db.users.get_leaderboard,
            results_coro=app.db.users.get_minified_leaderboard,
            page=page,
            page_size=page_size,
        )
        return await pagination.paginate(conn=conn)
    
@router.get(
    "/leaderboard/punishments/{user_id}",
    response_model=list[LeaderboardPunishmentRead],
    dependencies=[Depends(oidc)],
)
async def get_user_punishments(
    request: Request,
    user_id: UserId,
) -> list[LeaderboardPunishmentRead]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    _, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        return await app.db.users.get_punishments_for_leaderboard_user(user_id, conn=conn)
