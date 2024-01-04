# flake8: noqa

from typing import Any

import pytest

from tests.fixtures import (
    DEFAULT_PUNISHMENT_TYPES,
    GROUP_ID,
    GROUPS_ME_RESPONSE,
    ME_GROUPS_RESPONSE,
    ME_GROUPS_UPDATED_RESPONSE,
    ME_NEW_USER_RESPONSE,
    ME_UPDATED_RESPONSE,
    NEW_PUNISHMENT_TYPE_PAYLOAD,
    OTHER_USER_AUTHORIZATION,
    OTHER_USER_ID,
    OTHER_USER_NOT_IN_GROUP_AUTHORIZATION,
    OTHER_USER_NOT_IN_GROUP_ID,
    PUNISHMENT_1_ID,
    PUNISHMENT_2_ID,
    PUNISHMENT_TYPE_1_ID,
    PUNISHMENT_TYPE_2_ID,
    PUNISHMENT_TYPE_4_ID,
    SELF_USER_AUTHORIZATION,
    SELF_USER_ID,
    USERS_ME_RESPONSE,
    USERS_ME_RESPONSE_EMPTY_GROUPS,
    WAFFLES_PUNISHMENT_TYPE_RESPONSE,
    alter_punishment_id,
    alter_punishment_type_id,
    client,
    mock,
    setup_predictable_db_ids,
)
from tests.response_time import check_response_time

from .utils import suppress_defaults


class TestWithDB_OW:
    @pytest.mark.asyncio
    async def test_get_my_groups_missing_authorization(self, client: Any) -> None:
        response = await client.get("/group/me")

        assert response.status_code == 403
        check_response_time(response)

        assert response.json() == {"detail": "Not authenticated"}

    @pytest.mark.asyncio
    async def test_get_my_groups_unauthenticated(self, client: Any, mock: Any) -> None:
        response = await client.get(
            "/group/me", headers={"Authorization": "Bearer InvalidAuth"}
        )

        assert response.status_code == 401
        check_response_time(response)

        assert response.json() == {"detail": "Invalid access token"}

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
            "/user/me",
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
            "/user/me?include_groups=false",
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
            "/group/me",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            GROUPS_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_members(self, client: Any) -> None:
        response = await client.get(f"/group/{GROUP_ID}")

        assert response.status_code == 200
        check_response_time(response)

        def sort(x: Any) -> Any:
            x["members"].sort(key=lambda x: x["ow_user_id"])
            return x

        assert sort(suppress_defaults(response.json())) == sort(
            suppress_defaults(ME_GROUPS_RESPONSE[0])
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_update(self, client: Any) -> None:
        response = await client.get(
            "/group/me",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            ME_UPDATED_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_get_my_groups_members_update(self, client: Any) -> None:
        response = await client.get(f"/group/{GROUP_ID}")

        assert response.status_code == 200
        check_response_time(response)

        def sort(x: Any) -> Any:
            x["members"].sort(key=lambda x: x["ow_user_id"])
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
            "/group/me",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(response.json()) == suppress_defaults(
            ME_NEW_USER_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_create_punishment_type_forbidden(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishmentType",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punsihment_type(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishmentType",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        await alter_punishment_type_id(
            client.app, str(NEW_PUNISHMENT_TYPE_PAYLOAD["name"]), PUNISHMENT_TYPE_4_ID
        )

        assert suppress_defaults(response.json()) == suppress_defaults({"id": ""})

    @pytest.mark.asyncio
    async def test_get_group_with_punishment_type(self, client: Any) -> None:
        response = await client.get(f"/group/{GROUP_ID}")

        assert response.status_code == 200
        check_response_time(response)

        assert suppress_defaults(
            response.json()["punishment_types"]
        ) == suppress_defaults(
            DEFAULT_PUNISHMENT_TYPES + [WAFFLES_PUNISHMENT_TYPE_RESPONSE]
        )

    @pytest.mark.asyncio
    async def test_delete_punishment_type_user_not_in_group(self, client: Any) -> None:
        response = await client.delete(
            f"/group/{GROUP_ID}/punishmentType/{PUNISHMENT_TYPE_4_ID}",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_punishment_type(self, client: Any) -> None:
        response = await client.delete(
            f"/group/{GROUP_ID}/punishmentType/{PUNISHMENT_TYPE_4_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_create_punishment_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishment",
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
            f"/group/{GROUP_ID}/user/{OTHER_USER_ID}/punishment",
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
    async def test_create_punishment_hidden_reason_on_other_user(
        self, client: Any
    ) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/user/{OTHER_USER_ID}/punishment",
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
            f"/group/{GROUP_ID}/user/{OTHER_USER_NOT_IN_GROUP_ID}/punishment",
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
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
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
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
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
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
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
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}",
        )

        assert response.status_code == 200
        check_response_time(response)

        # Gotten in a group context. Should be 1 and not two.
        assert len(response.json()["punishments"][0]["reactions"]) == 1

    @pytest.mark.asyncio
    async def test_all_reactions_exist_on_leaderboard(self, client: Any) -> None:
        response = await client.get(f"user/leaderboard?page_size=1&page=1")

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
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "logo_url": "🍺",
                                    "name": "Ølstraff",
                                    "punishment_type_id": "",
                                    "value": 33,
                                },
                                "punishment_type_id": "",
                                "reactions": [
                                    {
                                        "emoji": "👍",
                                        "punishment_id": "",
                                        "punishment_reaction_id": "",
                                        "created_by": "",
                                        "created_at": "",
                                    },
                                    {
                                        "emoji": "👍",
                                        "punishment_id": "",
                                        "punishment_reaction_id": "",
                                        "created_by": "",
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
                "total": 9,
            }
        )

    @pytest.mark.asyncio
    async def test_replace_punishment_reaction_on_self_user(self, client: Any) -> None:
        response = await client.post(
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
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
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}",
        )

        assert response.status_code == 200
        check_response_time(response)

        assert len(response.json()["punishments"][0]["reactions"]) == 1
        assert response.json()["punishments"][0]["reactions"][0]["emoji"] == "🧡"

    @pytest.mark.asyncio
    async def test_delete_reaction_from_wrong_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_reaction_from_self_user(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/{PUNISHMENT_1_ID}/reaction",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_paid(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishments/paid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_unpaid(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishments/unpaid",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_mark_punishment_as_paid_from_other_user(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishments/paid",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_get_group_total_punishment_value(self, client: Any) -> None:
        response = await client.get(
            f"/group/{GROUP_ID}/totalPunishmentValue",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "total_value": 233,
            "total_paid_value": 33,
        }

    @pytest.mark.asyncio
    async def test_mark_punishment_as_unpaid_from_other_user(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/punishments/unpaid",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
            json=[
                PUNISHMENT_1_ID,  # punishment_id
            ],
        )

        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_other(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/{PUNISHMENT_2_ID}",
            headers={"Authorization": OTHER_USER_AUTHORIZATION},
        )

        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_delete_own_punishment_created_by_self(self, client: Any) -> None:
        response = await client.delete(
            f"/punishment/{PUNISHMENT_1_ID}",
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
            f"/punishment/{PUNISHMENT_1_ID}",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )

        assert response.status_code == 404
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_check_punishments_exists(self, client: Any) -> None:
        response = await client.get(f"/group/{GROUP_ID}/user/{OTHER_USER_ID}")

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
        response = await client.get(f"/group/{GROUP_ID}/users")

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
    async def test_get_group_user_punishment_streaks_empty(self, client: Any) -> None:
        response = await client.get(
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishmentStreaks"
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
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishment",
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
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishmentStreaks"
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
        response = await client.get(f"user/leaderboard?page_size=3")

        assert response.status_code == 200
        check_response_time(response)

        data = response.json()
        for res in data["results"]:
            for punishment in res["punishments"]:
                punishment["created_at"] = ""

        data["results"][0]["punishments"].sort(key=lambda x: x["reason"])

        assert suppress_defaults(data) == suppress_defaults(
            {
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
                                "created_by": "",
                                "created_at": "",
                                "created_by_name": "BrageUpdated Updated",
                                "group_id": "",
                                "paid": False,
                                "paid_at": None,
                                "marked_paid_by": None,
                                "punishment_id": "",
                                "punishment_type": {
                                    "logo_url": "🍷",
                                    "name": "Vinstraff",
                                    "punishment_type_id": "",
                                    "value": 100,
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
                                    "logo_url": "🍷",
                                    "name": "Vinstraff",
                                    "punishment_type_id": "",
                                    "value": 100,
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
                                    "logo_url": "🍺",
                                    "name": "Ølstraff",
                                    "punishment_type_id": "",
                                    "value": 33,
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
                    {
                        "email": "email2@email.com",
                        "first_name": "AmundUpdated",
                        "last_name": "Updated",
                        "ow_user_id": 1381,
                        "punishments": [],
                        "total_value": 0,
                        "user_id": "",
                    },
                ],
                "total": 9,
            }
        )

    @pytest.mark.asyncio
    async def test_leaderboard_empty_page(self, client: Any) -> None:
        response = await client.get(f"user/leaderboard?page=1&page_size=30")
        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "next": None,
            "previous": "http://test/user/leaderboard?page=0&page_size=30",
            "results": [],
            "total": 9,
        }

    @pytest.mark.asyncio
    async def test_create_group_event(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/events",
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
            f"/group/{GROUP_ID}/events",
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
            f"/group/{GROUP_ID}/events",
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
            "detail": "There is already an event in this time frame"
        }

    @pytest.mark.asyncio
    async def test_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"/group/{GROUP_ID}/events?page0&page_size=30",
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
        response = await client.get(f"/group/{GROUP_ID}/events?page0&page_size=30")
        assert response.status_code == 403
        check_response_time(response)

        assert response.json() == {"detail": "Not authenticated"}

    @pytest.mark.asyncio
    async def test_forbidden_get_group_events(self, client: Any) -> None:
        response = await client.get(
            f"group/{GROUP_ID}/events?page0&page_size=30",
            headers={"Authorization": OTHER_USER_NOT_IN_GROUP_AUTHORIZATION},
        )
        assert response.status_code == 403
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_group_events_empty_page(self, client: Any) -> None:
        response = await client.get(
            f"group/{GROUP_ID}/events?page=1&page_size=30",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

        assert response.json() == {
            "next": None,
            "previous": f"http://test/group/{GROUP_ID}/events?page=0&page_size=30",
            "results": [],
            "total": 1,
        }

    @pytest.mark.asyncio
    async def test_mark_all_punishments_as_paid(self, client: Any) -> None:
        response = await client.post(
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishments/paid/all",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 200
        check_response_time(response)

    @pytest.mark.asyncio
    async def test_assert_all_punishments_are_paid(self, client: Any) -> None:
        response = await client.get(
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}",
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
            f"/group/{GROUP_ID}/user/{SELF_USER_ID}/punishments/paid/all",
            headers={"Authorization": SELF_USER_AUTHORIZATION},
        )
        assert response.status_code == 404
        check_response_time(response)
