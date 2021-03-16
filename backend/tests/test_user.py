import pytest
from app.main import app
from tests.database import client

createdUser = {
    "id": 1,
    "name": "Joakim",
    "active": True,
    "debt": 0,
    "punishments": [],
    "totalPaid": 0,
}


class TestUser:
    @pytest.mark.asyncio
    async def test_no_user(self, client):
        async with client:
            response = await client.get("/user")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_create_user(self, client):
        async with client:
            response = await client.post("/user", json={"name": "Joakim"})
        assert response.status_code == 200
        assert response.json() == createdUser

    @pytest.mark.asyncio
    async def test_create_sameuser(self, client):
        async with client:
            response = await client.post("/user", json={"name": "Joakim"})
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_read_user(self, client):
        async with client:
            response = await client.get("/user/1")
        assert response.status_code == 200
        assert response.json() == createdUser

    @pytest.mark.asyncio
    async def test_read_baduser(self, client):
        async with client:
            response = await client.get("/user/10")
        assert response.status_code == 404


class TestUserInGroup:
    @pytest.mark.asyncio
    async def test_create_user(self, client):
        async with client:
            response = await client.post("/user", json={"name": "Joakim"})
        assert response.status_code == 200
        assert response.json() == createdUser

    @pytest.mark.asyncio
    async def test_create_group(self, client):
        async with client:
            response = await client.post(
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

    @pytest.mark.asyncio
    async def test_add_user_to_group(self, client):
        async with client:
            response = await client.post("/group/1/1")
            response2 = await client.post("/group/1/1")
        assert response.status_code == 200
        assert response2.status_code == 400

    @pytest.mark.asyncio
    async def test_user_in_group(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json()[0]["members"][0]["name"] == "Joakim"

    @pytest.mark.asyncio
    async def test_create_punishmentType(self, client):
        async with client:
            response = await client.post(
                "/group/1/punishmentType",
                json={"name": "Vin", "value": 100, "logoUrl": "http://example.com"},
            )
        assert response.status_code == 200
        assert response.json()["name"] == "Vin"

    @pytest.mark.asyncio
    async def test_get_group_with_punishmentType(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json()[0]["punishmentTypes"] == [
            {"name": "Vin", "value": 100, "logoUrl": "http://example.com", "id": 1}
        ]
