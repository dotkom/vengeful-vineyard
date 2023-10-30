# flake8: noqa

import copy
from typing import Any

import pytest

from tests.fixtures import client, mock
from tests.response_time import check_response_time


class AnyUUID:
    def __eq__(self, other):
        return isinstance(other, str) and len(other) == 36

    def __repr__(self):
        return "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"


GROUPS_ME_RESPONSE = [
    {
        "group_id": AnyUUID(),
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "members": [],
        "punishment_types": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
    }
]

USERS_ME_RESPONSE = {
    "ow_user_id": 2581,
    "user_id": AnyUUID(),
    "first_name": "Brage",
    "last_name": "",
    "email": "email1@email.com",
    "groups": GROUPS_ME_RESPONSE,
}

USERS_ME_RESPONSE_EMPTY_GROUPS = copy.copy(USERS_ME_RESPONSE)
USERS_ME_RESPONSE_EMPTY_GROUPS["groups"] = []

ME_UPDATED_RESPONSE = [
    {
        "group_id": AnyUUID(),
        "ow_group_id": 4,
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "DotkomUpdated",
        "rules": "No rules",
        "members": [],
        "punishment_types": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
    }
]

ME_NEW_USER_RESPONSE: list[dict[str, Any]] = []

ME_GROUPS_RESPONSE = [
    {
        "name": "Drifts- og Utviklingskomiteen",
        "name_short": "Dotkom",
        "rules": "No rules",
        "ow_group_id": 4,
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": AnyUUID(),
        "punishment_types": [
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "🍺",
                "punishment_type_id": AnyUUID(),
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "🍷",
                "punishment_type_id": AnyUUID(),
            },
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "🍸",
                "punishment_type_id": AnyUUID(),
            },
        ],
        "members": [
            {
                "ow_user_id": 2581,
                "first_name": "Brage",
                "last_name": "",
                "ow_group_user_id": 2224,
                "email": "email1@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1381,
                "first_name": "Amund",
                "last_name": "",
                "ow_group_user_id": 656,
                "email": "email2@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha Nguyen",
                "last_name": "",
                "ow_group_user_id": 658,
                "email": "email3@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna Irene",
                "last_name": "",
                "ow_group_user_id": 1552,
                "email": "email4@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy Steen",
                "last_name": "",
                "ow_group_user_id": 2227,
                "email": "email5@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1705,
                "first_name": "B\u00f8rge",
                "last_name": "",
                "ow_group_user_id": 1052,
                "email": "email6@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1395,
                "first_name": "Carl",
                "last_name": "",
                "ow_group_user_id": 1551,
                "email": "email7@email.com",
                "user_id": AnyUUID(),
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
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
        "members": [],
        "punishment_types": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": 1,
        "punishment_types": [
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "🍺",
                "punishment_type_id": 1,
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "🍷",
                "punishment_type_id": 2,
            },
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "🍸",
                "punishment_type_id": 3,
            },
        ],
        "members": [
            {
                "ow_user_id": 2581,
                "first_name": "BrageUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 2224,
                "email": "email1@email.com",
                "user_id": 1,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1381,
                "first_name": "AmundUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 656,
                "email": "email2@email.com",
                "user_id": 2,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 1383,
                "first_name": "Anh-Kha NguyenUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 658,
                "email": "email3@email.com",
                "user_id": 3,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 2027,
                "first_name": "Anna IreneUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 1552,
                "email": "email4@email.com",
                "user_id": 4,
                "active": False,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {
                "ow_user_id": 2219,
                "first_name": "Billy SteenUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 2227,
                "email": "email5@email.com",
                "user_id": 5,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            # Removed user here
            {
                "ow_user_id": 1395,
                "first_name": "CarlUpdated",
                "last_name": "Updated",
                "ow_group_user_id": 1551,
                "email": "email7@email.com",
                "user_id": 7,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
            {  # Added user here
                "ow_user_id": 1998,
                "first_name": "FelixOriginal",
                "last_name": "Original",
                "ow_group_user_id": 1399,
                "email": "email8@email.com",
                "user_id": 8,
                "active": True,
                "punishments": [],
                "total_paid_amount": 0,
            },
        ],
    }
]


DEFAULT_PUNISHMENT_TYPES = [
    {
        "name": "Ølstraff",
        "value": 33,
        "logo_url": "🍺",
        "punishment_type_id": 1,
    },
    {
        "name": "Vinstraff",
        "value": 100,
        "logo_url": "🍷",
        "punishment_type_id": 2,
    },
    {
        "name": "Spritstraff",
        "value": 300,
        "logo_url": "🍸",
        "punishment_type_id": 3,
    },
]

NEW_PUNISHMENT_TYPE_PAYLOAD = {
    "name": "Waffles",
    "value": 125,
    "logo_url": "🍺",
}

WAFFLES_PUNISHMENT_TYPE_RESPONSE = {
    "name": "Waffles",
    "value": 125,
    "logo_url": "🍺",
    "punishment_type_id": 4,
}


SELF_USER_ID = 1
OTHER_USER_ID = 4
OTHER_USER_NOT_IN_GROUP_ID = 10
SELF_USER_ACCESS_TOKEN = str(SELF_USER_ID)
OTHER_USER_ACCESS_TOKEN = str(OTHER_USER_ID)
OTHER_USER_NOT_IN_GROUP_ACCESS_TOKEN = str(OTHER_USER_NOT_IN_GROUP_ID)
SELF_USER_AUTHORIZATION = f"Bearer {SELF_USER_ACCESS_TOKEN}"
OTHER_USER_AUTHORIZATION = f"Bearer {OTHER_USER_ACCESS_TOKEN}"
OTHER_USER_NOT_IN_GROUP_AUTHORIZATION = f"Bearer {OTHER_USER_NOT_IN_GROUP_ACCESS_TOKEN}"


class TestWithDB_OW:
    @pytest.mark.asyncio
    async def test_get_my_groups_missing_authorization(self, client: Any) -> None:
        response = await client.get("/group/me")
        assert response.status_code == 403 and response.json() == {
            "detail": "Not authenticated"
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
    async def test_get_my_groups(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/group/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        assert response.json() == GROUPS_ME_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_user(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/user/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        assert response.json() == USERS_ME_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_user_empty_groups(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/user/me?include_groups=false",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        assert response.json() == USERS_ME_RESPONSE_EMPTY_GROUPS

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_other_user_in_group(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/group/me",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        assert response.json() == GROUPS_ME_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_members(self, client: Any) -> None:
        for c, group in enumerate(GROUPS_ME_RESPONSE):
            response = await client.get(f"/group/{group['group_id']}")

            assert response.status_code == 200
            assert response.json() == ME_GROUPS_RESPONSE[c]

            check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_my_groups_update(self, client: Any) -> None:
        response = await client.get(
            "/group/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
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

    @pytest.mark.asyncio
    async def test_get_my_groups_other_not_in_group(
        self,
        client: Any,
        mock: Any,
    ) -> None:
        response = await client.get(
            "/group/me",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 200
        assert response.json() == ME_NEW_USER_RESPONSE

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_type_forbidden(self, client: Any) -> None:
        response = await client.post(
            "/group/1/punishmentType",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punsihment_type(self, client: Any) -> None:
        response = await client.post(
            "/group/1/punishmentType",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == {"id": 4}
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_with_punishment_type(self, client: Any) -> None:
        response = await client.get(f"/group/1")
        assert response.status_code == 200
        assert response.json()["punishment_types"] == DEFAULT_PUNISHMENT_TYPES + [
            WAFFLES_PUNISHMENT_TYPE_RESPONSE
        ]

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_type_user_not_in_group(self, client: Any) -> None:
        response = await client.delete(
            "/group/1/punishmentType/4",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_type(self, client: Any) -> None:
        response = await client.delete(
            "/group/1/punishmentType/4",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/group/1/user/{SELF_USER_ID}/punishment",
            json=[
                {
                    "punishment_type_id": 1,
                    "reason": "Very good reason",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json()["ids"] == [1]
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_other_user(self, client: Any) -> None:
        response = await client.post(
            f"/group/1/user/{OTHER_USER_ID}/punishment",
            json=[
                {
                    "punishment_type_id": 2,
                    "reason": "Very good reason2",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json()["ids"] == [2]
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_hidden_reason_on_other_user(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/group/1/user/{OTHER_USER_ID}/punishment",
            json=[
                {
                    "punishment_type_id": 2,
                    "reason": "This is a very good hidden reason!!",
                    "reason_hidden": True,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json()["ids"] == [3]
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_other_user_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/group/1/user/{OTHER_USER_NOT_IN_GROUP_ID}/punishment",
            json=[
                {
                    "punishment_type_id": 2,
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
            f"/punishment/1/reaction",
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
            f"/punishment/1/reaction",
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
            f"/punishment/1/reaction",
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
            f"/group/1/user/{SELF_USER_ID}",
        )
        assert response.status_code == 200

        # Gotten in a group context. Should be 1 and not two.
        assert len(response.json()["punishments"][0]["reactions"]) == 1
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_all_reactions_exist_on_leaderboard(self, client: Any) -> None:
        response = await client.get(f"user/leaderboard?page_size=1&page=1")
        assert response.status_code == 200

        data = response.json()
        for res in data["results"]:
            for punishment in res["punishments"]:
                punishment["created_at"] = ""

                for punishment_reaction in punishment["reactions"]:
                    punishment_reaction["created_at"] = ""

        assert data == {
            "next": "http://test/user/leaderboard?page_size=1&page=2",
            "previous": "http://test/user/leaderboard?page_size=1&page=0",
            "results": [
                {
                    "email": "email1@email.com",
                    "first_name": "BrageUpdated",
                    "last_name": "Updated",
                    "ow_user_id": 2581,
                    "punishments": [
                        {
                            "amount": 1,
                            "created_by": 1,
                            "created_at": "",
                            "created_by_name": "BrageUpdated Updated",
                            "punishment_id": 1,
                            "punishment_type": {
                                "logo_url": "🍺",
                                "name": "Ølstraff",
                                "punishment_type_id": 1,
                                "value": 33,
                            },
                            "punishment_type_id": 1,
                            "reactions": [
                                {
                                    "emoji": "👍",
                                    "punishment_id": 1,
                                    "punishment_reaction_id": 1,
                                    "created_by": 1,
                                    "created_at": "",
                                },
                                {
                                    "emoji": "👍",
                                    "punishment_id": 1,
                                    "punishment_reaction_id": 2,
                                    "created_by": 9,
                                    "created_at": "",
                                },
                            ],
                            "reason": "Very good reason",
                            "reason_hidden": False,
                        },
                    ],
                    "total_value": 33,
                    "user_id": 1,
                },
            ],
            "total": 9,
        }

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_replace_punishment_reaction_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/punishment/1/reaction",
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
            f"/group/1/user/{SELF_USER_ID}",
        )
        assert response.status_code == 200
        assert len(response.json()["punishments"][0]["reactions"]) == 1
        assert response.json()["punishments"][0]["reactions"][0]["emoji"] == "🧡"
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_reaction_from_wrong_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/1/reaction",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )
        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_reaction_from_self_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/1/reaction",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_add_paid_log_entry(self, client: Any) -> None:
        response = await client.post(
            "group/1/user/1/punishments/paid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json={"value": 4},
        )
        assert response.status_code == 200
        assert response.json() == None

    @pytest.mark.asyncio
    async def test_add_paid_log_entry_from_other_user(self, client: Any) -> None:
        response = await client.post(
            "group/1/user/1/punishments/paid",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
            json={"value": 9},
        )
        assert response.status_code == 200
        assert response.json() == None

    @pytest.mark.asyncio
    async def test_get_paid_logs(self, client: Any) -> None:
        response = await client.get(
            "group/1/user/1/punishments/paid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200

        data = response.json()
        for log in data:
            log["created_at"] = ""

        assert data == [
            {
                "value": 4,
                "user_id": 1,
                "group_id": 1,
                "paid_punishment_log_id": 1,
                "created_at": "",
                "created_by": 1,
            },
            {
                "value": 9,
                "user_id": 1,
                "group_id": 1,
                "paid_punishment_log_id": 2,
                "created_at": "",
                "created_by": 4,
            },
        ]

    @pytest.mark.asyncio
    async def test_get_group_total_paid_for_user(self, client: Any) -> None:
        response = await client.get(
            "/group/1/user/1/punishments/paid/totalPaid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == 13
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_unpaid_for_user(self, client: Any) -> None:
        response = await client.get(
            "/group/1/user/1/punishments/paid/totalUnpaid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == 20  # 33 - 13
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_punishment_value(self, client: Any) -> None:
        response = await client.get(
            "/group/1/totalPunishmentValue",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == {
            "total_value": 233,
            "total_paid_value": 13,  # 4 + 9
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_total_paid_amount_on_group_user(self, client: Any) -> None:
        response = await client.get(
            f"/group/1/user/{SELF_USER_ID}",
        )
        assert response.status_code == 200

        assert response.json()["total_paid_amount"] == 13
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_total_paid_amount_on_group_users(self, client: Any) -> None:
        response = await client.get(
            f"/group/1/users",
        )
        assert response.status_code == 200

        data = response.json()
        for user in data:
            if user["user_id"] == SELF_USER_ID:
                assert user["total_paid_amount"] == 13
            else:
                assert user["total_paid_amount"] == 0

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_other(self, client: Any) -> None:
        response = await client.delete(
            "/punishment/2",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_self(self, client: Any) -> None:
        response = await client.delete(
            "/punishment/1",
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
            "/punishment/1",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_check_punishments_exists(self, client: Any) -> None:
        response = await client.get(f"/group/1/user/{OTHER_USER_ID}")
        punishments = response.json()["punishments"]
        assert len(punishments) == 2

        not_hidden_count = len([x for x in punishments if not x["reason_hidden"]])
        hidden_count = len([x for x in punishments if x["reason_hidden"]])

        assert not_hidden_count == 1
        assert hidden_count == 1

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_punishment_exists_group_users(self, client: Any) -> None:
        response = await client.get(f"/group/1/users")
        assert response.status_code == 200
        punishments = response.json()[3]["punishments"]
        assert len(punishments) == 2
        not_hidden_count = len([x for x in punishments if not x["reason_hidden"]])
        hidden_count = len([x for x in punishments if x["reason_hidden"]])
        assert not_hidden_count == 1
        assert hidden_count == 1

    @pytest.mark.asyncio
    async def test_get_group_user_punishment_streaks_empty(self, client: Any) -> None:
        response = await client.get(f"/group/1/user/1/punishmentStreaks")
        assert response.status_code == 200
        assert response.json() == {
            "current_streak": 0,
            "current_inverse_streak": 0,
            "longest_streak": 0,
            "longest_inverse_streak": 0,
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_user_punishment_streaks(self, client: Any) -> None:
        response = await client.post(
            f"/group/1/user/{SELF_USER_ID}/punishment",
            json=[
                {
                    "punishment_type_id": 1,
                    "reason": "Test",
                    "reason_hidden": False,
                    "amount": 1,
                }
            ],
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200

        response = await client.get(f"/group/1/user/1/punishmentStreaks")
        assert response.status_code == 200
        assert response.json() == {
            "current_streak": 1,
            "current_inverse_streak": 0,
            "longest_streak": 1,
            "longest_inverse_streak": 0,
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_leaderboard(self, client: Any) -> None:
        response = await client.get(f"user/leaderboard?page_size=3")
        assert response.status_code == 200

        data = response.json()
        for res in data["results"]:
            for punishment in res["punishments"]:
                punishment["created_at"] = ""

        assert data == {
            "next": "http://test/user/leaderboard?page_size=3&page=1",
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
                            "created_by": 1,
                            "created_at": "",
                            "created_by_name": "BrageUpdated Updated",
                            "punishment_id": 2,
                            "punishment_type": {
                                "logo_url": "🍷",
                                "name": "Vinstraff",
                                "punishment_type_id": 2,
                                "value": 100,
                            },
                            "punishment_type_id": 2,
                            "reactions": [],
                            "reason": "Very good reason2",
                            "reason_hidden": False,
                        },
                        {
                            "amount": 1,
                            "created_by": 1,
                            "created_at": "",
                            "created_by_name": "BrageUpdated Updated",
                            "punishment_id": 3,
                            "punishment_type": {
                                "logo_url": "🍷",
                                "name": "Vinstraff",
                                "punishment_type_id": 2,
                                "value": 100,
                            },
                            "punishment_type_id": 2,
                            "reactions": [],
                            "reason": "",
                            "reason_hidden": True,
                        },
                    ],
                    "total_value": 200,
                    "user_id": 4,
                },
                {
                    "email": "email1@email.com",
                    "first_name": "BrageUpdated",
                    "last_name": "Updated",
                    "ow_user_id": 2581,
                    "punishments": [
                        {
                            "amount": 1,
                            "created_by": 1,
                            "created_at": "",
                            "created_by_name": "BrageUpdated Updated",
                            "punishment_id": 4,
                            "punishment_type": {
                                "logo_url": "🍺",
                                "name": "Ølstraff",
                                "punishment_type_id": 1,
                                "value": 33,
                            },
                            "punishment_type_id": 1,
                            "reactions": [],
                            "reason": "Test",
                            "reason_hidden": False,
                        }
                    ],
                    "total_value": 33,
                    "user_id": 1,
                },
                {
                    "email": "email3@email.com",
                    "first_name": "Anh-Kha NguyenUpdated",
                    "last_name": "Updated",
                    "ow_user_id": 1383,
                    "punishments": [],
                    "total_value": 0,
                    "user_id": 3,
                },
            ],
            "total": 9,
        }

        check_response_time(response)

    @pytest.mark.asyncio
    async def test_leaderboard_empty_page(self, client: Any) -> None:
        response = await client.get(f"user/leaderboard?page=1&page_size=30")
        assert response.status_code == 200
        assert response.json() == {
            "next": None,
            "previous": "http://test/user/leaderboard?page=0&page_size=30",
            "results": [],
            "total": 9,
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_group_event(self, client: Any) -> None:
        response = await client.post(
            "/group/1/events",
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
            "/group/1/events",
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
            "/group/1/events",
            json={
                "name": "Test",
                "description": "Test",
                "start_time": "2021-01-01T10:00:00.000Z",
                "end_time": "2021-02-01T00:00:00",
            },
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 400
        assert response.json() == {
            "detail": "There is already an event in this time frame"
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_events(self, client: Any) -> None:
        response = await client.get(
            "/group/1/events?page0&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200

        data = response.json()
        for res in data["results"]:
            res["created_at"] = ""

        assert data == {
            "next": None,
            "previous": None,
            "results": [
                {
                    "name": "Test",
                    "description": "Test",
                    "start_time": "2021-01-01T00:00:00",
                    "end_time": "2021-02-01T00:00:00",
                    "event_id": 1,
                    "group_id": 1,
                    "created_by": 1,
                    "created_at": "",
                }
            ],
            "total": 1,
        }
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_missing_auth_get_group_events(self, client: Any) -> None:
        response = await client.get("/group/1/events?page0&page_size=30")
        assert response.status_code == 403
        assert response.json() == {"detail": "Not authenticated"}
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_forbidden_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"group/1/events?page0&page_size=30",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_group_events_empty_page(self, client: Any) -> None:
        response = await client.get(
            f"group/1/events?page=1&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == {
            "next": None,
            "previous": "http://test/group/1/events?page=0&page_size=30",
            "results": [],
            "total": 1,
        }
        check_response_time(response)
