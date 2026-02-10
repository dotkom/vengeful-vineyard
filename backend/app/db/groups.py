import datetime
from typing import TYPE_CHECKING, Optional, Union, cast

from asyncpg import Pool
from asyncpg.exceptions import ForeignKeyViolationError, UniqueViolationError

from app.config import (
    OW_GROUP_PERMISSIONS_AS_DICT,
    OW_GROUP_ROLES,
    PERMISSIONS_AS_DICT,
    ROLES,
)
from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group import Group, GroupCreate, GroupSearchResult, GroupPublic
from app.models.group_member import GroupMember, GroupMemberCreate
from app.models.punishment import TotalPunishmentValue
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.types import GroupId, InsertOrUpdateGroup, OWUserId, UserId, InviteCode
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(name="Ølstraff", value=33, emoji="🍺"),
    PunishmentTypeCreate(name="Vinstraff", value=100, emoji="🍷"),
    PunishmentTypeCreate(name="Spritstraff", value=300, emoji="🍸"),
]


class Groups:
    def __init__(self, db: "Database") -> None:
        self.db = db

    async def is_in_group(
        self,
        user_id: Union[UserId, OWUserId],
        group_id: GroupId,
        *,
        is_ow_user_id: bool = False,
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            if not is_ow_user_id:
                query = """SELECT 1 FROM group_members gm
                        WHERE group_id = $1 AND user_id = $2 AND gm.active = TRUE"""
            else:
                query = """SELECT 1 FROM group_members gm
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE group_id = $1 AND users.ow_user_id = $2 AND gm.active = TRUE"""

            res = await conn.fetchval(query, group_id, user_id)
            return res is not None

    async def combined_group_check(
        self,
        group_id: GroupId,
        user_id: Union[UserId, OWUserId],
        conn: Optional[Pool] = None,
    ) -> tuple[bool, bool]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
                    SELECT
                        g.ow_group_id IS NOT NULL AS is_ow_group,
                        COALESCE((SELECT true FROM group_members WHERE group_id = $1 AND user_id = $2 AND active = TRUE), false) AS is_group_member
                    FROM groups AS g
                    WHERE g.group_id = $1
                    """

            res = await conn.fetchrow(query, group_id, user_id)
            if res is None:
                return False, False
            return res["is_ow_group"], res["is_group_member"]

    async def is_in_any_ow_group(
        self,
        user_id: Union[UserId, OWUserId],
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT 1 FROM group_members gm
                    INNER JOIN groups g ON g.group_id = gm.group_id AND g.ow_group_id IS NOT NULL or special
                    WHERE gm.user_id = $1 AND gm.active = TRUE
                    """

            res = await conn.fetchval(query, user_id)
            return res is not None

    async def search(
        self,
        query: str,
        limit: int = 5,
        include_ow_groups: bool = True,
        conn: Optional[Pool] = None,
    ) -> list[GroupSearchResult]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            extra = "" if include_ow_groups else "AND ow_group_id IS NULL"

            queryy = f"""SELECT * FROM groups
                    WHERE (name ILIKE $1 OR name_short ILIKE $1) {extra}
                    LIMIT $2"""
            res = await conn.fetch(queryy, f"%{query}%", limit)

        return [GroupSearchResult(**row) for row in res]

    async def get(
        self,
        group_id: GroupId,
        invite_code: Optional[InviteCode] = None,
        include_members: bool = True,
        conn: Optional[Pool] = None,
    ) -> Group:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            parameters = [group_id]
            where_clause = "WHERE g.group_id = $1"
            if invite_code is not None:
                where_clause += " AND g.invite_code = $2"
                parameters.append(invite_code)

            query = f"""
                WITH join_request_users AS (
                    SELECT gjr.group_id, u.*
                    FROM group_join_requests gjr
                    LEFT JOIN users u ON gjr.user_id = u.user_id
                    WHERE gjr.group_id = $1
                )
                SELECT
                    g.*,
                    COALESCE(json_agg(pt.* ORDER BY pt.created_at) FILTER (WHERE pt.punishment_type_id IS NOT NULL), '[]') AS punishment_types,
                    COALESCE(json_agg(DISTINCT jru.*) FILTER (WHERE jru.user_id IS NOT NULL), '[]') AS join_requests
                FROM groups g
                LEFT JOIN punishment_types pt ON g.group_id = pt.group_id
                LEFT JOIN join_request_users jru ON g.group_id = jru.group_id
                {where_clause}
                GROUP BY g.group_id;
                """

            group = await conn.fetchrow(query, *parameters)

            if group is None:
                raise NotFound

            if include_members:
                members = await self.db.group_users.get_all(
                    group_id,
                    conn=conn,
                )
            else:
                members = []

            group = dict(group)

            group["punishment_types"] = {
                x["punishment_type_id"]: PunishmentTypeRead(**x)
                for x in group["punishment_types"]
            }

            is_ow_group = group["ow_group_id"] is not None

            return Group(
                **group,
                members=members,
                roles=OW_GROUP_ROLES if is_ow_group else ROLES,  # type: ignore
                permissions=(
                    OW_GROUP_PERMISSIONS_AS_DICT if is_ow_group else PERMISSIONS_AS_DICT
                ),
            )

    async def get_public_group_profile(
        self,
        group_short_name: str,
        user_id: Optional[UserId] = None,
        conn: Optional[Pool] = None,
    ) -> GroupPublic:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT * FROM groups WHERE lower(name_short) = lower($1)"
            group = await conn.fetchrow(query, group_short_name)

            if group is None:
                raise NotFound

            if user_id is not None:
                query = (
                    "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2"
                )
                is_member = bool(await conn.fetchval(query, group["group_id"], user_id))
            else:
                is_member = False

            return GroupPublic(
                **group,
                is_official=group["ow_group_id"] is not None,
                is_member=is_member,
            )

    async def get_total_punishment_value(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> TotalPunishmentValue:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """
            SELECT
                COALESCE(SUM(gp.amount * pt.value), 0) AS total_value,
                COALESCE(SUM(CASE WHEN gp.paid THEN gp.amount * pt.value ELSE 0 END), 0) AS total_paid_value
                FROM group_punishments AS gp
            LEFT JOIN punishment_types AS pt
                ON gp.punishment_type_id = pt.punishment_type_id
            WHERE gp.group_id = $1
            GROUP BY gp.group_id
            """

            row = await conn.fetchrow(query, group_id)
            return TotalPunishmentValue(**dict(row))

    async def insert(
        self,
        group: GroupCreate,
        created_by: Optional[UserId],
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO groups(ow_group_id, name, name_short, rules, image)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING group_id;"""
            try:
                group_id = await conn.fetchval(
                    query,
                    group.ow_group_id,
                    group.name.strip(),
                    group.name_short.strip(),
                    group.rules,
                    group.image,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

            gid = cast(GroupId, group_id)
            await self.db.punishment_types.insert_multiple(
                gid, DEFAULT_PUSHISHMENT_TYPES, created_by, conn=conn
            )

        return {"id": gid, "action": "CREATE"}

    async def update(
        self,
        group: GroupCreate,
        group_id: Optional[GroupId] = None,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        use_group_id = group_id is not None

        async with MaybeAcquire(conn, self.db.pool) as conn:
            where_clause = (
                "WHERE group_id = $5" if use_group_id else "WHERE ow_group_id = $5"
            )
            query = f"""UPDATE groups
                    SET name = $1, name_short = $2, rules = $3, image = $4
                    {where_clause}
                    RETURNING group_id;"""
            ret_group_id = await conn.fetchval(
                query,
                group.name.strip(),
                group.name_short.strip(),
                group.rules,
                group.image,
                group_id if use_group_id else group.ow_group_id,
            )

            return {
                "id": ret_group_id,
                "action": "UPDATE",
            }

    async def insert_or_update(
        self,
        group: GroupCreate,
        created_by: Optional[UserId],
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            try:
                return await self.db.groups.insert(group, created_by, conn=conn)
            except DatabaseIntegrityException:
                return await self.db.groups.update(group, conn=conn)

    async def insert_member(
        self,
        group_id: GroupId,
        member: GroupMemberCreate,
        conn: Optional[Pool] = None,
    ) -> dict[str, Union[GroupId, UserId]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_at)
                    VALUES ($1, $2, $3, $4)
                    RETURNING group_id, user_id
                    """
            try:
                res = await conn.fetchrow(
                    query,
                    group_id,
                    member.user_id,
                    member.ow_group_user_id,
                    datetime.datetime.utcnow(),
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise NotFound from exc

        return {
            "group_id": res["group_id"],
            "user_id": res["user_id"],
        }

    async def insert_members(
        self,
        group_id: GroupId,
        members: list[GroupMemberCreate],
        conn: Optional[Pool] = None,
    ) -> list[GroupMember]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_at, inactive_at)
                    (SELECT
                        m.group_id, m.user_id, m.ow_group_user_id, m.added_at, m.inactive_at
                    FROM
                        unnest($1::group_members[]) as m
                    )
                    ON CONFLICT (group_id, user_id) DO NOTHING
                    RETURNING *
                    """

            res = await conn.fetch(
                query,
                [
                    (
                        group_id,
                        x.user_id,
                        x.ow_group_user_id,
                        True,
                        datetime.datetime.utcnow(),
                        None,
                    )
                    for x in members
                ],
            )
            return [GroupMember(**row) for row in res]

    async def update_invite_code(
        self,
        group_id: GroupId,
        invite_code: Optional[InviteCode],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "UPDATE groups SET invite_code = $1 WHERE group_id = $2"
            await conn.execute(query, invite_code, group_id)

    async def delete(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM groups WHERE group_id = $1 RETURNING *"
            res = await conn.fetchval(query, group_id)

            if res is None:
                raise NotFound
