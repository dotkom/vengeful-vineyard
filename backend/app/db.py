import sqlite3
from typing import Dict, List

from fastapi import HTTPException

from app.config import settings
from app.models import (
    CreateGroup,
    CreatePunishment,
    CreatePunishmentType,
    CreateUser,
    Punishment,
    PunishmentType,
)
from app.types import GroupId, PunishmentId, UserId

con = sqlite3.connect(settings.vengeful_database)
con.row_factory = sqlite3.Row
cur = con.cursor()
schemaFile = ""


def loadSchema(file: str) -> None:
    global schemaFile
    schemaFile = file
    with open(file, "r") as f:
        schema = f.readlines()
        # Remove comments
        schema = list(filter(lambda x: not x.startswith("--"), schema))
        # Merge to one long string
        schemaStr = "".join([line.strip() for line in schema])
    cur.executescript(schemaStr)


def reconnect_db() -> None:
    global con
    global cur

    con = sqlite3.connect(settings.vengeful_database)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    try:
        loadSchema(schemaFile)
    except Exception:
        pass


reconnect_db()


async def getPunishmentTypes(group_id: GroupId) -> List[PunishmentType]:
    punishment_types = cur.execute(
        """SELECT * FROM punishment_types
           WHERE group_id = :group_id""",
        {"group_id": group_id},
    )
    return list(map(lambda x: PunishmentType(**dict(x)), punishment_types.fetchall()))


async def getPunishments(user_id: UserId, group_id: GroupId) -> List[Punishment]:
    punishments = cur.execute(
        """
        SELECT * FROM punishments
        WHERE group_id = :group_id
        AND user_id = :user_id
        """,
        {"group_id": group_id, "user_id": user_id},
    )
    return list(map(lambda x: Punishment(**dict(x)), punishments.fetchall()))


async def insertUser(user: CreateUser) -> Dict[str, int]:
    statement = "INSERT INTO users(first_name, last_name, email) VALUES (?, ?, ?)"
    values = (user.first_name, user.last_name, user.email)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    con.commit()
    return {"id": cur.lastrowid}


async def insertGroup(group: CreateGroup) -> Dict[str, int]:
    statement = "INSERT INTO groups(name, rules) VALUES (?, ?)"
    values = (group.name, group.rules)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    con.commit()
    return {"id": cur.lastrowid}


async def insertUserInGroup(group_id: GroupId, user_id: UserId) -> Dict[str, int]:
    statement = (
        "INSERT INTO group_members(group_id, user_id, is_admin) VALUES (?, ?, False)"
    )
    values = (group_id, user_id)
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    con.commit()
    return {"id": cur.lastrowid}


async def insertPunishmentType(
    group_id: GroupId, punishment_type: CreatePunishmentType
) -> Dict[str, int]:
    statement = "INSERT INTO punishment_types(group_id, name, value, logo_url) VALUES (?, ?, ?, ?)"
    values = (
        group_id,
        punishment_type.name,
        punishment_type.value,
        punishment_type.logo_url,
    )
    try:
        cur.execute(statement, values)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    con.commit()
    return {"id": cur.lastrowid}


async def insertPunishments(
    group_id: GroupId, user_id: UserId, punishments: List[CreatePunishment]
) -> Dict[str, int]:
    pass


async def deletePunishment(punishment_id: PunishmentId) -> None:
    # TODO: ACL
    statement = "DELETE FROM group_punishments WHERE punishment_id=:punishment_id"
    cur.execute(statement, {"punishment_id": punishment_id})
    con.commit()
