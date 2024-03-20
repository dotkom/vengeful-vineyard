from typing import Optional
from asyncpg import Pool

from app.utils.db import MaybeAcquire


class Statistics:
    def __init__(self, db: "Database") -> None:
        self.db = db

    async def get_all_group_statistics(self, conn: Optional[Pool] = None) -> dict[str, int]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
           SELECT
                COALESCE(SUM(gp.amount * pt.value), 0) AS total_value,
                COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM gp.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                      THEN gp.amount * pt.value
                      ELSE 0 END), 0) AS total_value_this_year,
                COALESCE(SUM(gp.amount * pt.value * CAST((NOT COALESCE(gp.paid, FALSE)) AS INT)), 0) AS total_unpaid_value,
                COUNT(gp.group_id) AS total_count,
                g.group_id AS group_id,
                g.name AS group_name,
                g.name_short AS group_name_short,
                g.image AS group_image
            FROM
                groups g
                LEFT JOIN group_punishments gp ON g.group_id = gp.group_id
                LEFT JOIN punishment_types pt ON gp.punishment_type_id = pt.punishment_type_id
            WHERE g.ow_group_id IS NOT NULL or special
            GROUP BY g.group_id, g.name, g.name_short, g.image
            ORDER BY total_value DESC
                    """
            res = await conn.fetch(query)
            return [dict(row) for row in res]

    async def get_group_statistics(self, group_id: str, conn: Optional[Pool] = None):
        """
        Returns statistics about users in a group.
        """

        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
            SELECT
                u.user_id AS user_id,
                u.first_name || ' ' || u.last_name AS user_name,
                u.email AS user_email,
                COALESCE(SUM(gp.amount * pt.value), 0) AS total_value,
                COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM gp.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                      THEN gp.amount * pt.value
                      ELSE 0 END), 0) AS total_value_this_year,
                COALESCE(SUM(gp.amount * pt.value * CAST((NOT COALESCE(gp.paid, FALSE)) AS INT)), 0) AS total_unpaid_value,
                COUNT(gp.punishment_id) AS total_count
            FROM
                users u
                LEFT JOIN group_punishments gp ON u.user_id = gp.user_id
                LEFT JOIN punishment_types pt ON gp.punishment_type_id = pt.punishment_type_id
                LEFT JOIN groups g ON gp.group_id = g.group_id AND g.ow_group_id IS NOT NULL
            WHERE g.group_id = $1
            GROUP BY u.user_id, u.first_name, u.last_name, u.email
            """
            res = await conn.fetchrow(query, group_id)
            return dict(res)

    async def get_user_statistics(self, user_id: str, conn: Optional[Pool] = None):
        """
        Returns statistics about a user.
        """

        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
            SELECT
                COALESCE(SUM(gp.amount * pt.value), 0) AS total_value,
                COALESCE(SUM(gp.amount * pt.value * CAST((NOT COALESCE(gp.paid, FALSE)) AS INT)), 0) AS total_unpaid_value,
                COUNT(gp.punishment_id) AS total_count
            FROM
                users u
                LEFT JOIN group_punishments gp ON u.user_id = gp.user_id
                LEFT JOIN punishment_types pt ON gp.punishment_type_id = pt.punishment_type_id
            WHERE u.user_id = $1
            """
            res = await conn.fetchrow(query, user_id)
            return dict(res)
