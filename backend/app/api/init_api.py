"""
Sets up the API (FastAPI)
    * Routes
    * Middlewares + CORS
"""

import logging
from timeit import default_timer as timer
from typing import Any

from app.api.endpoints import group, punishment, user
from app.config import settings
from app.db import load_db_migrations
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

logging.basicConfig(level=logging.DEBUG if settings.debug else logging.INFO)


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


def init_api() -> FastAPI:
    load_db_migrations()
    app = FastAPI()
    init_middlewares(app)
    init_routes(app)
    return app


asgi_app = init_api()
