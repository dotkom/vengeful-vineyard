"""
Application settings.

Values can be overridden by environment variables.
VENGEFUL_DATABASE=test.db will set vengeful_database="test.db"
"""
from pathlib import Path

from pydantic import BaseSettings

from app.types import PermissionPrivilege
from app.utils.permissions import ALWAYS, NEVER

ROLES = [
    ["Leder", "group.owner"],
    ["Administrator", "group.admin"],
    ["Straffeansvarlig", "group.moderator"],
    ["Medlem", ""],
]

OW_GROUP_ROLES = ROLES

INDEXED_ROLES = {role: index for index, (_, role) in enumerate(ROLES)}

PERMISSIONS = [
    # Roles
    ["group.owner", []],
    ["group.admin", ["group.owner"]],
    ["group.moderator", ["group.admin"]],
    # Permissions
    ["group.ownership.transfer", ["group.owner"]],
    ["group.delete", ["group.owner"]],
    ["group.edit", ["group.moderator"]],
    ["group.punishment_types.add", ["group.edit"]],
    ["group.punishment_types.delete", ["group.edit"]],
    ["group.punishment_types.edit", ["group.edit"]],
    ["group.members.manage", ["group.admin"]],
    ["group.members.add", ["group.members.manage"]],
    ["group.members.remove", ["group.members.manage"]],
    ["group.punishments.add", ["group.moderator"]],
    ["group.punishments.delete", ["group.moderator"]],
    ["group.punishments.mark_paid", ["group.moderator"]],
    ["group.punishments.mark_unpaid", ["group.moderator"]],
    ["group.join_requests.view", ["group.admin"]],
    ["group.join_requests.accept", ["group.admin"]],
    ["group.join_requests.deny", ["group.admin"]],
    ["group.invite_code.view", ["group.admin"]],
    ["group.invite_code.edit", ["group.admin"]],
]
PERMISSIONS_AS_DICT: dict[PermissionPrivilege, list[PermissionPrivilege]] = dict(
    PERMISSIONS  # type: ignore
)

# OW groups are managed automatically by the sync module. Also everyone should
# have permission to give punishments.
OW_GROUP_PERMISSIONS = [
    # Roles
    ["group.owner", []],
    ["group.admin", ["group.owner"]],
    ["group.moderator", ["group.admin"]],
    # Permissions
    ["group.ownership.transfer", [NEVER]],
    ["group.delete", [NEVER]],
    ["group.edit", ["group.moderator"]],
    ["group.punishment_types.add", ["group.edit"]],
    ["group.punishment_types.delete", ["group.edit"]],
    ["group.punishment_types.edit", ["group.edit"]],
    ["group.members.manage", [NEVER]],
    ["group.members.add", [NEVER]],
    ["group.members.remove", [NEVER]],
    ["group.punishments.add", [ALWAYS]],
    ["group.punishments.delete", ["group.moderator"]],
    ["group.punishments.mark_paid", [ALWAYS]],
    ["group.punishments.mark_unpaid", [ALWAYS]],
    ["group.join_requests.view", [NEVER]],
    ["group.join_requests.accept", [NEVER]],
    ["group.join_requests.deny", [NEVER]],
    ["group.invite_code.view", [NEVER]],
    ["group.invite_code.edit", [NEVER]],
]
OW_GROUP_PERMISSIONS_AS_DICT: dict[
    PermissionPrivilege, list[PermissionPrivilege]
] = dict(
    OW_GROUP_PERMISSIONS  # type: ignore
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
    client_origin: str = "http://localhost:3000"
    debug: bool = True
    ow4_base_url: str = "https://dev.online.ntnu.no"
    auth0_issuer: str = "https://auth.dev.online.ntnu.no"
    auth0_client_id: str = ""
    


settings = Settings()
