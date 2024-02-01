# flake8: noqa

import copy
from typing import Any

import pytest

from app.api import FastAPI
from app.config import OW_GROUP_PERMISSIONS_AS_DICT, OW_GROUP_ROLES
from tests.fixtures import client, mock
from tests.response_time import check_response_time

from .common import *
from .utils import suppress_defaults

GROUP_ID = GROUP_1_ID
SELF_USER_ID = USER_1_ID
OTHER_USER_ID = USER_2_ID
OTHER_USER_NOT_IN_GROUP_ID = USER_3_ID
SELF_USER_AUTHORIZATION = USER_1_AUTHORIZATION
OTHER_USER_AUTHORIZATION = USER_2_AUTHORIZATION
OTHER_USER_NOT_IN_GROUP_AUTHORIZATION = USER_3_AUTHORIZATION


GROUPS_ME_RESPONSE = [
    {
        "group_id": "",
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "members": [],
        "punishment_types": [],
        "join_requests": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "roles": [],
        "permissions": {},
    }
]

USERS_ME_RESPONSE = {
    "ow_user_id": 2581,
    "user_id": "",
    "first_name": "Brage",
    "last_name": "",
    "email": "email1@email.com",
    "groups": GROUPS_ME_RESPONSE,
}

USERS_ME_RESPONSE_EMPTY_GROUPS = copy.copy(USERS_ME_RESPONSE)
USERS_ME_RESPONSE_EMPTY_GROUPS["groups"] = []

ME_UPDATED_RESPONSE = [
    {
        "group_id": "",
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "DotkomUpdated",
        "rules": "No rules",
        "members": [],
        "punishment_types": [],
        "join_requests": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "roles": [],
        "permissions": {},
    }
]

ME_NEW_USER_RESPONSE: list[dict[str, Any]] = [
    {
        "group_id": "",
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "join_requests": [],
        "members": [],
        "name": "Other- og otherkomiteen",
        "name_short": "Otherkom",
        "ow_group_id": 69,
        "punishment_types": [],
        "rules": "No rules",
        "roles": [],
        "permissions": {},
    },
]

ME_GROUPS_RESPONSE = [
    {
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "ow_group_id": 4,
        "members": [],
        "punishment_types": [],
        "join_requests": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": "",
        "punishment_types": [
            {
                "name": "Spritstraff",
                "value": 300,
                "emoji": "🍸",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "emoji": "🍺",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "emoji": "🍷",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
        ],
        "members": [
            {
                "ow_user_id": 1381,
                "first_name": "Amund",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 656,
                "email": "email2@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha Nguyen",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 658,
                "email": "email3@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy Steen",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 2227,
                "email": "email5@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": ["group.admin"],
            },
            {
                "ow_user_id": 1705,
                "first_name": "B\u00f8rge",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 1052,
                "email": "email6@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 1395,
                "first_name": "Carl",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 1551,
                "email": "email7@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 2581,
                "first_name": "Brage",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 2224,
                "email": "email1@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": ["group.owner"],
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna Irene",
                "last_name": "",
                "group_id": "",
                "ow_group_user_id": 1552,
                "email": "email4@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
        ],
        "roles": OW_GROUP_ROLES,
        "permissions": OW_GROUP_PERMISSIONS_AS_DICT,
    }
]

ME_GROUPS_UPDATED_RESPONSE = [
    {
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "DotkomUpdated",
        "rules": "No rules",
        "ow_group_id": 4,
        "members": [],
        "punishment_types": [],
        "join_requests": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": "",
        "punishment_types": [
            {
                "name": "Spritstraff",
                "value": 300,
                "emoji": "🍸",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "emoji": "🍺",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "emoji": "🍷",
                "punishment_type_id": "",
                "created_at": "",
                "updated_at": "",
                "created_by": "",
            },
        ],
        "members": [
            {  # Added user here
                "ow_user_id": 1998,
                "first_name": "FelixOriginal",
                "last_name": "Original",
                "group_id": "",
                "ow_group_user_id": 1399,
                "email": "email8@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 1381,
                "first_name": "AmundUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 656,
                "email": "email2@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha NguyenUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 658,
                "email": "email3@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna IreneUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 1552,
                "email": "email4@email.com",
                "user_id": "",
                "active": False,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy SteenUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 2227,
                "email": "email5@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
            {
                "ow_user_id": 2581,
                "first_name": "BrageUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 2224,
                "email": "email1@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": ["group.owner"],
            },
            # Removed user here
            {
                "ow_user_id": 1395,
                "first_name": "CarlUpdated",
                "last_name": "Updated",
                "group_id": "",
                "ow_group_user_id": 1551,
                "email": "email7@email.com",
                "user_id": "",
                "active": True,
                "punishments": [],
                "permissions": [],
            },
        ],
        "roles": OW_GROUP_ROLES,
        "permissions": OW_GROUP_PERMISSIONS_AS_DICT,
    }
]


DEFAULT_PUNISHMENT_TYPES = [
    {
        "name": "Spritstraff",
        "value": 300,
        "emoji": "🍸",
        "punishment_type_id": "",
        "created_at": "",
        "updated_at": "",
        "created_by": "",
    },
    {
        "name": "Ølstraff",
        "value": 33,
        "emoji": "🍺",
        "punishment_type_id": "",
        "created_at": "",
        "updated_at": "",
        "created_by": "",
    },
    {
        "name": "Vinstraff",
        "value": 100,
        "emoji": "🍷",
        "punishment_type_id": "",
        "created_at": "",
        "updated_at": "",
        "created_by": "",
    },
]

NEW_PUNISHMENT_TYPE_PAYLOAD = {
    "name": "Waffles",
    "value": 125,
    "emoji": "🍺",
}

WAFFLES_PUNISHMENT_TYPE_RESPONSE = {
    "name": "Waffles",
    "value": 125,
    "emoji": "🍺",
    "punishment_type_id": "",
    "created_at": "",
    "updated_at": "",
    "created_by": "",
}


async def setup_predictable_db_ids(app: FastAPI) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE groups SET group_id = $1 WHERE ow_group_id = 4",
            GROUP_ID,
        )

        await conn.executemany(
            "UPDATE users SET user_id = $1 WHERE ow_user_id = $2",
            [
                (SELF_USER_ID, 2581),
                (OTHER_USER_ID, 2027),
                (OTHER_USER_NOT_IN_GROUP_ID, 6666),
            ],
        )

        await conn.executemany(
            "UPDATE punishment_types SET punishment_type_id = $1 WHERE name = $2",
            [
                (PUNISHMENT_TYPE_1_ID, "Ølstraff"),
                (PUNISHMENT_TYPE_2_ID, "Vinstraff"),
            ],
        )


class TestWithDB_OW:
    @pytest.mark.asyncio
    async def test_get_my_groups_missing_authorization(self, client: Any) -> None:
        response = await client.get("/groups/me")

        assert response.status_code == 403
        check_response_time(response)

        assert response.json() == {"detail": "Not authenticated"}

    @pytest.mark.asyncio
    async def test_get_my_groups_unauthenticated(self, client: Any, mock: Any) -> None:
        response = await client.get(
            "/groups/me", headers={"Authorization": "Bearer InvalidAuth"}
        )

        assert response.status_code == 401
        check_response_time(response)

        assert response.json() == {"detail": "Ugyldig access token"}

    @pytest.mark.asyncio
    async def test_get_my_groups(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        # check_response_time(response)

        await setup_predictable_db_ids(client.app)  # Don't mess with this :)

        assert suppress_defaults(response.json()) == suppress_defaults(
            GROUPS_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_user(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/users/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            USERS_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_user_empty_groups(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/users/me?include_groups=false",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            USERS_ME_RESPONSE_EMPTY_GROUPS
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_other_user_in_group(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            GROUPS_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_members(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        def sort(x: Any) -> Any:
            x["members"].sort(key=lambda x: x["ow_user_id"])
            x["punishment_types"].sort(key=lambda x: x["name"])
            return x

        assert sort(suppress_defaults(response.json())) == sort(
            suppress_defaults(ME_GROUPS_RESPONSE[0])
        )

    @pytest.mark.asyncio
    async def test_get_group_members_user_not_in_group(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_update(self, client: Any) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            ME_UPDATED_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_members_update(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        def sort(x: Any) -> Any:
            x["members"].sort(key=lambda x: x["ow_user_id"])
            x["punishment_types"].sort(key=lambda x: x["name"])
            return x

        assert sort(suppress_defaults(response.json())) == sort(
            suppress_defaults(ME_GROUPS_UPDATED_RESPONSE[0])
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_other_not_in_group(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            ME_NEW_USER_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_create_punishment_type_user_not_in_group(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type_no_permissions(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type_invalid_emoji(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishmentTypes",
            json={
                **NEW_PUNISHMENT_TYPE_PAYLOAD,  # type: ignore
                "emoji": "g",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        await alter_punishment_type_id(
            client.app, response.json()["punishment_type_id"], PUNISHMENT_TYPE_4_ID
        )

        assert suppress_defaults(response.json()) == suppress_defaults(
            {
                **NEW_PUNISHMENT_TYPE_PAYLOAD,
                "punishment_type_id": PUNISHMENT_TYPE_4_ID,
                "created_by": "",
                "created_at": "",
                "updated_at": "",
            }
        )

    @pytest.mark.asyncio
    async def test_get_group_with_punishment_type(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        def sort(x: Any) -> Any:
            x.sort(key=lambda x: x["name"])
            return x

        assert suppress_defaults(
            sort(response.json()["punishment_types"])
        ) == suppress_defaults(
            sort(DEFAULT_PUNISHMENT_TYPES + [WAFFLES_PUNISHMENT_TYPE_RESPONSE])
        )

    @pytest.mark.asyncio
    async def test_delete_punishment_type_user_not_in_group(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishmentTypes/{PUNISHMENT_TYPE_4_ID}",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_type_no_permissions(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishmentTypes/{PUNISHMENT_TYPE_4_ID}",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_type(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishmentTypes/{PUNISHMENT_TYPE_4_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_1_ID,
                    "reason": "Very good reason",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        ids = response.json()["ids"]
        assert len(ids) == 1

        old_id = ids[0]
        await alter_punishment_id(client.app, old_id, PUNISHMENT_1_ID)

    @pytest.mark.asyncio
    async def test_create_punishment_on_other_user(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_2_ID,
                    "reason": "Very good reason2",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        ids = response.json()["ids"]
        assert len(ids) == 1

        old_id = ids[0]
        await alter_punishment_id(client.app, old_id, PUNISHMENT_2_ID)

    @pytest.mark.asyncio
    async def test_create_punishment_by_other_user(self, client: Any) -> None:
        # Should have permissions to give punishments since this is an ow group
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_2_ID,
                    "reason": "Very good reason2",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        ids = response.json()["ids"]
        assert len(ids) == 1

        old_id = ids[0]
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishments/{old_id}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_create_punishment_by_user_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_2_ID,
                    "reason": "Very good reason2",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_hidden_reason_on_other_user(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_2_ID,
                    "reason": "This is a very good hidden reason!!",
                    "reason_hidden": True,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert len(response.json()["ids"]) == 1

    @pytest.mark.asyncio
    async def test_create_punishment_on_other_user_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_NOT_IN_GROUP_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_2_ID,
                    "reason": "Very good reason2",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_reaction_on_self_user_invalid_emoji(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            json={
                "emoji": "g",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_reaction_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            json={
                "emoji": "👍",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_reaction_by_user_not_in_group(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            json={
                "emoji": "👍",
            },
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_punishment_reaction_exists(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        # Gotten in a group context. Should be 1 and not two.
        assert len(response.json()["punishments"][0]["reactions"]) == 1

    @pytest.mark.asyncio
    async def test_all_reactions_exist_on_leaderboard(self, client: Any) -> None:
        response = await client.get(
            f"/users/leaderboard?page_size=1&page=1",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        data = response.json()
        for res in data["results"]:
            for punishment in res["punishments"]:
                punishment["created_at"] = ""

                for punishment_reaction in punishment["reactions"]:
                    punishment_reaction["created_at"] = ""

        assert suppress_defaults(data) == suppress_defaults(
            {
                "next": None,
                "previous": "http://test/users/leaderboard?page_size=1&page=0",
                "results": [
                    {
                        "email": "email1@email.com",
                        "first_name": "BrageUpdated",
                        "last_name": "Updated",
                        "ow_user_id": 2581,
                        "punishments": [
                            {
                                "amount": 1,
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "emoji": "🍺",
                                    "name": "Ølstraff",
                                    "punishment_type_id": "",
                                    "value": 33,
                                    "created_at": "",
                                    "created_by": "",
                                    "updated_at": "",
                                },
                                "punishment_type_id": "",
                                "reactions": [
                                    {
                                        "emoji": "👍",
                                        "punishment_id": "",
                                        "punishment_reaction_id": "",
                                        "created_by": "",
                                        "created_by_name": "BrageUpdated Updated",
                                        "created_at": "",
                                    },
                                    {
                                        "emoji": "👍",
                                        "punishment_id": "",
                                        "punishment_reaction_id": "",
                                        "created_by": "",
                                        "created_by_name": "Felix ",
                                        "created_at": "",
                                    },
                                ],
                                "reason": "Very good reason",
                                "reason_hidden": False,
                            },
                        ],
                        "total_value": 33,
                        "user_id": "",
                    },
                ],
                "total": 2,
            }
        )

    @pytest.mark.asyncio
    async def test_replace_punishment_reaction_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            json={
                "emoji": "🧡",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_punishment_reaction_was_replaced(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert len(response.json()["punishments"][0]["reactions"]) == 1
        assert response.json()["punishments"][0]["reactions"][0]["emoji"] == "🧡"

    @pytest.mark.asyncio
    async def test_delete_reaction_from_wrong_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_reaction_from_self_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishments/{PUNISHMENT_1_ID}/reactions",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_paid_by_user_not_in_group(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishments/paid",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
            json=[PUNISHMENT_1_ID],
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_paid(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishments/paid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_punishment_value_from_other_not_in_group(
        self, client: Any
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/totalPunishmentValue",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_punishment_value(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/totalPunishmentValue",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "total_value": 233,
            "total_paid_value": 33,
        }

    @pytest.mark.asyncio
    async def test_mark_punishment_as_unpaid_by_other_not_in_group(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishments/unpaid",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_unpaid(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/punishments/unpaid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_punishment_value_updated_value(
        self, client: Any
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/totalPunishmentValue",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "total_value": 233,
            "total_paid_value": 0,
        }

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_self(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishments/{PUNISHMENT_1_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_self_duplicate(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/punishments/{PUNISHMENT_1_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_check_punishments_exists(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        punishments = response.json()["punishments"]
        assert len(punishments) == 2

        not_hidden_count = len([x for x in punishments if not x["reason_hidden"]])
        hidden_count = len([x for x in punishments if x["reason_hidden"]])

        assert not_hidden_count == 1
        assert hidden_count == 1

    @pytest.mark.asyncio
    async def test_get_punishment_exists_group_users(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        punishments = []
        for group_user in response.json():
            if group_user["user_id"] == OTHER_USER_ID:
                punishments = group_user["punishments"]
                break
        else:
            assert False

        assert len(punishments) == 2
        not_hidden_count = len([x for x in punishments if not x["reason_hidden"]])
        hidden_count = len([x for x in punishments if x["reason_hidden"]])
        assert not_hidden_count == 1
        assert hidden_count == 1

    @pytest.mark.asyncio
    async def test_get_group_user_punishment_streaks_by_other_not_in_group(
        self, client: Any
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishmentStreaks",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_user_punishment_streaks_empty(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishmentStreaks",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "current_streak": 0,
            "current_inverse_streak": 0,
            "longest_streak": 0,
            "longest_inverse_streak": 0,
        }

    @pytest.mark.asyncio
    async def test_get_group_user_punishment_streaks(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishments",
            json=[
                {
                    "punishment_type_id": PUNISHMENT_TYPE_1_ID,
                    "reason": "Test",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishmentStreaks",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == {
            "current_streak": 1,
            "current_inverse_streak": 0,
            "longest_streak": 1,
            "longest_inverse_streak": 0,
        }

    @pytest.mark.asyncio
    async def test_leaderboard(self, client: Any) -> None:
        response = await client.get(
            f"/users/leaderboard?page_size=3",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        data = response.json()
        for res in data["results"]:
            for punishment in res["punishments"]:
                punishment["created_at"] = ""

        data["results"][0]["punishments"].sort(key=lambda x: x["reason"])

        assert suppress_defaults(data) == suppress_defaults(
            {
                "next": None,
                "previous": None,
                "results": [
                    {
                        "email": "email4@email.com",
                        "first_name": "Anna IreneUpdated",
                        "last_name": "Updated",
                        "ow_user_id": 2027,
                        "punishments": [
                            {
                                "amount": 1,
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "emoji": "🍷",
                                    "name": "Vinstraff",
                                    "punishment_type_id": "",
                                    "value": 100,
                                    "created_at": "",
                                    "created_by": "",
                                    "updated_at": "",
                                },
                                "punishment_type_id": "",
                                "reactions": [],
                                "reason": "",
                                "reason_hidden": True,
                            },
                            {
                                "amount": 1,
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "emoji": "🍷",
                                    "name": "Vinstraff",
                                    "punishment_type_id": "",
                                    "value": 100,
                                    "created_at": "",
                                    "created_by": "",
                                    "updated_at": "",
                                },
                                "punishment_type_id": "",
                                "reactions": [],
                                "reason": "Very good reason2",
                                "reason_hidden": False,
                            },
                        ],
                        "total_value": 200,
                        "user_id": "",
                    },
                    {
                        "email": "email1@email.com",
                        "first_name": "BrageUpdated",
                        "last_name": "Updated",
                        "ow_user_id": 2581,
                        "punishments": [
                            {
                                "amount": 1,
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "emoji": "🍺",
                                    "name": "Ølstraff",
                                    "punishment_type_id": "",
                                    "value": 33,
                                    "created_at": "",
                                    "created_by": "",
                                    "updated_at": "",
                                },
                                "punishment_type_id": "",
                                "reactions": [],
                                "reason": "Test",
                                "reason_hidden": False,
                            }
                        ],
                        "total_value": 33,
                        "user_id": "",
                    },
                ],
                "total": 2,
            }
        )

    @pytest.mark.asyncio
    async def test_leaderboard_empty_page(self, client: Any) -> None:
        response = await client.get(
            f"users/leaderboard?page=1&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "next": None,
            "previous": "http://test/users/leaderboard?page=0&page_size=30",
            "results": [],
            "total": 2,
        }

    @pytest.mark.asyncio
    async def test_create_group_event(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/events",
            json={
                "name": "Test",
                "description": "Test",
                "start_time": "2021-01-01T00:00:00.000Z",
                "end_time": "2021-02-01T00:00:00",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_group_event_invalid_times(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/events",
            json={
                "name": "TestInvalid",
                "description": "Test",
                "start_time": "2021-02-01T00:00:00.000Z",
                "end_time": "2021-01-01T00:00:00",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_group_event_duplicate_time(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/events",
            json={
                "name": "Test",
                "description": "Test",
                "start_time": "2021-01-01T10:00:00.000Z",
                "end_time": "2021-02-01T00:00:00",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 400
        check_response_time(response)

        assert response.json() == {
            "detail": "Det finnes allerede et arrangement i dette tidsrommet"
        }

    @pytest.mark.asyncio
    async def test_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/events?page0&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        data = response.json()
        for res in data["results"]:
            res["created_at"] = ""

        assert suppress_defaults(data) == suppress_defaults(
            {
                "next": None,
                "previous": None,
                "results": [
                    {
                        "name": "Test",
                        "description": "Test",
                        "start_time": "2021-01-01T00:00:00",
                        "end_time": "2021-02-01T00:00:00",
                        "event_id": "",
                        "group_id": "",
                        "created_by": "",
                        "created_at": "",
                    }
                ],
                "total": 1,
            }
        )

    @pytest.mark.asyncio
    async def test_missing_auth_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/events?page0&page_size=30",
        )
        assert response.status_code == 403
        check_response_time(response)

        assert response.json() == {"detail": "Not authenticated"}

    @pytest.mark.asyncio
    async def test_forbidden_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/events?page0&page_size=30",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_group_events_empty_page(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/events?page=1&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "next": None,
            "previous": f"http://test/groups/{GROUP_ID}/events?page=0&page_size=30",
            "results": [],
            "total": 1,
        }

    @pytest.mark.asyncio
    async def test_mark_all_punishments_as_paid(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishments/paid/all",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_assert_all_punishments_are_paid(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        for punishment in response.json()["punishments"]:
            assert punishment["paid"] == True

    @pytest.mark.asyncio
    async def test_mark_all_punishments_as_paid_not_works_when_no_unpaid(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}/punishments/paid/all",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_patch_permissions(self, client: Any) -> None:
        response = await client.patch(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}/permissions",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json={"privilege": "group.admin"},
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_leave_group(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/users/{SELF_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 400
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_kick_user(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_transfer_ownership_of_group(self, client: Any) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/users/{OTHER_USER_ID}/transferOwnership",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_delete_group(self, client: Any) -> None:
        response = await client.delete(
            f"/groups/{GROUP_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_get_join_requests(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_ID}/joinRequests",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_cannot_create_join_request_towards_ow_group(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_ID}/joinRequests",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 400
        check_response_time(response)
