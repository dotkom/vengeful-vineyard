"""
Functions for interacting with the SQLite database.
"""
import asyncio
import datetime
import logging
from pathlib import Path
from typing import Any, cast

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
from app.utils.db import MaybeAcquire
from asyncpg import Pool, create_pool
from asyncpg.exceptions import (
    CannotConnectNowError,
    ForeignKeyViolationError,
    UndefinedObjectError,
    UniqueViolationError,
)

DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(name="Ølstraff", value=33, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Vinstraff", value=100, logo_url="https://example.com"),
    PunishmentTypeCreate(name="Spritstraff", value=300, logo_url="https://example.com"),
]

logger = logging.getLogger(__name__)


def read_sql_file(filepath: Path) -> str:
    """Reads an SQL file and ignores comments"""
    with open(filepath, "r", encoding="utf-8") as file:
        result = []

        for line in file.readlines():
            if line.startswith("--"):
                continue

            if "--" in line:
                line = line.split("--")[0]

            result.append(line.strip())

        return "".join(result)


class Database:
    def __init__(self) -> None:
        self._pool: Pool | None = None
        self._db_name = ""

    @property
    def pool(self) -> Pool:
        """A little hacky but mypy won't shut up about pool being None."""
        assert self._pool is not None
        return self._pool

    @pool.setter
    def pool(self, value: Pool) -> None:
        self._pool = value

    async def async_init(self, **db_settings: str) -> None:
        for _ in range(10):  # Try for 10*0.5 seconds
            try:
                logger.info("Connecting to postgres database.")

                self._db_name = db_settings.get("database", settings.postgres_db)
                self._pool = await create_pool(
                    host=db_settings.get("host", settings.postgres_host),
                    port=db_settings.get("port", settings.postgres_port),
                    user=db_settings.get("user", settings.postgres_user),
                    password=db_settings.get("password", settings.postgres_password),
                    database=self._db_name,
                )
            except (ConnectionError, CannotConnectNowError):
                logger.info(
                    "Connection to postgres database could not be established. Retrying in 0.5s"
                )
                await asyncio.sleep(0.5)
            else:
                break

        if self._pool is None:
            raise RuntimeError("Couldn't connect to postgres database.")

        await self.load_db_migrations()

    async def close(self) -> None:
        await self.pool.close()

    async def _set_database_version(
        self, version: int, conn: Pool | None = None
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = f"set mg.version to {version}; alter database {self._db_name} set mg.version from current;"
            await conn.execute(query)

    async def load_db_migrations(self, conn: Pool | None = None) -> None:
        """
        Loads the database schema and applies new migrations.
        """

        def get_version_from_name(name: str) -> int:
            return int(name.split("_", 1)[0])

        file_ = max(
            (f for f in settings.migrations_directory.iterdir() if f.suffix == ".sql"),
            key=lambda f: get_version_from_name(f.name),
        )

        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT current_setting('mg.version') as version"
            try:
                schema_version = await conn.fetchval(query)
            except UndefinedObjectError:
                schema_version = 0
            else:
                schema_version = int(schema_version)

            logger.debug("Schema version: %d", schema_version)

            file_version = get_version_from_name(file_.name)
            if file_version <= schema_version:
                logger.debug("Skipping migration: %s", file_.name)
                return

            sql_commands = read_sql_file(file_)
            logger.info("Applying migration: %s", file_.name)

            await conn.execute(sql_commands)
            await self._set_database_version(file_version)

    async def get_raw_users(self, conn: Pool | None = None) -> dict[str, list[Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            db_users = await conn.fetch("SELECT * FROM users")

        users = [dict(row) for row in db_users]
        return {"users": users}

    async def get_user(
        self, user_id: UserId, *, punishments: bool, conn: Pool | None = None
    ) -> User:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM users WHERE user_id = $1"
            db_user = await conn.fetchrow(query, user_id)

            if db_user is None:
                raise NotFound

            user = dict(db_user)
            user["punishments"] = []
            if punishments:
                query = """SELECT punishment_id, punishment_type, reason, amount, verified_by, verified_time, created_time
                        FROM group_punishments
                        INNER JOIN groups
                        ON group_punishments.group_id = groups.group_id
                        WHERE user_id = $1;
                        """
                db_punishments = await conn.fetch(query, user_id)

                for db_punishment in db_punishments:
                    user["punishments"].append(dict(db_punishment))

            return User(**user)

    async def get_raw_user_groups(
        self, user_id: UserId, conn: Pool | None = None
    ) -> dict[str, Any]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT group_members.group_id, name from group_members
                    INNER JOIN users on users.user_id = group_members.user_id
                    INNER JOIN groups on groups.group_id = group_members.group_id
                    WHERE group_members.user_id = $1
                    """
            groups = await conn.fetch(query, user_id)

            if groups is None:
                raise NotFound

        return {"groups": list(map(lambda x: {"id": x[0], "group": x[1]}, groups))}

    async def get_group(self, group_id: GroupId, conn: Pool | None = None) -> Group:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM groups WHERE groups.group_id = $1"
            db_group = await conn.fetchrow(query, group_id)

            if db_group is None:
                raise NotFound

        group = dict(db_group)
        group["punishment_types"] = await self.get_punishment_types(group_id)
        group["members"] = await self.get_group_users(group_id)
        return Group(**dict(group))

    async def get_group_user(
        self,
        group_id: GroupId,
        user_id: UserId,
        *,
        punishments: bool,
        conn: Pool | None = None,
    ) -> User:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM users WHERE user_id = $1"
            db_user = await conn.fetchrow(query, user_id)

            if db_user is None:
                raise NotFound

            query = "SELECT group_id FROM group_members WHERE user_id = $1 AND group_id = $2"
            group_user = await conn.fetchrow(query, user_id, group_id)

            if group_user is None:
                raise UserNotInGroup

            user = dict(db_user)
            user["punishments"] = []
            if punishments:
                query = """SELECT punishment_id, group_id, user_id, punishment_type, reason, amount, verified_by, verified_time, created_time
                        FROM   group_punishments
                        WHERE  group_id = $1
                        AND    user_id = $2
                        """
                db_punishments = await conn.fetch(query, user_id, group_id)

                for db_punishment in db_punishments:
                    user["punishments"].append(dict(db_punishment))

            return User(**user)

    async def get_group_users(
        self, group_id: GroupId, conn: Pool | None = None
    ) -> list[User]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT *
                    FROM users
                    INNER JOIN group_members
                    ON  group_members.group_id = $1
                    AND users.user_id = group_members.user_id
                    """
            db_users = await conn.fetch(query, group_id)

        members = []
        for db_user in db_users:
            user = dict(db_user)
            user["punishments"] = None
            members.append(User(**user))

        return members

    async def get_punishment_types(
        self, group_id: GroupId, conn: Pool | None = None
    ) -> list[PunishmentTypeRead]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM punishment_types WHERE group_id = $1"
            punishment_types = await conn.fetch(query, group_id)

        return [PunishmentTypeRead(**dict(x)) for x in punishment_types]

    async def get_punishment(
        self, punishment_id: PunishmentId, conn: Pool | None = None
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM group_punishments WHERE punishment_id = $1"
            punishments = await conn.fetchrow(query, punishment_id)
            assert punishments is not None

        return PunishmentRead(**dict(punishments))

    async def get_punishments(
        self, user_id: UserId, group_id: GroupId, conn: Pool | None = None
    ) -> list[PunishmentRead]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = (
                "SELECT * FROM group_punishments WHERE group_id = $1 AND user_id = $2"
            )
            punishments = await conn.fetch(query, group_id, user_id)

        return [PunishmentRead(**dict(x)) for x in punishments]

    async def insert_user(
        self, user: UserCreate, conn: Pool | None = None
    ) -> dict[str, int | None]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "INSERT INTO users(first_name, last_name, email) VALUES ($1, $2, $3) RETURNING user_id"
            try:
                user_id = await conn.fetchval(
                    query,
                    user.first_name,
                    user.last_name,
                    user.email,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": user_id}

    async def insert_group(
        self, group: GroupCreate, conn: Pool | None = None
    ) -> dict[str, int | None]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "INSERT INTO groups(name, rules) VALUES ($1, $2) RETURNING group_id"
            try:
                group_id = await conn.fetchval(
                    query,
                    group.name,
                    group.rules,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

            gid = cast(GroupId, group_id)
            for punishment_type in DEFAULT_PUSHISHMENT_TYPES:
                await self.insert_punishment_type(gid, punishment_type, conn=conn)

        return {"id": gid}

    async def insert_user_in_group(
        self, group_id: GroupId, user_id: UserId, conn: Pool | None = None
    ) -> dict[str, int | None]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, is_admin)
                    VALUES ($1, $2, $3)
                    RETURNING group_id, user_id
                    """
            try:
                res = await conn.fetchrow(query, group_id, user_id, False)
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise NotFound from exc

        return {
            "group_id": group_id,
            "user_id": res["user_id"],
        }

    async def insert_punishment_type(
        self,
        group_id: GroupId,
        punishment_type: PunishmentTypeCreate,
        conn: Pool | None = None,
    ) -> dict[str, int | None]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO punishment_types(group_id, name, value, logo_url)
                    VALUES ($1, $2, $3, $4)
                    RETURNING punishment_type_id
                    """
            try:
                punishment_type_id = await conn.fetchval(
                    query,
                    group_id,
                    punishment_type.name,
                    punishment_type.value,
                    punishment_type.logo_url,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": punishment_type_id}

    async def delete_punishment_type(
        self,
        group_id: GroupId,
        punishment_type_id: PunishmentTypeId,
        conn: Pool | None = None,
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM punishment_types WHERE group_id = $1 AND punishment_type_id = $2 RETURNING *"
            val = await conn.fetchval(
                query,
                group_id,
                punishment_type_id,
            )

            if val is None:  # None = Nothing was deleted as it wasnt found
                raise PunishmentTypeNotExists

    async def insert_punishments(
        self,
        group_id: GroupId,
        user_id: UserId,
        punishments: list[PunishmentCreate],
        conn: Pool | None = None,
    ) -> dict[str, list[int]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            # Run a check to make sure that the punishments exists in the groups context
            for punishment in punishments:
                query = "SELECT punishment_type_id FROM punishment_types WHERE group_id = $1 AND punishment_type_id = $2"
                punishment_type = await conn.fetchval(
                    query,
                    group_id,
                    punishment.punishment_type,
                )

                if punishment_type is None:
                    raise PunishmentTypeNotExists(
                        detail=f"Punishment type {punishment.punishment_type} does not exist in group {group_id}'s context"
                    )

            ids = []
            for punishment in punishments:
                query = """INSERT INTO group_punishments(group_id, user_id, punishment_type, reason, amount)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING punishment_id
                        """
                try:
                    punishment_id = await conn.fetchval(
                        query,
                        group_id,
                        user_id,
                        punishment.punishment_type,
                        punishment.reason,
                        punishment.amount,
                    )
                except UniqueViolationError as exc:
                    raise DatabaseIntegrityException(detail=str(exc)) from exc
                else:
                    ids.append(punishment_id)

        return {"ids": ids}

    async def delete_punishment(
        self, punishment_id: PunishmentId, conn: Pool | None = None
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM group_punishments WHERE punishment_id = $1 RETURNING *"
            res = await conn.fetchval(query, punishment_id)

            if res is None:
                raise NotFound

    async def verify_punishment(
        self, punishment_id: PunishmentId, conn: Pool | None = None
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "UPDATE group_punishments SET verified_time = $1 WHERE punishment_id = $2 RETURNING punishment_id"
            res = await conn.fetchval(
                query,
                datetime.datetime.utcnow(),
                punishment_id,
            )

            if res is None:
                raise NotFound

            return await self.get_punishment(punishment_id, conn=conn)
