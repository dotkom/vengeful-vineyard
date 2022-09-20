import itertools
from typing import AsyncGenerator

import pytest_asyncio
from app.api.init_api import init_api
from asgi_lifespan import LifespanManager
from httpx import AsyncClient

counter = itertools.count().__next__


@pytest_asyncio.fixture(scope="class")
async def client() -> AsyncGenerator[AsyncClient, None]:
    # Need to use a LifespanManager in order for the startup and shutdown event to be
    # called during testing. Otherwise the DB would not be set up for testing.
    app = init_api(database=f"db{counter() + 1}")

    async with LifespanManager(app):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
