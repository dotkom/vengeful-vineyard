# flake8: noqa

from typing import Any

import pytest
from tests.fixtures import client
from tests.response_time import check_response_time
from tests.test_user import DEFAULT_PUNISHMENT_TYPES


class TestGroup:
    @pytest.mark.asyncio
    async def test_no_group(self, client: Any) -> None:
        response = await client.get("/group/1000")
        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_group(self, client: Any) -> None:
        response = await client.post(
            "/group",
            json={
                "name": "DotkomLong",
                "name_short": "DotkomShort",
                "rules": "myrules",
                "image": "myimage",
            },
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_group_duplicate_fail(self, client: Any) -> None:
        response = await client.post(
            "/group",
            json={
                "name": "DotkomLong",
                "name_short": "DotkomShort",
                "rules": "myrules2",
                "image": "myimage2",
            },
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group(self, client: Any) -> None:
        response = await client.get("/group/1")
        assert response.status_code == 200
        assert response.json() == {
            "group_id": 1,
            "name": "DotkomLong",
            "name_short": "DotkomShort",
            "ow_group_id": None,
            "image": "myimage",
            "rules": "myrules",
            "members": [],
            "punishment_types": DEFAULT_PUNISHMENT_TYPES,
        }
        check_response_time(response)


class TestPunishmentType:
    group_id = 1

    @pytest.mark.asyncio
    async def test_create_punishment_type(self, client: Any) -> None:
        await TestGroup.test_create_group(self, client)
        response = await client.post(
            f"/group/{self.group_id}/punishmentType",
            json={"name": "Vin", "value": 123, "logo_url": "http://example.com"},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type_duplicate(self, client: Any) -> None:
        response = await client.post(
            f"/group/{self.group_id}/punishmentType",
            json={"name": "Vin", "value": 100, "logo_url": "http://example.com"},
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_with_punishment_type(self, client: Any) -> None:
        response = await client.get("/group/1")
        assert response.status_code == 200
        json = response.json()
        assert json["name"] == "DotkomLong"
        assert json["group_id"] == 1
        assert {
            "name": "Vin",
            "value": 123,
            "logo_url": "http://example.com",
            "punishment_type_id": 4,
        } in json["punishment_types"]
        check_response_time(response)
