from typing import TYPE_CHECKING, Iterable, Optional

from asyncpg import Pool

from app.models.permission import GroupMemberPermissionRead
from app.types import GroupId, PermissionPrivilege, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class Permissions:
    def __init__(self, db: "Database") -> None:
        self.db = db

    async def get_auto_managed_permissions_for_group(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[GroupMemberPermissionRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    SELECT * FROM group_member_permissions
                       WHERE group_id = $1 AND created_by IS NULL
                    """
            res = await conn.fetch(query, group_id)

        return [GroupMemberPermissionRead(**row) for row in res]

    async def get_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[GroupMemberPermissionRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    SELECT * FROM group_member_permissions
                       WHERE group_id = $1 AND user_id = $2
                    """
            res = await conn.fetch(query, group_id, user_id)

        return [GroupMemberPermissionRead(**row) for row in res]

    async def get_permission_privileges(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> list[PermissionPrivilege]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    SELECT privilege FROM group_member_permissions
                       WHERE group_id = $1 AND user_id = $2
                    """
            res = await conn.fetch(query, group_id, user_id)

        return [row["privilege"] for row in res]

    async def get_permission_privileges_for_multiple(
        self,
        group_id: GroupId,
        user_ids: Iterable[UserId],
        conn: Optional[Pool] = None,
    ) -> dict[UserId, list[PermissionPrivilege]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    SELECT
                        gm.user_id,
                        COALESCE(json_agg(gmp.privilege) FILTER (WHERE gmp.privilege IS NOT NULL), '[]') AS privileges
                    FROM group_members gm
                    LEFT JOIN group_member_permissions gmp
                        ON gm.group_id = gmp.group_id AND gm.user_id = gmp.user_id
                    WHERE gm.group_id = $1 AND gm.user_id = Any($2)
                    GROUP BY gm.user_id
                    """
            res = await conn.fetch(query, group_id, user_ids)

        return {row["user_id"]: row["privileges"] for row in res}

    async def has_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: list[PermissionPrivilege],
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT COUNT(*) FROM group_member_permissions
                    WHERE group_id = $1 AND user_id = $2 AND privilege = $3"""
            res = await conn.fetchval(query, group_id, user_id, privilege)

        ret = res == len(privilege)
        assert isinstance(ret, bool)  # mypy smh
        return ret

    async def has_permission(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: PermissionPrivilege,
        conn: Optional[Pool] = None,
    ) -> bool:
        return await self.has_permissions(group_id, user_id, [privilege], conn)

    async def insert_permissions_for_multiple_users(
        self,
        group_id: GroupId,
        mapped_privileges: Iterable[tuple[UserId, PermissionPrivilege]],
        created_by: Optional[UserId] = None,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_member_permissions(group_id, user_id, privilege, created_by)
                    VALUES ($1, $2, $3, $4)"""

            data = [
                (group_id, user_id, privilege, created_by)
                for user_id, privilege in mapped_privileges
            ]

            await conn.executemany(query, data)

    async def insert_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        privileges: list[PermissionPrivilege],
        created_by: Optional[UserId] = None,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.insert_permissions_for_multiple_users(
            group_id,
            [(user_id, privilege) for privilege in privileges],
            created_by,
            conn,
        )

    async def insert_permission(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: PermissionPrivilege,
        created_by: Optional[UserId] = None,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.insert_permissions(group_id, user_id, [privilege], created_by, conn)

    async def remove_permissions_for_multiple_users(
        self,
        group_id: GroupId,
        mapped_privileges: Iterable[tuple[UserId, PermissionPrivilege]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_member_permissions
                    WHERE group_id = $1 AND user_id = $2 AND privilege = $3"""

            data = [
                (group_id, user_id, privilege)
                for user_id, privilege in mapped_privileges
            ]

            await conn.executemany(query, data)

    async def remove_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        privileges: list[PermissionPrivilege],
        conn: Optional[Pool] = None,
    ) -> None:
        await self.remove_permissions_for_multiple_users(
            group_id, [(user_id, privilege) for privilege in privileges], conn
        )

    async def remove_permission(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: PermissionPrivilege,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.remove_permissions(group_id, user_id, [privilege], conn)

    async def remove_all_permissions_for_multiple_users(
        self,
        group_id: GroupId,
        user_ids: Iterable[UserId],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """DELETE FROM group_member_permissions
                    WHERE group_id = $1 AND user_id = Any($2)"""

            await conn.execute(query, group_id, user_ids)

    async def remove_all_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.remove_all_permissions_for_multiple_users(group_id, [user_id], conn)
