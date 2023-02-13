import datetime
from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.paid_punishment_log import (
    PaidPunishmentsLogCreate,
    PaidPunishmentsLogRead,
)
from app.types import GroupId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class PaidPunishmentsLogs:
    def __init__(self, db: "Database"):
        self.db = db

    async def get_all_for_user(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[PaidPunishmentsLogRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM paid_punishments_logs WHERE group_id = $1 AND user_id = $2"""
            rows = await conn.fetch(
                query,
                group_id,
                user_id,
            )

            return [PaidPunishmentsLogRead(**dict(row)) for row in rows]

    async def get_total_paid(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT SUM(value) FROM paid_punishments_logs WHERE group_id = $1 AND user_id = $2"
            row = await conn.fetchrow(
                query,
                group_id,
                user_id,
            )

            if row is None:
                raise NotFound

            assert isinstance(row[0], int)
            return row[0]

    async def get_total_unpaid(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                SELECT COALESCE(SUM(gp.amount * pt.value), 0) AS total_amount,
                       (SELECT SUM(value) FROM paid_punishments_logs WHERE group_id = $1 AND user_id = $2) AS total_paid
                    FROM group_punishments AS gp
                LEFT JOIN punishment_types AS pt
                    ON gp.punishment_type_id = pt.punishment_type_id
                WHERE gp.group_id = $1
                    AND gp.user_id = $2
                GROUP BY gp.group_id, gp.user_id
            """

            row = await conn.fetchrow(
                query,
                group_id,
                user_id,
            )

            if row is None:
                return 0

            val = row["total_amount"] - row["total_paid"]
            assert isinstance(val, int)
            return val

    async def insert_multiple(
        self,
        group_id: GroupId,
        user_id: UserId,
        paid_punishments_logs: list[PaidPunishmentsLogCreate],
        created_by: UserId,
        conn: Optional[Pool] = None,
    ) -> dict[str, list[int]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO paid_punishments_logs(group_id,
                                                         user_id,
                                                         value,
                                                         created_by,
                                                         created_at)
                (SELECT
                    pl.group_id,
                    pl.user_id,
                    pl.value,
                    pl.created_by,
                    pl.created_at
                FROM
                    unnest($1::paid_punishments_logs[]) AS pl
                )
                RETURNING paid_punishment_log_id
                """

            res = await conn.fetch(
                query,
                [
                    (
                        None,
                        group_id,
                        user_id,
                        ppl.value,
                        created_by,
                        datetime.datetime.now(),
                    )
                    for ppl in paid_punishments_logs
                ],
            )
            return {"ids": [r["paid_punishment_log_id"] for r in res]}
