"""
Application settings.

Values can be overridden by environment variables.
VENGEFUL_DATABASE=test.db will set vengeful_database="test.db"
"""
from pathlib import Path

from pydantic import BaseSettings


class Settings(BaseSettings):
    vengeful_database: str = ":memory:"
    postgres_host: str = "127.0.0.1"
    postgres_port: int = 5433
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "dev"
    max_punishment_types: int = 10
    max_groups_per_user: int = 20
    max_active_punishments_per_group: int = 1000
    max_group_members: int = 300
    migrations_directory: Path = Path("app/migrations")
    debug: bool = True


settings = Settings()
