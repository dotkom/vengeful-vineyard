from typing import TYPE_CHECKING, Any, Optional, Union

from asyncpg import Pool
from asyncpg.exceptions import UniqueViolationError

from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group import Group
from app.models.user import (
    MinifiedLeaderboardUser,
    User,
    UserCreate,
    UserUpdate,
)
from app.models.punishment import LeaderboardPunishmentRead
from app.types import InsertOrUpdateUser, OWUserId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class Users:
    def __init__(self, db: "Database"):
        self.db = db

    async def get_count(
        self,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            res = await conn.fetchval("SELECT COUNT(*) FROM users")
            assert isinstance(res, int)
            return res

    async def get_leaderboard_count(
        self,
        active_only: bool = True,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            if active_only:
                res = await conn.fetchval(
                    """SELECT
                            count(DISTINCT(user_id))
                        FROM
                            group_members
                            INNER JOIN groups ON group_members.group_id = groups.group_id
                        WHERE
                            (groups.ow_group_id IS NOT NULL OR groups.special)
                            AND group_members.active = TRUE;
                    """,
                )
            else:
                res = await conn.fetchval(
                    """SELECT
                            count(DISTINCT(gp.user_id))
                        FROM
                            group_punishments gp
                            INNER JOIN groups ON gp.group_id = groups.group_id
                        WHERE
                            groups.ow_group_id IS NOT NULL;
                    """,
                )
            assert isinstance(res, int)
            return res

    async def get_all_raw(
        self,
        conn: Optional[Pool] = None,
    ) -> dict[str, list[Any]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            db_users = await conn.fetch("SELECT * FROM users")

        users = [dict(row) for row in db_users]
        return {"users": users}

    async def get(
        self,
        user_id: Union[UserId, OWUserId],
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
    ) -> User:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            if not is_ow_user_id:
                query = "SELECT * FROM users WHERE user_id = $1"
            else:
                query = "SELECT * FROM users WHERE ow_user_id = $1"

            db_user = await conn.fetchrow(query, user_id)

            if db_user is None:
                raise NotFound

            return User(**db_user)

    async def upsert(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO users(ow_user_id, first_name, last_name, email)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (ow_user_id)
                    DO UPDATE SET first_name = $2, last_name = $3, email = $4
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
                # Email conflict: user exists with same email but different ow_user_id
                # This happens when OW returns different IDs from group sync vs direct login
                # Update the existing user's ow_user_id to match what OW provides
                if "users_email_key" in str(exc):
                    # Get the old ow_user_id before updating
                    old_ow_user_id = await conn.fetchval(
                        "SELECT ow_user_id FROM users WHERE email = $1",
                        user.email,
                    )
                    update_query = """UPDATE users
                            SET ow_user_id = $1, first_name = $2, last_name = $3
                            WHERE email = $4
                            RETURNING user_id"""
                    user_id = await conn.fetchval(
                        update_query,
                        user.ow_user_id,
                        user.first_name,
                        user.last_name,
                        user.email,
                    )
                    # Also update ow_group_user_id in group_members to keep memberships linked
                    if old_ow_user_id:
                        await conn.execute(
                            "UPDATE group_members SET ow_group_user_id = $1 WHERE ow_group_user_id = $2",
                            user.ow_user_id,
                            old_ow_user_id,
                        )
                    return {"id": user_id, "action": "UPDATE"}
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": user_id, "action": "CREATE"}

    async def insert(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def update(
        self,
        user_id: UserId,
        user: UserUpdate,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def update_multiple(
        self,
        users: list[UserUpdate],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def update_by_ow_user_id(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    def _compare_user(
        self,
        user: UserCreate,
        db_user: Union[User, dict[str, Any]],
    ) -> bool:
        if isinstance(db_user, User):
            db_user = db_user.dict()

        is_the_same = (
            user.first_name == db_user["first_name"]
            and user.last_name == db_user["last_name"]
            and user.email == db_user["email"]
        )
        return is_the_same is True  # mypy, smh

    async def insert_or_update(
        self,
        user: UserCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateUser:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            try:
                db_user = await self.get(
                    user.ow_user_id,
                    is_ow_user_id=True,
                    conn=conn,
                )
            except NotFound:
                return await self.insert(user, conn=conn)

            is_changed = not self._compare_user(user, db_user)
            if is_changed:
                return await self.update_by_ow_user_id(user, conn=conn)

            return {"id": db_user.user_id, "action": "NO_CHANGE"}

    async def upsert_multiple(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO users(ow_user_id, first_name, last_name, email)
                    (SELECT
                        u.ow_user_id, u.first_name, u.last_name, u.email
                    FROM
                        unnest($1::users[]) as u
                    )
                    ON CONFLICT (ow_user_id)
                    DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = EXCLUDED.email
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

    async def insert_multiple(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def update_multiple_by_ow_user_id(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def insert_or_update_multiple(
        self,
        users: list[UserCreate],
        conn: Optional[Pool] = None,
    ) -> dict[OWUserId, UserId]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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
                    is_changed = not self._compare_user(user, existing[user.ow_user_id])
                    if is_changed:
                        to_update.append(user)
                    else:
                        user_id = existing[user.ow_user_id]["user_id"]
                        not_updated[user.ow_user_id] = user_id

            created = {}
            updated = {}
            if to_create:
                created = await self.insert_multiple(
                    to_create,
                    conn=conn,
                )
            if to_update:
                updated = await self.update_multiple_by_ow_user_id(
                    to_update,
                    conn=conn,
                )

            return created | updated | not_updated

    async def get_groups(
        self,
        user_id: UserId,
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
    ) -> list[Group]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            if not is_ow_user_id:
                query = """SELECT groups.* FROM groups
                        INNER JOIN group_members ON groups.group_id = group_members.group_id
                        WHERE group_members.user_id = $1 AND group_members.active = TRUE"""
            else:
                query = """SELECT groups.* FROM groups
                        INNER JOIN group_members ON groups.group_id = group_members.group_id
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE users.ow_user_id = $1 AND group_members.active = TRUE"""

            result = await conn.fetch(query, user_id)
            return [Group(**row) for row in result]

    async def get_minified_leaderboard(
        self,
        this_year: bool,
        year: Optional[int],
        active_only: bool,
        offset: int,
        limit: int,
        conn: Optional[Pool] = None,
    ) -> list[MinifiedLeaderboardUser]:
        from datetime import date

        if year is not None:
            year_start = date(year, 1, 1)
            year_end = date(year + 1, 1, 1)
        else:
            year_start = None
            year_end = None

        async with MaybeAcquire(conn, self.db.pool) as conn:
            if year is not None:
                year_filter = "p.created_at >= $3 AND p.created_at < $4"
            else:
                year_filter = "p.created_at >= DATE_TRUNC('year', CURRENT_DATE)"

            punishment_subquery = f"""
                SELECT
                    p.user_id,
                    SUM(pt.value * p.amount) AS total_value,
                    STRING_AGG(REPEAT(pt.emoji, p.amount), '') AS emojis,
                    SUM(p.amount) AS amount_punishments,
                    COUNT(DISTINCT p.punishment_type_id) AS amount_unique_punishments,
                    SUM(CASE WHEN {year_filter} THEN pt.value * p.amount ELSE 0 END) AS total_value_this_year,
                    STRING_AGG(CASE WHEN {year_filter} THEN REPEAT(pt.emoji, p.amount) ELSE '' END, '') AS emojis_this_year,
                    SUM(CASE WHEN {year_filter} THEN p.amount ELSE 0 END) AS amount_punishments_this_year,
                    COUNT(DISTINCT CASE WHEN {year_filter} THEN p.punishment_type_id ELSE NULL END) AS amount_unique_punishments_this_year
                FROM group_punishments p
                LEFT JOIN punishment_types pt
                    ON pt.punishment_type_id = p.punishment_type_id
                LEFT JOIN groups g
                    ON g.group_id = p.group_id
                WHERE g.ow_group_id IS NOT NULL
                GROUP BY p.user_id
            """

            if active_only:
                query = f"""
                SELECT
                    DISTINCT u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.ow_user_id,
                    COALESCE(p.total_value, 0) AS total_value,
                    COALESCE(p.emojis, '') AS emojis,
                    COALESCE(p.amount_punishments, 0) AS amount_punishments,
                    COALESCE(p.amount_unique_punishments, 0) AS amount_unique_punishments,
                    COALESCE(p.total_value_this_year, 0) AS total_value_this_year,
                    COALESCE(p.emojis_this_year, '') AS emojis_this_year,
                    COALESCE(p.amount_punishments_this_year, 0) AS amount_punishments_this_year,
                    COALESCE(p.amount_unique_punishments_this_year, 0) AS amount_unique_punishments_this_year
                FROM users u
                LEFT JOIN ({punishment_subquery}) p ON p.user_id = u.user_id
                LEFT JOIN group_members gm
                    ON gm.user_id = u.user_id
                LEFT JOIN groups g
                    ON g.group_id = gm.group_id
                WHERE (g.ow_group_id IS NOT NULL OR g.special)
                    AND gm.active = TRUE
                """
            else:
                query = f"""
                SELECT
                    DISTINCT u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.ow_user_id,
                    COALESCE(p.total_value, 0) AS total_value,
                    COALESCE(p.emojis, '') AS emojis,
                    COALESCE(p.amount_punishments, 0) AS amount_punishments,
                    COALESCE(p.amount_unique_punishments, 0) AS amount_unique_punishments,
                    COALESCE(p.total_value_this_year, 0) AS total_value_this_year,
                    COALESCE(p.emojis_this_year, '') AS emojis_this_year,
                    COALESCE(p.amount_punishments_this_year, 0) AS amount_punishments_this_year,
                    COALESCE(p.amount_unique_punishments_this_year, 0) AS amount_unique_punishments_this_year
                FROM users u
                INNER JOIN (
                    SELECT DISTINCT gp.user_id
                    FROM group_punishments gp
                    JOIN groups g ON g.group_id = gp.group_id
                    WHERE g.ow_group_id IS NOT NULL
                ) eligible ON eligible.user_id = u.user_id
                LEFT JOIN ({punishment_subquery}) p ON p.user_id = u.user_id
                """

            if this_year or year is not None:
                query += "ORDER BY total_value_this_year DESC, u.first_name ASC "
            else:
                query += "ORDER BY total_value DESC, u.first_name ASC "
            query += "OFFSET $1 LIMIT $2"

            params: list = [offset, limit]
            if year is not None:
                params.extend([year_start, year_end])

            res = await conn.fetch(query, *params)

        return [MinifiedLeaderboardUser(**r) for r in res]

    async def get_punishments_for_leaderboard_user(
        self,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[LeaderboardPunishmentRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
            SELECT
                gp.*,
                CONCAT(COALESCE(NULLIF(users.first_name, ''), users.email), ' ', users.last_name) AS created_by_name,
                COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions,
                json_build_object(
                    'punishment_type_id', pt.punishment_type_id,
                    'name', pt.name,
                    'value', pt.value,
                    'emoji', pt.emoji,
                    'created_at', pt.created_at,
                    'created_by', pt.created_by,
                    'updated_at', pt.updated_at
                ) AS punishment_type
            FROM group_punishments gp
            LEFT JOIN punishment_types pt
                ON pt.punishment_type_id = gp.punishment_type_id
            LEFT JOIN (
                SELECT 
                pr1.*,
                CONCAT(COALESCE(NULLIF(u1.first_name, ''), u1.email), ' ', u1.last_name) AS created_by_name
                FROM punishment_reactions pr1
                JOIN group_members gm ON pr1.created_by = gm.user_id
                LEFT JOIN users u1 on pr1.created_by = u1.user_id
                GROUP BY pr1.punishment_reaction_id, u1.first_name, u1.email, u1.last_name
            ) pr ON pr.punishment_id = gp.punishment_id
            LEFT JOIN users ON gp.created_by = users.user_id
            LEFT JOIN groups g ON gp.group_id = g.group_id
            WHERE gp.user_id = $1 AND (g.ow_group_id IS NOT NULL OR g.special)
            GROUP BY gp.punishment_id, users.first_name, users.email, users.last_name, pt.punishment_type_id
            ORDER BY gp.created_at DESC
            """
            res = await conn.fetch(
                query,
                user_id,
            )

        return [LeaderboardPunishmentRead(**r) for r in res]
