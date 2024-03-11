import datetime
from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.models.punishment_reaction import PunishmentReactionRead
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
            query = """SELECT gp.*, CONCAT(COALESCE(NULLIF('', users.first_name, users.email)), ' ', users.last_name) AS created_by_name, COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions FROM group_punishments gp
                       LEFT JOIN punishment_reactions pr ON pr.punishment_id = gp.punishment_id
                       LEFT JOIN users ON gp.created_by = users.user_id
                       WHERE gp.punishment_id = $1
                       GROUP BY gp.punishment_id, created_by_name;"""
            res = await conn.fetchrow(query, punishment_id)

            if res is None:
                raise NotFound

        return PunishmentRead(**res)

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
