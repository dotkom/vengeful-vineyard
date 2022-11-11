"""
Functions for interacting with the SQLite database.
"""
import asyncio
import datetime
import logging
from collections import defaultdict
from pathlib import Path
from typing import Any, Optional, TypedDict, Union, cast

from app.config import settings
from app.exceptions import DatabaseIntegrityException, NotFound, PunishmentTypeNotExists
from app.models.group import Group, GroupCreate
from app.models.group_event import GroupEvent, GroupEventCreate
from app.models.group_member import GroupMemberCreate, GroupMemberUpdate
from app.models.group_user import GroupUser
from app.models.leaderboard import LeaderboardUser
from app.models.punishment import PunishmentCreate, PunishmentRead, PunishmentStreaks
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.models.user import User, UserCreate, UserUpdate
from app.types import (
    GroupEventId,
    GroupId,
    OWUserId,
    PunishmentId,
    PunishmentTypeId,
    UserId,
)
from app.utils.db import MaybeAcquire
from app.utils.streaks import calculate_punishment_streaks
from asyncpg import Pool, create_pool
from asyncpg.exceptions import (
    CannotConnectNowError,
    ForeignKeyViolationError,
    UndefinedObjectError,
    UniqueViolationError,
)

DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(
        name="Ølstraff", value=33, logo_url="./assets/beerOutlined.svg"
    ),
    PunishmentTypeCreate(
        name="Vinstraff", value=100, logo_url="./assets/wineOutlined.svg"
    ),
    PunishmentTypeCreate(
        name="Spritstraff", value=300, logo_url="./assets/spiritOutlined.svg"
    ),
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
        self._pool: Optional[Pool] = None
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

    async def get_total_users(self, conn: Optional[Pool] = None) -> int:
        async with MaybeAcquire(conn, self.pool) as conn:
            return await conn.fetchval("SELECT COUNT(*) FROM users")  # type: ignore

    async def get_leaderboard(
        self,
        offset: int,
        limit: int,
        conn: Optional[Pool] = None,
    ) -> list[LeaderboardUser]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT u.*,
                        array_remove(array_agg(gp.*), NULL) as punishments,
                        COALESCE(SUM(gp.amount * pt.value), 0) as total_value
                    FROM users u
                    LEFT JOIN group_punishments gp
                        ON gp.user_id = u.user_id
                    LEFT JOIN punishment_types pt
                        ON pt.punishment_type_id = gp.punishment_type_id
                    GROUP BY u.user_id
                    ORDER BY total_value DESC
                    OFFSET $1
                    LIMIT $2"""
            res = await conn.fetch(
                query,
                offset,
                limit,
            )

            return [LeaderboardUser(**r) for r in res]

    async def get_raw_users(self, conn: Optional[Pool] = None) -> dict[str, list[Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            db_users = await conn.fetch("SELECT * FROM users")

        users = [dict(row) for row in db_users]
        return {"users": users}

    async def get_user_streaks(
        self,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> dict[str, Any]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT created_time FROM group_punishments
                    WHERE user_id = $1
                    ORDER BY created_time DESC"""
            res = await conn.fetch(query, user_id)

            if not res:
                query = """SELECT added_time FROM group_members WHERE user_id = $1"""
                compare_to = await conn.fetchval(query, user_id)
                if compare_to is None:
                    raise NotFound
            else:
                compare_to = datetime.datetime.utcnow()

        actual_current_streak = 0
        actual_current_inverse_streak = 0

        streaks = []
        inverse_streaks = []

        current_streak = 0

        now_dt = datetime.datetime.utcnow()
        now_iso_calendar = now_dt.isocalendar()
        now_year, now_week, _ = now_iso_calendar

        pre_dt = None
        pre_year = None
        pre_week = None

        is_on_now_streak = False
        has_gived_current_week = False

        def calc_inverse_streak(
            last_year: int, last_week: int, year: int, week: int
        ) -> int:
            years = last_year - year
            weeks = max(last_week - (week - (years * 52)) - 1, 0)
            return weeks

        for c, row in enumerate(res):
            dt = row["created_time"]
            year, week, _ = dt.isocalendar()

            if pre_dt is None:
                if (year == now_year - 1 and now_week == 1 and week == 52) or (
                    year == now_year and week in (now_week, now_week - 1)
                ):
                    is_on_now_streak = True

                current_streak += 1

                if c - 1 < 0:
                    last_iso_calendar = now_iso_calendar
                else:
                    try:
                        last_row = res[c - 1]
                    except IndexError:
                        last_iso_calendar = now_iso_calendar
                    else:
                        last_dt = last_row["created_time"]
                        last_iso_calendar = last_dt.isocalendar()

                last_year, last_week, _ = last_iso_calendar

                weeks = calc_inverse_streak(last_year, last_week, year, week)
                inverse_streaks.append(weeks)

            else:
                if (  # Catch last year
                    pre_year == year + 1 and pre_week == 1 and week == 52
                ) or pre_week == week + 1:
                    current_streak += 1
                elif week == pre_week and year == pre_year:
                    if not has_gived_current_week:
                        current_streak += 1
                        has_gived_current_week = True

                    continue
                else:
                    if is_on_now_streak:
                        actual_current_streak = current_streak
                        is_on_now_streak = False

                    streaks.append(current_streak)
                    current_streak = 0
                    has_gived_current_week = False

                    last_dt = res[c - 1]["created_time"]
                    last_year, last_week, _ = last_dt.isocalendar()

                    weeks = calc_inverse_streak(last_year, last_week, year, week)
                    inverse_streaks.append(weeks)

            pre_dt = dt
            pre_year = year
            pre_week = week

        if current_streak > 0:
            if is_on_now_streak:
                actual_current_streak = current_streak
                is_on_now_streak = False

            streaks.append(current_streak)

        if not res:
            year, week, _ = compare_to.isocalendar()
            years = now_year - year
            inverse_streaks.append(now_week - (week - (years * 52)))

        if inverse_streaks:
            actual_current_inverse_streak = inverse_streaks[0]

        return {
            "current_streak": actual_current_streak,
            "current_inverse_streak": actual_current_inverse_streak,
            "longest_streak": max(streaks) if streaks else 0,
            "longest_inverse_streak": max(inverse_streaks) if inverse_streaks else 0,
        }

    async def get_user(
        self,
        user_id: Union[UserId, OWUserId],
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
    ) -> User:
        async with MaybeAcquire(conn, self.pool) as conn:
            if not is_ow_user_id:
                query = "SELECT * FROM users WHERE user_id = $1"
            else:
                query = "SELECT * FROM users WHERE ow_user_id = $1"

            db_user = await conn.fetchrow(query, user_id)

            if db_user is None:
                raise NotFound

            return User(**db_user)

    async def get_user_groups(
        self,
        user_id: UserId,
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
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

    async def is_in_group(
        self,
        user_id: Union[UserId, OWUserId],
        group_id: GroupId,
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.pool) as conn:
            if not is_ow_user_id:
                query = """SELECT 1 FROM group_members
                        WHERE group_id = $1 AND user_id = $2"""
            else:
                query = """SELECT 1 FROM group_members
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE group_id = $1 AND users.ow_user_id = $2"""

            res = await conn.fetchval(query, group_id, user_id)
            return res is not None

    async def get_group(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> Group:
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
                conn=conn,
            )

            return Group(**group)

    async def get_raw_punishments_for_user(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
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
        self,
        group_id: GroupId,
        user_ids: list[UserId],
        conn: Optional[Pool] = None,
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
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> GroupUser:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT m.active, m.ow_group_user_id, users.*
                    FROM users
                    INNER JOIN group_members as m
                    ON users.user_id = m.user_id
                    WHERE users.user_id = $1 AND m.group_id = $2
                    """
            db_user = await conn.fetchrow(
                query,
                user_id,
                group_id,
            )

            if db_user is None:
                raise NotFound

            user = dict(db_user)
            user["punishments"] = []
            if punishments:
                user["punishments"] = await self.get_raw_punishments_for_user(
                    group_id,
                    user_id,
                    conn=conn,
                )

            return GroupUser(**user)

    async def get_raw_group_users(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT m.active, m.ow_group_user_id, users.*
                    FROM users
                    INNER JOIN group_members as m
                    ON users.user_id = m.user_id
                    WHERE m.group_id = $1
                    """
            db_users = await conn.fetch(query, group_id)

        return [dict(row) for row in db_users]

    async def get_group_users(
        self,
        group_id: GroupId,
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> list[GroupUser]:
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
                users.append(GroupUser(**user))

            return users

    async def get_group_user_punishment_streaks(
        self, group_id: GroupId, user_id: UserId, conn: Optional[Pool] = None
    ) -> PunishmentStreaks:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT created_time FROM group_punishments
                    WHERE group_id = $1 AND user_id = $2
                    ORDER BY created_time DESC"""
            res = await conn.fetch(
                query,
                group_id,
                user_id,
            )

            compare_to = None
            if not res:
                query = """SELECT added_time FROM group_members
                        WHERE group_id = $1 AND user_id = $2"""
                compare_to = await conn.fetchval(
                    query,
                    group_id,
                    user_id,
                )
                if compare_to is None:
                    raise NotFound

        streaks = calculate_punishment_streaks(
            res,
            compare_to=compare_to,
        )
        return PunishmentStreaks(**streaks)

    async def get_group_members_raw(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM group_members WHERE group_id = $1"
            res = await conn.fetch(query, group_id)

        return [dict(row) for row in res]

    async def delete_user_from_group(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *"
            res = await conn.fetchval(query, group_id, user_id)

            if res is None:
                raise NotFound

    async def delete_users_from_group(
        self,
        group_id: GroupId,
        users: list[UserId],
        conn: Optional[Pool] = None,
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
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[PunishmentTypeRead]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT * FROM punishment_types WHERE group_id = $1"
            punishment_types = await conn.fetch(query, group_id)

        return [PunishmentTypeRead(**dict(x)) for x in punishment_types]

    async def get_punishments(
        self,
        user_id: UserId,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[PunishmentRead]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = (
                "SELECT * FROM group_punishments WHERE group_id = $1 AND user_id = $2"
            )
            punishments = await conn.fetch(query, group_id, user_id)

        return [PunishmentRead(**dict(x)) for x in punishments]

    async def insert_user(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
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
        self,
        user_id: UserId,
        user: UserUpdate,
        conn: Optional[Pool] = None,
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
        self,
        users: list[UserUpdate],
        conn: Optional[Pool] = None,
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
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
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

    def compare_user(
        self, user: UserCreate, db_user: Union[User, dict[str, Any]]
    ) -> bool:
        if isinstance(db_user, User):
            db_user = db_user.dict()

        is_the_same = (
            user.first_name == db_user["first_name"]
            and user.last_name == db_user["last_name"]
            and user.email == db_user["email"]
        )
        return is_the_same is True  # mypy, smh

    async def insert_or_update_user(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.pool) as conn:
            try:
                db_user = await self.get_user(
                    user.ow_user_id,
                    is_ow_user_id=True,
                    conn=conn,
                )
            except NotFound:
                return await self.insert_user(user, conn=conn)

            is_changed = not self.compare_user(user, db_user)
            if is_changed:
                return await self.update_user_by_ow_user_id(user, conn=conn)

            return {"id": db_user.user_id, "action": "NO_CHANGE"}

    async def insert_many_users(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
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
                    (None, x.ow_user_id, x.first_name, x.last_name, x.email)
                    for x in users
                ],
            )
            return {x["ow_user_id"]: x["user_id"] for x in res}

    async def update_many_users_by_ow_id(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
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
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM users WHERE ow_user_id = ANY($1)"""
            res = await conn.fetch(query, [x.ow_user_id for x in users])
            existing = {r["ow_user_id"]: r for r in res}

            to_create = []
            to_update = []
            not_updated = {}
            for user in users:
                if user.ow_user_id not in existing:
                    to_create.append(user)
                else:
                    is_changed = not self.compare_user(user, existing[user.ow_user_id])
                    if is_changed:
                        to_update.append(user)
                    else:
                        user_id = existing[user.ow_user_id]["user_id"]
                        not_updated[user.ow_user_id] = user_id

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

            return created | updated | not_updated

    async def insert_group(
        self,
        group: GroupCreate,
        conn: Optional[Pool] = None,
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
        self,
        group: GroupCreate,
        conn: Optional[Pool] = None,
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
        self,
        group: GroupCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.pool) as conn:
            try:
                return await self.insert_group(group, conn=conn)
            except DatabaseIntegrityException:
                return await self.update_group(group, conn=conn)

    async def insert_user_in_group(
        self,
        member: GroupMemberCreate,
        conn: Optional[Pool] = None,
    ) -> dict[str, Union[GroupId, UserId]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_time)
                    VALUES ($1, $2, $3, $4)
                    RETURNING group_id, user_id
                    """
            try:
                res = await conn.fetchrow(
                    query,
                    member.group_id,
                    member.user_id,
                    member.ow_group_user_id,
                    datetime.datetime.utcnow(),
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
        self,
        members: list[GroupMemberCreate],
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Union[GroupId, UserId]]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_time)
                    (SELECT
                        m.group_id, m.user_id, m.ow_group_user_id, m.added_time
                    FROM
                        unnest($1::group_members[]) as m
                    )
                    RETURNING group_id, user_id
                    """

            res = await conn.fetch(
                query,
                [
                    (
                        x.group_id,
                        x.user_id,
                        x.ow_group_user_id,
                        True,
                        datetime.datetime.utcnow(),
                    )
                    for x in members
                ],
            )
            return [dict(r) for r in res]

    async def update_group_members(
        self,
        members: list[GroupMemberUpdate],
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Union[GroupId, UserId]]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE group_members
                    SET active = m.active
                    FROM
                        unnest($1::group_members[]) as m
                    WHERE
                        group_members.ow_group_user_id = m.ow_group_user_id
                    RETURNING m.group_id, m.user_id;
                    """

            res = await conn.fetch(
                query,
                [
                    (x.group_id, x.user_id, x.ow_group_user_id, x.active, None)
                    for x in members
                ],
            )
            return [dict(r) for r in res]

    async def insert_punishment_type(
        self,
        group_id: GroupId,
        punishment_type: PunishmentTypeCreate,
        conn: Optional[Pool] = None,
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
        conn: Optional[Pool] = None,
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
        created_by: UserId,
        punishments: list[PunishmentCreate],
        conn: Optional[Pool] = None,
    ) -> dict[str, list[int]]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT 1 FROM punishment_types
                WHERE group_id = $1 AND punishment_type_id = ANY($2::int[])
                """
            res = await conn.fetch(
                query,
                group_id,
                [x.punishment_type_id for x in punishments],
            )
            if len(res) != len(punishments):
                raise PunishmentTypeNotExists

            query = """INSERT INTO group_punishments(group_id,
                                                     user_id,
                                                     punishment_type_id,
                                                     reason,
                                                     amount,
                                                     created_by)
                    (SELECT
                        p.group_id,
                        p.user_id,
                        p.punishment_type_id,
                        p.reason,
                        p.amount,
                        p.created_by
                    FROM
                        unnest($1::group_punishments[]) as p
                    )
                    RETURNING punishment_id
                    """
            res = await conn.fetch(
                query,
                [
                    (
                        None,
                        group_id,
                        user_id,
                        p.punishment_type_id,
                        p.reason,
                        p.amount,
                        None,
                        created_by,
                        None,
                        datetime.datetime.utcnow(),
                    )
                    for p in punishments
                ],
            )
            return {"ids": [r["punishment_id"] for r in res]}

    async def get_punishment(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM group_punishments WHERE punishment_id = $1"""
            res = await conn.fetchrow(query, punishment_id)

            if res is None:
                raise NotFound

        return PunishmentRead(**res)

    async def delete_punishment(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM group_punishments WHERE punishment_id = $1 RETURNING *"
            res = await conn.fetchval(query, punishment_id)

            if res is None:
                raise NotFound

    async def verify_punishment(
        self,
        punishment_id: PunishmentId,
        verified_by: UserId,
        conn: Optional[Pool] = None,
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """UPDATE group_punishments
                SET verified_by = $1, verified_time = $2
                WHERE punishment_id = $3
                RETURNING punishment_id
                """
            res = await conn.fetchval(
                query,
                verified_by,
                datetime.datetime.utcnow(),
                punishment_id,
            )

            if res is None:
                raise NotFound

            return await self.get_punishment(punishment_id, conn=conn)

    async def insert_group_event(
        self,
        group_id: GroupId,
        event: GroupEventCreate,
        created_by: UserId,
        conn: Optional[Pool] = None,
    ) -> dict[str, int]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """INSERT INTO group_events(group_id,
                                                name,
                                                description,
                                                start_time,
                                                end_time,
                                                created_by,
                                                created_time)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING event_id
                    """
            try:
                group_event_id = await conn.fetchval(
                    query,
                    group_id,
                    event.name,
                    event.description,
                    event.start_time,
                    event.end_time,
                    created_by,
                    datetime.datetime.utcnow(),
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": group_event_id}

    async def group_event_exists_between(
        self,
        group_id: GroupId,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT 1 FROM group_events
                WHERE group_id = $1 AND start_time < $2 AND end_time > $3
                """
            res = await conn.fetchrow(query, group_id, end_time, start_time)
            return res is not None

    async def get_total_group_events(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "SELECT COUNT(*) FROM group_events WHERE group_id = $1"
            return await conn.fetchval(  # type: ignore
                query,
                group_id,
            )

    async def get_group_events(
        self,
        group_id: GroupId,
        conn: Optional[Pool],
    ) -> list[GroupEvent]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM group_events WHERE group_id = $1"""
            res = await conn.fetch(query, group_id)

        return [GroupEvent(**r) for r in res]

    async def get_group_events_with_offset(
        self,
        group_id: GroupId,
        offset: int,
        limit: int,
        conn: Optional[Pool] = None,
    ) -> list[GroupEvent]:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = """SELECT * FROM group_events
                    WHERE group_id = $1
                    ORDER BY start_time DESC
                    OFFSET $2
                    LIMIT $3
                    """
            res = await conn.fetch(
                query,
                group_id,
                offset,
                limit,
            )

            return [GroupEvent(**r) for r in res]

    async def delete_group_event(
        self,
        event_id: GroupEventId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.pool) as conn:
            query = "DELETE FROM group_events WHERE event_id = $1 RETURNING 1"
            res = await conn.fetchval(query, event_id)

            if res is None:
                raise NotFound
