from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.group_join_requests import GroupJoinRequest
from app.types import GroupId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class GroupJoinRequests:
    def __init__(self, db: "Database"):
        self.db = db

    async def get(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> GroupJoinRequest:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_join_requests
                    WHERE group_id = $1 AND user_id = $2"""
            res = await conn.fetchrow(query, group_id, user_id)
            if not res:
                raise NotFound

        return GroupJoinRequest(**res)

    async def get_all(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[GroupJoinRequest]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_join_requests
                    WHERE group_id = $1 ORDER BY created_at DESC"""
            res = await conn.fetch(query, group_id)

        return [GroupJoinRequest(**row) for row in res]

    async def insert_multiple(
        self,
        mappings: list[tuple[GroupId, UserId]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_join_requests (group_id, user_id)
                    VALUES ($1, $2)"""
            await conn.executemany(query, mappings)

    async def insert(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.insert_multiple([(group_id, user_id)], conn=conn)

    async def delete_multiple(
        self,
        mappings: list[tuple[GroupId, UserId]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_join_requests
                    WHERE group_id = $1 AND user_id = $2"""
            await conn.executemany(query, mappings)

    async def delete(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_join_requests
                    WHERE group_id = $1 AND user_id = $2
                    RETURNING *"""
            res = await conn.fetch(query, group_id, user_id)
            if not res:
                raise NotFound
