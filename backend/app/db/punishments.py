import datetime
from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.punishment import PunishmentCreate, PunishmentRead, TopStreaker
from app.models.punishment_reaction import PunishmentReactionRead
from app.models.user import LogPunishmentOut
from app.types import GroupId, PunishmentId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class Punishments:
    def __init__(self, db: "Database"):
        self.db = db

    async def has_reaction_for_punishment(
        self,
        punishment_id: PunishmentId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT 1 FROM punishment_reactions
                    WHERE punishment_id = $1 AND created_by = $2"""
            res = await conn.fetchval(query, punishment_id, user_id)
            return res is not None

    async def get_punishment_reaction_for_user(
        self,
        punishment_id: PunishmentId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> PunishmentReactionRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM punishment_reactions
                        WHERE punishment_id = $1 AND created_by = $2"""
            res = await conn.fetchrow(query, punishment_id, user_id)

            if res is None:
                raise NotFound

        return PunishmentReactionRead(**res)

    async def get(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT gp.*, CONCAT(COALESCE(NULLIF(users.first_name, ''), users.email), ' ', users.last_name) AS created_by_name, COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions FROM group_punishments gp
                       LEFT JOIN punishment_reactions pr ON pr.punishment_id = gp.punishment_id
                       LEFT JOIN users ON gp.created_by = users.user_id
                       WHERE gp.punishment_id = $1
                       GROUP BY gp.punishment_id, created_by_name;"""
            res = await conn.fetchrow(query, punishment_id)

            if res is None:
                raise NotFound

        return PunishmentRead(**res)

    @staticmethod
    def _build_where(
        group_id: Optional[GroupId],
        date_from: Optional[datetime.date] = None,
        date_to: Optional[datetime.date] = None,
        search: Optional[str] = None,
    ) -> tuple[str, list, str]:
        """Returns (where_clause, params, extra_joins)."""
        conditions = ["(g.ow_group_id IS NOT NULL OR g.special)"]
        params: list = []
        extra_joins = ""

        if group_id is not None:
            params.append(group_id)
            conditions = [f"g.group_id = ${len(params)}"]

        if date_from is not None:
            params.append(date_from)
            conditions.append(f"gp.created_at >= ${len(params)}::date")

        if date_to is not None:
            params.append(date_to)
            conditions.append(f"gp.created_at < (${len(params)}::date + interval '1 day')")

        if search is not None:
            params.append(f"%{search}%")
            extra_joins = "LEFT JOIN users search_user ON gp.user_id = search_user.user_id"
            conditions.append(
                f"CONCAT(COALESCE(NULLIF(search_user.first_name, ''), search_user.email), ' ', search_user.last_name) ILIKE ${len(params)}"
            )

        return "WHERE " + " AND ".join(conditions), params, extra_joins

    async def get_all(
        self,
        offset: int,
        limit: int,
        group_id: Optional[GroupId] = None,
        date_from: Optional[datetime.date] = None,
        date_to: Optional[datetime.date] = None,
        search: Optional[str] = None,
        conn: Optional[Pool] = None,
    ) -> list[LogPunishmentOut]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            where_clause, params, extra_joins = self._build_where(group_id, date_from, date_to, search)

            params.append(offset)
            offset_param = f"${len(params)}"
            params.append(limit)
            limit_param = f"${len(params)}"

            query = f"""
            SELECT
                gp.*,
                CONCAT(COALESCE(NULLIF(created_by_user.first_name, ''), created_by_user.email), ' ', created_by_user.last_name) AS created_by_name,
                COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions,
                json_build_object(
                    'punishment_type_id', pt.punishment_type_id,
                    'name', pt.name,
                    'value', pt.value,
                    'emoji', pt.emoji,
                    'created_at', pt.created_at,
                    'created_by', pt.created_by,
                    'updated_at', pt.updated_at
                ) AS punishment_type,
                json_build_object(
                    'user_id', given_to_user.user_id,
                    'first_name', given_to_user.first_name,
                    'last_name', given_to_user.last_name,
                    'email', given_to_user.email,
                    'ow_user_id', given_to_user.ow_user_id
                ) AS user,
                g.name_short as group_name
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
            LEFT JOIN groups g ON gp.group_id = g.group_id
            LEFT JOIN users created_by_user ON gp.created_by = created_by_user.user_id
            LEFT JOIN users given_to_user ON gp.user_id = given_to_user.user_id
            {extra_joins}
            {where_clause}
            GROUP BY gp.punishment_id, created_by_user.first_name, created_by_user.email, created_by_user.last_name, pt.punishment_type_id, given_to_user.user_id, g.name_short
            ORDER BY gp.created_at DESC
            OFFSET {offset_param}
            LIMIT {limit_param}
            """

            res = await conn.fetch(query, *params)

        return [LogPunishmentOut(**r) for r in res]

    async def get_all_count(
        self,
        group_id: Optional[GroupId] = None,
        date_from: Optional[datetime.date] = None,
        date_to: Optional[datetime.date] = None,
        search: Optional[str] = None,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            where_clause, params, extra_joins = self._build_where(group_id, date_from, date_to, search)
            query = f"""
                SELECT COUNT(*) FROM group_punishments gp
                LEFT JOIN groups g ON gp.group_id = g.group_id
                {extra_joins}
                {where_clause}
                """

            res = await conn.fetchval(query, *params)

        return res

    async def insert_multiple(
        self,
        group_id: GroupId,
        user_id: UserId,
        created_by: UserId,
        punishments: list[PunishmentCreate],
        conn: Optional[Pool] = None,
    ) -> dict[str, list[PunishmentId]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_punishments(group_id,
                                                     user_id,
                                                     punishment_type_id,
                                                     reason,
                                                     reason_hidden,
                                                     amount,
                                                     created_by,
                                                     created_at,
                                                     paid,
                                                     paid_at,
                                                     marked_paid_by,
                                                     legacy)
                    (SELECT
                        p.group_id,
                        p.user_id,
                        p.punishment_type_id,
                        p.reason,
                        p.reason_hidden,
                        p.amount,
                        p.created_by,
                        p.created_at,
                        p.paid,
                        p.paid_at,
                        p.marked_paid_by,
                        p.legacy
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
                        p.reason_hidden,
                        p.amount,
                        datetime.datetime.utcnow(),
                        created_by,
                        False,
                        None,
                        None,
                        p.legacy,
                    )
                    for p in punishments
                ],
            )
            return {"ids": [r["punishment_id"] for r in res]}

    async def delete(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM group_punishments WHERE punishment_id = $1 RETURNING *"
            res = await conn.fetchval(query, punishment_id)

            if res is None:
                raise NotFound

    async def mark_multiple_as_paid(
        self,
        group_id: GroupId,
        punishment_ids: list[PunishmentId],
        marked_paid_by: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            async with conn.transaction():
                query = """UPDATE group_punishments
                        SET paid = true, paid_at = $1, marked_paid_by = $2
                        WHERE group_id = $3 AND punishment_id = ANY($4::uuid[])
                        RETURNING *"""
                res = await conn.fetch(
                    query,
                    datetime.datetime.utcnow(),
                    marked_paid_by,
                    group_id,
                    punishment_ids,
                )

                if len(res) != len(punishment_ids):
                    raise NotFound

    async def mark_multiple_as_unpaid(
        self,
        group_id: GroupId,
        punishment_ids: list[PunishmentId],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            async with conn.transaction():
                query = """UPDATE group_punishments
                        SET paid = false, paid_at = null, marked_paid_by = null
                        WHERE group_id = $1 AND punishment_id = ANY($2::uuid[])
                        RETURNING *"""
                res = await conn.fetch(
                    query,
                    group_id,
                    punishment_ids,
                )

                if len(res) != len(punishment_ids):
                    raise NotFound

    async def mark_all_punishments_as_paid_for_user(
        self,
        group_id: GroupId,
        user_id: UserId,
        marked_paid_by: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """UPDATE group_punishments
                    SET paid = true, paid_at = $1, marked_paid_by = $2
                    WHERE group_id = $3 AND user_id = $4 AND paid = false
                    RETURNING *"""
            res = await conn.fetch(
                query,
                datetime.datetime.utcnow(),
                marked_paid_by,
                group_id,
                user_id,
            )

            if len(res) == 0:
                raise NotFound

    async def get_top_streakers(
        self,
        conn: Optional[Pool] = None,
    ) -> list[TopStreaker]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
            WITH punishment_weeks AS (
                SELECT DISTINCT
                    gp.user_id,
                    gp.group_id,
                    EXTRACT(EPOCH FROM date_trunc('week', gp.created_at AT TIME ZONE 'Europe/Oslo'))::bigint / 604800 AS abs_week
                FROM group_punishments gp
                JOIN groups g ON g.group_id = gp.group_id
                WHERE g.ow_group_id IS NOT NULL
            ),
            ranked AS (
                SELECT
                    user_id,
                    group_id,
                    abs_week,
                    abs_week + ROW_NUMBER() OVER (PARTITION BY user_id, group_id ORDER BY abs_week DESC) AS streak_group,
                    ROW_NUMBER() OVER (PARTITION BY user_id, group_id ORDER BY abs_week DESC) AS rn
                FROM punishment_weeks
            ),
            newest AS (
                SELECT user_id, group_id, streak_group, abs_week
                FROM ranked
                WHERE rn = 1
            ),
            current_streaks AS (
                SELECT
                    r.user_id,
                    r.group_id,
                    COUNT(*) AS streak_length
                FROM ranked r
                JOIN newest n ON r.user_id = n.user_id AND r.group_id = n.group_id AND r.streak_group = n.streak_group
                WHERE n.abs_week >= (EXTRACT(EPOCH FROM date_trunc('week', NOW() AT TIME ZONE 'Europe/Oslo'))::bigint / 604800) - 1
                GROUP BY r.user_id, r.group_id
                HAVING COUNT(*) >= 3
            )
            SELECT
                cs.user_id,
                TRIM(CONCAT(COALESCE(NULLIF(u.first_name, ''), u.email), ' ', u.last_name)) AS display_name,
                g.name_short AS group_name,
                cs.streak_length
            FROM current_streaks cs
            JOIN users u ON u.user_id = cs.user_id
            JOIN groups g ON g.group_id = cs.group_id
            ORDER BY cs.streak_length DESC
            LIMIT 3
            """
            res = await conn.fetch(query)

            return [TopStreaker(**dict(row)) for row in res]
