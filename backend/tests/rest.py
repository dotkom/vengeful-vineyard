# -*- coding: utf-8 -*-
from typing import Any, Dict

from app.types import GroupId, UserId


async def rest_create_user(client: Any, createUser: Dict[str, str]) -> Any:
    async with client:
        response = await client.post(
            "/user",
            json=createUser,
        )
    return response


async def rest_create_group(client: Any, name: str) -> Any:
    async with client:
        response = await client.post(
            "/group",
            json={"name": name, "rules": "test"},
        )
    return response


async def rest_join_group(client: Any, group_id: GroupId, user_id: UserId) -> Any:
    async with client:
        response = await client.post(f"/group/{group_id}/user/{user_id}")
    return response
