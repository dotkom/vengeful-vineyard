"""Handles state and cache related operations."""

from .types import OWUserId


class State:
    def __init__(self) -> None:
        self.access_tokens_to_ow_user_ids: dict[str, OWUserId] = {}
        self.ow_user_ids_to_access_tokens: dict[OWUserId, str] = {}

    def add_access_token(self, access_token: str, user_id: OWUserId) -> None:
        to_remove = self.ow_user_ids_to_access_tokens.get(user_id)

        self.access_tokens_to_ow_user_ids[access_token] = user_id
        self.ow_user_ids_to_access_tokens[user_id] = access_token

        if to_remove is not None:
            del self.access_tokens_to_ow_user_ids[to_remove]

    def get_ow_user_id_by_access_token(self, access_token: str) -> OWUserId | None:
        return self.access_tokens_to_ow_user_ids.get(access_token)

    def get_access_token_by_ow_user_id(self, user_id: OWUserId) -> str | None:
        return self.ow_user_ids_to_access_tokens.get(user_id)
