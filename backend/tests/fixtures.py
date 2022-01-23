import asyncio
from asyncio import AbstractEventLoop
from typing import AsyncGenerator, Generator

import pytest
from app.api.init_api import asgi_app
from app.db import reconnect_db
from httpx import AsyncClient


@pytest.fixture(scope="class")
def event_loop() -> Generator[AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="class")
async def client() -> AsyncGenerator[AsyncClient, None]:
    reconnect_db()
    async_client = AsyncClient(app=asgi_app, base_url="http://test")
    yield async_client
    await async_client.aclose()
