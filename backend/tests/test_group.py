import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_no_group():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/group")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_group():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/group", json={"name": "dotkom", "logoUrl": "http://example.com"}
        )
        response2 = await ac.post(
            "/group", json={"name": "dotkom", "logoUrl": "http://example.com"}
        )
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "dotkom",
        "logoUrl": "http://example.com",
        "members": [],
        "punishmentTypes": [],
    }
    assert response2.status_code == 400


@pytest.mark.asyncio
async def test_create_punishmentType():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/group/1/punishmentType",
            json={"name": "Vin", "value": 100, "logoUrl": "http://example.com"},
        )
    assert response.status_code == 200
