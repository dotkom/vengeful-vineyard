"""
User endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api import APIRoute, Request, oidc
from app.exceptions import NotFound
from app.models.group import UserWithGroupsAndInvites
from app.models.user import LeaderboardUser, User
from app.utils.pagination import Page, Pagination

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    route_class=APIRoute,
)


@router.get(
    "/me",
    response_model=UserWithGroupsAndInvites,
    dependencies=[Depends(oidc)],
)
async def get_me(
    request: Request,
    include_groups: bool = Query(title="Include groups", default=True),
    include_invites: bool = Query(title="Include invites", default=True),
    wait_for_updates: bool = Query(title="Wait for updates", default=True),
    optimistic: bool = Query(title="Optimistic", default=False),
) -> User:
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
        if include_invites:
            invites = await app.db.group_invites.get_with_metadata_by_user(user_id, conn=conn)


        user = await app.db.users.get(user_id=user_id, conn=conn)

        return UserWithGroupsAndInvites(
            groups=groups,
            invites=invites,
            **dict(user),
        )


@router.get(
    "/search",
    response_model=list[User],
    dependencies=[Depends(oidc)],
)
async def search_users(
    request: Request,
    query: str = Query(title="Query", default=""),
    limit: int = Query(title="Limit", default=5, ge=1, le=10),
) -> list[User]:
    """
    Endpoint to search for users.
    """
    request.raise_if_missing_authorization()
    app = request.app

    if len(query) < 1:
        return []

    return await app.db.users.search(
        query, limit=limit
    )



@router.get(
    "/leaderboard",
    response_model=Page[LeaderboardUser],
    dependencies=[Depends(oidc)],
)
async def get_leadeboard(
    request: Request,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[LeaderboardUser]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_in_any_ow_group = await app.db.groups.is_in_any_ow_group(user_id, conn=conn)
        if not is_in_any_ow_group:
            raise HTTPException(
                status_code=403, detail="Du har ikke tilgang til denne ressursen"
            )

        pagination = Pagination[LeaderboardUser](
            request=request,
            total_coro=app.db.users.get_leaderboard_count,
            results_coro=app.db.users.get_leaderboard,
            page=page,
            page_size=page_size,
        )
        return await pagination.paginate(conn=conn)
