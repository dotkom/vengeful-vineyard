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
            query = """SELECT m.active, m.ow_group_user_id, users.*
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
                user[
                    "total_paid_amount"
                ] = await self.db.paid_punishments_logs.get_total_paid(
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

    async def get_all(
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
                db_paid_amounts = (
                    await self.db.paid_punishments_logs.get_total_paid_for_multiple(
                        group_id,
                        user_ids,
                        conn=conn,
                    )
                )
            else:
                db_punishments = {}
                db_paid_amounts = {}

            users = []
            for db_user in db_users:
                user = dict(db_user)
                user["punishments"] = db_punishments.get(user["user_id"], [])
                user["total_paid_amount"] = db_paid_amounts.get(user["user_id"], 0)
                users.append(GroupUser(**user))

            return users
