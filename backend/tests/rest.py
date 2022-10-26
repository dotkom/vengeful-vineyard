from typing import Any

from app.models.user import UserCreate
from app.types import GroupId, OWGroupUserId, UserId


async def rest_create_user(client: Any, create_user: UserCreate) -> Any:
    response = await client.post(
        "/user",
        json=dict(create_user),
    )
    return response


async def rest_create_group(client: Any, name: str, name_short: str) -> Any:
    response = await client.post(
        "/group",
        json={"name": name, "name_short": name_short, "rules": "test", "image": "test"},
    )
    return response


async def rest_join_group(
    client: Any,
    group_id: GroupId,
    user_id: UserId,
    ow_group_user_id: OWGroupUserId | None = None,
) -> Any:
    params = {}
    if ow_group_user_id is not None:
        params["ow_group_user_id"] = ow_group_user_id

    response = await client.post(
        f"/group/{group_id}/user/{user_id}",
        params=params,
    )
    return response
