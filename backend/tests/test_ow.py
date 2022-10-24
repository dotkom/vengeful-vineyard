# flake8: noqa

from typing import Any

import pytest
from tests.fixtures import client, mock
from tests.response_time import check_response_time

ME_RESPONSE = [
    {
        "group_id": 1,
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
    }
]

ME_UPDATED_RESPONSE = [
    {
        "group_id": 1,
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "DotkomUpdated",
        "rules": "No rules",
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
    }
]

ME_GROUPS_RESPONSE = [
    {
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "ow_group_id": 4,
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": 1,
        "punishment_types": [
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "https://example.com",
                "punishment_type_id": 1,
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "https://example.com",
                "punishment_type_id": 2,
            },
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "https://example.com",
                "punishment_type_id": 3,
            },
        ],
        "members": [
            {
                "ow_user_id": 2581,
                "first_name": "Brage",
                "last_name": "",
                "email": "email1@email.com",
                "user_id": 1,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1381,
                "first_name": "Amund",
                "last_name": "",
                "email": "email2@email.com",
                "user_id": 2,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha Nguyen",
                "last_name": "",
                "email": "email3@email.com",
                "user_id": 3,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna Irene",
                "last_name": "",
                "email": "email4@email.com",
                "user_id": 4,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy Steen",
                "last_name": "",
                "email": "email5@email.com",
                "user_id": 5,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1705,
                "first_name": "B\u00f8rge",
                "last_name": "",
                "email": "email6@email.com",
                "user_id": 6,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1395,
                "first_name": "Carl",
                "last_name": "",
                "email": "email7@email.com",
                "user_id": 7,
                "active": True,
                "punishments": [],
            },
        ],
    }
]

ME_GROUPS_UPDATED_RESPONSE = [
    {
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "DotkomUpdated",
        "rules": "No rules",
        "ow_group_id": 4,
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": 1,
        "punishment_types": [
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "https://example.com",
                "punishment_type_id": 1,
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "https://example.com",
                "punishment_type_id": 2,
            },
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "https://example.com",
                "punishment_type_id": 3,
            },
        ],
        "members": [
            {
                "ow_user_id": 2581,
                "first_name": "BrageUpdated",
                "last_name": "Updated",
                "email": "email1@email.com",
                "user_id": 1,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1381,
                "first_name": "AmundUpdated",
                "last_name": "Updated",
                "email": "email2@email.com",
                "user_id": 2,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha NguyenUpdated",
                "last_name": "Updated",
                "email": "email3@email.com",
                "user_id": 3,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna IreneUpdated",
                "last_name": "Updated",
                "email": "email4@email.com",
                "user_id": 4,
                "active": True,
                "punishments": [],
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy SteenUpdated",
                "last_name": "Updated",
                "email": "email5@email.com",
                "user_id": 5,
                "active": True,
                "punishments": [],
            },
            # Removed user here
            {
                "ow_user_id": 1395,
                "first_name": "CarlUpdated",
                "last_name": "Updated",
                "email": "email7@email.com",
                "user_id": 7,
                "active": True,
                "punishments": [],
            },
            {  # Added user here
                "ow_user_id": 1998,
                "first_name": "FelixOriginal",
                "last_name": "Original",
                "email": "email8@email.com",
                "user_id": 8,
                "active": True,
                "punishments": [],
            },
        ],
    }
]


class TestOW:
    @pytest.mark.asyncio
    async def test_get_my_groups_missing_authorization(self, client: Any) -> None:
        response = await client.get("/group/me")
        assert response.status_code == 401 and response.json() == {
            "detail": "Missing authorization"
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_unauthenticated(self, client: Any, mock: Any) -> None:
        response = await client.get(
            "/group/me", headers={"Authorization": "Bearer InvalidAuth"}
        )
        assert response.status_code == 401 and response.json() == {
            "detail": "Invalid access token"
        }

    @pytest.mark.asyncio
    async def test_get_my_groups(self, client: Any, mock: Any) -> None:
        response = await client.get(
            "/group/me", headers={"Authorization": "Bearer 123"}
        )

        assert response.status_code == 200
        assert response.json() == ME_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_members(self, client: Any) -> None:
        for c, group in enumerate(ME_RESPONSE):
            response = await client.get(f"/group/{group['group_id']}")

            assert response.status_code == 200
            assert response.json() == ME_GROUPS_RESPONSE[c]

            check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_update(self, client: Any) -> None:
        response = await client.get(
            "/group/me", headers={"Authorization": "Bearer 123"}
        )

        assert response.status_code == 200
        assert response.json() == ME_UPDATED_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_members_update(self, client: Any) -> None:
        for c, group in enumerate(ME_UPDATED_RESPONSE):
            response = await client.get(f"/group/{group['group_id']}")

            assert response.status_code == 200

            response_data = response.json()
            response_data["members"] = sorted(
                response_data["members"], key=lambda x: x["ow_user_id"]  # type: ignore
            )
            set_response = ME_GROUPS_UPDATED_RESPONSE
            set_response[c]["members"] = sorted(
                set_response[c]["members"], key=lambda x: x["ow_user_id"]  # type: ignore
            )
            assert response_data == set_response[c]

            check_response_time(response)
