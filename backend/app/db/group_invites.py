from typing import TYPE_CHECKING, Optional, Union

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.group_invites import GroupInvite, GroupInviteWithMetadata
from app.types import GroupId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class GroupInvites:
    def __init__(self, db: "Database"):
        self.db = db

    async def get(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> GroupInvite:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_invites
                    WHERE group_id = $1 AND user_id = $2"""
            res = await conn.fetchrow(query, group_id, user_id)
            if not res:
                raise NotFound

        return GroupInvite(**res)

    async def get_by_user(
        self,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[Union[GroupInvite]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_invites
                    WHERE user_id = $1 ORDER BY created_at DESC"""
            res = await conn.fetch(query, user_id)

            return [GroupInvite(**row) for row in res]

    async def get_with_metadata_by_user(
        self,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[GroupInviteWithMetadata]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            """
            Now we need to get the group name and the name of the user who created the invite from groups table and users table
            """
            query = """SELECT * FROM group_invites
                    WHERE user_id = $1 ORDER BY created_at DESC"""
            res = await conn.fetch(query, user_id)
            invites = [GroupInvite(**row) for row in res]

            group_ids = [invite.group_id for invite in invites]
            group_query = """SELECT group_id, name FROM groups
                    WHERE group_id = ANY($1)"""
            group_res = await conn.fetch(group_query, group_ids)
            group_mapping = {row["group_id"]: row["name"] for row in group_res}

            created_by_ids = [invite.created_by for invite in invites]
            user_query = """SELECT user_id, CONCAT(first_name, ' ', last_name) AS name FROM users
                    WHERE user_id = ANY($1)"""
            user_res = await conn.fetch(user_query, created_by_ids)
            user_mapping = {row["user_id"]: row["name"] for row in user_res}

            return [
                GroupInviteWithMetadata(
                    invite=invite,
                    group_name=group_mapping[invite.group_id],
                    created_by_name=user_mapping[invite.created_by],
                )
                for invite in invites
            ]

    async def get_by_group(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[GroupInvite]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_invites
                    WHERE group_id = $1 ORDER BY created_at DESC"""
            res = await conn.fetch(query, group_id)

        return [GroupInvite(**row) for row in res]

    async def insert_multiple(
        self,
        mappings: list[tuple[GroupId, UserId, UserId]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_invites (group_id, user_id, created_by)
                    VALUES ($1, $2, $3)"""
            await conn.executemany(query, mappings)

    async def insert(
        self,
        group_id: GroupId,
        user_id: UserId,
        created_by: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.insert_multiple([(group_id, user_id, created_by)], conn)

    async def delete_multiple(
        self,
        mappings: list[tuple[GroupId, UserId]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_invites
                    WHERE group_id = $1 AND user_id = $2"""
            await conn.executemany(query, mappings)

    async def delete(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_invites
                    WHERE group_id = $1 AND user_id = $2
                    RETURNING *"""
            res = await conn.fetch(query, group_id, user_id)
            if not res:
                raise NotFound
