import pytest

from app.main import app
from tests.database import client

createdUserReturn = {
    "id": 1,
}

createUser = {
    "first_name": "Joakim",
    "last_name": "Fremstad",
    "email": "email@example.com",
    "active": True,
}

createdUser = createUser
createdUser["user_id"] = 1


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
                json=createUser,
            )
        assert response.status_code == 200
        assert response.json() == createdUserReturn

    @pytest.mark.asyncio
    async def test_create_user_duplicate(self, client):
        async with client:
            response = await client.post(
                "/user",
                json=createUser,
            )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_get_user(self, client):
        async with client:
            response = await client.get("/user/1")
        assert response.status_code == 200
        assert response.json() == createdUser

    @pytest.mark.asyncio
    async def test_get_nonexisting_user(self, client):
        async with client:
            response = await client.get("/user/10")
        assert response.status_code == 404


class TestUserInGroup:
    group_id = 1
    user_id = 1
    punishment_id = 1

    @pytest.mark.asyncio
    async def test_create_group(self, client):
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
        await TestUser.test_create_user(self, client)
        async with client:
            response = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_add_user_to_group_duplicate(self, client):
        async with client:
            response2 = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response2.status_code == 400

    @pytest.mark.asyncio
    async def test_check_user_in_group(self, client):
        async with client:
            response = await client.get("/group/1")
        assert response.status_code == 200
        assert response.json()["members"][0]["first_name"] == "Joakim"

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
            response = await client.get(f"/group/{self.group_id}")
        assert response.status_code == 200
        assert response.json()["punishment_types"] == [
            {
                "name": "Vin",
                "value": 100,
                "logo_url": "http://example.com",
                "punishment_type_id": 1,
            }
        ]

    @pytest.mark.asyncio
    async def test_create_punishment_on_user(self, client):
        async with client:
            response = await client.post(
                f"/group/{self.group_id}/user/{self.user_id}/punishment",
                json={
                    "punishment_type_id": 1,
                    "reason": "Good",
                },
            )
        assert response.status_code == 200
        assert response.json()["id"] == 1

    @pytest.mark.asyncio
    async def test_verify_punishment(self, client):
        async with client:
            response = await client.post(
                f"/group/{self.group_id}/user/{self.user_id}/punishment/{self.punishment_id}/verify"
            )
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
            response = await client.delete(
                f"/group/{self.group_id}/user/{self.user_id}/punishment/{self.punishment_id}"
            )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_verify_deleted_punishment(self, client):
        async with client:
            response = await client.get("/user")
        punishments = response.json()[0]["punishments"]
        assert len(punishments) == 0
