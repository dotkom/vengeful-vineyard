import json
from typing import Any, Optional

from asyncpg.pool import Pool, PoolAcquireContext


class MaybeAcquire:
    """Aqcuires a connection from the connection pool only if the
    connection passed is None. This exists to avoid having to acquire
    a new connection multiple times during a single function.
    """

    def __init__(
        self,
        connection: Optional[PoolAcquireContext],
        pool: Pool,
    ) -> None:
        self._connection = connection
        self.pool = pool
        self._cleanup = False

    async def __aenter__(self) -> PoolAcquireContext:
        if self._connection is None:
            self._cleanup = True
            self._connection = c = await self.pool.acquire()
            await c.set_type_codec(
                "json", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
            )
            return c
        return self._connection

    async def __aexit__(self, *args: Any) -> None:
        if self._cleanup:
            await self.pool.release(self._connection)
