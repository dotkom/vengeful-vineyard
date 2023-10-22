from typing import TYPE_CHECKING, Optional

from asyncpg import Pool
from asyncpg.exceptions import ForeignKeyViolationError, UniqueViolationError

from app.exceptions import DatabaseIntegrityException, PunishmentTypeNotExists
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
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO punishment_types(group_id, name, value, logo_url)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                    """
            try:
                punishment_type_row = await conn.fetchrow(
                    query,
                    group_id,
                    punishment_type.name,
                    punishment_type.value,
                    punishment_type.logo_url,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return PunishmentTypeRead(**dict(punishment_type_row))

    async def update(
        self,
        punishment_type: PunishmentTypeCreate,
        punishment_type_id: PunishmentTypeId,
        conn: Optional[Pool] = None,
    ) -> PunishmentTypeRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """UPDATE punishment_types
                    SET name = $1, value = $2, logo_url = $3
                    WHERE punishment_type_id = $4
                    RETURNING *
                    """
            try:
                punishment_type_row = await conn.fetchrow(
                    query,
                    punishment_type.name,
                    punishment_type.value,
                    punishment_type.logo_url,
                    punishment_type_id,
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return PunishmentTypeRead(**dict(punishment_type_row))

    async def get(
        self,
        punishment_type_id: PunishmentTypeId,
        conn: Optional[Pool] = None,
    ) -> PunishmentTypeRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT * FROM punishment_types WHERE punishment_type_id = $1"
            punishment_type = await conn.fetchrow(query, punishment_type_id)

        return PunishmentTypeRead(**dict(punishment_type))

    async def delete(
        self,
        punishment_type_id: PunishmentTypeId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = (
                "DELETE FROM punishment_types WHERE punishment_type_id = $1 RETURNING *"
            )
            val = await conn.fetchval(
                query,
                punishment_type_id,
            )

            if val is None:  # None = Nothing was deleted as it wasnt found
                raise PunishmentTypeNotExists
