# -*- coding: utf-8 -*-
from typing import Any, Dict

import pytest
from tests.database import client
from tests.rest import rest_create_group, rest_create_user

createdUserReturn = {
    "id": 1,
}

createUser = {
    "first_name": "Joakim",
    "last_name": "Fremstad",
    "email": "email@example.com",
}

createdUser: Dict[str, Any] = createUser
createdUser["user_id"] = 1
createdUser["active"] = True
createdUser["punishments"] = []


fastResponse = 50  # Milliseconds


def checkResponseTime(response: Any, max_time: float = fastResponse) -> None:
    assert float(response.headers["Process-Time-Ms"]) <= max_time


class TestUser:
    @pytest.mark.asyncio
    async def test_no_user(self, client: Any) -> None:
        async with client:
            response = await client.get("/user")
        assert response.status_code == 200
        assert response.json() == {"users": []}
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_create_user(self, client: Any) -> None:
        response = await rest_create_user(client, createUser)
        assert response.status_code == 200
        assert response.json() == createdUserReturn
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_create_user_duplicate(self, client: Any) -> None:
        async with client:
            response = await client.post(
                "/user",
                json=createUser,
            )
        assert response.status_code == 400
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_get_user(self, client: Any) -> None:
        async with client:
            response = await client.get("/user/1")
        assert response.status_code == 200
        assert response.json() == createdUser
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_get_nonexisting_user(self, client: Any) -> None:
        async with client:
            response = await client.get("/user/10")
        assert response.status_code == 404
        checkResponseTime(response)


class TestUserInGroup:
    group_id = 1
    user_id = 1
    punishment_id = 1

    @pytest.mark.asyncio
    async def test_create_group(self, client: Any) -> None:
        response = await rest_create_group(client, "dotkom")
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
        }
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_add_user_to_group(self, client: Any) -> None:
        await TestUser.test_create_user(self, client)
        async with client:
            response = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 200
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_add_user_to_group_duplicate(self, client: Any) -> None:
        async with client:
            response = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 400
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_check_user_in_group(self, client: Any) -> None:
        async with client:
            response = await client.get("/group/1")
        assert response.status_code == 200
        assert response.json()["members"][0]["first_name"] == "Joakim"
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_create_punishmentType(self, client: Any) -> None:
        async with client:
            response = await client.post(
                "/group/1/punishmentType",
                json={"name": "Vin", "value": 100, "logo_url": "http://example.com"},
            )
        assert response.status_code == 200
        assert response.json() == {"id": 1}
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_get_group_with_punishmentType(self, client: Any) -> None:
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
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_user(self, client: Any) -> None:
        async with client:
            response = await client.post(
                f"/group/{self.group_id}/user/{self.user_id}/punishment",
                json=[
                    {
                        "punishment_type": 1,
                        "reason": "Very good reason",
                        "amount": 1,
                    }
                ],
            )
        assert response.status_code == 200
        assert response.json()["ids"] == [1]
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_verify_punishment(self, client: Any) -> None:
        async with client:
            response = await client.post(f"/punishment/{self.punishment_id}/verify")
        assert response.status_code == 200
        assert response.json()["verified_time"] is not None
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_get_user_with_punishment(self, client: Any) -> None:
        async with client:
            response = await client.get(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 200
        punishments = response.json()["punishments"]
        assert len(punishments) == 1
        assert punishments[0]["verified_time"] is not None
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_delete_punishment(self, client: Any) -> None:
        async with client:
            response = await client.delete(f"/punishment/{self.punishment_id}")
        assert response.status_code == 200
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_duplicate(self, client: Any) -> None:
        async with client:
            response = await client.delete(f"/punishment/{self.punishment_id}")
        assert response.status_code == 200
        checkResponseTime(response)

    @pytest.mark.asyncio
    async def test_verify_deleted_punishment(self, client: Any) -> None:
        async with client:
            response = await client.get(f"/group/{self.group_id}/user/{self.user_id}")
        punishments = response.json()["punishments"]
        assert len(punishments) == 0
        checkResponseTime(response)
