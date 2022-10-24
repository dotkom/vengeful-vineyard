"""
Functions for interacting with the SQLite database.
"""
import asyncio
import datetime
import logging
from collections import defaultdict
from pathlib import Path
from typing import Any, TypedDict, cast

from app.config import settings
from app.exceptions import (
    DatabaseIntegrityException,
    NotFound,
    PunishmentTypeNotExists,
    UserNotInGroup,
)
from app.models.group import Group, GroupCreate
from app.models.group_member import GroupMemberCreate
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.models.user import User, UserCreate, UserUpdate
from app.types import GroupId, OWUserId, PunishmentId, PunishmentTypeId, UserId
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


class InsertOrUpdateUser(TypedDict):
    id: UserId
    action: str


class InsertOrUpdateGroup(TypedDict):
    id: GroupId
    action: str


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
        self,
        user_id: UserId | OWUserId,
        *,
        is_ow_user_id: bool = False,
        punishments: bool = True,
        conn: Pool | None = None,
    ) -> User:
        async with MaybeAcquire(conn, self.pool) as conn:
            if not is_ow_user_id:
                query = "SELECT * FROM users WHERE user_id = $1"
            else:
                query = "SELECT * FROM users WHERE ow_user_id = $1"

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

    async def get_user_groups(
        self, user_id: UserId, *, is_ow_user_id: bool = False, conn: Pool | None = None
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            if not is_ow_user_id:
                query = """SELECT groups.* FROM groups
                        INNER JOIN group_members ON groups.group_id = group_members.group_id
                        WHERE group_members.user_id = $1"""
            else:
                query = """SELECT groups.* FROM groups
                        INNER JOIN group_members ON groups.group_id = group_members.group_id
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE users.ow_user_id = $1"""

            result = await conn.fetch(query, user_id)
            return [dict(row) for row in result]

    async def get_group(self, group_id: GroupId, conn: Pool | None = None) -> Group:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM groups WHERE groups.group_id = $1"
            db_group = await conn.fetchrow(query, group_id)

            if db_group is None:
                raise NotFound

            group = dict(db_group)
            group["punishment_types"] = await self.get_punishment_types(
                group_id, conn=conn
            )
            group["members"] = await self.get_group_users(
                group_id,
                punishments=True,
                conn=conn,
            )

            return Group(**group)

    async def get_raw_punishments_for_user(
        self, group_id: GroupId, user_id: UserId, conn: Pool | None = None
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM group_punishments
                    WHERE group_id = $1
                    AND user_id = $2
                    """

            punishments = []
            db_punishments = await conn.fetch(query, group_id, user_id)
            for db_punishment in db_punishments:
                punishments.append(dict(db_punishment))

            return punishments

    async def get_raw_punishments_for_users(
        self, group_id: GroupId, user_ids: list[UserId], conn: Pool | None = None
    ) -> dict[UserId, list[dict[UserId, Any]]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM group_punishments
                    WHERE group_id = $1
                    AND user_id = ANY($2)
                    """

            db_punishments = await conn.fetch(query, group_id, user_ids)

            punishments = defaultdict(list)
            for db_punishment in db_punishments:
                punishments[db_punishment["user_id"]].append(dict(db_punishment))

            return punishments

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

            query = "SELECT ow_group_user_id FROM group_members WHERE user_id = $1 AND group_id = $2"
            group_user = await conn.fetchrow(query, user_id, group_id)

            if group_user is None:
                raise UserNotInGroup

            user = dict(db_user)
            user["punishments"] = []
            user["ow_group_user_id"] = group_user["ow_group_user_id"]
            if punishments:
                user["punishments"] = await self.get_raw_punishments_for_user(
                    group_id,
                    user_id,
                    conn=conn,
                )

            return User(**user)

    async def get_raw_group_users(
        self, group_id: GroupId, conn: Pool | None = None
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT *
                    FROM users
                    INNER JOIN group_members
                    ON users.user_id = group_members.user_id
                    WHERE group_members.group_id = $1
                    """
            db_users = await conn.fetch(query, group_id)

        return [dict(row) for row in db_users]

    async def get_group_users(
        self, group_id: GroupId, punishments: bool = True, conn: Pool | None = None
    ) -> list[User]:
        async with MaybeAcquire(conn, self.pool) as conn:
            db_users = await self.get_raw_group_users(group_id, conn=conn)

            if punishments:
                user_ids = [db_user["user_id"] for db_user in db_users]
                db_punishments = await self.get_raw_punishments_for_users(
                    group_id,
                    user_ids,
                    conn=conn,
                )
            else:
                db_punishments = {}

            users = []
            for db_user in db_users:
                user = dict(db_user)
                user["punishments"] = db_punishments.get(user["user_id"], [])
                users.append(User(**user))

            return users

    async def get_group_members_raw(
        self, group_id: GroupId, conn: Pool | None = None
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM group_members WHERE group_id = $1"
            res = await conn.fetch(query, group_id)

        return [dict(row) for row in res]

    async def delete_user_from_group(
        self, group_id: GroupId, user_id: UserId, conn: Pool | None = None
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *"
            res = await conn.fetchval(query, group_id, user_id)

            if res is None:
                raise NotFound

    async def delete_users_from_group(
        self, group_id: GroupId, users: list[UserId], conn: Pool | None = None
    ) -> list[UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """DELETE FROM group_members
                    WHERE group_id = $1 AND user_id = ANY($2::bigint[])
                    RETURNING user_id;
                    """
            res = await conn.fetch(
                query,
                group_id,
                users,
            )
            return [r["user_id"] for r in res]

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
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO users(ow_user_id, first_name, last_name, email)
                    VALUES ($1, $2, $3, $4)
                    RETURNING user_id"""
            try:
                user_id = await conn.fetchval(
                    query,
                    user.ow_user_id,
                    user.first_name,
                    user.last_name,
                    user.email,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": user_id, "action": "CREATE"}

    async def update_user(
        self, user_id: UserId, user: UserUpdate, conn: Pool | None = None
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE users
                    SET first_name = $1, last_name = $2, email = $3
                    WHERE user_id = $4"""
            await conn.execute(
                query,
                user.first_name,
                user.last_name,
                user.email,
                user_id,
            )

    async def update_users(
        self, users: list[UserUpdate], conn: Pool | None = None
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE users
                    SET first_name = $1, last_name = $2, email = $3
                    WHERE user_id = $4"""
            await conn.executemany(
                query,
                [
                    (
                        user.first_name,
                        user.last_name,
                        user.email,
                        user.user_id,
                    )
                    for user in users
                ],
            )

    async def update_user_by_ow_user_id(
        self, user: UserCreate, conn: Pool | None = None
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE users
                    SET first_name = $1, last_name = $2, email = $3
                    WHERE ow_user_id = $4
                    RETURNING user_id"""
            user_id = await conn.fetchval(
                query,
                user.first_name,
                user.last_name,
                user.email,
                user.ow_user_id,
            )
            return {"id": user_id, "action": "UPDATE"}

    async def insert_or_update_user(
        self, user: UserCreate, conn: Pool | None = None
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.pool) as conn:
            try:
                return await self.insert_user(user, conn=conn)
            except DatabaseIntegrityException:
                return await self.update_user_by_ow_user_id(user, conn=conn)

    async def insert_many_users(
        self, users: list[UserCreate], conn: Pool | None = None
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO users(ow_user_id, first_name, last_name, email)
                    (SELECT
                        u.ow_user_id, u.first_name, u.last_name, u.email
                    FROM
                        unnest($1::users[]) as u
                    )
                    RETURNING user_id, ow_user_id
                    """

            res = await conn.fetch(
                query,
                [
                    (None, x.ow_user_id, x.first_name, x.last_name, x.email, True)
                    for x in users
                ],
            )
            return {x["ow_user_id"]: x["user_id"] for x in res}

    async def update_many_users_by_ow_id(
        self, users: list[UserCreate], conn: Pool | None = None
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE users
                    SET first_name = u.first_name, last_name = u.last_name, email = u.email
                    FROM
                        unnest($1::users[]) as u
                    WHERE
                        users.ow_user_id = u.ow_user_id
                    RETURNING user_id, ow_user_id
                    """

            res = await conn.fetch(
                query,
                [(x.ow_user_id, x.first_name, x.last_name, x.email) for x in users],
            )
            return {x["ow_user_id"]: x["user_id"] for x in res}

    async def insert_or_update_users(
        self, users: list[UserCreate], conn: Pool | None = None
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT ow_user_id FROM users WHERE ow_user_id = ANY($1)"
            existing = await conn.fetch(query, [x.ow_user_id for x in users])

            existing_ow_user_ids = [r["ow_user_id"] for r in existing]

            to_create = []
            to_update = []
            for user in users:
                if user.ow_user_id not in existing_ow_user_ids:
                    to_create.append(user)
                else:
                    to_update.append(user)

            created = {}
            updated = {}
            if to_create:
                created = await self.insert_many_users(
                    to_create,
                    conn=conn,
                )
            if to_update:
                updated = await self.update_many_users_by_ow_id(
                    to_update,
                    conn=conn,
                )

            return created | updated

    async def insert_group(
        self, group: GroupCreate, conn: Pool | None = None
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO groups(ow_group_id, name, name_short, rules, image)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING group_id;"""
            try:
                group_id = await conn.fetchval(
                    query,
                    group.ow_group_id,
                    group.name,
                    group.name_short,
                    group.rules,
                    group.image,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

            gid = cast(GroupId, group_id)
            for punishment_type in DEFAULT_PUSHISHMENT_TYPES:
                await self.insert_punishment_type(gid, punishment_type, conn=conn)

        return {"id": gid, "action": "CREATE"}

    async def update_group(
        self, group: GroupCreate, conn: Pool | None = None
    ) -> InsertOrUpdateGroup:
        if group.ow_group_id is None:
            raise ValueError("ow_group_id must be set")

        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE groups
                    SET name = $1, name_short = $2, rules = $3, image = $4
                    WHERE ow_group_id = $5
                    RETURNING group_id;"""
            group_id = await conn.fetchval(
                query,
                group.name,
                group.name_short,
                group.rules,
                group.image,
                group.ow_group_id,
            )
            return {"id": group_id, "action": "UPDATE"}

    async def insert_or_update_group(
        self, group: GroupCreate, conn: Pool | None = None
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.pool) as conn:
            try:
                return await self.insert_group(group, conn=conn)
            except DatabaseIntegrityException:
                return await self.update_group(group, conn=conn)

    async def insert_user_in_group(
        self, member: GroupMemberCreate, conn: Pool | None = None
    ) -> dict[str, GroupId | UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id)
                    VALUES ($1, $2, $3)
                    RETURNING group_id, user_id
                    """
            try:
                res = await conn.fetchrow(
                    query,
                    member.group_id,
                    member.user_id,
                    member.ow_group_user_id,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise NotFound from exc

        return {
            "group_id": res["group_id"],
            "user_id": res["user_id"],
        }

    async def insert_users_in_group(
        self, members: list[GroupMemberCreate], conn: Pool | None = None
    ) -> list[dict[str, GroupId | UserId]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id)
                    (SELECT
                        m.group_id, m.user_id, m.ow_group_user_id
                    FROM
                        unnest($1::group_members[]) as m
                    )
                    RETURNING group_id, user_id
                    """

            res = await conn.fetch(
                query,
                [
                    (x.group_id, x.user_id, x.ow_group_user_id, False, True)
                    for x in members
                ],
            )
            return [dict(r) for r in res]

    async def insert_punishment_type(
        self,
        group_id: GroupId,
        punishment_type: PunishmentTypeCreate,
        conn: Pool | None = None,
    ) -> dict[str, int]:
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
