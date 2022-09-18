"""
Functions for interacting with the SQLite database.
"""
import logging
from pathlib import Path
from typing import Any, Optional, cast

import aiosqlite
from aiosqlite import Connection
from app.config import settings
from app.exceptions import (
    DatabaseIntegrityException,
    NotFound,
    PunishmentTypeNotExists,
    UserNotInGroup,
)
from app.models.group import Group, GroupCreate
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.models.user import User, UserCreate
from app.types import GroupId, PunishmentId, PunishmentTypeId, UserId

DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(name="Ølstraff", value=33, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Vinstraff", value=100, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Spritstraff", value=300, logo_url="https://example.com"),
]

# Too much noise
aiosqlite_logger = logging.getLogger("aiosqlite")
aiosqlite_logger.setLevel(level=logging.INFO)

logger = logging.getLogger(__name__)


def read_sql_file(filepath: Path) -> str:
    """Reads an SQL file and ignores comments"""
    with open(filepath, "r", encoding="utf-8") as file:
        content = file.readlines()
        # Remove comments
        content = list(filter(lambda x: not x.startswith("--"), content))
        # Merge to one long string
        return "".join([line.strip() for line in content])


class Database:
    def __init__(self) -> None:
        self._conn: Optional[Connection] = None

    @property
    def conn(self) -> Connection:
        """A little hacky but mypy won't shut up about conn being None."""
        assert self._conn is not None
        return self._conn

    @conn.setter
    def conn(self, value: Connection) -> None:
        self._conn = value

    async def async_init(self) -> None:
        self._conn = await aiosqlite.connect(settings.vengeful_database)
        self._conn.row_factory = aiosqlite.Row

        await self.load_db_migrations()

    async def close(self) -> None:
        await self.conn.close()

    async def load_db_migrations(self) -> None:
        """
        Loads the database schema and applies new migrations.
        """
        async with self.conn.execute("pragma user_version") as cursor:
            res = await cursor.fetchone()
            assert res is not None

            schema_version = res["user_version"]

        logger.debug("Schema version: %d", schema_version)
        for file in settings.migrations_directory.iterdir():
            if file.suffix != ".sql":
                continue
            file_version = int(file.name.split("_", 1)[0])

            if file_version <= schema_version:
                logger.debug("Skipping migration: %s", file.name)
                continue

            sql_commands = read_sql_file(file)
            logger.info("Applying migration: %s", file.name)
            await self.conn.executescript(sql_commands)
            await self.conn.execute(f"pragma user_version={file_version}")

    async def reconnect_db(self) -> None:
        self.conn = await aiosqlite.connect(settings.vengeful_database)
        self.conn.row_factory = aiosqlite.Row

        await self.load_db_migrations()

    async def get_raw_users(self) -> dict[str, list[Any]]:
        async with self.conn.execute("""SELECT * FROM users""") as cursor:
            db_users = await cursor.fetchall()

        users = list(map(dict, db_users))
        return {"users": users}

    async def get_user(self, user_id: UserId, *, punishments: bool) -> User:
        async with self.conn.execute(
            """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
        ) as cursor:
            db_user = await cursor.fetchone()

        if not db_user:
            raise NotFound

        user = dict(db_user)
        user["punishments"] = []
        if punishments:
            async with self.conn.execute(
                """
                SELECT punishment_id, punishment_type, reason, amount, verified_by, verified_time, created_time
                FROM group_punishments
                INNER JOIN groups
                ON group_punishments.group_id = groups.group_id
                WHERE user_id = :user_id;
                """,
                {"user_id": user_id},
            ) as cursor:
                db_punishments = await cursor.fetchall()

            for db_punishment in db_punishments:
                user["punishments"].append(dict(db_punishment))

        return User(**user)

    async def get_raw_user_groups(self, user_id: UserId) -> dict[str, Any]:
        async with self.conn.execute(
            """SELECT group_members.group_id, name from group_members
            INNER JOIN users on users.user_id = group_members.user_id
            INNER JOIN groups on groups.group_id = group_members.group_id
            WHERE group_members.user_id = :user_id""",
            {"user_id": user_id},
        ) as cursor:
            groups = await cursor.fetchall()

        if groups is None:
            raise NotFound

        return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}

    async def get_group(self, group_id: GroupId) -> Group:
        async with self.conn.execute(
            """SELECT * FROM groups
            WHERE groups.group_id = :group_id""",
            {"group_id": group_id},
        ) as cursor:
            db_group = await cursor.fetchone()

        if not db_group:
            raise NotFound

        group = dict(db_group)
        group["punishment_types"] = await self.get_punishment_types(group_id)
        group["members"] = await self.get_group_users(group_id)
        return Group(**dict(group))

    async def get_group_user(
        self, group_id: GroupId, user_id: UserId, *, punishments: bool
    ) -> User:
        async with self.conn.execute(
            """SELECT * FROM users WHERE user_id = :user_id""", {"user_id": user_id}
        ) as cursor:
            db_user = await cursor.fetchone()

        if not db_user:
            raise NotFound

        async with self.conn.execute(
            """SELECT group_id FROM group_members WHERE user_id = :user_id""",
            {"user_id": user_id},
        ) as cursor:
            group_user = await cursor.fetchone()

        if not group_user:
            raise UserNotInGroup

        user = dict(db_user)
        user["punishments"] = []
        if punishments:
            async with self.conn.execute(
                """SELECT punishment_id, group_id, user_id, punishment_type, reason, amount, verified_by, verified_time, created_time
                FROM   group_punishments
                WHERE  group_id = :group_id
                AND    user_id = :user_id""",
                {"user_id": user_id, "group_id": group_id},
            ) as cursor:
                db_punishments = await cursor.fetchall()

            for db_punishment in db_punishments:
                user["punishments"].append(dict(db_punishment))
        return User(**user)

    async def get_group_users(self, group_id: GroupId) -> list[User]:
        members = []
        async with self.conn.execute(
            """SELECT *
            FROM users
            INNER JOIN group_members
            WHERE group_members.group_id = :group_id
            AND   users.user_id = group_members.user_id""",
            {"group_id": group_id},
        ) as cursor:
            db_users = await cursor.fetchall()

        for db_user in db_users:
            user = dict(db_user)
            user["punishments"] = None
            members.append(User(**user))
        return members

    async def get_punishment_types(self, group_id: GroupId) -> list[PunishmentTypeRead]:
        async with self.conn.execute(
            """SELECT * FROM punishment_types
            WHERE group_id = :group_id""",
            {"group_id": group_id},
        ) as cursor:
            punishment_types = await cursor.fetchall()

        return list(map(lambda x: PunishmentTypeRead(**dict(x)), punishment_types))

    async def get_punishment(self, punishment_id: PunishmentId) -> PunishmentRead:
        async with self.conn.execute(
            """
            SELECT * FROM group_punishments
            WHERE punishment_id = :punishment_id
            """,
            {"punishment_id": punishment_id},
        ) as cursor:
            punishments = await cursor.fetchone()
            assert punishments is not None

        return PunishmentRead(**dict(punishments))

    async def get_punishments(
        self, user_id: UserId, group_id: GroupId
    ) -> list[PunishmentRead]:
        async with self.conn.execute(
            """
            SELECT * FROM group_punishments
            WHERE group_id = :group_id
            AND user_id = :user_id
            """,
            {"group_id": group_id, "user_id": user_id},
        ) as cursor:
            punishments = await cursor.fetchall()

        return list(map(lambda x: PunishmentRead(**dict(x)), punishments))

    async def insert_user(self, user: UserCreate) -> dict[str, int | None]:
        statement = "INSERT INTO users(first_name, last_name, email) VALUES (?, ?, ?)"
        values = (user.first_name, user.last_name, user.email)
        try:
            cur = await self.conn.cursor()
            await cur.execute(statement, values)
        except aiosqlite.IntegrityError as ex:
            raise DatabaseIntegrityException(detail=str(ex)) from ex

        await self.conn.commit()
        return {"id": cur.lastrowid}

    async def insert_group(self, group: GroupCreate) -> dict[str, int | None]:
        statement = "INSERT INTO groups(name, rules) VALUES (?, ?)"
        values = (group.name, group.rules)
        try:
            cur = await self.conn.cursor()
            await cur.execute(statement, values)
        except aiosqlite.IntegrityError as ex:
            raise DatabaseIntegrityException(detail=str(ex)) from ex

        gid = cast(GroupId, cur.lastrowid)
        for punishment_type in DEFAULT_PUSHISHMENT_TYPES:
            await self.insert_punishment_type(gid, punishment_type)

        return {"id": gid}

    async def insert_user_in_group(
        self, group_id: GroupId, user_id: UserId
    ) -> dict[str, int | None]:
        statement = "INSERT INTO group_members(group_id, user_id, is_admin) VALUES (?, ?, False)"
        values = (group_id, user_id)
        try:
            cur = await self.conn.cursor()
            await cur.execute(statement, values)
        except aiosqlite.IntegrityError as ex:
            raise DatabaseIntegrityException(detail=str(ex)) from ex

        await self.conn.commit()
        return {"id": cur.lastrowid}

    async def insert_punishment_type(
        self, group_id: GroupId, punishment_type: PunishmentTypeCreate
    ) -> dict[str, int | None]:
        statement = "INSERT INTO punishment_types(group_id, name, value, logo_url) VALUES (?, ?, ?, ?)"
        values = (
            group_id,
            punishment_type.name,
            punishment_type.value,
            punishment_type.logo_url,
        )
        try:
            cur = await self.conn.cursor()
            await cur.execute(statement, values)
        except aiosqlite.IntegrityError as ex:
            raise DatabaseIntegrityException(detail=str(ex)) from ex

        await self.conn.commit()
        return {"id": cur.lastrowid}

    async def delete_punishment_type(
        self, group_id: GroupId, punishment_type_id: PunishmentTypeId
    ) -> None:
        cursor = await self.conn.cursor()
        await cursor.execute(
            "DELETE FROM punishment_types WHERE group_id = :group_id AND punishment_type_id = :punishment_type_id",
            {"group_id": group_id, "punishment_type_id": punishment_type_id},
        )

        if cursor.rowcount <= 0:
            raise PunishmentTypeNotExists

        await self.conn.commit()

    async def insert_punishments(
        self, group_id: GroupId, user_id: UserId, punishments: list[PunishmentCreate]
    ) -> dict[str, list[int]]:
        # Run a check to make sure that the punishments exists in the groups context
        for punishment in punishments:
            async with self.conn.execute(
                """SELECT punishment_type_id FROM punishment_types WHERE group_id = :group_id AND punishment_type_id = :punishment_type_id""",
                {
                    "group_id": group_id,
                    "punishment_type_id": punishment.punishment_type,
                },
            ) as cursor:
                punishment_type = await cursor.fetchone()

            if punishment_type is None:
                raise PunishmentTypeNotExists(
                    detail=f"Punishment type {punishment.punishment_type} does not exist in group {group_id}'s context"
                )

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
                cur = await self.conn.cursor()
                await cur.execute(statement, values)
                ids.append(cur.lastrowid)
            except aiosqlite.IntegrityError as ex:
                raise DatabaseIntegrityException(detail=str(ex)) from ex

        await self.conn.commit()
        return {"ids": ids}

    async def delete_punishment(self, punishment_id: PunishmentId) -> None:
        statement = "DELETE FROM group_punishments WHERE punishment_id=:punishment_id"
        await self.conn.execute(statement, {"punishment_id": punishment_id})
        await self.conn.commit()

    async def verify_punishment(self, punishment_id: PunishmentId) -> PunishmentRead:
        statement = "UPDATE group_punishments SET verified_time=datetime('now', 'localtime') WHERE punishment_id=:punishment_id"
        await self.conn.execute(statement, {"punishment_id": punishment_id})
        await self.conn.commit()
        return await self.get_punishment(punishment_id)
