"""API related functions and classes."""

from typing import Any, Callable, Coroutine
from fastapi import Response
from fastapi import Request as OriginalRequest
from fastapi import FastAPI as OriginalFastAPI
from fastapi.routing import APIRoute
from app.db import Database
from starlette.requests import Request as StarletteRequest


__all__ = (
    'FastAPI',
    'Request',
    'ModifiedRoute',
)


class FastAPI(OriginalFastAPI):
    db: Database

    def set_db(self, db: Database) -> None:
        self.db = db


class Request(OriginalRequest):
    app: FastAPI


class ModifiedRoute(APIRoute):
    def get_route_handler(self) -> Callable[[StarletteRequest], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: OriginalRequest) -> Response:
            request = Request(request.scope, request.receive)
            return await original_route_handler(request)

        return custom_route_handler
