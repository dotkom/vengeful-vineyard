"""Contains HTTP related methods."""

import asyncio
import functools
from typing import Any, Optional

from aiohttp import ClientSession

from .exceptions import NotAuthorizedException

BASE_OLD_ONLINE = "https://old.online.ntnu.no"


def create_aiohttp_closed_event(session: ClientSession) -> asyncio.Event:
    """Work around aiohttp issue that doesn't properly close transports on exit.
    See https://github.com/aio-libs/aiohttp/issues/1925#issuecomment-639080209
    Returns:
       An event that will be set once all transports have been properly closed.
    """

    transports = 0
    all_is_lost = asyncio.Event()

    def connection_lost(exc: Exception, orig_lost: Any) -> None:
        nonlocal transports

        try:
            orig_lost(exc)
        finally:
            transports -= 1
            if transports == 0:
                all_is_lost.set()

    def eof_received(orig_eof_received: Any) -> None:
        try:
            orig_eof_received()
        except AttributeError:
            # It may happen that eof_received() is called after
            # _app_protocol and _transport are set to None.
            pass

    connector = getattr(session, "connector", None)
    _conns = getattr(connector, "_conns", {})

    for conn in _conns.values():
        for handler, _ in conn:
            proto = getattr(handler.transport, "_ssl_protocol", None)
            if proto is None:
                continue

            transports = 1
            orig_lost = proto.connection_lost
            orig_eof_received = proto.eof_received

            proto.connection_lost = functools.partial(
                connection_lost, orig_lost=orig_lost
            )
            proto.eof_received = functools.partial(
                eof_received, orig_eof_received=orig_eof_received
            )

    if transports == 0:
        all_is_lost.set()

    return all_is_lost


class HTTPClient:
    _session: ClientSession

    async def async_init(self) -> None:
        self._session = ClientSession()

    async def close(self) -> None:
        if self._session is not None:
            event = create_aiohttp_closed_event(self._session)
            await self._session.close()

            try:
                await asyncio.wait_for(event.wait(), timeout=2)
            except asyncio.TimeoutError:
                pass

    async def get_ow_profile_by_access_token(self, access_token: str) -> Optional[Any]:
        async with self._session.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile/",
            headers={"Authorization": f"Bearer {access_token}"},
        ) as response:
            if response.status == 401:
                return None

            data = await response.json()
            return data

    async def get_ow_profile_by_user_id(
        self,
        user_id: int,
        *,
        access_token: Optional[str] = None,
    ) -> Optional[Any]:
        headers = {}
        if access_token is not None:
            headers["Authorization"] = f"Bearer {access_token}"

        async with self._session.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile/search/{user_id}/",
            headers=headers,
        ) as response:
            if response.status == 404:
                return None
            if response.status == 401:
                raise NotAuthorizedException()

            return await response.json()

    async def search_ow_profiles(
        self,
        query: str,
        *,
        access_token: Optional[str] = None,
    ) -> Optional[Any]:
        headers = {}
        if access_token is not None:
            headers["Authorization"] = f"Bearer {access_token}"

        params = {
            "search": query,
        }

        async with self._session.get(
            f"{BASE_OLD_ONLINE}/api/v1/profile/search/",
            headers=headers,
            params=params,
        ) as response:
            if response.status == 401:
                raise NotAuthorizedException()

            data = await response.json()
            return data["results"]

    async def get_ow_groups_by_user_id(self, user_id: int) -> Any:
        params = {
            "members__user": user_id,
        }

        async with self._session.get(
            f"{BASE_OLD_ONLINE}/api/v1/group/online-groups/",
            params=params,
        ) as response:
            return await response.json()  # TODO?: Implement pagination?

    async def get_ow_group_users(self, group_id: int) -> Any:
        async with self._session.get(
            f"{BASE_OLD_ONLINE}/api/v1/group/online-groups/{group_id}/group-users/",
        ) as response:
            if response.status == 404:
                return []

            return await response.json()
