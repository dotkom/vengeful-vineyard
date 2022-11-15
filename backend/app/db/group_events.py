import datetime
from typing import TYPE_CHECKING, Optional

from app.exceptions import DatabaseIntegrityException, NotFound
from app.models.group_event import GroupEvent, GroupEventCreate
from app.types import GroupEventId, GroupId, UserId
from app.utils.db import MaybeAcquire
from asyncpg import Pool
from asyncpg.exceptions import ForeignKeyViolationError, UniqueViolationError

if TYPE_CHECKING:
    from app.db.core import Database


class GroupEvents:
    def __init__(self, db: "Database"):
        self.db = db

    async def insert(
        self,
        group_id: GroupId,
        event: GroupEventCreate,
        created_by: UserId,
        conn: Optional[Pool] = None,
    ) -> dict[str, int]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO group_events(group_id,
                                                name,
                                                description,
                                                start_time,
                                                end_time,
                                                created_by,
                                                created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING event_id
                    """
            try:
                group_event_id = await conn.fetchval(
                    query,
                    group_id,
                    event.name,
                    event.description,
                    event.start_time,
                    event.end_time,
                    created_by,
                    datetime.datetime.utcnow(),
                )
            except UniqueViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc
            except ForeignKeyViolationError as exc:
                raise DatabaseIntegrityException(detail=str(exc)) from exc

        return {"id": group_event_id}

    async def exists_between(
        self,
        group_id: GroupId,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        conn: Optional[Pool] = None,
    ) -> bool:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT 1 FROM group_events
                WHERE group_id = $1 AND start_time < $2 AND end_time > $3
                """
            res = await conn.fetchrow(query, group_id, end_time, start_time)
            return res is not None

    async def get_count(
        self,
        group_id: GroupId,
        conn: Optional[Pool] = None,
    ) -> int:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "SELECT COUNT(*) FROM group_events WHERE group_id = $1"
            return await conn.fetchval(  # type: ignore
                query,
                group_id,
            )

    async def get_all(
        self,
        group_id: GroupId,
        conn: Optional[Pool],
    ) -> list[GroupEvent]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_events WHERE group_id = $1"""
            res = await conn.fetch(query, group_id)

        return [GroupEvent(**r) for r in res]

    async def get_all_with_offset(
        self,
        group_id: GroupId,
        offset: int,
        limit: int,
        conn: Optional[Pool] = None,
    ) -> list[GroupEvent]:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM group_events
                    WHERE group_id = $1
                    ORDER BY start_time DESC
                    OFFSET $2
                    LIMIT $3
                    """
            res = await conn.fetch(
                query,
                group_id,
                offset,
                limit,
            )

            return [GroupEvent(**r) for r in res]

    async def delete(
        self,
        event_id: GroupEventId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM group_events WHERE event_id = $1 RETURNING 1"
            res = await conn.fetchval(query, event_id)

            if res is None:
                raise NotFound
