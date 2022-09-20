import random
import string
from typing import Any

import pytest
from app.types import GroupId, UserId
from tests.fixtures import client
from tests.rest import rest_create_group, rest_create_user, rest_join_group


class TestManyGroups:
    groups = 25
    users = 100

    @pytest.mark.asyncio
    async def test_many_groups_many_users(self, client: Any) -> None:
        for group_id in range(1, self.groups + 1):
            response = await rest_create_group(client, f"group{group_id}")
            assert response.status_code == 200
        for user_id in range(1, self.users + 1):
            user = {
                "first_name": "user",
                "last_name": f"{user_id}",
                "email": "".join(
                    random.choices(string.ascii_uppercase + string.digits, k=10)
                ),
            }
            response = await rest_create_user(client, user)
            assert response.status_code == 200

        for group_id in range(1, self.groups + 1):
            response = await rest_join_group(
                client, GroupId(group_id), UserId(random.randint(1, self.users))
            )
            assert response.status_code == 200
