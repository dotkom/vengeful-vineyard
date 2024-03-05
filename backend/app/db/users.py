from typing import TYPE_CHECKING, Any, Optional, Union

from asyncpg import Pool
from asyncpg.exceptions import UniqueViolationError

from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group import Group
from app.models.user import LeaderboardUser, User, UserCreate, UserUpdate
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
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            res = await conn.fetchval(
                """SELECT
                        count(DISTINCT(user_id))
                    FROM
                        group_members
                        INNER JOIN GROUPS ON group_members.group_id = groups.group_id
                    WHERE
                        groups.ow_group_id IS NOT NULL OR groups.special;
                """,
            )
            assert isinstance(res, int)
            return res

    async def get_leaderboard(
        self,
        offset: int,
        limit: int,
        force_include_reasons: bool = False,
        conn: Optional[Pool] = None,
    ) -> list[LeaderboardUser]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    WITH punishments_with_reactions AS (
                        SELECT
                            gp.*,
                            u.first_name || ' ' || u.last_name as created_by_name,
                            COALESCE(json_agg(json_build_object(
                                'punishment_reaction_id', pr.punishment_reaction_id,
                                'punishment_id', pr.punishment_id,
                                'emoji', pr.emoji,
                                'created_at', pr.created_at,
                                'created_by', pr.created_by,
                                'created_by_name', (SELECT first_name || ' ' || last_name FROM users WHERE user_id = pr.created_by)
                            )) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions
                        FROM group_punishments gp
                        LEFT JOIN punishment_reactions pr
                            ON pr.punishment_id = gp.punishment_id
                        LEFT JOIN users u
                            ON u.user_id = gp.created_by
                        LEFT JOIN groups g
                            ON g.group_id = gp.group_id
                        WHERE g.ow_group_id IS NOT NULL OR special
                        GROUP BY gp.punishment_id, created_by_name
                    )
                    SELECT u.*,
                        COALESCE(json_agg(
                            json_build_object(
                                'punishment_id', pwr.punishment_id,
                                'user_id', pwr.user_id,
                                'punishment_type_id', pwr.punishment_type_id,
                                'reason', pwr.reason,
                                'reason_hidden', pwr.reason_hidden,
                                'amount', pwr.amount,
                                'created_by', pwr.created_by,
                                'created_by_name', pwr.created_by_name,
                                'created_at', pwr.created_at,
                                'group_id', pwr.group_id,
                                'paid', pwr.paid,
                                'paid_at', pwr.paid_at,
                                'marked_paid_by', pwr.marked_paid_by,
                                'reactions', pwr.reactions,
                                'punishment_type', (SELECT json_build_object(
                                    'punishment_type_id', pt.punishment_type_id,
                                    'name', pt.name,
                                    'value', pt.value,
                                    'emoji', pt.emoji,
                                    'created_at', pt.created_at,
                                    'created_by', pt.created_by,
                                    'updated_at', pt.updated_at
                                ) FROM punishment_types pt WHERE pt.punishment_type_id = pwr.punishment_type_id)
                            )
                        ) FILTER (WHERE pwr.punishment_id IS NOT NULL), '[]') AS punishments,
                        COALESCE(SUM(pwr.amount * pt.value), 0) as total_value
                    FROM users u
                    LEFT JOIN punishments_with_reactions pwr
                        ON pwr.user_id = u.user_id
                    LEFT JOIN punishment_types pt
                        ON pt.punishment_type_id = pwr.punishment_type_id
                    INNER JOIN groups g
                        ON g.group_id = pwr.group_id AND g.ow_group_id IS NOT NULL OR special
                    GROUP BY u.user_id
                    ORDER BY total_value DESC, u.first_name ASC
                    OFFSET $1
                    LIMIT $2"""
            res = await conn.fetch(
                query,
                offset,
                limit,
            )

            users = [LeaderboardUser(**r) for r in res]

            if not force_include_reasons:
                for user in users:
                    for punishment in user.punishments:
                        if punishment.reason_hidden:
                            punishment.reason = ""

            return users

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
                        WHERE group_members.user_id = $1"""
            else:
                query = """SELECT groups.* FROM groups
                        INNER JOIN group_members ON groups.group_id = group_members.group_id
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE users.ow_user_id = $1"""

            result = await conn.fetch(query, user_id)
            return [Group(**row) for row in result]
