# flake8: noqa

import logging
from typing import Any

import pytest
from app.models.user import User, UserCreate
from app.types import UserId
from tests.fixtures import client
from tests.response_time import check_response_time
from tests.rest import rest_create_group, rest_create_user

logging.basicConfig(level=logging.DEBUG)

DEFAULT_PUNISHMENT_TYPES = [
    {
        "name": "Ølstraff",
        "value": 33,
        "logo_url": "./assets/beerOutlined.svg",
        "punishment_type_id": 1,
    },
    {
        "name": "Vinstraff",
        "value": 100,
        "logo_url": "./assets/wineOutlined.svg",
        "punishment_type_id": 2,
    },
    {
        "name": "Spritstraff",
        "value": 300,
        "logo_url": "./assets/spiritOutlined.svg",
        "punishment_type_id": 3,
    },
]

createdUserReturn = {
    "id": 1,
}

createUser = UserCreate(
    first_name="Joakim",
    last_name="Fremstad",
    email="email@example.com",
    ow_user_id=1,
)

createdUser = User(
    user_id=UserId(1),
    active=True,
    punishments=[],
    **dict(createUser),
)


class TestUser:
    @pytest.mark.asyncio
    async def test_no_user(self, client: Any) -> None:
        response = await client.get("/user")
        assert response.status_code == 200
        assert response.json() == {"users": []}
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_user(self, client: Any) -> None:
        response = await rest_create_user(client, createUser)
        assert response.status_code == 200
        assert response.json() == createdUserReturn
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_user_duplicate(self, client: Any) -> None:
        response = await client.post(
            "/user",
            json=dict(createUser),
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_user(self, client: Any) -> None:
        response = await client.get("/user/1")
        assert response.status_code == 200
        assert response.json() == dict(createdUser)
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_nonexisting_user(self, client: Any) -> None:
        response = await client.get("/user/10")
        assert response.status_code == 404
        check_response_time(response)


class TestUserInGroup:
    group_id = 1
    user_id = 1
    punishment_id = 1

    @pytest.mark.asyncio
    async def test_create_group(self, client: Any) -> None:
        response = await rest_create_group(client, "DotkomLong", "DotkomShort")
        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_add_user_to_group(self, client: Any) -> None:
        await TestUser.test_create_user(self, client)
        response = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_add_user_to_group_duplicate(self, client: Any) -> None:
        response = await client.post(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_user_groups(self, client: Any) -> None:
        response = await client.get(f"user/{self.user_id}/group")
        assert response.status_code == 200
        assert response.json()[0]["name"] == "DotkomLong"
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_check_user_in_group(self, client: Any) -> None:
        response = await client.get("/group/1")
        assert response.status_code == 200
        assert response.json()["members"][0]["first_name"] == "Joakim"
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type(self, client: Any) -> None:
        response = await client.post(
            "/group/1/punishmentType",
            json={
                "name": "Waffles",
                "value": 125,
                "logo_url": "./assets/beerOutlined.svg",
            },
        )
        assert response.status_code == 200
        assert response.json() == {"id": 4}
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_with_punishment_type(self, client: Any) -> None:
        response = await client.get(f"/group/{self.group_id}")
        assert response.status_code == 200
        assert response.json()["punishment_types"] == DEFAULT_PUNISHMENT_TYPES + [
            {
                "name": "Waffles",
                "value": 125,
                "logo_url": "./assets/beerOutlined.svg",
                "punishment_type_id": 4,
            },
        ]
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_user(self, client: Any) -> None:
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
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_verify_punishment(self, client: Any) -> None:
        response = await client.post(f"/punishment/{self.punishment_id}/verify")
        assert response.status_code == 200
        assert response.json()["verified_time"] is not None
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_user_with_punishment(self, client: Any) -> None:
        response = await client.get(f"/group/{self.group_id}/user/{self.user_id}")
        assert response.status_code == 200
        punishments = response.json()["punishments"]
        assert len(punishments) == 1
        assert punishments[0]["verified_time"] is not None
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_with_punishment(self, client: Any) -> None:
        response = await client.get(f"/group/{self.group_id}")
        assert response.status_code == 200

        punishments = response.json()["members"][0].get("punishments")
        assert punishments is not None
        assert len(punishments) == 1
        assert punishments[0]["verified_time"] is not None
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_users_with_punishment(self, client: Any) -> None:
        response = await client.get(f"/group/{self.group_id}/users")
        assert response.status_code == 200

        punishments = response.json()[0].get("punishments")
        assert punishments is not None
        assert len(punishments) == 1
        assert punishments[0]["verified_time"] is not None
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment(self, client: Any) -> None:
        response = await client.delete(f"/punishment/{self.punishment_id}")
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_duplicate(self, client: Any) -> None:
        response = await client.delete(f"/punishment/{self.punishment_id}")
        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_verify_deleted_punishment(self, client: Any) -> None:
        response = await client.get(f"/group/{self.group_id}/user/{self.user_id}")
        punishments = response.json()["punishments"]
        assert not punishments
        check_response_time(response)
