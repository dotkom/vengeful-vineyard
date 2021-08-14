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
    User,
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


async def getUser(user_id: UserId, *, punishments: bool) -> User:
    dbUser = cur.execute(
        """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
    ).fetchone()
    if not dbUser:
        raise HTTPException(status_code=404, detail="User not found")
    user = dict(dbUser)
    user["punishments"] = []
    if punishments:
        # TODO: Create a real sql command
        dbPunishments = cur.execute(
            """SELECT group_members.group_id, name
           FROM group_members
           INNER JOIN users on users.user_id = group_members.user_id
           INNER JOIN groups on groups.group_id = group_members.group_id
           WHERE group_members.user_id = :user_id""",
            {"user_id": user_id},
        ).fetchall()
        for dbPunishment in dbPunishments:
            user["punishments"].append(dict(dbPunishment))
    return User(**user)


async def getGroupUser(
    group_id: GroupId, user_id: UserId, *, punishments: bool
) -> User:
    dbUser = cur.execute(
        """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
    ).fetchone()
    if not dbUser:
        raise HTTPException(status_code=404, detail="User not found")
    user = dict(dbUser)
    user["punishments"] = []
    if punishments:
        dbPunishments = cur.execute(
            """SELECT punishment_id, group_id, user_id, punishment_type, reason, amount, verified_by, verified_time, created_time
               FROM   group_punishments
               WHERE  group_id = :group_id
               AND    user_id = :user_id""",
            {"user_id": user_id, "group_id": group_id},
        ).fetchall()
        for dbPunishment in dbPunishments:
            user["punishments"].append(dict(dbPunishment))
    return User(**user)


# Todo: incomplete and not used
async def getGroupUsers(group_id: GroupId) -> List[User]:
    dbUsers = cur.execute(
        """SELECT *
           FROM users
           INNER JOIN group_members
           INNER JOIN group_punishments
           WHERE group_members.group_id = :group_id
           AND   group_punishments.group_id = :group_id""",
        {"group_id": group_id},
    ).fetchall()
    for dbUser in dbUsers:
        print(dbUser)
    return User(**user)


async def getPunishmentTypes(group_id: GroupId) -> List[PunishmentType]:
    punishment_types = cur.execute(
        """SELECT * FROM punishment_types
           WHERE group_id = :group_id""",
        {"group_id": group_id},
    )
    return list(map(lambda x: PunishmentType(**dict(x)), punishment_types.fetchall()))


async def getPunishment(punishment_id: PunishmentId) -> Punishment:
    punishments = cur.execute(
        """
        SELECT * FROM group_punishments
        WHERE punishment_id = :punishment_id
        """,
        {"punishment_id": punishment_id},
    )
    return Punishment(**dict(punishments.fetchone()))


async def getPunishments(user_id: UserId, group_id: GroupId) -> List[Punishment]:
    punishments = cur.execute(
        """
        SELECT * FROM group_punishments
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
) -> Dict[str, List[int]]:
    ids = []
    for punishment in punishments:
        statement = "INSERT INTO group_punishments(group_id, user_id, punishment_type, reason, amount) VALUES (?, ?, ?, ?, ?)"
        values = (
            group_id,
            user_id,
            punishment.punishment_type,
            punishment.reason,
            punishment.amount,
        )
        try:
            cur.execute(statement, values)
            ids.append(cur.lastrowid)
        except sqlite3.IntegrityError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
    con.commit()
    return {"ids": ids}


async def deletePunishment(punishment_id: PunishmentId) -> None:
    # TODO: ACL
    statement = "DELETE FROM group_punishments WHERE punishment_id=:punishment_id"
    cur.execute(statement, {"punishment_id": punishment_id})
    con.commit()


async def verifyPunishment(punishment_id: PunishmentId) -> Punishment:
    statement = "UPDATE group_punishments SET verified_time=datetime('now', 'localtime') WHERE punishment_id=:punishment_id"
    cur.execute(statement, {"punishment_id": punishment_id})
    con.commit()
    return await getPunishment(punishment_id)
