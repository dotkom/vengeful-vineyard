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
ow_groups_for_user_response = load_json_response("ow_groups_for_user.json")
ow_groups_for_user_response_2 = load_json_response("ow_groups_for_user_2.json")
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


GROUPS_ME_RESPONSE = [
    {
        "group_id": "",
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
        "members": [],
        "punishment_types": [],
        "image": "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/sm/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
        "group_id": "",
        "punishment_types": [
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "🍸",
                "punishment_type_id": "",
            },
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "🍺",
                "punishment_type_id": "",
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "🍷",
                "punishment_type_id": "",
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
        "group_id": "",
        "punishment_types": [
            {
                "name": "Spritstraff",
                "value": 300,
                "logo_url": "🍸",
                "punishment_type_id": "",
            },
            {
                "name": "\u00d8lstraff",
                "value": 33,
                "logo_url": "🍺",
                "punishment_type_id": "",
            },
            {
                "name": "Vinstraff",
                "value": 100,
                "logo_url": "🍷",
                "punishment_type_id": "",
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
            },
        ],
    }
]


DEFAULT_PUNISHMENT_TYPES = [
    {
        "name": "Spritstraff",
        "value": 300,
        "logo_url": "🍸",
        "punishment_type_id": "",
    },
    {
        "name": "Ølstraff",
        "value": 33,
        "logo_url": "🍺",
        "punishment_type_id": "",
    },
    {
        "name": "Vinstraff",
        "value": 100,
        "logo_url": "🍷",
        "punishment_type_id": "",
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
    "punishment_type_id": "",
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


async def alter_punishment_type_id(app: FastAPI, name: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE punishment_types SET punishment_type_id = $1 WHERE name = $2",
            new_id,
            name,
        )


async def alter_punishment_id(app: FastAPI, old_id: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE group_punishments SET punishment_id = $1 WHERE punishment_id = $2",
            new_id,
            old_id,
        )


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
            payload={"count": 0, "next": None, "previous": None, "results": []},
        )

        yield m
