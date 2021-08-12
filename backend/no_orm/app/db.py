import os
import sqlite3
from typing import Any, Dict, List

from fastapi import HTTPException

from app.models import (
    CreateGroup,
    CreatePunishment,
    CreatePunishmentType,
    CreateUser,
    Group,
    PunishmentType,
    User,
)

con = None
cur = None
schemaFile = ""


def loadSchema(file: str) -> None:
    global schemaFile
    schemaFile = file
    with open(file, "r") as f:
        schema = f.readlines()
        schemaStr = "".join([line.strip() for line in schema])
    cur.executescript(schemaStr)


def reconnect():
    global con
    global cur

    con = sqlite3.connect(os.environ.get("VENGEFUL_DATABASE"))
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    try:
        loadSchema(schemaFile)
    except:
        pass


reconnect()


async def getPunishmentTypes(group_id: int) -> List[Dict[str, Any]]:
    punishment_types = cur.execute(
        """SELECT * FROM punishment_types
           WHERE group_id = :group_id""",
        {"group_id": group_id},
    )
    return list(map(lambda x: PunishmentType(**dict(x)), punishment_types.fetchall()))


async def insertUser(user: CreateUser) -> Dict[str, int]:
    statement = (
        f"INSERT INTO users(first_name, last_name, email, active) VALUES (?, ?, ?, ?)"
    )
    values = (user.first_name, user.last_name, user.email, user.active)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertGroup(group: CreateGroup) -> Dict[str, int]:
    statement = f"INSERT INTO groups(name, rules) VALUES (?, ?)"
    values = (group.name, group.rules)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertUserInGroup(group_id: int, user_id: int) -> Dict[str, int]:
    statement = (
        f"INSERT INTO group_members(group_id, user_id, is_admin) VALUES (?, ?, False)"
    )
    values = (group_id, user_id)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertPunishmentType(
    group_id: int, type: CreatePunishmentType
) -> Dict[str, int]:
    statement = f"INSERT INTO punishment_types(group_id, name, value, logo_url) VALUES (?, ?, ?, ?)"
    values = (group_id, type.name, type.value, type.logo_url)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    con.commit()
    return {"id": cur.lastrowid}


async def insertPunishments(
    group_id: int, user_id: int, type: CreatePunishment
) -> Dict[str, int]:
    pass
