"""
Definition of API
"""

from timeit import default_timer as timer
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Request

from app import db
from app.models import (
    CreateGroup,
    CreatePunishment,
    CreatePunishmentType,
    CreateUser,
    Group,
    Punishment,
    User,
)
from app.types import GroupId, PunishmentId, UserId

db.load_schema("schema.sql")

app = FastAPI()


@app.middleware("http")
async def add_process_time_header(request: Request, call_next: Any) -> Any:
    start_time = timer()
    response = await call_next(request)
    end_time = timer()
    process_time = end_time - start_time
    response.headers["Process-Time-Ms"] = str(round(process_time * 1000, 2))
    return response


@app.get("/user", tags=["User"])
async def get_users() -> Dict[str, List[Any]]:
    db_users = db.CUR.execute("""SELECT * FROM users""")
    users = list(map(dict, db_users))
    return {"users": users}


@app.post("/user", tags=["User"])
async def post_user(user: CreateUser) -> Dict[str, int]:
    return await db.insert_user(user)


@app.get("/user/{user_id}", tags=["User"])
async def get_user(user_id: UserId) -> User:
    return await db.get_user(user_id, punishments=True)


@app.get("/group/{group_id}/user/{user_id}", tags=["Group"])
async def get_group_user(group_id: GroupId, user_id: UserId) -> User:
    return await db.get_group_user(group_id, user_id, punishments=True)


@app.get("/group/{group_id}", tags=["Group"])
async def get_group(group_id: GroupId) -> Group:
    db_group = db.CUR.execute(
        """SELECT * FROM groups
           WHERE groups.group_id = :group_id""",
        {"group_id": group_id},
    ).fetchone()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    group = dict(db_group)
    group["punishment_types"] = await db.get_punishment_types(group_id)
    group["members"] = await db.get_group_users(group_id)
    return Group(**dict(group))


@app.post("/group", tags=["Group"])
async def post_group(group: CreateGroup) -> Dict[str, int]:
    return await db.insert_group(group)


@app.post("/group/{group_id}/punishmentType", tags=["Group"])
async def add_punishment_type_to_group(
    group_id: GroupId, punishment_type: CreatePunishmentType
) -> Dict[str, int]:
    return await db.insert_punishment_type(group_id, punishment_type)


@app.post("/group/{group_id}/user/{user_id}", tags=["Group"])
async def add_user_to_group(group_id: GroupId, user_id: UserId) -> Dict[str, int]:
    return await db.insert_user_in_group(group_id, user_id)


@app.post("/group/{group_id}/user/{user_id}/punishment", tags=["Group"])
async def add_punishment(
    group_id: GroupId, user_id: UserId, punishments: List[CreatePunishment]
) -> Dict[str, List[int]]:
    return await db.insert_punishments(group_id, user_id, punishments)


@app.delete(
    "/group/{group_id}/user/{user_id}/punishment/{punishment_id}", tags=["Group"]
)
async def delete_punishment(punishment_id: PunishmentId) -> None:
    await db.delete_punishment(punishment_id)


@app.post(
    "/group/{group_id}/user/{user_id}/punishment/{punishment_id}/verify", tags=["Group"]
)
async def verify_punishment(punishment_id: PunishmentId) -> Punishment:
    return await db.verify_punishment(punishment_id)


@app.get("/user/{user_id}/group", tags=["User"])
async def get_user_groups(user_id: UserId) -> Dict[str, Any]:
    groups = db.CUR.execute(
        """SELECT group_members.group_id, name from group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           WHERE group_members.user_id = :user_id""",
        {"user_id": user_id},
    ).fetchall()
    if groups is None:
        raise HTTPException(status_code=500, detail="User groups could not be found")

    return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}
