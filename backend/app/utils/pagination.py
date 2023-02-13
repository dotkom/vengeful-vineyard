from typing import Awaitable, Generic, Optional, Protocol, TypeVar

from asyncpg import Pool
from pydantic.generics import GenericModel

from app.api import Request

T = TypeVar("T")


class TotalCoro(Protocol):
    def __call__(self, conn: Optional[Pool]) -> Awaitable[int]:
        ...


class ResultsCoro(Protocol, Generic[T]):
    def __call__(
        self,
        offset: int,
        limit: int,
        conn: Optional[Pool] = None,
    ) -> Awaitable[list[T]]:
        ...


class Page(GenericModel, Generic[T]):
    total: int
    next: Optional[str]
    previous: Optional[str]
    results: list[T]


class Pagination(Generic[T]):
    def __init__(
        self,
        request: Request,
        total_coro: TotalCoro,
        results_coro: ResultsCoro[T],
        page: int,
        page_size: int,
    ) -> None:
        self._request = request
        self._url = request.url

        self._total_coro = total_coro
        self._results_coro = results_coro
        self._page = page
        self._page_size = page_size

    def _get_url(self, page: int) -> str:
        query_params = dict(self._request.query_params)
        query_params["page"] = str(page)

        replaced = self._url.replace_query_params(**query_params)
        return str(replaced)

    async def paginate(self) -> Page[T]:
        page = self._page
        page_size = self._page_size

        offset = page * page_size
        limit = page_size

        async with self._request.app.db.pool.acquire() as conn:
            total = await self._total_coro(conn=conn)
            results = await self._results_coro(offset, limit, conn=conn)

        return Page[T](
            total=total,
            next=self._get_url(page + 1) if total > offset + limit else None,
            previous=self._get_url(page - 1) if page > 0 else None,
            results=results,
        )
