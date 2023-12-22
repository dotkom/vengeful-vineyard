from typing import TYPE_CHECKING, Any, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.group_user import GroupUser
from app.types import GroupId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class GroupUsers:
    def __init__(self, db: "Database"):
        self.db = db

    async def get(
        self,
        group_id: GroupId,
        user_id: UserId,
        *,
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> GroupUser:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT m.active, m.ow_group_user_id, m.group_id, users.*
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
                user["punishments"] = await self.db.group_members.get_raw_punishments(
                    group_id,
                    user_id,
                    conn=conn,
                )

            return GroupUser(**user)

    async def get_all_raw(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Any]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT m.active, m.ow_group_user_id, users.*
                    FROM users
                    INNER JOIN group_members as m
                    ON users.user_id = m.user_id
                    WHERE m.group_id = $1
                    """
            db_users = await conn.fetch(query, group_id)

        return [dict(row) for row in db_users]

    async def get_alla(
        self,
        group_id: GroupId,
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> list[GroupUser]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            db_users = await self.db.group_users.get_all_raw(group_id, conn=conn)

            if punishments:
                user_ids = [db_user["user_id"] for db_user in db_users]
                db_punishments = (
                    await self.db.group_members.get_raw_punishments_for_multiple(
                        group_id,
                        user_ids,
                        conn=conn,
                    )
                )
            else:
                db_punishments = {}

            users = []
            for db_user in db_users:
                user = dict(db_user)
                user["punishments"] = db_punishments.get(user["user_id"], [])
                user["group_id"] = group_id
                users.append(GroupUser(**user))

            return users

    async def get_all(
        self,
        group_id: GroupId,
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> list[GroupUser]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                WITH punishments_with_reactions AS (
                    SELECT
                        gp.*,
                        u.first_name || ' ' || u.last_name as created_by_name,
                        array_remove(array_agg(pr.*), NULL) as reactions
                    FROM group_punishments gp
                    LEFT JOIN punishment_reactions pr
                        ON pr.punishment_id = gp.punishment_id
                    LEFT JOIN users u
                        ON u.user_id = gp.created_by
                    GROUP BY gp.punishment_id, created_by_name
                )
                SELECT gm.active,
                       gm.ow_group_user_id,
                       u.*,
                       COALESCE(json_agg(json_build_object(
                            'punishment_id', pwr.punishment_id,
                            'group_id', pwr.group_id,
                            'user_id', pwr.user_id,
                            'punishment_type_id', pwr.punishment_type_id,
                            'reason', pwr.reason,
                            'reason_hidden', pwr.reason_hidden,
                            'amount', pwr.amount,
                            'created_at', pwr.created_at,
                            'created_by', pwr.created_by,
                            'created_by_name', pwr.created_by_name,
                            'paid', pwr.paid,
                            'paid_at', pwr.paid_at,
                            'marked_paid_by', pwr.marked_paid_by,
                            'reactions', pwr.reactions
                       )) FILTER (WHERE pwr.punishment_id IS NOT NULL), '[]') as punishments,
                       COALESCE(json_agg(gmp.privilege) FILTER (WHERE gmp.privilege IS NOT NULL), '[]') as permissions
                    FROM group_members gm
                LEFT JOIN users u
                    ON gm.user_id = u.user_id
                LEFT JOIN punishments_with_reactions pwr
                    ON gm.user_id = pwr.user_id AND gm.group_id = pwr.group_id AND true = $2
                LEFT JOIN group_member_permissions gmp
                    ON gm.user_id = gmp.user_id AND gm.group_id = gmp.group_id
                WHERE gm.group_id = $1
                GROUP BY gm.active, gm.ow_group_user_id, u.user_id
                """

            db_group_users = await conn.fetch(query, group_id, punishments)
            return [
                GroupUser(**db_group_user, group_id=group_id)
                for db_group_user in db_group_users
            ]
