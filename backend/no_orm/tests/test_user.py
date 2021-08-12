import pytest

from app.main import app
from tests.database import client

createdUserReturn = {
    "id": 1,
}

createdUser = {
    "user_id": 1,
    "first_name": "Joakim",
    "last_name": "Fremstad",
    "active": True,
}


class TestUser:
    @pytest.mark.asyncio
    async def test_no_user(self, client):
        async with client:
            response = await client.get("/user")
        assert response.status_code == 200
        assert response.json() == {"users": []}

    @pytest.mark.asyncio
    async def test_create_user(self, client):
        async with client:
            response = await client.post(
                "/user",
                json={"first_name": "Joakim", "last_name": "Fremstad", "active": True},
            )
        assert response.status_code == 200
        assert response.json() == createdUserReturn

    @pytest.mark.asyncio
    async def test_create_sameuser(self, client):
        async with client:
            response = await client.post(
                "/user",
                json={"first_name": "Joakim", "last_name": "Fremstad", "active": True},
            )
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
    async def test_create_group(self, client):
        await TestUser.test_create_user(self, client)
        async with client:
            response = await client.post(
                "/group", json={"name": "dotkom", "rules": "http://example.com"}
            )
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
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
                json={"name": "Vin", "value": 100, "logo_url": "http://example.com"},
            )
        assert response.status_code == 200
        assert response.json() == {"id": 1}

    @pytest.mark.asyncio
    async def test_get_group_with_punishmentType(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json()[0]["punishmentTypes"] == [
            {"name": "Vin", "value": 100, "logo_url": "http://example.com", "id": 1}
        ]

    @pytest.mark.asyncio
    async def test_create_punishment_on_user(self, client):
        async with client:
            response = await client.post(
                "/punishment",
                json={
                    "reason": "Good",
                    "type_id": 1,
                    "givenTo_id": 1,
                    "group_id": 1,
                },
            )
        assert response.status_code == 200
        assert response.json()["reason"] == "Good"

    @pytest.mark.asyncio
    async def test_verify_punishment(self, client):
        async with client:
            response = await client.post("/punishment/1/verify")
        assert response.status_code == 200
        assert response.json()["verifiedTime"] is not None

    @pytest.mark.asyncio
    async def test_get_user_with_punishment(self, client):
        async with client:
            response = await client.get("/user")
        assert response.status_code == 200
        punishments = response.json()[0]["punishments"]
        assert len(punishments) == 1
        assert punishments[0]["verifiedTime"] is not None

    @pytest.mark.asyncio
    async def test_delete_punishment(self, client):
        async with client:
            response = await client.delete("/punishment/1")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_verify_deleted_punishment(self, client):
        async with client:
            response = await client.get("/user")
        punishments = response.json()[0]["punishments"]
        assert len(punishments) == 0
