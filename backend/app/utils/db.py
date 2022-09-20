from typing import Any

from asyncpg.pool import Pool, PoolAcquireContext


class MaybeAcquire:
    """Aqcuires a connection from the connection pool only if the
    connection passed is None. This exists to avoid having to acquire
    a new connection multiple times during a single function.
    """

    def __init__(self, connection: PoolAcquireContext | None, pool: Pool) -> None:
        self.connection = connection
        self.pool = pool
        self._cleanup = False

    async def __aenter__(self) -> PoolAcquireContext:
        if self.connection is None:
            self._cleanup = True
            self._connection = c = await self.pool.acquire()
            return c
        return self.connection

    async def __aexit__(self, *args: Any) -> None:
        if self._cleanup:
            await self.pool.release(self._connection)
