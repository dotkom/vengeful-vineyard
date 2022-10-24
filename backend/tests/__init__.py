import copy
import json
from typing import Any, Optional, Tuple, Union
from unittest.mock import patch

from aiohttp import ClientConnectionError, ClientResponse, ClientSession, hdrs
from aioresponses import aioresponses
from aioresponses.compat import URL, merge_params, normalize_url
from aioresponses.core import RequestCall, RequestMatch


# We need to patch aioresponses to allow for our custom implementation of passthrough
# to work. The intended use of passthrough works like a whitelist, but we want
# all requests not explicitly mocked to be passed through.
async def patched_request_mock(
    self: Any,
    orig_self: ClientSession,
    method: str,
    url: Union[URL, str],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """Return mocked response object or raise connection error."""
    if orig_self.closed:
        raise RuntimeError("Session is closed")

    url_origin = url
    url = normalize_url(merge_params(url, kwargs.get("params", {})))
    url_str = str(url)
    # for prefix in self._passthrough:
    #     if url_str.startswith(prefix):
    #         return (await self.patcher.temp_original(
    #             orig_self, method, url_origin, *args, **kwargs
    #         ))

    # Custom match implementation. If no matches found = passthrough
    for _match in self._matches:
        if _match.match(method, url):
            break
    else:
        # If we didn't find a match, we want to pass through the request
        return await self.patcher.temp_original(
            orig_self, method, url_origin, *args, **kwargs
        )

    key = (method, url)
    self.requests.setdefault(key, [])
    try:
        kwargs_copy = copy.deepcopy(kwargs)
    except (TypeError, ValueError):
        # Handle the fact that some values cannot be deep copied
        kwargs_copy = kwargs
    self.requests[key].append(RequestCall(args, kwargs_copy))

    response = await self.match(method, url, **kwargs)

    if response is None:
        raise ClientConnectionError("Connection refused: {} {}".format(method, url))
    self._responses.append(response)

    # Automatically call response.raise_for_status() on a request if the
    # request was initialized with raise_for_status=True. Also call
    # response.raise_for_status() if the client session was initialized
    # with raise_for_status=True, unless the request was called with
    # raise_for_status=False.
    raise_for_status = kwargs.get("raise_for_status")
    if raise_for_status is None:
        raise_for_status = getattr(orig_self, "_raise_for_status", False)
    if raise_for_status:
        response.raise_for_status()

    return response


def patched_start(self: Any) -> None:
    self._responses = []
    self._matches = []
    self.patcher.start()
    self.patcher.return_value = self._request_mock


def patched_add(self: Any, *args: Any, **kwargs: Any) -> None:
    self._matches.append(RequestMatch(*args, **kwargs))


async def patched_match(
    self: Any,
    method: str,
    url: URL,
    allow_redirects: bool = True,
    **kwargs: Any,
) -> Any:
    history = []
    while True:
        to_remove = None
        for c, matcher in enumerate(self._matches):
            if matcher.match(method, url):
                response_or_exc = await matcher.build_response(
                    url, allow_redirects=allow_redirects, **kwargs
                )
                to_remove = c
                break
        else:
            return None

        if matcher.repeat is False:
            del self._matches[to_remove]

        if self.is_exception(response_or_exc):
            raise response_or_exc
        is_redirect = response_or_exc.status in (301, 302, 303, 307, 308)
        if is_redirect and allow_redirects:
            if hdrs.LOCATION not in response_or_exc.headers:
                break
            history.append(response_or_exc)
            redirect_url = URL(response_or_exc.headers[hdrs.LOCATION])
            if redirect_url.is_absolute():
                url = redirect_url
            else:
                url = url.join(redirect_url)
            method = "get"
            continue
        else:
            break

    response_or_exc._history = tuple(history)

    return response_or_exc


aioresponses._request_mock = patched_request_mock  # type: ignore
aioresponses.start = patched_start  # type: ignore
aioresponses.add = patched_add  # type: ignore
aioresponses.match = patched_match  # type: ignore
