"""
Health check endpoints
"""

from fastapi import APIRouter

from app.api import APIRoute

router = APIRouter(
    prefix="/health",
    tags=["Monitoring"],
    route_class=APIRoute,
)

@router.get(
    "/",
    response_model=dict[str, str],
)
async def get_health() -> dict[str, str]:
    return {"status": "ok"}
