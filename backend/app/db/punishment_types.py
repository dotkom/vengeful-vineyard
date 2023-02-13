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
    ) -> dict[str, int]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO punishment_types(group_id, name, value, logo_url)
                    VALUES ($1, $2, $3, $4)
                    RETURNING punishment_type_id
                    """
            try:
                punishment_type_id = await conn.fetchval(
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

        return {"id": punishment_type_id}

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
