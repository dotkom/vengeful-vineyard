"""Contains HTTP related methods."""

import datetime
import json
import os
import asyncio
import functools
from typing import Any, Optional

from aiohttp import ClientSession
from app.config import (
    settings,
)
from app.types import OWSyncGroup, OWSyncGroupMember, OWSyncUser
from app.utils.date import parse_naive_datetime

from .exceptions import NotAuthorizedException

BASE_OLD_ONLINE = settings.ow4_base_url
BASE_OW5 = settings.ow5_base_url


def create_trpc_input(value: str) -> str:
    payload = {"json": value}
    return json.dumps(payload)


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

    async def get_ow_profile_by_access_token(
        self, access_token: str
    ) -> Optional[OWSyncUser]:
        async with self._session.get(
            f"{BASE_OW5}/user.getMe",
            headers={"Authorization": f"Bearer {access_token}"},
        ) as response:
            if response.status == 401 or response.status == 404:
                return None

            data = await response.json()

            raw = data.get("result", {}).get("data", {}).get("json", {})

            if raw is None:
                return None

            parts = raw.get("name", "").split()
            first_name = " ".join(parts[:-1]) if parts else ""
            last_name = parts[-1] if len(parts) > 1 else ""

            return OWSyncUser(
                id=raw["id"],
                email=raw["email"],
                first_name=first_name,
                last_name=last_name,
            )

    async def get_ow_groups_by_user_id(self, user_id: str) -> list[OWSyncGroup]:
        input = create_trpc_input(user_id)

        async with self._session.get(
            f"{BASE_OW5}/group.allByMember?input={input}",
        ) as response:
            data = await response.json()

            raw = data.get("result", {}).get("data", {}).get("json", {})

            if raw is None:
                return []

            return [
                OWSyncGroup(
                    slug=item["slug"],
                    name=(
                        item["name"]
                        if item["name"] is not None
                        else item["abbreviation"]
                    ),
                    type=item["type"],
                    imageUrl=item["imageUrl"],
                    abbreviation=item["abbreviation"],
                )
                for item in raw
            ]

    async def get_ow_group_users(self, group_id: str) -> list[OWSyncGroupMember]:
        input = create_trpc_input(group_id)

        async with self._session.get(
            f"{BASE_OW5}/group.getMembers?input={input}",
        ) as response:
            if response.status == 404:
                return []

            data = await response.json()

            raw = data.get("result", {}).get("data", {}).get("json", {})

            if raw is None:
                return []

            now = datetime.datetime.now()

            ow_users: list[OWSyncGroupMember] = []
            for _, user in raw:
                roles = [
                    role["type"]
                    for membership in user["groupMemberships"]
                    for role in membership["roles"]
                    if (membership["end"] is None)
                    or (parse_naive_datetime(membership["end"]) > now)
                ]

                has_active_group_membership = any(
                    (gm["end"] is None) or (parse_naive_datetime(gm["end"]) > now)
                    for gm in user["groupMemberships"]
                )

                parts = user.get("name", "").split()
                first_name = " ".join(parts[:-1]) if parts else ""
                last_name = parts[-1] if len(parts) > 1 else ""

                ow_user = OWSyncGroupMember(
                    id=user["id"],
                    email=user["email"],
                    first_name=first_name,
                    last_name=last_name,
                    roles=roles,
                    has_active_membership=has_active_group_membership,
                )

                ow_users.append(ow_user)

            return ow_users

    async def get_all_ow_users(self) -> Optional[list[OWSyncUser]]:
        input = create_trpc_input({"take": 10000000})

        async with self._session.get(
            f"{BASE_OW5}/user.all?input={input}",
        ) as response:
            if response.status == 401 or response.status == 404:
                return None

            data = await response.json()

            raw = (
                data.get("result", {}).get("data", {}).get("json", {}).get("items", [])
            )

            if raw is None:
                return []

            ow_users: list[OWSyncUser] = []

            for data in raw:
                parts = data.get("name", "").split()
                first_name = " ".join(parts[:-1]) if parts else ""
                last_name = parts[-1] if len(parts) > 1 else ""

                ow_user = OWSyncUser(
                    id=data["id"],
                    email=data["email"],
                    first_name=first_name,
                    last_name=last_name,
                )
                ow_users.append(ow_user)

            return ow_users
