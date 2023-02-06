import datetime
from typing import TYPE_CHECKING, Optional

from app.exceptions import NotFound, PunishmentTypeNotExists
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.models.paid_punishment_log import PaidPunishmentsLogCreate, PaidPunishmentsLogRead
from app.types import GroupId, PunishmentId, UserId
from app.utils.db import MaybeAcquire
from asyncpg import Pool

if TYPE_CHECKING:
    from app.db.core import Database


class PaidPunishmentsLogs:
    def __init__(self, db: "Database"):
        self.db = db

    async def get_all_for_user(
        self,
        user_id: UserId,
        group_id: GroupId,
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
        user_id: UserId,
        group_id: GroupId,
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

            return row[0]

    async def get_total_unpaid(
        self,
        user_id: UserId,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                SELECT SUM(ppl.value) AS total_paid, COALESCE(SUM(gp.amount * pt.value), 0) AS total_amount
                    FROM paid_punishments_logs AS ppl
                LEFT JOIN group_punishments AS gp
                    ON ppl.user_id = gp.user_id
                    AND ppl.group_id = gp.group_id
                LEFT JOIN punishment_types AS pt
                    ON gp.punishment_type_id = pt.punishment_type_id
                WHERE ppl.group_id = $1
                    AND ppl.user_id = $2
            """
            row = await conn.fetchrow(
                query,
                group_id,
                user_id,
            )

            if row is None:
                return 0

            return row['total_amount'] - row['total_paid']

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
                ]
            )
            return {"ids": [r["paid_punishment_log_id"] for r in res]}