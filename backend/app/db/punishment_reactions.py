from typing import TYPE_CHECKING, Optional

from asyncpg import Pool

from app.exceptions import NotFound
from app.models.punishment_reaction import (
    PunishmentReactionCreate,
    PunishmentReactionRead,
)
from app.types import PunishmentId, PunishmentReactionId, UserId
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class PunishmentReactions:
    def __init__(self, db: "Database"):
        self.db = db

    async def get(
        self,
        punishment_reaction_id: PunishmentReactionId,
        conn: Optional[Pool] = None,
    ) -> PunishmentReactionRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """SELECT * FROM punishment_reactions WHERE punishment_reaction_id = $1"""
            res = await conn.fetchrow(query, punishment_reaction_id)

            if res is None:
                raise NotFound

        return PunishmentReactionRead(**res)

    async def insert(
        self,
        punishment_id: PunishmentId,
        user_id: UserId,
        punishment_reaction: PunishmentReactionCreate,
        conn: Optional[Pool] = None,
    ) -> PunishmentReactionRead:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = """INSERT INTO punishment_reactions(emoji, punishment_id, created_by)
                    VALUES ($1, $2, $3)
                    RETURNING *"""

            res = await conn.fetchrow(
                query,
                punishment_reaction.emoji,
                punishment_id,
                user_id,
            )

        return PunishmentReactionRead(**res)

    async def delete(
        self,
        punishment_reaction_id: PunishmentReactionId,
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.db.pool) as conn:
            query = "DELETE FROM punishment_reactions WHERE punishment_reaction_id = $1 RETURNING *"
            res = await conn.fetchval(query, punishment_reaction_id)

            if res is None:
                raise NotFound
