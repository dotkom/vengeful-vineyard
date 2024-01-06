from datetime import datetime
from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import PunishmentTypeNotExists
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.types import GroupId, PunishmentTypeId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class PunishmentTypes:
    def __init__(self, db: "Database"):
        self.db = db

    async def get_all(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[PunishmentTypeRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT * FROM punishment_types WHERE group_id = $1"
            punishment_types = await conn.fetch(query, group_id)

        return [PunishmentTypeRead(**dict(x)) for x in punishment_types]

    async def insert(
        self,
        group_id: GroupId,
        punishment_type: PunishmentTypeCreate,
        created_by: Optional[UserId],
        conn: Optional[Pool] = None,
    ) -> PunishmentTypeRead:
        res = await self.insert_multiple(
            group_id, [punishment_type], created_by, conn=conn
        )
        return res[0]

    async def insert_multiple(
        self,
        group_id: GroupId,
        punishment_types: list[PunishmentTypeCreate],
        created_by: Optional[UserId],
        conn: Optional[Pool] = None,
    ) -> list[PunishmentTypeRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO punishment_types(group_id, name, value, emoji, created_at, created_by, updated_at)
                    (SELECT
                        m.group_id, m.name, m.value, m.emoji, m.created_at, m.created_by, m.updated_at
                    FROM
                        unnest($1::punishment_types[]) as m
                    )
                    RETURNING *
                    """

            punishment_types = await conn.fetch(
                query,
                [
                    (
                        None,
                        group_id,
                        x.name,
                        x.value,
                        x.emoji,
                        datetime.utcnow(),
                        created_by,
                        datetime.utcnow(),
                    )
                    for x in punishment_types
                ],
            )

        return [PunishmentTypeRead(**dict(x)) for x in punishment_types]

    async def update(
        self,
        group_id: GroupId,
        punishment_type_id: PunishmentTypeId,
        punishment_type: PunishmentTypeCreate,
        conn: Optional[Pool] = None,
    ) -> PunishmentTypeRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """UPDATE punishment_types SET
                    name = $3,
                    value = $4,
                    emoji = $5,
                    updated_at = $6
                    WHERE group_id = $1 AND punishment_type_id = $2
                    RETURNING *
                    """

            punishment_type = await conn.fetchrow(
                query,
                group_id,
                punishment_type_id,
                punishment_type.name,
                punishment_type.value,
                punishment_type.emoji,
                datetime.utcnow(),
            )

        if punishment_type is None:
            raise PunishmentTypeNotExists

        return PunishmentTypeRead(**dict(punishment_type))

    async def delete(
        self,
        group_id: GroupId,
        punishment_type_id: PunishmentTypeId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM punishment_types WHERE group_id = $1 AND punishment_type_id = $2 RETURNING *"
            val = await conn.fetchval(
                query,
                group_id,
                punishment_type_id,
            )

            if val is None:  # None = Nothing was deleted as it wasnt found
                raise PunishmentTypeNotExists
