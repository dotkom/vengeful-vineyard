import sqlite3
from typing import Any, Dict, List, Tuple

from fastapi import FastAPI, HTTPException

import db
from models import Group, User

db.loadSchema("schema.sql")


def dbToGroup(dbGroup: sqlite3.Cursor) -> Group:
    return Group(**dict(zip(Group.__fields__.keys(), dbGroup)))


def dbToUser(dbUser: sqlite3.Cursor) -> User:
    return User(**dict(zip(User.__fields__.keys(), dbUser)))


app = FastAPI()


@app.get("/user", tags=["User"])
async def get_users() -> Dict[str, List[Any]]:
    users = db.cur.execute("""SELECT * FROM users""")
    return {"users": list(map(dbToUser, users))}


@app.post("/user", tags=["User"])
async def post_user(user: User) -> Dict[str, int]:
    if user.age <= 18:
        raise HTTPException(status_code=400, detail="User is too young!")
    return await db.insertUser(user)


@app.get("/user/{user_id}", tags=["User"])
async def get_user(user_id: int) -> User:
    user = db.cur.execute(
        """SELECT * FROM users where user_id = :user_id""", {"user_id": user_id}
    )
    user = user.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dbToUser(user)


@app.get("/group/{group_id}", tags=["Group"])
async def get_group(group_id: int) -> Group:
    group = db.cur.execute(
        """SELECT * FROM groups where group_id = :group_id""", {"group_id": group_id}
    )
    group = group.fetchone()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return dbToGroup(group)


@app.post("/group", tags=["Group"])
async def post_group(group: Group) -> Dict[str, int]:
    # TODO: Validation
    return await db.insertGroup(group)


@app.post("/group/{group_id}/{user_id}", tags=["Group"])
async def add_user_to_group(group_id: int, user_id: int) -> Dict[str, int]:
    return await db.insertUserInGroup(group_id, user_id)


@app.get("/user/{user_id}/group", tags=["User"])
async def get_user_groups(user_id: int) -> Dict[str, Any]:
    groups = db.cur.execute(
        """SELECT group_members.group_id, name from group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           where group_members.user_id = :user_id""",
        {"user_id": user_id},
    ).fetchall()
    if not groups:
        raise HTTPException(status_code=404, detail="User groups could not be found")

    return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}
