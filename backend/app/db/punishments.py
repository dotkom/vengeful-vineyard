import datetime
from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound, PunishmentTypeNotExists
from app.models.punishment import PunishmentCreate, PunishmentRead
from app.types import GroupId, PunishmentId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class Punishments:
    def __init__(self, db: "Database"):
        self.db = db

    async def get(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> PunishmentRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_punishments WHERE punishment_id = $1"""
            res = await conn.fetchrow(query, punishment_id)

            if res is None:
                raise NotFound

        return PunishmentRead(**res)

    async def get_all(
        self,
        user_id: UserId,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> list[PunishmentRead]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = (
                "SELECT * FROM group_punishments WHERE group_id = $1 AND user_id = $2"
            )
            punishments = await conn.fetch(query, group_id, user_id)

        return [PunishmentRead(**dict(x)) for x in punishments]

    async def insert_multiple(
        self,
        group_id: GroupId,
        user_id: UserId,
        created_by: UserId,
        punishments: list[PunishmentCreate],
        conn: Optional[Pool] = None,
    ) -> dict[str, list[int]]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT 1 FROM punishment_types
                WHERE group_id = $1 AND punishment_type_id = ANY($2::int[])
                """
            res = await conn.fetch(
                query,
                group_id,
                [x.punishment_type_id for x in punishments],
            )
            if len(res) != len(punishments):
                raise PunishmentTypeNotExists

            query = """INSERT INTO group_punishments(group_id,
                                                     user_id,
                                                     punishment_type_id,
                                                     reason,
                                                     amount,
                                                     created_by,
                                                     created_at)
                    (SELECT
                        p.group_id,
                        p.user_id,
                        p.punishment_type_id,
                        p.reason,
                        p.amount,
                        p.created_by,
                        p.created_at
                    FROM
                        unnest($1::group_punishments[]) as p
                    )
                    RETURNING punishment_id
                    """
            res = await conn.fetch(
                query,
                [
                    (
                        None,
                        group_id,
                        user_id,
                        p.punishment_type_id,
                        p.reason,
                        p.amount,
                        created_by,
                        datetime.datetime.utcnow(),
                    )
                    for p in punishments
                ],
            )
            return {"ids": [r["punishment_id"] for r in res]}

    async def delete(
        self,
        punishment_id: PunishmentId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM group_punishments WHERE punishment_id = $1 RETURNING *"
            res = await conn.fetchval(query, punishment_id)

            if res is None:
                raise NotFound
