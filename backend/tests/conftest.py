import asyncio
from asyncio import AbstractEventLoop
from typing import Generator

import pytest_asyncio


@pytest_asyncio.fixture(scope="session")
def event_loop() -> Generator[AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
