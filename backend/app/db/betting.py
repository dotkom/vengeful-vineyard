from typing import TYPE_CHECKING, List, Optional

from asyncpg import Pool
from app.models.betting import VersusBet
from app.utils.db import MaybeAcquire

if TYPE_CHECKING:
    from app.db.core import Database


class Betting:
    def __init__(self, db: "Database") -> None:
        self.db = db

    async def get_all_versus_bets(
        self, offset: int, limit: int, conn: Optional[Pool] = None
    ) -> List[VersusBet]:
        async with MaybeAcquire(conn, self.db.pool) as connection:
            query = """
            SELECT
                
            """
