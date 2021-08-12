import os

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.db import reconnect
from app.main import app


@pytest.fixture(scope="class")
def client():
    reconnect()
    # try:
    #    os.remove("test.db")
    # except Exception:
    #    pass
    c = AsyncClient(app=app, base_url="http://test")
    return c
