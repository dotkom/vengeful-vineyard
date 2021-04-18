import pytest
from app.main import app
from tests.database import client


class TestGroup:
    @pytest.mark.asyncio
    async def test_no_group(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_create_group(self, client):
        async with client:
            response = await client.post(
                "/group", json={"name": "dotkom", "logoUrl": "http://example.com"}
            )
            response2 = await client.post(
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
    async def test_get_group(self, client):
        async with client:
            response = await client.get("/group")
        assert response.status_code == 200
        assert response.json() == [
            {
                "name": "dotkom",
                "logoUrl": "http://example.com",
                "id": 1,
                "members": [],
                "punishmentTypes": [],
            }
        ]


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
