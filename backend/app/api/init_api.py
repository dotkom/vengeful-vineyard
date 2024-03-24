"""
Sets up the API (FastAPI)
    * Routes
    * Middlewares + CORS
    * Events
"""

import sentry_sdk
import logging
import os

from timeit import default_timer as timer
from typing import Any

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.endpoints import group, punishment, user, statistics
from app.config import OW_GROUP_PERMISSIONS, PERMISSIONS, settings
from app.db.core import Database
from app.http import HTTPClient
from app.state import State
from app.sync import OWSync
from app.utils.permissions import PermissionManager

from . import APIRoute, FastAPI, Request

logging.basicConfig(level=logging.DEBUG if settings.debug else logging.INFO)

if "SENTRY_DSN" in os.environ:
    sentry_sdk.init(
        dsn=os.environ["SENTRY_DSN"],
        enable_tracing=True,
        environment=os.environ.get("SENTRY_ENVIRONMENT") or "DEFAULT"
    )


def init_middlewares(app: FastAPI) -> None:
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next: Any) -> Any:
        start_time = timer()
        response = await call_next(request)
        end_time = timer()
        process_time = end_time - start_time
        response.headers["Process-Time-Ms"] = str(round(process_time * 1000, 2))
        return response

    origins = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        settings.client_origin,
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Compress large responses
    app.add_middleware(GZipMiddleware)


def init_routes(app: FastAPI) -> None:
    app.include_router(user.router)
    app.include_router(group.router)
    app.include_router(punishment.router)
    app.include_router(statistics.router)


def init_events(app: FastAPI, **db_settings: str) -> None:
    @app.on_event("startup")
    async def start_handler() -> None:
        database = Database()
        app.set_db(database)

        http = HTTPClient()
        app.set_http(http)

        app.set_app_state(State())
        app.set_ow_sync(OWSync(app))

        permission_manager = PermissionManager.from_raw_permissions(PERMISSIONS)
        permission_manager.inject_app(app)
        app.set_permission_manager(permission_manager)

        ow_permission_manager = PermissionManager.from_raw_permissions(
            OW_GROUP_PERMISSIONS
        )
        ow_permission_manager.inject_app(app)
        app.set_ow_permission_manager(ow_permission_manager)

        await database.async_init(**db_settings)
        await http.async_init()

    @app.on_event("shutdown")
    async def shutdown_handler() -> None:
        database = app.db
        if database is not None:
            await database.close()

        if app.http is not None:
            await app.http.close()


def init_api(**db_settings: str) -> FastAPI:
    oauth = {
        "clientId": "5rOMfB8Ztegz",
        "appName": "Vengeful Vineyard Docs",
        "usePkceWithAuthorizationCodeGrant": True,
        "scopes": "openid email profile onlineweb4",
    }

    app = FastAPI(
        swagger_ui_init_oauth=oauth,
        swagger_ui_oauth2_redirect_url="/docs/oauth2-redirect",
    )

    app.openapi_version = "3.0.0"
    app.router.route_class = APIRoute
    init_middlewares(app)
    init_routes(app)
    init_events(app, **db_settings)
    return app


asgi_app = init_api()
