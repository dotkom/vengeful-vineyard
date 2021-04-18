from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient

from app.main import app, get_db
from app.database import Base
from app import models

import pytest
import os


@pytest.fixture(scope="class")
def client():
    try:
        os.remove("test.db")
    except Exception:
        pass
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    c = AsyncClient(app=app, base_url="http://test")
    return c
