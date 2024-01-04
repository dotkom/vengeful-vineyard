# flakes8: noqa

from typing import Any

import pytest

from tests.fixtures import client, no_groups_mock

from .common import *
from .utils import find, suppress_defaults

USER_1_ME_RESPONSE = {
    "ow_user_id": 2581,
    "user_id": "",
    "first_name": "Brage",
    "last_name": "",
    "email": "email1@email.com",
    "groups": [],
}

USER_2_ME_RESPONSE = {
    "ow_user_id": 2027,
    "user_id": "",
    "first_name": "Anna Irene",
    "last_name": "",
    "email": "email4@email.com",
    "groups": [],
}

USER_3_ME_RESPONSE = {
    "ow_user_id": 6666,
    "user_id": "",
    "first_name": "Felix",
    "last_name": "",
    "email": "email6666@email.com",
    "groups": [],
}

GET_GROUP_1_RESPONSE = {
    "group_id": "",
    "image": "",
    "join_requests": [],
    "members": [
        {
            "active": True,
            "email": "email1@email.com",
            "first_name": "Brage",
            "group_id": "",
            "last_name": "",
            "ow_group_user_id": None,
            "ow_user_id": 2581,
            "permissions": ["group.owner"],
            "punishments": [],
            "user_id": "",
        }
    ],
    "name": "Long name",
    "name_short": "Short name",
    "ow_group_id": None,
    "punishment_types": [
        {
            "created_at": "",
            "created_by": "",
            "emoji": "🍺",
            "name": "Ølstraff",
            "punishment_type_id": "",
            "updated_at": "",
            "value": 33,
        },
        {
            "created_at": "",
            "created_by": "",
            "emoji": "🍷",
            "name": "Vinstraff",
            "punishment_type_id": "",
            "updated_at": "",
            "value": 100,
        },
        {
            "created_at": "",
            "created_by": "",
            "emoji": "🍸",
            "name": "Spritstraff",
            "punishment_type_id": "",
            "updated_at": "",
            "value": 300,
        },
    ],
    "rules": "",
}


CREATE_GROUP_PAYLOAD = {"name": "Long name", "name_short": "Short name"}

NEW_PUNISHMENT_TYPE_PAYLOAD = {
    "name": "Waffles",
    "value": 125,
    "emoji": "🚀",
}

EDIT_PUNISHMENT_TYPE_PAYLOAD = {
    "name": "WafflesUpdated",
    "value": 100,
    "emoji": "💩",
}

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
        "punishment_type_id": PUNISHMENT_TYPE_1_ID,
        "reason": "Reason2",
        "reason_hidden": False,
        "amount": 2,
    },
]


class TestWithDB_Regular_Groups:
    @pytest.mark.asyncio
    async def test_user1_get_me_success(
        self,
        client: Any,
        no_groups_mock: Any,
    ) -> None:
        response = await client.get(
            "/users/me",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )

        assert response.status_code == 200

        await alter_user_id(client.app, response.json()["user_id"], USER_1_ID)

        assert suppress_defaults(response.json()) == suppress_defaults(
            USER_1_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_user2_get_me_success(
        self,
        client: Any,
        no_groups_mock: Any,
    ) -> None:
        response = await client.get(
            "/users/me",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_user_id(client.app, response.json()["user_id"], USER_2_ID)

        assert suppress_defaults(response.json()) == suppress_defaults(
            USER_2_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_user3_get_me_success(
        self,
        client: Any,
        no_groups_mock: Any,
    ) -> None:
        response = await client.get(
            "/users/me",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_user_id(client.app, response.json()["user_id"], USER_3_ID)

        assert suppress_defaults(response.json()) == suppress_defaults(
            USER_3_ME_RESPONSE
        )

    @pytest.mark.asyncio
    async def test_user1_get_me_groups_result_empty(
        self,
        client: Any,
        no_groups_mock: Any,
    ) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        assert suppress_defaults(response.json()) == suppress_defaults([])

    @pytest.mark.asyncio
    async def test_user2_get_me_groups_result_empty(
        self,
        client: Any,
        no_groups_mock: Any,
    ) -> None:
        response = await client.get(
            "/groups/me",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        assert suppress_defaults(response.json()) == suppress_defaults([])

    @pytest.mark.asyncio
    async def test_user1_create_group_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            "/groups",
            json=CREATE_GROUP_PAYLOAD,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        old_group_id = response.json()["id"]
        await alter_group_id(client.app, old_group_id, GROUP_1_ID)

    @pytest.mark.asyncio
    async def test_user2_create_group_duplicate(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            "/groups",
            json=CREATE_GROUP_PAYLOAD,
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_user3_get_group_forbidden(self, client: Any) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_get_group_success(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        def sort(x: Any) -> Any:
            x["members"].sort(key=lambda y: y["first_name"])
            x["punishment_types"].sort(key=lambda y: y["name"])
            return x

        assert suppress_defaults(sort(response.json())) == suppress_defaults(
            sort(GET_GROUP_1_RESPONSE)
        )

    @pytest.mark.asyncio
    async def test_user3_cannot_get_group_users_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/users",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_can_get_group_users(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/users",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["user_id"] == USER_1_ID

    @pytest.mark.asyncio
    async def test_user3_cannot_get_group_user_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_can_get_group_user(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert response.json()["user_id"] == USER_1_ID

    @pytest.mark.asyncio
    async def test_group_user_not_found(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_user1_create_join_request_error(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 0

    @pytest.mark.asyncio
    async def test_user2_create_join_request_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 1

    @pytest.mark.asyncio
    async def test_user2_create_join_request_duplicate(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 1

    @pytest.mark.asyncio
    async def test_user3_cannot_get_join_requests_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user2_cannot_get_join_requests_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_can_get_join_requests(
        self,
        client: Any,
    ) -> None:
        response = await client.get(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["user_id"] == USER_2_ID

    @pytest.mark.asyncio
    async def test_user2_deny_join_request_error(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_2_ID}/deny",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 1

    @pytest.mark.asyncio
    async def test_user1_deny_join_request_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_2_ID}/deny",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 0

    @pytest.mark.asyncio
    async def test_user2_recreate_join_request_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 1

    @pytest.mark.asyncio
    async def test_user2_accept_join_request_error(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_2_ID}/accept",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["join_requests"]) == 1

    @pytest.mark.asyncio
    async def test_user1_accept_join_request_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_2_ID}/accept",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 2
        assert len(group["join_requests"]) == 0

        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user2 is not None
        assert user2["permissions"] == []

    @pytest.mark.asyncio
    async def test_user3_cannot_edit_group_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}",
            json={"name": "New name", "name_short": "New short name"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert group["name"] == CREATE_GROUP_PAYLOAD["name"]
        assert group["name_short"] == CREATE_GROUP_PAYLOAD["name_short"]

    @pytest.mark.asyncio
    async def test_user2_cannot_edit_group_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}",
            json={"name": "New name", "name_short": "New short name"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert group["name"] == CREATE_GROUP_PAYLOAD["name"]
        assert group["name_short"] == CREATE_GROUP_PAYLOAD["name_short"]

    @pytest.mark.asyncio
    async def test_user1_can_edit_group(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}",
            json={"name": "New name", "name_short": "New short name"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert group["name"] == "New name"
        assert group["name_short"] == "New short name"

    @pytest.mark.asyncio
    async def test_user3_patch_permissions_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user2_patch_permissions_no_permission(self, client: Any) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_patch_permissions_success(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 2

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user1["permissions"] == ["group.owner"]
        assert user2["permissions"] == ["group.admin"]

    @pytest.mark.asyncio
    async def test_user1_cannot_downgrade_permissions_when_owner(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_user2_cannot_downgrade_permissions_of_owner(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/permissions",
            json={"privilege": "group.member"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user_2_can_downgrade_self(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.moderator"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user2["permissions"] == ["group.moderator"]

    @pytest.mark.asyncio
    async def test_user3_transfer_ownership_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/transferOwnership",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user2_transfer_ownership_no_permission(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/transferOwnership",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_user1_transfer_ownership_success(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/transferOwnership",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 2

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user1["permissions"] == ["group.admin"]
        assert user2["permissions"] == ["group.owner"]

        # Cleanup
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/transferOwnership",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_user1_cannot_leave_when_owner(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 2

    @pytest.mark.asyncio
    async def test_user2_can_leave_when_not_owner(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 1

    @pytest.mark.asyncio
    async def test_user2_can_rejoin_group(
        self,
        client: Any,
    ) -> None:
        request = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert request.status_code == 200

        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_2_ID}/accept",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 2

        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user2["permissions"] == []

    @pytest.mark.asyncio
    async def test_user3_can_join_group(
        self,
        client: Any,
    ) -> None:
        request = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert request.status_code == 200

        response = await client.post(
            f"/groups/{GROUP_1_ID}/joinRequests/{USER_3_ID}/accept",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["members"]) == 3

        user3 = find(group["members"], lambda x: x["user_id"] == USER_3_ID)
        assert user3["permissions"] == []

    @pytest.mark.asyncio
    async def test_user2_cannot_patch_user3_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": "group.moderator"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user3 = find(group["members"], lambda x: x["user_id"] == USER_3_ID)
        assert user3["permissions"] == []

    @pytest.mark.asyncio
    async def test_user1_repatch_user2_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert user2["permissions"] == ["group.admin"]

    @pytest.mark.asyncio
    async def test_user2_cannot_patch_user3_to_same_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user3 = find(group["members"], lambda x: x["user_id"] == USER_3_ID)
        assert user3["permissions"] == []

    @pytest.mark.asyncio
    async def test_user2_can_patch_user3_to_lower_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": "group.moderator"},
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user3 = find(group["members"], lambda x: x["user_id"] == USER_3_ID)
        assert user3["permissions"] == ["group.moderator"]

    @pytest.mark.asyncio
    async def test_user3_cannot_remove_user_with_higher_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_3_AUTHORIZATION)
        assert len(group["members"]) == 3

    @pytest.mark.asyncio
    async def test_user3_cannot_remove_user_with_same_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_3_AUTHORIZATION)
        assert len(group["members"]) == 3

        # Cleanup
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": "group.moderator"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )

    @pytest.mark.asyncio
    async def test_user2_cannot_kick_without_proper_permissions(
        self,
        client: Any,
    ) -> None:
        # Setup
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}/permissions",
            json={"privilege": ""},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.moderator"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        # Actual test
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)
        assert len(group["members"]) == 3

        # Cleanup
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": "group.admin"},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )

    @pytest.mark.asyncio
    async def test_user2_can_remove_user_with_lower_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/users/{USER_3_ID}",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)
        assert len(group["members"]) == 2

        # Cleanup admin perms
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/permissions",
            json={"privilege": ""},
            headers={"Authorization": USER_1_AUTHORIZATION},
        )

    @pytest.mark.asyncio
    async def test_user3_cannot_create_punishment_type_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["punishment_types"]) == 3

    @pytest.mark.asyncio
    async def test_user2_cannot_create_punishment_type_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)
        assert len(group["punishment_types"]) == 3

    @pytest.mark.asyncio
    async def test_user1_can_create_punishment_type(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishmentTypes",
            json=NEW_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_punishment_type_id(
            client.app,
            response.json()["punishment_type_id"],
            PUNISHMENT_TYPE_1_ID,
        )

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        assert len(group["punishment_types"]) == 4

        new_pt = find(
            group["punishment_types"],
            lambda x: x["punishment_type_id"] == PUNISHMENT_TYPE_1_ID,
        )
        assert new_pt is not None
        assert new_pt["name"] == NEW_PUNISHMENT_TYPE_PAYLOAD["name"]
        assert new_pt["value"] == NEW_PUNISHMENT_TYPE_PAYLOAD["value"]
        assert new_pt["emoji"] == NEW_PUNISHMENT_TYPE_PAYLOAD["emoji"]

    @pytest.mark.asyncio
    async def test_user3_cannot_edit_punishment_type_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/punishmentTypes/{PUNISHMENT_TYPE_1_ID}",
            json=EDIT_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        pt = find(
            group["punishment_types"],
            lambda x: x["punishment_type_id"] == PUNISHMENT_TYPE_1_ID,
        )
        assert pt["name"] == NEW_PUNISHMENT_TYPE_PAYLOAD["name"]

    @pytest.mark.asyncio
    async def test_user2_cannot_edit_punishment_type_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/punishmentTypes/{PUNISHMENT_TYPE_1_ID}",
            json=EDIT_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        pt = find(
            group["punishment_types"],
            lambda x: x["punishment_type_id"] == PUNISHMENT_TYPE_1_ID,
        )
        assert pt["name"] == NEW_PUNISHMENT_TYPE_PAYLOAD["name"]

    @pytest.mark.asyncio
    async def test_user1_can_edit_punishment_type(
        self,
        client: Any,
    ) -> None:
        response = await client.patch(
            f"/groups/{GROUP_1_ID}/punishmentTypes/{PUNISHMENT_TYPE_1_ID}",
            json=EDIT_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        pt = find(
            group["punishment_types"],
            lambda x: x["punishment_type_id"] == PUNISHMENT_TYPE_1_ID,
        )
        assert pt["name"] == EDIT_PUNISHMENT_TYPE_PAYLOAD["name"]

    @pytest.mark.asyncio
    async def test_user1_cannot_edit_punishment_type_invalid_emoji(
        self,
        client: Any,
    ) -> None:
        NEW_EDIT_PUNISHMENT_TYPE_PAYLOAD = {
            **EDIT_PUNISHMENT_TYPE_PAYLOAD,  # type: ignore
            "emoji": "g",
        }

        response = await client.patch(
            f"/groups/{GROUP_1_ID}/punishmentTypes/{PUNISHMENT_TYPE_1_ID}",
            json=NEW_EDIT_PUNISHMENT_TYPE_PAYLOAD,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        pt = find(
            group["punishment_types"],
            lambda x: x["punishment_type_id"] == PUNISHMENT_TYPE_1_ID,
        )
        assert pt["emoji"] == EDIT_PUNISHMENT_TYPE_PAYLOAD["emoji"]

    @pytest.mark.asyncio
    async def test_user3_cannot_give_punishment_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_1,
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 0

    @pytest.mark.asyncio
    async def test_user2_cannot_give_punishment_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_1,
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 0

    @pytest.mark.asyncio
    async def test_user1_cannot_give_punishment_with_too_high_amount(
        self, client: Any
    ) -> None:
        NEW_NEW_PUNISHMENT_PAYLOAD_1 = [
            {
                **NEW_PUNISHMENT_PAYLOAD_1[0],  # type: ignore
                "amount": 10,
            }
        ]

        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments",
            json=NEW_NEW_PUNISHMENT_PAYLOAD_1,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 0

    @pytest.mark.asyncio
    async def test_user1_cannot_give_punishments_with_too_high_amount(
        self, client: Any
    ) -> None:
        NEW_NEW_PUNISHMENT_PAYLOAD_1 = [
            {
                **NEW_PUNISHMENT_PAYLOAD_1[0],  # type: ignore
                "amount": 2,
            },
            {
                **NEW_PUNISHMENT_PAYLOAD_1[0],  # type: ignore
                "amount": 10,
            },
        ]

        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments",
            json=NEW_NEW_PUNISHMENT_PAYLOAD_1,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 400

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 0

    @pytest.mark.asyncio
    async def test_user1_can_give_punishment_on_self(
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
            client.app,
            response.json()["ids"][0],
            PUNISHMENT_1_ID,
        )

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        new_punishment = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert new_punishment["reason"] == NEW_PUNISHMENT_PAYLOAD_1[0]["reason"]
        assert (
            new_punishment["reason_hidden"]
            == NEW_PUNISHMENT_PAYLOAD_1[0]["reason_hidden"]
        )
        assert new_punishment["amount"] == NEW_PUNISHMENT_PAYLOAD_1[0]["amount"]

    @pytest.mark.asyncio
    async def test_user1_can_give_punishment_on_user2(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_2_ID}/punishments",
            json=NEW_PUNISHMENT_PAYLOAD_2,
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        await alter_punishment_id(
            client.app,
            response.json()["ids"][0],
            PUNISHMENT_2_ID,
        )

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert len(user2["punishments"]) == 1

        new_punishment = find(
            user2["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_2_ID
        )
        assert new_punishment["reason"] == NEW_PUNISHMENT_PAYLOAD_2[0]["reason"]
        assert (
            new_punishment["reason_hidden"]
            == NEW_PUNISHMENT_PAYLOAD_2[0]["reason_hidden"]
        )
        assert new_punishment["amount"] == NEW_PUNISHMENT_PAYLOAD_2[0]["amount"]

    @pytest.mark.asyncio
    async def test_user3_cannot_mark_punishment_as_paid_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/paid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert not punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user2_cannot_mark_punishment_as_paid_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/paid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert not punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user1_can_mark_punishment_as_paid(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/paid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user3_cannot_mark_punishment_as_unpaid_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/unpaid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user2_cannot_mark_punishment_as_unpaid_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/unpaid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user1_can_mark_punishment_as_unpaid(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/punishments/unpaid",
            json=[PUNISHMENT_1_ID],
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        punishment1 = find(
            user1["punishments"], lambda x: x["punishment_id"] == PUNISHMENT_1_ID
        )
        assert not punishment1["paid"]

    @pytest.mark.asyncio
    async def test_user3_cannot_mark_all_punishments_as_paid(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments/paid/all",
            headers={"Authorization": USER_3_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        for punishment in user1["punishments"]:
            assert not punishment["paid"]

    @pytest.mark.asyncio
    async def test_user2_cannot_mark_all_punishments_as_paid_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments/paid/all",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        for punishment in user1["punishments"]:
            assert not punishment["paid"]

    @pytest.mark.asyncio
    async def test_user1_can_mark_all_punishments_as_paid(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments/paid/all",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)

        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 1

        for punishment in user1["punishments"]:
            assert punishment["paid"]

    @pytest.mark.asyncio
    async def test_user1_cannot_mark_all_punishments_as_paid_when_no_unpaid_found(
        self,
        client: Any,
    ) -> None:
        response = await client.post(
            f"/groups/{GROUP_1_ID}/users/{USER_1_ID}/punishments/paid/all",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_user3_cannot_delete_punishment_not_in_group(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/punishments/{PUNISHMENT_2_ID}",  # User 2 has unpaid punishment.
            headers={"Authorization": USER_3_AUTHORIZATION},  # Test that first
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)
        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert len(user2["punishments"]) == 1

    @pytest.mark.asyncio
    async def test_user2_cannot_delete_punishment_no_permissions(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/punishments/{PUNISHMENT_2_ID}",
            headers={"Authorization": USER_2_AUTHORIZATION},
        )
        assert response.status_code == 403

        group = await get_group(client, GROUP_1_ID, USER_2_AUTHORIZATION)
        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert len(user2["punishments"]) == 1

    @pytest.mark.asyncio
    async def test_user1_can_delete_punishment(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/punishments/{PUNISHMENT_2_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        user2 = find(group["members"], lambda x: x["user_id"] == USER_2_ID)
        assert len(user2["punishments"]) == 0

    @pytest.mark.asyncio
    async def test_user1_can_delete_paid_punishment(
        self,
        client: Any,
    ) -> None:
        response = await client.delete(
            f"/groups/{GROUP_1_ID}/punishments/{PUNISHMENT_1_ID}",
            headers={"Authorization": USER_1_AUTHORIZATION},
        )
        assert response.status_code == 200

        group = await get_group(client, GROUP_1_ID, USER_1_AUTHORIZATION)
        user1 = find(group["members"], lambda x: x["user_id"] == USER_1_ID)
        assert len(user1["punishments"]) == 0
