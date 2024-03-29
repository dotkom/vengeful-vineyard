import copy
import itertools
import json
import os
import re
from typing import Any, AsyncGenerator

import pytest_asyncio
from aioresponses import aioresponses
from asgi_lifespan import LifespanManager
from httpx import AsyncClient

from app.api import FastAPI
from app.api.init_api import init_api
from app.http import BASE_OLD_ONLINE


def load_json_response(filename: str) -> Any:
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(dir_path, f"responses/{filename}"), "r") as f:
        return json.load(f)


counter = itertools.count().__next__
ESCAPED_BASE_OLD_ONLINE = re.escape(BASE_OLD_ONLINE)

ow_group_users_response = load_json_response("ow_group_users.json")
ow_group_users_response_2 = load_json_response("ow_group_users_2.json")
ow_group_users_other_not_in_group_response = load_json_response(
    "ow_group_users_other_not_in_group.json"
)
ow_groups_for_user_response = load_json_response("ow_groups_for_user.json")
ow_groups_for_user_response_2 = load_json_response("ow_groups_for_user_2.json")
ow_groups_for_other_not_in_group = load_json_response(
    "ow_groups_for_other_not_in_group.json"
)
ow_profile_response = load_json_response("ow_profile.json")
ow_profile_other_not_in_group_response = load_json_response(
    "ow_profile_other_not_in_group.json"
)
ow_profile_other_response = load_json_response("ow_profile_other.json")


GROUP_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee0"
SELF_USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1"
OTHER_USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee2"
OTHER_USER_NOT_IN_GROUP_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee3"
SELF_USER_ACCESS_TOKEN = SELF_USER_ID
OTHER_USER_ACCESS_TOKEN = OTHER_USER_ID
OTHER_USER_NOT_IN_GROUP_ACCESS_TOKEN = OTHER_USER_NOT_IN_GROUP_ID
SELF_USER_AUTHORIZATION = f"Bearer {SELF_USER_ACCESS_TOKEN}"
OTHER_USER_AUTHORIZATION = f"Bearer {OTHER_USER_ACCESS_TOKEN}"
OTHER_USER_NOT_IN_GROUP_AUTHORIZATION = f"Bearer {OTHER_USER_NOT_IN_GROUP_ACCESS_TOKEN}"
PUNISHMENT_TYPE_1_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeaaaa1"
PUNISHMENT_TYPE_2_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeaaaa2"
PUNISHMENT_TYPE_4_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeaaaa4"
PUNISHMENT_1_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeaaab1"
PUNISHMENT_2_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeaaab2"


@pytest_asyncio.fixture(scope="class")
async def client() -> AsyncGenerator[AsyncClient, None]:
    # Need to use a LifespanManager in order for the startup and shutdown event to be
    # called during testing. Otherwise the DB would not be set up for testing.
    app = init_api(database=f"db{counter() + 1}")

    async with LifespanManager(app):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            setattr(ac, "app", app)
            yield ac


@pytest_asyncio.fixture(scope="class")
async def mock() -> AsyncGenerator[aioresponses, None]:
    with aioresponses() as m:
        # Register endpoints to mock here

        # TestOW.test_get_my_groups_unauthenticated()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=401,
        )

        # TestOW.test_get_my_groups()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_user_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_response,
        )

        # TestOW.test_get_my_user()
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_user_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_response,
        )

        # TestOW.test_get_my_user_empty_groups()
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_user_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_response,
        )

        # TestOW.test_get_my_groups_other_user_in_group()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_user_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_response,
        )

        # TestOW.test_get_my_groups_update()
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_user_response_2,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_response_2,
        )

        # TestOW.test_get_my_groups_other_not_in_group()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_not_in_group_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_other_not_in_group,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_other_not_in_group_response,
        )

        yield m


@pytest_asyncio.fixture(scope="class")
async def no_groups_mock() -> AsyncGenerator[aioresponses, None]:
    with aioresponses() as m:
        # Register endpoints to mock here

        # test_user1_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user2_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user3_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_not_in_group_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user1_get_me_groups_result_empty()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user2_get_me_groups_result_empty()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        yield m


@pytest_asyncio.fixture(scope="class")
async def all_groups_mock() -> AsyncGenerator[aioresponses, None]:
    with aioresponses() as m:
        # Register endpoints to mock here

        # test_user1_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user2_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload={
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            },
        )

        # test_user3_get_me_success()
        m.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile",
            status=200,
            payload=ow_profile_other_not_in_group_response,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}/api/v1/group/online-groups\?members__user=\d+"
            ),
            status=200,
            payload=ow_groups_for_other_not_in_group,
        )
        m.get(
            re.compile(
                rf"{ESCAPED_BASE_OLD_ONLINE}\/api\/v1\/group\/online-groups\/\d+\/group-users"
            ),
            status=200,
            payload=ow_group_users_other_not_in_group_response,
        )

        yield m
