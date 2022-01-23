"""
Functions for interacting with the SQLite database.
"""
import sqlite3
from sqlite3 import Connection

from app.config import settings
from app.models.group import GroupCreate
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.models.user import User, UserCreate
from app.types import GroupId, PunishmentId, UserId
from fastapi import HTTPException

CONN = sqlite3.connect(settings.vengeful_database)
CONN.row_factory = sqlite3.Row
SCHEMAFILE = settings.schema_file

DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(name="Ølstraff", value=33, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Vinstraff", value=100, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Spritstraff", value=300, logo_url="https://example.com"),
]


def get_instance() -> Connection:
    return CONN


def load_schema(filepath: str) -> None:
    global SCHEMAFILE
    SCHEMAFILE = filepath
    with open(filepath, "r", encoding="utf-8") as file:
        schema = file.readlines()
        # Remove comments
        schema = list(filter(lambda x: not x.startswith("--"), schema))
        # Merge to one long string
        schema_str = "".join([line.strip() for line in schema])
    CONN.executescript(schema_str)


def reconnect_db() -> None:
    global CONN

    CONN = sqlite3.connect(settings.vengeful_database)
    CONN.row_factory = sqlite3.Row
    try:
        load_schema(SCHEMAFILE)
    except FileNotFoundError:
        pass


reconnect_db()


async def get_user(user_id: UserId, *, punishments: bool) -> User:
    db_user = CONN.execute(
        """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
    ).fetchone()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = dict(db_user)
    user["punishments"] = []
    if punishments:
        db_punishments = CONN.execute(
            """
            SELECT punishment_id, punishment_type, reason, amount, verified_by, verified_time, created_time
            FROM group_punishments
            INNER JOIN groups
            ON group_punishments.group_id = groups.group_id
            WHERE user_id = :user_id;
            """,
            {"user_id": user_id},
        ).fetchall()
        for db_punishment in db_punishments:
            user["punishments"].append(dict(db_punishment))
    return User(**user)


async def get_group_user(
    group_id: GroupId, user_id: UserId, *, punishments: bool
) -> User:
    db_user = CONN.execute(
        """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
    ).fetchone()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = dict(db_user)
    user["punishments"] = []
    if punishments:
        db_punishments = CONN.execute(
            """SELECT punishment_id, group_id, user_id, punishment_type, reason, amount, verified_by, verified_time, created_time
               FROM   group_punishments
               WHERE  group_id = :group_id
               AND    user_id = :user_id""",
            {"user_id": user_id, "group_id": group_id},
        ).fetchall()
        for db_punishment in db_punishments:
            user["punishments"].append(dict(db_punishment))
    return User(**user)


async def get_group_users(group_id: GroupId) -> list[User]:
    members = []
    db_users = CONN.execute(
        """SELECT *
           FROM users
           INNER JOIN group_members
           WHERE group_members.group_id = :group_id
           AND   users.user_id = group_members.user_id""",
        {"group_id": group_id},
    ).fetchall()
    for db_user in db_users:
        user = dict(db_user)
        user["punishments"] = None
        members.append(User(**user))
    return members


async def get_punishment_types(group_id: GroupId) -> list[PunishmentTypeRead]:
    punishment_types = CONN.execute(
        """SELECT * FROM punishment_types
           WHERE group_id = :group_id""",
        {"group_id": group_id},
    )
    return list(
        map(lambda x: PunishmentTypeRead(**dict(x)), punishment_types.fetchall())
    )


async def get_punishment(punishment_id: PunishmentId) -> PunishmentRead:
    punishments = CONN.execute(
        """
        SELECT * FROM group_punishments
        WHERE punishment_id = :punishment_id
        """,
        {"punishment_id": punishment_id},
    )
    return PunishmentRead(**dict(punishments.fetchone()))


async def get_punishments(user_id: UserId, group_id: GroupId) -> list[PunishmentRead]:
    punishments = CONN.execute(
        """
        SELECT * FROM group_punishments
        WHERE group_id = :group_id
        AND user_id = :user_id
        """,
        {"group_id": group_id, "user_id": user_id},
    )
    return list(map(lambda x: PunishmentRead(**dict(x)), punishments.fetchall()))


async def insert_user(user: UserCreate) -> dict[str, int]:
    statement = "INSERT INTO users(first_name, last_name, email) VALUES (?, ?, ?)"
    values = (user.first_name, user.last_name, user.email)
    try:
        cur = CONN.cursor()
        cur.execute(statement, values)
    except sqlite3.IntegrityError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    CONN.commit()
    return {"id": cur.lastrowid}


async def insert_group(group: GroupCreate) -> dict[str, int]:
    statement = "INSERT INTO groups(name, rules) VALUES (?, ?)"
    values = (group.name, group.rules)
    try:
        cur = CONN.cursor()
        cur.execute(statement, values)
    except sqlite3.IntegrityError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    gid = cur.lastrowid
    for punishment_type in DEFAULT_PUSHISHMENT_TYPES:
        await insert_punishment_type(gid, punishment_type)
    return {"id": gid}


async def insert_user_in_group(group_id: GroupId, user_id: UserId) -> dict[str, int]:
    statement = (
        "INSERT INTO group_members(group_id, user_id, is_admin) VALUES (?, ?, False)"
    )
    values = (group_id, user_id)
    try:
        cur = CONN.cursor()
        cur.execute(statement, values)
    except sqlite3.IntegrityError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    CONN.commit()
    return {"id": cur.lastrowid}


async def insert_punishment_type(
    group_id: GroupId, punishment_type: PunishmentTypeCreate
) -> dict[str, int]:
    statement = "INSERT INTO punishment_types(group_id, name, value, logo_url) VALUES (?, ?, ?, ?)"
    values = (
        group_id,
        punishment_type.name,
        punishment_type.value,
        punishment_type.logo_url,
    )
    try:
        cur = CONN.cursor()
        cur.execute(statement, values)
    except sqlite3.IntegrityError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    CONN.commit()
    return {"id": cur.lastrowid}


async def insert_punishments(
    group_id: GroupId, user_id: UserId, punishments: list[PunishmentCreate]
) -> dict[str, list[int]]:
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
            cur = CONN.cursor()
            cur.execute(statement, values)
            ids.append(cur.lastrowid)
        except sqlite3.IntegrityError as ex:
            raise HTTPException(status_code=400, detail=str(ex)) from ex
    CONN.commit()
    return {"ids": ids}


async def delete_punishment(punishment_id: PunishmentId) -> None:
    statement = "DELETE FROM group_punishments WHERE punishment_id=:punishment_id"
    CONN.execute(statement, {"punishment_id": punishment_id})
    CONN.commit()


async def verify_punishment(punishment_id: PunishmentId) -> PunishmentRead:
    statement = "UPDATE group_punishments SET verified_time=datetime('now', 'localtime') WHERE punishment_id=:punishment_id"
    CONN.execute(statement, {"punishment_id": punishment_id})
    CONN.commit()
    return await get_punishment(punishment_id)
