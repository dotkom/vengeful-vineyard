from fastapi import APIRouter, HTTPException
from app.api import APIRoute, Request

router = APIRouter(
    prefix="/statistics",
    tags=["Statistics"],
    route_class=APIRoute,
)

@router.get("/groups")
async def get_group_statistics(
    request: Request
):
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_in_any_ow_group = await app.db.groups.is_in_any_ow_group(user_id, conn=conn)
        if not is_in_any_ow_group:
            raise HTTPException(
                status_code=403, detail="Du har ikke tilgang til denne ressursen"
            )

        return await app.db.statistics.get_all_group_statistics(conn=conn)

@router.get("/groups/{group_id}")
async def get_group_statistics(
    request: Request,
    group_id: str
):
    app = request.app
    async with app.db.pool.acquire() as conn:
        return await app.db.statistics.get_group_statistics(group_id, conn=conn)

@router.get("/users/{user_id}")
async def get_user_statistics(
    request: Request,
    user_id: str
):
    app = request.app
    async with app.db.pool.acquire() as conn:
        return await app.db.statistics.get_user_statistics(user_id, conn=conn)