from collections import defaultdict
from typing import TYPE_CHECKING, Any, Optional, Union

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.group_member import GroupMemberUpdate
from app.models.punishment import PunishmentStreaks
from app.types import GroupId, UserId
from app.utils.db import MaybeAcquire
from app.utils.streaks import calculate_punishment_streaks

if TYPE_CHECKING:
    from app.db.core import Database


class GroupMembers:
    def __init__(self, db: "Database"):
        self.db = db

    async def get_punishment_streaks(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> PunishmentStreaks:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT created_at FROM group_punishments
                    WHERE group_id = $1 AND user_id = $2
                    ORDER BY created_at DESC"""
            res = await conn.fetch(
                query,
                group_id,
                user_id,
            )

            compare_to = None
            if not res:
                query = """SELECT added_at FROM group_members
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

    async def get_all_raw(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT * FROM group_members WHERE group_id = $1"
            res = await conn.fetch(query, group_id)

        return [dict(row) for row in res]

    async def delete(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *"
            res = await conn.fetchval(query, group_id, user_id)

            if res is None:
                raise NotFound

    async def delete_multiple(
        self,
        group_id: GroupId,
        users: list[UserId],
        conn: Optional[Pool] = None,
    ) -> list[UserId]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def update_multiple(
        self,
        members: list[GroupMemberUpdate],
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Union[GroupId, UserId]]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
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

    async def get_raw_punishments(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT gp.*, CONCAT(users.first_name, ' ', users.last_name) AS created_by_name, COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions
                    FROM group_punishments gp
                    LEFT JOIN (
                        SELECT pr1.*
                        FROM punishment_reactions pr1
                        JOIN group_members gm ON pr1.created_by = gm.user_id
                        WHERE gm.group_id = $1
                    ) pr ON pr.punishment_id = gp.punishment_id
                    LEFT JOIN users ON gp.created_by = users.user_id
                    WHERE group_id = $1 AND gp.user_id = $2
                    GROUP BY gp.punishment_id, created_by_name;
                    """

            punishments = []
            db_punishments = await conn.fetch(query, group_id, user_id)
            for db_punishment in db_punishments:
                punishments.append(dict(db_punishment))

            return punishments

    async def get_raw_punishments_for_multiple(
        self,
        group_id: GroupId,
        user_ids: list[UserId],
        conn: Optional[Pool] = None,
    ) -> dict[UserId, list[dict[UserId, Any]]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT gp.*, CONCAT(users.first_name, ' ', users.last_name) AS created_by_name, COALESCE(json_agg(pr) FILTER (WHERE pr.punishment_reaction_id IS NOT NULL), '[]') as reactions
                    FROM group_punishments gp
                    LEFT JOIN (
                        SELECT pr1.*
                        FROM punishment_reactions pr1
                        JOIN group_members gm ON pr1.created_by = gm.user_id
                        WHERE gm.group_id = $1
                    ) pr ON pr.punishment_id = gp.punishment_id
                    LEFT JOIN users ON gp.created_by = users.user_id
                    WHERE gp.user_id IN (SELECT unnest($2::uuid[])) AND group_id = $1
                    GROUP BY gp.punishment_id, created_by_name;"""

            db_punishments = await conn.fetch(query, group_id, user_ids)

            punishments = defaultdict(list)
            for db_punishment in db_punishments:
                punishments[db_punishment["user_id"]].append(dict(db_punishment))

            return punishments
