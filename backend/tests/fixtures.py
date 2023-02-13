import itertools
import json
import os
import re
from typing import Any, AsyncGenerator

import pytest_asyncio
from aioresponses import aioresponses
from asgi_lifespan import LifespanManager
from httpx import AsyncClient

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
ow_groups_for_user_response = load_json_response("ow_groups_for_user.json")
ow_groups_for_user_response_2 = load_json_response("ow_groups_for_user_2.json")
ow_profile_response = load_json_response("ow_profile.json")
ow_profile_other_not_in_group_response = load_json_response(
    "ow_profile_other_not_in_group.json"
)
ow_profile_other_response = load_json_response("ow_profile_other.json")


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
    with aioresponses() as m:  # type: ignore
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
            payload={"count": 0, "next": None, "previous": None, "results": []},
        )

        yield m
