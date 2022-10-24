"""Contains methods for syncing users from OW."""

import asyncio
from typing import TYPE_CHECKING, Any, cast

from asyncpg import Pool

from .exceptions import DatabaseIntegrityException, NotFound
from .models.group import GroupCreate
from .models.group_member import GroupMemberCreate
from .models.user import UserCreate, UserUpdate
from .types import GroupId, OWUserId, UserId
from .utils.db import MaybeAcquire

if TYPE_CHECKING:
    from .api import FastAPI


IGNORE_OW_GROUPS = (12,)  # "Komiteer"


class OWSync:
    def __init__(self, app: "FastAPI"):
        self.app = app

    async def sync_for_access_token(self, access_token: str) -> tuple[UserId, OWUserId]:
        ow_user_id = self.app.app_state.get_ow_user_id_by_access_token(access_token)
        if ow_user_id is None:
            ow_profile = await self.app.http.get_ow_profile_by_access_token(
                access_token
            )
            if ow_profile is None:
                raise NotFound

            ow_user_id = cast(OWUserId, ow_profile["id"])
            self.app.app_state.add_access_token(access_token, ow_user_id)

            user_id = await self.create_user_if_not_exists(
                ow_user_id=ow_user_id,
                first_name=ow_profile["first_name"],
                last_name=ow_profile["last_name"],
                email=ow_profile["email"],
            )
            return user_id, ow_user_id

        user = await self.app.db.get_user(
            user_id=ow_user_id,
            is_ow_user_id=True,
            punishments=False,
        )
        return user.user_id, ow_user_id

    async def sync_for_user(
        self,
        ow_user_id: OWUserId,
        user_id: UserId,
        wait_for_updates: bool = True,
    ) -> None:
        groups_data = await self.app.http.get_ow_groups_by_user_id(ow_user_id)
        filtered_groups_data = [
            g for g in groups_data["results"] if g["id"] not in IGNORE_OW_GROUPS
        ]

        tasks = [
            asyncio.create_task(self.sync_group_for_user(ow_user_id, user_id, g))
            for g in filtered_groups_data
        ]

        if wait_for_updates:
            await asyncio.gather(*tasks)
        else:
            # Only wait for the tasks if the user needs to me added or removed from
            # one or more groups.
            db_groups_res = await self.app.db.get_user_groups(user_id)
            db_groups = {g["ow_group_id"]: g for g in db_groups_res if g is not None}

            sum_ow_groups = 0
            for group in filtered_groups_data:
                if group["id"] in db_groups:
                    sum_ow_groups += 1

            # Only wait for the tasks if we need to add or remove the user from one or more groups
            if sum_ow_groups != len(filtered_groups_data):
                await asyncio.gather(*tasks)

    async def create_user_if_not_exists(
        self,
        ow_user_id: OWUserId,
        first_name: str,
        last_name: str,
        email: str,
    ) -> UserId:
        user_create = UserCreate(
            ow_user_id=ow_user_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        res = await self.app.db.insert_or_update_user(user_create)
        return res["id"]

    async def add_user_to_group(
        self,
        group_id: GroupId,
        user_data: dict[str, Any],
        conn: Pool | None = None,
    ) -> None:
        user_create = UserCreate(
            ow_user_id=user_data["user"]["id"],
            first_name=user_data["user"]["first_name"],
            last_name=user_data["user"]["last_name"],
            email=user_data["user"]["email"],
        )

        res = await self.app.db.insert_or_update_user(user_create, conn=conn)
        user_id = res["id"]

        try:
            await self.app.db.insert_user_in_group(
                GroupMemberCreate(
                    group_id=group_id,
                    user_id=user_id,
                    ow_group_user_id=user_data["id"],
                ),
                conn=conn,
            )
        except DatabaseIntegrityException:
            pass

    async def add_users_to_group(
        self,
        group_id: GroupId,
        users_data: list[dict[str, Any]],
        conn: Pool | None = None,
    ) -> None:
        user_creates = {}
        for user_data in users_data:
            user_creates[user_data["user"]["id"]] = UserCreate(
                ow_user_id=user_data["user"]["id"],
                first_name=user_data["user"]["first_name"],
                last_name=user_data["user"]["last_name"],
                email=user_data["user"]["email"],
            )

        res = await self.app.db.insert_or_update_users(
            list(user_creates.values()), conn=conn
        )

        group_member_creates = []
        for user_data in users_data:
            user_id = res[user_data["user"]["id"]]
            group_member_creates.append(
                GroupMemberCreate(
                    group_id=group_id,
                    user_id=user_id,
                    ow_group_user_id=user_data["id"],
                )
            )

        await self.app.db.insert_users_in_group(group_member_creates, conn=conn)

    async def handle_group_update(
        self,
        group_id: GroupId,
        group_users: list[dict[str, Any]],
        member_ids: list[int],
        conn: Pool | None = None,
    ) -> None:
        group_members = await self.app.db.get_group_members_raw(group_id)
        ids = [m["ow_group_user_id"] for m in group_members]

        to_add = [u for u in group_users if u["id"] not in ids]
        to_remove = [
            m["user_id"]
            for m in group_members
            if m["ow_group_user_id"] not in member_ids
        ]
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            if to_add:
                await self.add_users_to_group(
                    group_id,
                    to_add,
                    conn=conn,
                )

            if to_remove:
                await self.app.db.delete_users_from_group(
                    group_id,
                    to_remove,
                    conn=conn,
                )

    async def sync_group_for_user(
        self,
        ow_user_id: OWUserId,
        user_id: UserId,
        group_data: dict[str, Any],
    ) -> None:
        group_users = await self.app.http.get_ow_group_users(group_data["id"])

        image_data = group_data["image"]
        group_create = GroupCreate(
            ow_group_id=group_data["id"],
            name=group_data["name_long"],
            name_short=group_data["name_short"],
            rules="No rules",
            image=image_data["sm"]
            if image_data
            else "NoImage",  # TODO?: Maybe change to something default??
        )

        ow_group_user_id = None
        for group_user in group_users:
            if group_user["user"]["id"] == ow_user_id:
                ow_group_user_id = group_user["id"]
                break

        assert ow_group_user_id is not None

        async with self.app.db.pool.acquire() as conn:
            group_res = await self.app.db.insert_or_update_group(
                group_create,
                conn=conn,
            )
            group_id = group_res["id"]

            group_member_create = GroupMemberCreate(
                group_id=group_id,
                user_id=user_id,
                ow_group_user_id=ow_group_user_id,
            )

            try:
                await self.app.db.insert_user_in_group(
                    group_member_create,
                    conn=conn,
                )
            except DatabaseIntegrityException:
                pass

            action = group_res["action"]
            if action == "CREATE":
                for group_user in group_users:
                    if group_user["user"]["id"] == ow_user_id:
                        continue

                    await self.add_user_to_group(
                        group_id=group_id,
                        user_data=group_user,
                        conn=conn,
                    )

            elif action == "UPDATE":
                await self.handle_group_update(
                    group_id=group_id,
                    group_users=group_users,
                    member_ids=group_data["members"],
                    conn=conn,
                )

                await self.update_users(
                    group_id=group_id,
                    group_users=group_users,
                    conn=conn,
                )

    async def update_user(
        self,
        user_id: UserId,
        user_data: dict[str, Any],
        conn: Pool | None = None,
    ) -> None:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            user_update = UserUpdate(
                user_id=user_id,
                ow_user_id=user_data["user"]["id"],
                first_name=user_data["user"]["first_name"],
                last_name=user_data["user"]["last_name"],
                email=user_data["user"]["email"],
            )
            await self.app.db.update_user(
                user_id,
                user_update,
                conn=conn,
            )

    async def update_users(
        self,
        group_id: GroupId,
        group_users: list[dict[str, Any]],
        conn: Pool | None = None,
    ) -> None:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            db_group_users = await self.app.db.get_raw_group_users(
                group_id=group_id,
                conn=conn,
            )
            mapped = {g["ow_user_id"]: g for g in db_group_users}

            to_update = []
            for group_user_data in group_users:
                group_user = group_user_data["user"]
                db_user = mapped.get(group_user["id"])
                if db_user is None:
                    continue

                keys = ("first_name", "last_name", "email")
                if not any(group_user[key] != db_user[key] for key in keys):
                    continue

                to_update.append(
                    UserUpdate(
                        user_id=db_user["user_id"],
                        ow_user_id=group_user["id"],
                        first_name=group_user["first_name"],
                        last_name=group_user["last_name"],
                        email=group_user["email"],
                    )
                )

            if to_update:
                await self.app.db.update_users(
                    to_update,
                    conn=conn,
                )
