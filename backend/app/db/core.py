import asyncio
import logging
from pathlib import Path
from typing import Optional

from app.config import settings
from app.utils.db import MaybeAcquire
from asyncpg import Pool, create_pool
from asyncpg.exceptions import CannotConnectNowError, UndefinedObjectError

from .group_events import GroupEvents
from .group_members import GroupMembers
from .group_users import GroupUsers
from .groups import Groups
from .paid_punishment_logs import PaidPunishmentsLogs
from .punishment_types import PunishmentTypes
from .punishments import Punishments
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
        self.punishments = Punishments(self)
        self.punishment_types = PunishmentTypes(self)
        self.paid_punishments_logs = PaidPunishmentsLogs(self)
        self.group_members = GroupMembers(self)
        self.group_users = GroupUsers(self)
        self.group_events = GroupEvents(self)

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
        self,
        version: int,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = f"set mg.version to {version}; alter database {self._db_name} set mg.version from current;"
            await conn.execute(query)

    async def load_db_migrations(self, conn: Optional[Pool] = None) -> None:
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
