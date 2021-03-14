import pytest
from httpx import AsyncClient

from app.main import app

createdUser = {
    "id": 1,
    "name": "Joakim",
    "active": True,
    "debt": 0,
    "punishments": [],
    "totalPaid": 0,
}


@pytest.mark.asyncio
async def test_no_user():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/user")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/user", json={"name": "Joakim"})
    assert response.status_code == 200
    assert response.json() == createdUser


@pytest.mark.asyncio
async def test_create_sameuser():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/user", json={"name": "Joakim"})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_read_user():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/user/1")
    assert response.status_code == 200
    assert response.json() == createdUser


@pytest.mark.asyncio
async def test_read_baduser():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/user/10")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_add_user_to_group():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/group/1/1")
        response2 = await ac.post("/group/1/1")
    assert response.status_code == 200
    assert response2.status_code == 400
