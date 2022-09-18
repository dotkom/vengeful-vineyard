import asyncio
from asyncio import AbstractEventLoop
from typing import AsyncGenerator, Generator

import pytest_asyncio
from app.api.init_api import asgi_app
from asgi_lifespan import LifespanManager
from httpx import AsyncClient


@pytest_asyncio.fixture(scope="class")
def event_loop() -> Generator[AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="class")
async def client() -> AsyncGenerator[AsyncClient, None]:
    # Need to use a LifespanManager in order for the startup and shutdown event to be
    # called during testing. Otherwise the DB would not be set up for testing.
    async with LifespanManager(asgi_app):
        async with AsyncClient(app=asgi_app, base_url="http://test") as ac:
            yield ac
