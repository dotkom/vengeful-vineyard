from typing import Any

import pytest

from app.main import app
from tests.database import client


class TestGroup:
    @pytest.mark.asyncio
    async def test_no_group(self, client: Any) -> None:
        async with client:
            response = await client.get("/group/1000")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_create_group(self, client: Any) -> None:
        async with client:
            response = await client.post(
                "/group", json={"group_id": 0, "name": "dotkom", "rules": "myrules"}
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_create_group_duplicate_fail(self, client: Any) -> None:
        async with client:
            response = await client.post(
                "/group", json={"group_id": 0, "name": "dotkom", "rules": "myrules2"}
            )
            assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_get_group(self, client: Any) -> None:
        async with client:
            response = await client.get(f"/group/1")
        assert response.status_code == 200
        assert response.json() == {
            "group_id": 1,
            "name": "dotkom",
            "rules": "myrules",
            "punishment_types": [],
        }


class TestPunishmentType:
    group_id = 1

    @pytest.mark.asyncio
    async def test_create_punishmentType(self, client: Any) -> None:
        await TestGroup.test_create_group(self, client)
        async with client:
            response = await client.post(
                f"/group/{self.group_id}/punishmentType",
                json={"name": "Vin", "value": 123, "logo_url": "http://example.com"},
            )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_create_punishmentType_duplicate(self, client: Any) -> None:
        async with client:
            response = await client.post(
                f"/group/{self.group_id}/punishmentType",
                json={"name": "Vin", "value": 100, "logo_url": "http://example.com"},
            )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_get_group_with_punishmentType(self, client: Any) -> None:
        async with client:
            response = await client.get("/group/1")
        assert response.status_code == 200
        assert response.json() == {
            "name": "dotkom",
            "rules": "myrules",
            "group_id": 1,
            # "members": [],
            "punishment_types": [
                {
                    "name": "Vin",
                    "value": 123,
                    "logo_url": "http://example.com",
                    "punishment_type_id": 1,
                }
            ],
        }
