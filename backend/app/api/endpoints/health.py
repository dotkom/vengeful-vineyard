"""
Health check endpoints
"""

from fastapi import APIRouter

from app.api import APIRoute

router = APIRouter(
    tags=["Monitoring"],
    route_class=APIRoute,
)

@router.get(
    "/health",
    response_model=dict[str, str],
)
async def get_health() -> dict[str, str]:
    return {"status": "ok"}
