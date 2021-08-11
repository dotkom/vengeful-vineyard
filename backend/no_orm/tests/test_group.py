import pytest
from app.main import app
from tests.database import client


class TestGroup:
    groupId = 0

    @pytest.mark.asyncio
    async def test_no_group(self, client):
        async with client:
            response = await client.get("/group/1000")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_create_group(self, client):
        global groupId
        async with client:
            response = await client.post(
                "/group", json={"id": 0, "name": "dotkom", "rules": "myrules"}
            )
            assert response.status_code == 200
            groupId = response.json()["id"]

            response2 = await client.post(
                "/group", json={"id": 0, "name": "dotkom", "rules": "myrules2"}
            )
            assert response2.status_code == 400

    @pytest.mark.asyncio
    async def test_get_group(self, client):
        async with client:
            response = await client.get(f"/group/{groupId}")
        assert response.status_code == 200
        assert response.json() == {"id": groupId, "name": "dotkom", "rules": "myrules"}


class TestPunishmentType:
    @pytest.mark.asyncio
    async def test_create_punishmentType(self, client):
        await TestGroup.test_create_group(self, client)
        async with client:
            response = await client.post(
                "/group/1/punishmentType",
                json={"name": "Vin", "value": 100, "logoUrl": "http://example.com"},
            )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_group_with_punishmentType(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json() == [
            {
                "name": "dotkom",
                "logoUrl": "http://example.com",
                "id": 1,
                "members": [],
                "punishmentTypes": [
                    {
                        "name": "Vin",
                        "value": 100,
                        "logoUrl": "http://example.com",
                        "id": 1,
                    }
                ],
            }
        ]
