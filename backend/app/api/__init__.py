"""API related functions and classes."""

from typing import Any, Callable, Coroutine, Optional

from app.db import Database
from app.http import HTTPClient
from app.state import State
from app.sync import OWSync
from fastapi import FastAPI as OriginalFastAPI
from fastapi import HTTPException
from fastapi import Request as OriginalRequest
from fastapi import Response
from fastapi.routing import APIRoute as OriginalAPIRoute
from fastapi.security import OpenIdConnect
from starlette.requests import Request as StarletteRequest

__all__ = (
    "FastAPI",
    "Request",
    "APIRoute",
)


oidc = OpenIdConnect(
    openIdConnectUrl="https://old.online.ntnu.no/openid/.well-known/openid-configuration",
)


class FastAPI(OriginalFastAPI):
    db: Database
    http: HTTPClient
    app_state: State
    ow_sync: OWSync

    def set_db(self, db: Database) -> None:
        self.db = db

    def set_http(self, http: HTTPClient) -> None:
        self.http = http

    def set_app_state(self, state: State) -> None:
        self.app_state = state

    def set_ow_sync(self, ow_sync: OWSync) -> None:
        self.ow_sync = ow_sync


class Request(OriginalRequest):
    app: FastAPI

    @property
    def access_token(self) -> Optional[str]:
        token = self.headers.get("Authorization")
        if token is not None and token.lower().startswith("bearer "):
            return str(token[7:])
        return None

    def raise_if_missing_authorization(self) -> str:
        access_token = self.access_token
        if access_token is None:
            raise HTTPException(
                status_code=401,
                detail="Missing authorization",
            )

        return access_token


class APIRoute(OriginalAPIRoute):
    def get_route_handler(
        self,
    ) -> Callable[[StarletteRequest], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: OriginalRequest) -> Response:
            request = Request(request.scope, request.receive)
            return await original_route_handler(request)

        return custom_route_handler
