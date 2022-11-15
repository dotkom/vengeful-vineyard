import datetime
from typing import TYPE_CHECKING, Optional, Union, cast

from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group import Group, GroupCreate
from app.models.group_member import GroupMemberCreate
from app.models.punishment_type import PunishmentTypeCreate
from app.types import GroupId, InsertOrUpdateGroup, OWUserId, UserId
from app.utils.db import MaybeAcquire
from asyncpg import Pool
from asyncpg.exceptions import ForeignKeyViolationError, UniqueViolationError

if TYPE_CHECKING:
    from app.db.core import Database


DEFAULT_PUSHISHMENT_TYPES = [
    PunishmentTypeCreate(
        name="Ølstraff", value=33, logo_url="./assets/beerOutlined.svg"
    ),
    PunishmentTypeCreate(
        name="Vinstraff", value=100, logo_url="./assets/wineOutlined.svg"
    ),
    PunishmentTypeCreate(
        name="Spritstraff", value=300, logo_url="./assets/spiritOutlined.svg"
    ),
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
                query = """SELECT 1 FROM group_members
                        WHERE group_id = $1 AND user_id = $2"""
            else:
                query = """SELECT 1 FROM group_members
                        INNER JOIN users ON users.user_id = group_members.user_id
                        WHERE group_id = $1 AND users.ow_user_id = $2"""

            res = await conn.fetchval(query, group_id, user_id)
            return res is not None

    async def get(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> Group:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT * FROM groups WHERE groups.group_id = $1"
            db_group = await conn.fetchrow(query, group_id)

            if db_group is None:
                raise NotFound

            group = dict(db_group)
            group["punishment_types"] = await self.db.punishment_types.get_all(
                group_id, conn=conn
            )
            group["members"] = await self.db.group_users.get_all(
                group_id,
                conn=conn,
            )

            return Group(**group)

    async def get_total_punishment_value(
        self,
        group_id: GroupId,
        include_verified: bool = False,
        conn: Optional[Pool] = None,
    ) -> dict[str, int]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            extra = "" if include_verified else " AND verified_by IS NULL"

            query = f"""SELECT COALESCE(SUM(gp.amount * pt.value), 0) FROM group_punishments AS gp
                    LEFT JOIN punishment_types AS pt
                        ON gp.punishment_type_id = pt.punishment_type_id
                    WHERE gp.group_id = $1{extra}
                    """

            val = await conn.fetchval(query, group_id)
            assert isinstance(val, int)

            return {"value": val}

    async def insert(
        self,
        group: GroupCreate,
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
                    group.name,
                    group.name_short,
                    group.rules,
                    group.image,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

            gid = cast(GroupId, group_id)
            for punishment_type in DEFAULT_PUSHISHMENT_TYPES:
                await self.db.punishment_types.insert(gid, punishment_type, conn=conn)

        return {"id": gid, "action": "CREATE"}

    async def update(
        self,
        group: GroupCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        if group.ow_group_id is None:
            raise ValueError("ow_group_id must be set")

        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """UPDATE groups
                    SET name = $1, name_short = $2, rules = $3, image = $4
                    WHERE ow_group_id = $5
                    RETURNING group_id;"""
            group_id = await conn.fetchval(
                query,
                group.name,
                group.name_short,
                group.rules,
                group.image,
                group.ow_group_id,
            )
            return {"id": group_id, "action": "UPDATE"}

    async def insert_or_update(
        self,
        group: GroupCreate,
        conn: Optional[Pool] = None,
    ) -> InsertOrUpdateGroup:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            try:
                return await self.db.groups.insert(group, conn=conn)
            except DatabaseIntegrityException:
                return await self.db.groups.update(group, conn=conn)

    async def insert_member(
        self,
        member: GroupMemberCreate,
        conn: Optional[Pool] = None,
    ) -> dict[str, Union[GroupId, UserId]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_time)
                    VALUES ($1, $2, $3, $4)
                    RETURNING group_id, user_id
                    """
            try:
                res = await conn.fetchrow(
                    query,
                    member.group_id,
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
        members: list[GroupMemberCreate],
        conn: Optional[Pool] = None,
    ) -> list[dict[str, Union[GroupId, UserId]]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_members(group_id, user_id, ow_group_user_id, added_time)
                    (SELECT
                        m.group_id, m.user_id, m.ow_group_user_id, m.added_time
                    FROM
                        unnest($1::group_members[]) as m
                    )
                    RETURNING group_id, user_id
                    """

            res = await conn.fetch(
                query,
                [
                    (
                        x.group_id,
                        x.user_id,
                        x.ow_group_user_id,
                        True,
                        datetime.datetime.utcnow(),
                    )
                    for x in members
                ],
            )
            return [dict(r) for r in res]
