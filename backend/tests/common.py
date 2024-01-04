from typing import Any

from app.api import FastAPI

NON_EXISTING_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

USER_1_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
USER_2_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"
USER_3_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"
GROUP_1_ID = "bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
GROUP_2_ID = "bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaa2"
PUNISHMENT_TYPE_1_ID = "cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
PUNISHMENT_TYPE_2_ID = "cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaa2"
PUNISHMENT_TYPE_3_ID = "cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaa3"
PUNISHMENT_TYPE_4_ID = "cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaa4"
PUNISHMENT_1_ID = "dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
PUNISHMENT_2_ID = "dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaa2"
PUNISHMENT_3_ID = "dddddddd-aaaa-aaaa-aaaa-aaaaaaaaaaa3"

USER_1_AUTHORIZATION = f"Bearer {USER_1_ID}"
USER_2_AUTHORIZATION = f"Bearer {USER_2_ID}"
USER_3_AUTHORIZATION = f"Bearer {USER_3_ID}"

CREATE_GROUP_PAYLOAD = {"name": "Long name", "name_short": "Short name"}


async def get_group(client: Any, group_id: str, authorization: str) -> Any:
    response = await client.get(
        f"/groups/{group_id}",
        headers={"Authorization": authorization},
    )
    assert response.status_code == 200
    return response.json()


async def alter_punishment_type_id_by_name(
    app: FastAPI, group_id: str, name: str, new_id: str
) -> None:
    async with app.db.pool.acquire() as conn:
        query = "UPDATE punishment_types SET punishment_type_id = $1 WHERE name = $2 AND group_id = $3"
        await conn.execute(query, new_id, name, group_id)


async def alter_user_id(app: FastAPI, old_id: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE users SET user_id = $1 WHERE user_id = $2",
            new_id,
            old_id,
        )


async def alter_group_id(app: FastAPI, old_id: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE groups SET group_id = $1 WHERE group_id = $2",
            new_id,
            old_id,
        )


async def alter_punishment_type_id(app: FastAPI, old_id: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE punishment_types SET punishment_type_id = $1 WHERE punishment_type_id = $2",
            new_id,
            old_id,
        )


async def alter_punishment_id(app: FastAPI, old_id: str, new_id: str) -> None:
    async with app.db.pool.acquire() as conn:
        await conn.execute(
            "UPDATE group_punishments SET punishment_id = $1 WHERE punishment_id = $2",
            new_id,
            old_id,
        )
