"""Contains methods for syncing users from OW."""

import asyncio
import sentry_sdk
from collections import defaultdict
from typing import TYPE_CHECKING, Any, Optional, cast

from asyncpg import Pool

from .exceptions import DatabaseIntegrityException, NotFound
from .models.group import GroupCreate
from .models.group_member import GroupMember, GroupMemberCreate, GroupMemberUpdate
from .models.user import UserCreate, UserUpdate
from .types import GroupId, OWUserId, PermissionPrivilege, UserId
from .utils.db import MaybeAcquire

if TYPE_CHECKING:
    from .api import FastAPI


IGNORE_OW_GROUPS = (12,)  # "Komiteer"


OW_GROUP_ROLES = {
    1063: "leader",
    1064: "deputy_leader",
    1065: "treasurer",
    1069: "chief_editor",
    1079: "board_member",
}


OW_GROUP_ROLES_TO_PERMISSIONS: dict[int, tuple[str, ...]] = {
    1063: ("group.owner",),
    1064: ("group.admin",),
}


class OWSync:
    def __init__(self, app: "FastAPI"):
        self.app = app

    async def sync_for_access_token(
        self,
        access_token: str,
        *,
        conn: Optional[Pool] = None,
    ) -> tuple[UserId, OWUserId]:
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
                conn=conn,
            )
            return user_id, ow_user_id

        user = await self.app.db.users.get(
            user_id=ow_user_id,
            is_ow_user_id=True,
            conn=conn,
        )
        return user.user_id, ow_user_id

    async def sync_for_user(
        self,
        ow_user_id: OWUserId,
        user_id: UserId,
        wait_for_updates: bool = True,
    ) -> None:
        try:
            groups_data = await self.app.http.get_ow_groups_by_user_id(ow_user_id)
            filtered_groups_data = [
                g
                for g in groups_data["results"]
                if g["id"] not in IGNORE_OW_GROUPS
                and g["group_type"] in ("committee", "node_committee")
            ]

            tasks = [
                asyncio.create_task(self.sync_group_for_user(ow_user_id, g))
                for g in filtered_groups_data
            ]

            if wait_for_updates:
                await asyncio.gather(*tasks)
            else:
                # Only wait for the tasks if the user needs to me added or removed from
                # one or more groups.
                db_groups_res = await self.app.db.users.get_groups(user_id)
                db_groups = {g.ow_group_id: g for g in db_groups_res if g is not None}

                sum_ow_groups = 0
                for group in filtered_groups_data:
                    if group.id in db_groups:
                        sum_ow_groups += 1

                # Only wait for the tasks if we need to add or remove the user from one or more groups
                if sum_ow_groups != len(filtered_groups_data):
                    await asyncio.gather(*tasks)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            print("Error reported to Sentry")

    async def create_user_if_not_exists(
        self,
        ow_user_id: OWUserId,
        first_name: str,
        last_name: str,
        email: str,
        *,
        conn: Optional[Pool] = None,
    ) -> UserId:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            user_create = UserCreate(
                ow_user_id=ow_user_id,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )
            res = await self.app.db.users.upsert(user_create, conn=conn)
            return res["id"]

    async def add_user_to_group(
        self,
        group_id: GroupId,
        user_data: dict[str, Any],
        conn: Optional[Pool] = None,
    ) -> None:
        user_create = UserCreate(
            ow_user_id=user_data["user"]["id"],
            first_name=user_data["user"]["first_name"],
            last_name=user_data["user"]["last_name"],
            email=user_data["user"]["email"],
        )

        res = await self.app.db.users.upsert(user_create, conn=conn)
        user_id = res["id"]

        try:
            await self.app.db.groups.insert_member(
                group_id,
                GroupMemberCreate(
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
        conn: Optional[Pool] = None,
    ) -> list[GroupMember]:
        user_creates = {}
        for user_data in users_data:
            user_creates[user_data["user"]["id"]] = UserCreate(
                ow_user_id=user_data["user"]["id"],
                first_name=user_data["user"]["first_name"],
                last_name=user_data["user"]["last_name"],
                email=user_data["user"]["email"],
            )

        res = await self.app.db.users.upsert_multiple(
            list(user_creates.values()), conn=conn
        )

        group_member_creates = []
        for user_data in users_data:
            user_id = res[user_data["user"]["id"]]
            group_member_creates.append(
                GroupMemberCreate(
                    user_id=user_id,
                    ow_group_user_id=user_data["id"],
                )
            )

        return await self.app.db.groups.insert_members(
            group_id, group_member_creates, conn=conn
        )

    def map_roles(self, roles: list[int]) -> list[PermissionPrivilege]:
        _roles = []
        for role in roles:
            mapped = OW_GROUP_ROLES_TO_PERMISSIONS.get(role)
            if mapped is not None:
                for p in mapped:
                    _roles.append(PermissionPrivilege(p))

        return _roles

    async def handle_initial_group_permissions(
        self,
        group_id: GroupId,
        members: list[GroupMember],
        group_users: list[dict[str, Any]],
        conn: Optional[Pool] = None,
    ) -> None:
        ids_map = {m.ow_group_user_id: m.user_id for m in members}
        privileges = []
        for u in group_users:
            user_id = ids_map.get(u["id"])
            if user_id is not None:
                for role in self.map_roles(u["roles"]):
                    privileges.append((user_id, role))

        if privileges:
            await self.app.db.permissions.insert_permissions_for_multiple_users(
                group_id,
                privileges,
                conn=conn,
            )

    async def handle_group_update(
        self,
        group_id: GroupId,
        group_users: list[dict[str, Any]],
        member_ids: list[int],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            group_members = await self.app.db.group_members.get_all_raw(
                group_id, conn=conn
            )
            id_map = {m["ow_group_user_id"]: m["user_id"] for m in group_members}

            to_add = [u for u in group_users if u["id"] not in id_map]
            to_remove = [
                m["user_id"]
                for m in group_members
                if m["ow_group_user_id"] not in member_ids
            ]

            added_members = []
            if to_add:
                added_members = await self.add_users_to_group(
                    group_id,
                    to_add,
                    conn=conn,
                )

            if to_remove:
                await self.app.db.group_members.delete_multiple(
                    group_id,
                    to_remove,
                    conn=conn,
                )

            updated_id_map = {k: v for k, v in id_map.items() if v not in to_remove}
            updated_id_map.update(
                {m.ow_group_user_id: m.user_id for m in added_members}
            )

            privileges = {
                updated_id_map[u["id"]]: self.map_roles(u["roles"])
                for u in group_users
                if u["id"] in updated_id_map
            }

            db_permissions = (
                await self.app.db.permissions.get_auto_managed_permissions_for_group(
                    group_id,
                    conn=conn,
                )
            )

            db_permissions_map = defaultdict(list)
            for role in db_permissions:
                db_permissions_map[role.user_id].append(role.privilege)

            privileges_to_add = []
            for user_id, _privileges in privileges.items():
                for privilege in _privileges:
                    if privilege not in db_permissions_map[user_id]:
                        privileges_to_add.append((user_id, privilege))

            privileges_to_remove = []
            for user_id, _privileges in db_permissions_map.items():
                for privilege in _privileges:
                    if privilege not in privileges.get(user_id, []):
                        privileges_to_remove.append((user_id, privilege))

            if privileges_to_add:
                await self.app.db.permissions.insert_permissions_for_multiple_users(
                    group_id,
                    privileges_to_add,
                    conn=conn,
                )

            if privileges_to_remove:
                await self.app.db.permissions.remove_permissions_for_multiple_users(
                    group_id,
                    privileges_to_remove,
                    conn=conn,
                )

    async def sync_group_for_user(
        self,
        ow_user_id: OWUserId,
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
            group_res = await self.app.db.groups.insert_or_update(
                group_create,
                created_by=None,
                conn=conn,
            )
            group_id = group_res["id"]

            action = group_res["action"]
            if action == "CREATE":
                members = await self.add_users_to_group(
                    group_id,
                    [u for u in group_users if u["user"]["id"] != ow_group_user_id],
                    conn=conn,
                )
                await self.handle_initial_group_permissions(
                    group_id,
                    members,
                    group_users,
                    conn=conn,
                )

            elif action == "UPDATE":
                await self.handle_group_update(
                    group_id=group_id,
                    group_users=group_users,
                    member_ids=group_data["members"],
                    conn=conn,
                )

                await self.update_multiple(
                    group_id=group_id,
                    group_users=group_users,
                    conn=conn,
                )

    async def update_user(
        self,
        user_id: UserId,
        user_data: dict[str, Any],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            user_update = UserUpdate(
                user_id=user_id,
                ow_user_id=user_data["user"]["id"],
                first_name=user_data["user"]["first_name"],
                last_name=user_data["user"]["last_name"],
                email=user_data["user"]["email"],
            )
            await self.app.db.users.update(
                user_id,
                user_update,
                conn=conn,
            )

    async def update_multiple(
        self,
        group_id: GroupId,
        group_users: list[dict[str, Any]],
        conn: Optional[Pool] = None,
    ) -> None:
        async with MaybeAcquire(conn, self.app.db.pool) as conn:
            db_group_users = await self.app.db.group_users.get_all_raw(
                group_id=group_id,
                conn=conn,
            )
            mapped = {g["ow_user_id"]: g for g in db_group_users}

            users_to_update = []
            group_members_to_update = []
            for group_user_data in group_users:
                group_user = group_user_data["user"]
                db_user = mapped.get(group_user["id"])
                if db_user is None:
                    continue

                keys = ("first_name", "last_name", "email")
                if any(group_user[key] != db_user[key] for key in keys):
                    users_to_update.append(
                        UserUpdate(
                            user_id=db_user["user_id"],
                            ow_user_id=group_user["id"],
                            first_name=group_user["first_name"],
                            last_name=group_user["last_name"],
                            email=group_user["email"],
                        )
                    )

                if (
                    group_user_data["is_retired"] == db_user["active"]
                ):  # They are opposite, so update if they match
                    group_members_to_update.append(
                        GroupMemberUpdate(
                            user_id=db_user["user_id"],
                            ow_group_user_id=group_user_data["id"],
                            active=not group_user_data["is_retired"],
                        )
                    )

            if users_to_update:
                await self.app.db.users.update_multiple(
                    users_to_update,
                    conn=conn,
                )

            if group_members_to_update:
                await self.app.db.group_members.update_multiple(
                    group_id,
                    group_members_to_update,
                    conn=conn,
                )
