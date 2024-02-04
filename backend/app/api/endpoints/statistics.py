from fastapi import APIRouter
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
    app = request.app
    async with app.db.pool.acquire() as conn:
        return await app.db.statistics.get_group_statistics(conn=conn)

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