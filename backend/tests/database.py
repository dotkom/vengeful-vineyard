from typing import Any

import pytest
from httpx import AsyncClient

from app.db import reconnect_db
from app.main import app


@pytest.fixture(scope="class")
def client() -> Any:
    reconnect_db()
    c = AsyncClient(app=app, base_url="http://test")
    return c
