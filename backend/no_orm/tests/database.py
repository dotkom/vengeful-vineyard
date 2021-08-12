import os

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.db import reconnect_db
from app.main import app


@pytest.fixture(scope="class")
def client():
    reconnect_db()
    c = AsyncClient(app=app, base_url="http://test")
    return c
