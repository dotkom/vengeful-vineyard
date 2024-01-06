from typing import Any

import pytest

from tests.fixtures import all_groups_mock, client
from tests.utils import suppress_defaults

from .common import *

NEW_PUNISHMENT_PAYLOAD_1 = [
    {
        "punishment_type_id": PUNISHMENT_TYPE_1_ID,
        "reason": "Reason1",
        "reason_hidden": True,
        "amount": 1,
    },
]

NEW_PUNISHMENT_PAYLOAD_2 = [
    {
        "punishment_type_id": PUNISHMENT_TYPE_2_ID,
        "reason": "Reason2",
        "reason_hidden": True,
        "amount": 1,
    },
]

NEW_PUNISHMENT_PAYLOAD_3 = [
    {
        "punishment_type_id": PUNISHMENT_TYPE_2_ID,
        "reason": "Reason3",
        "reason_hidden": False,
        "amount": 2,
    },
]


class TestWithDB_AllGroups:
    @pytest.mark.asyncio
    async def test_setup_users(
        self,
        client: Any,
        all_groups_mock: Any,
    ) -> None:
        async def setup(user_id: str) -> None:
            response = await client.get(
                "/users/me",
                headers={"Authorization": f"Bearer {user_id}"},
            )
            assert response.status_code == 200

            await alter_user_id(client.app, response.json()["user_id"], user_id)

        for user_id in (USER_1_ID, USER_2_ID, USER_3_ID):
            await setup(user_id)

        query = "SELECT group_id FROM group_members WHERE user_id = $1"
        async with client.app.db.pool.acquire() as conn:
            group_id = await conn.fetchval(query, USER_3_ID)

        await alter_group_id(client.app, group_id, GROUP_2_ID)
        await alter_punishment_type_id_by_name(
            client.app, GROUP_2_ID, "Ølstraff", PUNISHMENT_TYPE_2_ID
        )

    @pytest.mark.asyncio
    async def test_user1_can_create_group(self, client: Any) -> None:
        response = await client.post(
            "/groups",
            json=CREATE_GROUP_PAYLOAD,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_group_id(client.app, response.json()["id"], GROUP_1_ID)
        await alter_punishment_type_id_by_name(
            client.app, GROUP_1_ID, "Vinstraff", PUNISHMENT_TYPE_1_ID
        )

    @pytest.mark.asyncio
    async def test_user3_can_search_groups_but_empty_query(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            "/groups/search",
            params={"query": ""},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_user3_can_search_groups_but_no_results(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            "/groups/search",
            params={"query": "xyz"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_user3_can_search_groups_success(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            "/groups/search",
            params={"query": "Long"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        group = response.json()[0]
        assert group["group_id"] == GROUP_1_ID

    @pytest.mark.asyncio
    async def test_user1_can_search_groups_success(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            "/groups/search",
            params={"query": "shoRT"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        group = response.json()[0]
        assert group["group_id"] == GROUP_1_ID

    @pytest.mark.asyncio
    async def test_user1_search_ow_group_empty_result_when_include_ow_groups_false(
        self, client: Any
    ) -> None:
        response = await client.get(
            "/groups/search?include_ow_groups=false",
            params={"query": "otHer"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_user3_search_ow_group_empty_result_when_include_ow_groups_false(
        self, client: Any
    ) -> None:
        response = await client.get(
            "/groups/search?include_ow_groups=false",
            params={"query": "otHer"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_user1_search_ow_group_non_empty_result_when_include_ow_groups_true(
        self, client: Any
    ) -> None:
        response = await client.get(
            "/groups/search?include_ow_groups=true",
            params={"query": "otHer"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert suppress_defaults(response.json()) == suppress_defaults(
            [
                {
                    "group_id": "",
                    "name": "Other- og otherkomiteen",
                    "name_short": "Otherkom",
                },
            ]
        )

    @pytest.mark.asyncio
    async def test_user3_search_ow_group_non_empty_result_when_include_ow_groups_true(
        self, client: Any
    ) -> None:
        response = await client.get(
            "/groups/search?include_ow_groups=true",
            params={"query": "otHer"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert suppress_defaults(response.json()) == suppress_defaults(
            [
                {
                    "group_id": "",
                    "name": "Other- og otherkomiteen",
                    "name_short": "Otherkom",
                },
            ]
        )

    @pytest.mark.asyncio
    async def test_user1_can_create_punishment_on_self(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_1,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_punishment_id(
            client.app, response.json()["ids"][0], PUNISHMENT_1_ID
        )

    @pytest.mark.asyncio
    async def test_user3_can_create_punishment_on_self(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_2_ID}/users/{USER_3_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_2,
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_punishment_id(
            client.app, response.json()["ids"][0], PUNISHMENT_2_ID
        )

    @pytest.mark.asyncio
    async def test_user3_can_create_punishment_with_reason_hidden_on_self(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_2_ID}/users/{USER_3_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_3,
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_punishment_id(
            client.app, response.json()["ids"][0], PUNISHMENT_3_ID
        )

    @pytest.mark.asyncio
    async def test_user1_cannot_get_wallofshame_since_not_in_an_ow_group(
        self, client: Any
    ) -> None:
        response = await client.get(
            f"/users/leaderboard",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user3_can_get_wallofshame(self, client: Any) -> None:
        response = await client.get(
            f"/users/leaderboard",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert len(response.json()["results"]) == 1

        assert len(response.json()["results"][0]["punishments"]) == 2
