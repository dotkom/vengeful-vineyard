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
            db_users = await self.get_all(
                group_id, [user_id], punishments=punishments, conn=conn
            )

            if not db_users:
                raise NotFound("Group user not found")

            return db_users[0]

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

    async def get_all(
        self,
        group_id: GroupId,
        users: Optional[list[UserId]] = None,
        punishments: bool = True,
        conn: Optional[Pool] = None,
    ) -> list[GroupUser]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            if users:
                extra = "AND u.user_id = ANY($3)"
                args = [group_id, punishments, users]
            else:
                extra = ""
                args = [group_id, punishments]

            query = f"""
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
                    LEFT JOIN group_members gm
                        ON gm.group_id = gp.group_id
                    LEFT JOIN punishment_reactions pr
                        ON pr.punishment_id = gp.punishment_id AND pr.created_by = gm.user_id
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
                WHERE gm.group_id = $1 {extra}
                GROUP BY gm.active, gm.ow_group_user_id, u.user_id
                """

            db_group_users = await conn.fetch(query, *args)
            return [
                GroupUser(**db_group_user, group_id=group_id)
                for db_group_user in db_group_users
            ]
