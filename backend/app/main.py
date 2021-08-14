import sqlite3
from timeit import default_timer as timer
from typing import Any, Dict, List, Tuple

from fastapi import FastAPI, HTTPException, Request

from app import db
from app.models import (
    CreateGroup,
    CreatePunishment,
    CreatePunishmentType,
    CreateUser,
    Group,
    Punishment,
    PunishmentType,
    User,
)
from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId

db.loadSchema("schema.sql")

app = FastAPI()

# TODO
# Authentication: https://fastapi.tiangolo.com/tutorial/security
# SQL migration "framework"


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
    dbUsers = db.cur.execute("""SELECT * FROM users""")
    users = list(map(lambda x: dict(x), dbUsers))
    for user in users:
        # TODO: Add punishments
        user["punishments"] = []

    return {"users": users}


@app.post("/user", tags=["User"])
async def post_user(user: CreateUser) -> Dict[str, int]:
    return await db.insertUser(user)


@app.get("/user/{user_id}", tags=["User"])
async def get_user(user_id: UserId) -> User:
    dbUser = db.cur.execute(
        """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
    ).fetchone()
    if not dbUser:
        raise HTTPException(status_code=404, detail="User not found")
    # TODO: Add punishments
    user = dict(dbUser)
    user["punishments"] = []
    return User(**user)


@app.get("/group/{group_id}", tags=["Group"])
async def get_group(group_id: GroupId) -> Group:
    dbGroup = db.cur.execute(
        """SELECT * FROM groups
           WHERE groups.group_id = :group_id""",
        {"group_id": group_id},
    ).fetchone()
    if not dbGroup:
        raise HTTPException(status_code=404, detail="Group not found")
    group = dict(dbGroup)
    group["punishment_types"] = await db.getPunishmentTypes(group_id)
    return Group(**dict(group))


@app.post("/group", tags=["Group"])
async def post_group(group: CreateGroup) -> Dict[str, int]:
    # TODO: Validation
    return await db.insertGroup(group)


@app.post("/group/{group_id}/punishmentType", tags=["Group"])
async def add_punishment_type_to_group(
    group_id: GroupId, type: CreatePunishmentType
) -> Dict[str, int]:
    return await db.insertPunishmentType(group_id, type)


@app.post("/group/{group_id}/user/{user_id}", tags=["Group"])
async def add_user_to_group(group_id: GroupId, user_id: UserId) -> Dict[str, int]:
    return await db.insertUserInGroup(group_id, user_id)


@app.post("/group/{group_id}/user/{user_id}/punishment", tags=["Group"])
async def add_punishment(
    group_id: GroupId, user_id: UserId, punishments: List[CreatePunishment]
) -> Dict[str, int]:
    return await db.insertPunishments(group_id, user_id, punishments)


@app.delete(
    "/group/{group_id}/user/{user_id}/punishment/{punishment_id}", tags=["Group"]
)
async def delete_punishment(punishment_id: PunishmentId) -> None:
    await db.deletePunishment(punishment_id)


@app.get("/user/{user_id}/group", tags=["User"])
async def get_user_groups(user_id: UserId) -> Dict[str, Any]:
    groups = db.cur.execute(
        """SELECT group_members.group_id, name from group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           WHERE group_members.user_id = :user_id""",
        {"user_id": user_id},
    ).fetchall()
    if groups is None:
        raise HTTPException(status_code=500, detail="User groups could not be found")

    return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}
