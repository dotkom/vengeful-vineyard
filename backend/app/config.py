from pydantic import BaseSettings


class Settings(BaseSettings):
    vengeful_database: str
    max_punishment_types: int = 20
    max_groups_per_user: int = 20
    max_active_punishments_per_group: int = 1000
    max_group_members: int = 100


settings = Settings()
