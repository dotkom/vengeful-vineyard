import asyncio
import json
import logging
from pathlib import Path
from typing import Optional

from asyncpg import Pool, create_pool
from asyncpg.exceptions import CannotConnectNowError

from app.config import settings
from app.utils.db import MaybeAcquire

from .group_events import GroupEvents
from .group_join_requests import GroupJoinRequests
from .group_members import GroupMembers
from .group_users import GroupUsers
from .groups import Groups
from .permissions import Permissions
from .punishment_reactions import PunishmentReactions
from .punishment_types import PunishmentTypes
from .punishments import Punishments
from .statistics import Statistics
from .users import Users

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
        self._pool: Optional[Pool] = None
        self._db_name = ""

        self.users = Users(self)
        self.groups = Groups(self)
        self.statistics = Statistics(self)
        self.permissions = Permissions(self)
        self.punishments = Punishments(self)
        self.punishment_types = PunishmentTypes(self)
        self.punishment_reactions = PunishmentReactions(self)
        self.group_members = GroupMembers(self)
        self.group_users = GroupUsers(self)
        self.group_events = GroupEvents(self)
        self.group_join_requests = GroupJoinRequests(self)

    async def get_migration_lock_version(self, conn: Optional[Pool]) -> int:
        assert conn is not None
        await conn.execute(
            "CREATE TABLE IF NOT EXISTS __migration_version_lock (id INT PRIMARY KEY, version INT DEFAULT 0)"
        )
        has_version = await conn.fetchval(
            "SELECT COUNT(*) AS count FROM __migration_version_lock"
        )
        if int(has_version) == 0:
            await conn.execute("INSERT INTO __migration_version_lock VALUES (0, 0)")
        current_version = await conn.fetchval(
            "SELECT version FROM __migration_version_lock WHERE id = 0 LIMIT 1"
        )
        return int(current_version)

    async def set_migration_lock_version(
        self, conn: Optional[Pool], version: int
    ) -> None:
        assert conn is not None
        await conn.execute(
            "UPDATE __migration_version_lock SET version = $1 WHERE id = 0", version
        )

    @property
    def pool(self) -> Pool:
        """A little hacky but mypy won't shut up about pool being None."""
        assert self._pool is not None
        return self._pool

    @pool.setter
    def pool(self, value: Pool) -> None:
        self._pool = value

    @staticmethod
    async def set_connection_codecs(conn: Optional[Pool]) -> None:
        assert conn is not None
        await conn.set_type_codec(
            "json", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
        )

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
                    init=Database.set_connection_codecs,
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

    async def load_db_migrations(self, conn: Optional[Pool] = None) -> None:
        """
        Loads the database schema and applies new migrations.
        """

        def get_version_from_name(name: str) -> int:
            return int(name.split("_", 1)[0])

        files = sorted(
            (f for f in settings.migrations_directory.iterdir() if f.suffix == ".sql"),
            key=lambda f: get_version_from_name(f.name),
        )

        async with MaybeAcquire(conn, self.pool) as conn:
            schema_version = await self.get_migration_lock_version(conn)
            logger.debug("Schema version: %d", schema_version)

            for file in files:
                file_version = get_version_from_name(file.name)
                if file_version <= schema_version:
                    logger.debug("Skipping migration: %s", file.name)
                    continue

                sql_commands = read_sql_file(file)
                logger.info("Applying migration: %s", file.name)

                await conn.execute(sql_commands)
                await self.set_migration_lock_version(conn, file_version)
