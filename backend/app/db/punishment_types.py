from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import PunishmentTypeNotExists
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.types import GroupId, PunishmentTypeId
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
        conn: Optional[Pool] = None,
    ) -> PunishmentTypeRead:
        res = await self.insert_multiple(group_id, [punishment_type], conn=conn)
        return res[0]

    async def insert_multiple(
        self,
        group_id: GroupId,
        punishment_types: list[PunishmentTypeCreate],
        conn: Optional[Pool] = None,
    ) -> list[PunishmentTypeRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO punishment_types(group_id, name, value, logo_url)
                    (SELECT
                        m.group_id, m.name, m.value, m.logo_url
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
                        x.logo_url,
                    )
                    for x in punishment_types
                ],
            )

        return [PunishmentTypeRead(**dict(x)) for x in punishment_types]

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
