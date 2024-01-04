"""
Application settings.

Values can be overridden by environment variables.
VENGEFUL_DATABASE=test.db will set vengeful_database="test.db"
"""
from pathlib import Path

from pydantic import BaseSettings

ROLES = (
    ("Group Owner", "group.owner"),
    ("Group Admin", "group.admin"),
    ("Group Moderator", "group.moderator"),
)

PERMISSIONS = (
    # Roles
    ("group.owner",),
    ("group.admin", ("group.owner",)),
    ("group.moderator", ("group.admin",)),
    # Permissions
    ("group.members.manage", ("group.admin",)),
    ("group.punishments.add", ("group.moderator",)),
    ("group.punishments.remove", ("group.moderator",)),
)


class Settings(BaseSettings):
    vengeful_database: str = ":memory:"
    postgres_host: str = "db"  # docker-compose service name
    postgres_port: int = 5432
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
