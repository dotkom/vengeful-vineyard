"""
Group endpoints
"""
import time
from functools import partial

from emoji import is_emoji
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api import APIRoute, Request, oidc
from app.config import INDEXED_ROLES
from app.exceptions import DatabaseIntegrityException, NotFound, PunishmentTypeNotExists
from app.models.group import Group, GroupPublic, GroupCreate, GroupCreateMinified, GroupSearchResult, InviteCodePatch
from app.models.group_event import GroupEvent, GroupEventCreate
from app.models.group_join_requests import GroupJoinRequest
from app.models.group_member import GroupMemberCreate
from app.models.group_user import GroupUser
from app.models.permission import GroupMemberPermissionPatch
from app.models.punishment import (
    PunishmentCreate,
    PunishmentStreaks,
    TotalPunishmentValue,
)
from app.models.punishment_type import PunishmentTypeCreate, PunishmentTypeRead
from app.types import (
    GroupEventId,
    GroupId,
    PermissionPrivilege,
    PunishmentId,
    PunishmentTypeId,
    UserId,
    InviteCode,
)
from app.utils.pagination import Page, Pagination

router = APIRouter(
    prefix="/groups",
    tags=["Groups"],
    route_class=APIRoute,
)


@router.get(
    "/me",
    response_model=list[Group],
    dependencies=[Depends(oidc)],
)
async def get_my_groups(
    request: Request,
    wait_for_updates: bool = Query(title="Wait for updates", default=True),
    optimistic: bool = Query(title="Optimistic", default=False),
) -> list[Group]:
    app = request.app
    access_token = request.raise_if_missing_authorization()

    if access_token is None:
        raise HTTPException(status_code=401, detail="Ugyldig access token")

    try:
        user_id, ow_user_id = await app.ow_sync.sync_for_access_token(access_token)
    except NotFound as exc:
        raise HTTPException(status_code=401, detail="Ugyldig access token") from exc

    if not optimistic:
        await app.ow_sync.sync_for_user(
            ow_user_id,
            user_id,
            wait_for_updates=wait_for_updates,
        )

    groups = await app.db.users.get_groups(user_id)
    return groups


@router.get(
    "/search",
    response_model=list[GroupSearchResult],
    dependencies=[Depends(oidc)],
)
async def search_groups(
    request: Request,
    query: str = Query(title="Query", default=""),
    limit: int = Query(title="Limit", default=5, ge=1, le=10),
    include_ow_groups: bool = Query(title="Include OW groups", default=True),
) -> list[GroupSearchResult]:
    """
    Endpoint to search for groups.
    """
    request.raise_if_missing_authorization()
    app = request.app

    if len(query) < 1:
        return []

    return await app.db.groups.search(
        query, limit=limit, include_ow_groups=include_ow_groups
    )


@router.get(
    "/{group_id}/users/{user_id}",
    response_model=GroupUser,
    dependencies=[Depends(oidc)],
)
async def get_group_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> GroupUser:
    """
    Endpoint to get a user in the context of a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            requester_user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403, detail="Du er ikke et medlem av gruppen"
            )

        try:
            ret = await app.db.group_users.get(group_id, user_id)
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="Brukeren ble ikke funnet eller er ikke i gruppen",
            ) from exc

        assert isinstance(ret, GroupUser)
        return ret


@router.get(
    "/{group_id}/users/{user_id}/punishmentStreaks",
    response_model=PunishmentStreaks,
    dependencies=[Depends(oidc)],
)
async def get_group_user_punishment_streaks(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> PunishmentStreaks:
    """
    Endpoint to get a user's punishment streaks in the context of a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403, detail="Du er ikke et medlem av gruppen"
            )

        try:
            return await app.db.group_members.get_punishment_streaks(group_id, user_id)
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="Brukeren ble ikke funnet eller er ikke i gruppen",
            ) from exc


@router.get(
    "/{group_id}/users",
    response_model=list[GroupUser],
    dependencies=[Depends(oidc)],
)
async def get_group_users(request: Request, group_id: GroupId) -> list[GroupUser]:
    """
    Endpoint to get all users in a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403, detail="Du er ikke et medlem av gruppen"
            )

        return await app.db.group_users.get_all(group_id, conn=conn)


@router.get(
    "/{group_id}",
    response_model=Group,
    dependencies=[Depends(oidc)],
)
async def get_group(request: Request, group_id: GroupId) -> Group:
    """
    Endpoint to get a specific group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403, detail="Du er ikke et medlem av gruppen"
            )

        try:
            return await app.db.groups.get(group_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc


@router.get(
    "/public_profiles/{group_name_short}",
    response_model=GroupPublic,
    dependencies=[Depends(oidc)],
)
async def get_public_group(request: Request, group_name_short: str) -> GroupPublic:
    """
    Endpoint to get a public group.
    """
    app = request.app

    if request.access_token is not None:
        user_id, _ = await app.ow_sync.sync_for_access_token(request.access_token)
    else:
        user_id = None


    async with app.db.pool.acquire() as conn:
        try:
            return await app.db.groups.get_public_group_profile(group_name_short, user_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc


@router.post("", dependencies=[Depends(oidc)])
async def post_group(
    request: Request,
    group: GroupCreateMinified,
) -> dict[str, GroupId]:
    """
    Endpoint to create a new group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        async with conn.transaction():
            try:
                data = await app.db.groups.insert(
                    GroupCreate.from_minified(group), user_id, conn=conn
                )
            except DatabaseIntegrityException as exc:
                raise HTTPException(status_code=400, detail=exc.detail) from exc

            group_id = data["id"]

            await app.db.groups.insert_member(
                group_id,
                GroupMemberCreate(
                    user_id=user_id,
                    ow_group_user_id=None,
                    active=True,
                ),
                conn=conn,
            )

            await app.db.permissions.insert_permission(
                group_id=group_id,
                user_id=user_id,
                privilege=PermissionPrivilege("group.owner"),
                created_by=None,
                conn=conn,
            )

            return {"id": data["id"]}


@router.patch(
    "/{group_id}",
    dependencies=[Depends(oidc)],
)
async def patch_group(
    request: Request,
    group_id: GroupId,
    group_data: GroupCreateMinified,
) -> dict[str, GroupId]:
    """
    Endpoint to update a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=False, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        permission_manager = app.get_permission_manager(
            is_ow_group=group.ow_group_id is not None
        )
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.edit",
            conn=conn,
        )

        try:
            data = await app.db.groups.update(
                GroupCreate.from_minified(group_data), group_id=group_id, conn=conn
            )
        except DatabaseIntegrityException as exc:
            raise HTTPException(status_code=400, detail=exc.detail) from exc

        return {"id": data["id"]}

@router.patch(
    "/{group_id}/inviteCode",
    dependencies=[Depends(oidc)],
)
async def patch_invite_code(
    request: Request,
    group_id: GroupId,
    invite_code_patch: InviteCodePatch,
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=False, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        permission_manager = app.get_permission_manager(
            is_ow_group=group.ow_group_id is not None
        )
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.invite_code.edit",
            conn=conn,
        )

        invite_code = invite_code_patch.invite_code

        if invite_code == "" or invite_code is not None and invite_code.isspace():
            raise HTTPException(
                status_code=400,
                detail="Invitasjonskoden kan ikke være tom"
            )

        await app.db.groups.update_invite_code(group_id, invite_code, conn=conn)

@router.delete(
    "/{group_id}",
    dependencies=[Depends(oidc)],
)
async def delete_group(
    request: Request,
    group_id: GroupId,
) -> None:
    """
    Endpoint to delete a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=False, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        permission_manager = app.get_permission_manager(
            is_ow_group=group.ow_group_id is not None
        )
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.delete",
            conn=conn,
        )

        await app.db.groups.delete(group_id, conn=conn)


@router.delete(
    "/{group_id}/users/{user_id}",
    dependencies=[Depends(oidc)],
)
async def delete_group_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    """
    Endpoint to remove a user from a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=False, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        is_ow_group = group.ow_group_id is not None
        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)

        if requester_user_id == user_id:
            if is_ow_group:
                raise HTTPException(
                    status_code=400,
                    detail="Du kan ikke forlate en automatisk administrert gruppe",
                )

            members = await app.db.group_members.get_all(group_id, conn=conn)
            if len(members) == 1:
                raise HTTPException(
                    status_code=400,
                    detail="Du kan ikke forlate en gruppe du er den eneste medlemmet i. Slett gruppen i stedet.",
                )

            permissions = await app.db.permissions.get_permission_privileges(
                group_id,
                user_id,
                conn=conn,
            )
            if "group.owner" in permissions:
                raise HTTPException(
                    status_code=400,
                    detail="Du kan ikke forlate en gruppe du er eieren av. Overfør eierskapet til en annen bruker først.",
                )
        else:
            privileges_map = (
                await app.db.permissions.get_permission_privileges_for_multiple(
                    group_id,
                    (user_id, requester_user_id),
                    conn=conn,
                )
            )

            user_roles = privileges_map.get(user_id, [])
            requester_roles = privileges_map.get(requester_user_id, [])

            if not permission_manager.internal_has_permission(
                "group.members.remove", requester_roles
            ):
                raise HTTPException(
                    status_code=403,
                    detail="Du har ikke tilgang til å gjøre dette",
                )

            user_role = user_roles[0] if len(user_roles) > 0 else None
            requester_role = requester_roles[0] if len(requester_roles) > 0 else None

            user_role_index = INDEXED_ROLES.get(user_role, float("inf"))  # type: ignore
            requester_role_index = INDEXED_ROLES.get(requester_role, float("inf"))  # type: ignore

            if requester_role_index >= user_role_index:
                raise HTTPException(
                    status_code=403,
                    detail="Du har ikke tilgang til å gjøre dette mot denne brukeren",
                )

        await app.db.group_members.delete(group_id, user_id, conn=conn)
        await app.db.permissions.remove_all_permissions(group_id, user_id, conn=conn)


@router.post(
    "/{group_id}/users/{user_id}/transferOwnership",
    dependencies=[Depends(oidc)],
)
async def transfer_ownership(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    """
    Endpoint to transfer ownership of a group to another user.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=True, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        is_ow_group = group.ow_group_id is not None
        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            requester_user_id,
            "group.ownership.transfer",
            conn=conn,
        )

        await app.db.permissions.remove_all_permissions_for_multiple_users(
            group_id, [user_id, requester_user_id], conn=conn
        )
        await app.db.permissions.insert_permissions_for_multiple_users(
            group_id,
            [
                (user_id, PermissionPrivilege("group.owner")),
                (requester_user_id, PermissionPrivilege("group.admin")),
            ],
            conn=conn,
        )


@router.patch(
    "/{group_id}/users/{user_id}/permissions",
    dependencies=[Depends(oidc)],
)
async def patch_group_user_permissions(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    permissions_patch: GroupMemberPermissionPatch,
) -> None:
    """
    Endpoint to update a user's permissions in a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=True, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        is_ow_group = group.ow_group_id is not None

        if is_ow_group:
            raise HTTPException(
                status_code=400,
                detail="You cannot edit permissions in an OW group",
            )

        privileges_map = (
            await app.db.permissions.get_permission_privileges_for_multiple(
                group_id,
                (user_id, requester_user_id),
                conn=conn,
            )
        )

        user_roles = privileges_map.get(user_id, [])
        requester_roles = privileges_map.get(requester_user_id, [])

        if not app.permission_manager.internal_has_permission(
            "group.members.manage", requester_roles
        ):
            raise HTTPException(
                status_code=403,
                detail="Du har ikke tilgang til å gjøre dette",
            )

        user_role = user_roles[0] if len(user_roles) > 0 else None
        requester_role = requester_roles[0] if len(requester_roles) > 0 else None

        user_role_index = INDEXED_ROLES.get(user_role, float("inf"))  # type: ignore
        requester_role_index = INDEXED_ROLES.get(requester_role, float("inf"))  # type: ignore

        if requester_role_index > user_role_index:
            raise HTTPException(
                status_code=403,
                detail="Du har ikke tilgang til å gjøre dette mot denne brukeren",
            )

        if user_role == "group.owner":
            raise HTTPException(
                status_code=400,
                detail="Du kan ikke endre rettighetene til eieren av en gruppe",
            )

        target_role_index = INDEXED_ROLES.get(permissions_patch.privilege, float("inf"))

        if requester_role_index >= target_role_index:
            raise HTTPException(
                status_code=403,
                detail="Du har ikke tilgang til å gi denne rettigheten til denne brukeren",
            )

        await app.db.permissions.remove_all_permissions(
            group_id,
            user_id,
            conn=conn,
        )

        if permissions_patch.privilege in INDEXED_ROLES:
            await app.db.permissions.insert_permission(
                group_id,
                user_id,
                permissions_patch.privilege,
                created_by=requester_user_id,
                conn=conn,
            )


@router.post(
    "/{group_id}/punishmentTypes",
    dependencies=[Depends(oidc)],
)
async def add_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type: PunishmentTypeCreate,
) -> PunishmentTypeRead:
    """
    Endpoint to create a custom punishment type for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishment_types.add",
            conn=conn,
        )

        if not is_emoji(punishment_type.emoji):
            raise HTTPException(
                status_code=400,
                detail="Emojien er ugyldig",
            )

        try:
            return await app.db.punishment_types.insert(
                group_id,
                punishment_type,
                user_id,
                conn=conn,
            )
        except DatabaseIntegrityException as exc:
            raise HTTPException(status_code=400, detail=exc.detail) from exc


@router.patch(
    "/{group_id}/punishmentTypes/{punishment_type_id}",
    dependencies=[Depends(oidc)],
)
async def patch_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type_id: PunishmentTypeId,
    punishment_type: PunishmentTypeCreate,
) -> PunishmentTypeRead:
    """
    Endpoint to update a custom punishment type for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishment_types.edit",
            conn=conn,
        )

        if not is_emoji(punishment_type.emoji):
            raise HTTPException(
                status_code=400,
                detail="Emojien er ugyldig",
            )

        try:
            return await app.db.punishment_types.update(
                group_id,
                punishment_type_id,
                punishment_type,
                conn=conn,
            )
        except PunishmentTypeNotExists as exc:
            raise HTTPException(
                status_code=400,
                detail="Straffetypen eksisterer ikke i gruppens kontekst",
            ) from exc


@router.delete(
    "/{group_id}/punishmentTypes/{punishment_type_id}",
    dependencies=[Depends(oidc)],
)
async def delete_punishment_type_to_group(
    request: Request,
    group_id: GroupId,
    punishment_type_id: PunishmentTypeId,
) -> None:
    """
    Endpoint to remove a custom punishment type for a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishment_types.delete",
            conn=conn,
        )

        try:
            await app.db.punishment_types.delete(
                group_id,
                punishment_type_id,
                conn=conn,
            )
        except PunishmentTypeNotExists as exc:
            raise HTTPException(
                status_code=400,
                detail="Straffetypen eksisterer ikke i gruppens kontekst",
            ) from exc


@router.post(
    "/{group_id}/users/{user_id}/punishments",
    dependencies=[Depends(oidc)],
)
async def add_punishment(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
    punishments: list[PunishmentCreate],
) -> dict[str, list[PunishmentId]]:
    """
    Endpoint to add a punishment to a user in the context of a specific group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    created_by, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=True, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        """
        is_ow_group = group.ow_group_id is not None
        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            created_by,
            "group.punishments.add",
            conn=conn,
        )
        """

        res = await app.db.groups.is_in_group(
            created_by,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=400,
                detail="Brukeren er ikke et medlem av gruppen",
            )

        # Check that no punishment have too high amount
        for punishment in punishments:
            if punishment.amount > 9:
                raise HTTPException(
                    status_code=400,
                    detail="Du kan ikke gi så mange straffer på en gang",
                )

        try:
            return await app.db.punishments.insert_multiple(
                group_id,
                user_id,
                created_by,
                punishments,
                conn=conn,
            )
        except DatabaseIntegrityException as exc:
            raise HTTPException(status_code=400, detail=exc.detail) from exc
        except PunishmentTypeNotExists as exc:
            raise HTTPException(status_code=400, **exc.kwargs) from exc


@router.delete(
    "/{group_id}/punishments/{punishment_id}",
    tags=["Punishment"],
    dependencies=[Depends(oidc)],
)
async def delete_punishment(
    request: Request,
    group_id: GroupId,
    punishment_id: PunishmentId,
) -> None:
    """
    Endpoint to delete a punishment.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, include_members=True, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        is_ow_group = group.ow_group_id is not None
        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishments.delete",
            conn=conn,
        )

        try:
            await app.db.punishments.delete(
                punishment_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Straffen ble ikke funnet"
            ) from exc


@router.post(
    "/{group_id}/punishments/paid",
    dependencies=[Depends(oidc)],
)
async def post_mark_punishments_as_paid(
    request: Request,
    group_id: GroupId,
    punishment_ids: list[PunishmentId],
) -> None:
    """
    Endpoint to mark punishments as paid.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )
        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishments.mark_paid",
            conn=conn,
        )

        try:
            await app.db.punishments.mark_multiple_as_paid(
                group_id,
                punishment_ids,
                user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="En eller flere av straffene ble ikke funnet i gruppens kontekst",
            ) from exc


@router.post(
    "/{group_id}/punishments/unpaid",
    dependencies=[Depends(oidc)],
)
async def post_mark_punishments_as_unpaid(
    request: Request,
    group_id: GroupId,
    punishment_ids: list[PunishmentId],
) -> None:
    """
    Endpoint to mark punishments as unpaid.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )
        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.punishments.mark_unpaid",
            conn=conn,
        )

        try:
            await app.db.punishments.mark_multiple_as_unpaid(
                group_id,
                punishment_ids,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="En eller flere av straffene ble ikke funnet i gruppens kontekst",
            ) from exc


@router.post(
    "/{group_id}/users/{user_id}/punishments/paid/all",
    dependencies=[Depends(oidc)],
)
async def post_mark_all_punishments_as_paid_for_user(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    """
    Endpoint to mark all punishments as paid for a given user.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        try:
            group = await app.db.groups.get(group_id, conn=conn)
        except NotFound as exc:
            raise HTTPException(
                status_code=404, detail="Gruppen ble ikke funnet"
            ) from exc

        requester_is_group_member = False
        user_is_group_member = False
        for member in group.members:
            if member.user_id == requester_user_id:
                requester_is_group_member = True
            if member.user_id == user_id:
                user_is_group_member = True

            if requester_is_group_member and user_is_group_member:
                break

        if not requester_is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        if not user_is_group_member:
            raise HTTPException(
                status_code=400,
                detail="Brukeren er ikke et medlem av gruppen",
            )

        is_ow_group = group.ow_group_id is not None
        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            requester_user_id,
            "group.punishments.mark_paid",
            conn=conn,
        )

        try:
            await app.db.punishments.mark_all_punishments_as_paid_for_user(
                group_id,
                user_id,
                requester_user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="Kunne ikke finne noen ubetalte straffer for denne brukeren",
            ) from exc


@router.get(
    "/{group_id}/events",
    dependencies=[Depends(oidc)],
    response_model=Page[GroupEvent],
)
async def get_group_events(
    request: Request,
    group_id: GroupId,
    page: int = Query(title="Page number", default=0, ge=0),
    page_size: int = Query(title="Page size", default=30, ge=1, le=50),
) -> Page[GroupEvent]:
    """
    Endpoint to get the events of a group.
    """
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å se denne informasjonen",
            )

    pagination = Pagination[GroupEvent](
        request=request,
        total_coro=partial(app.db.group_events.get_count, group_id),
        results_coro=partial(app.db.group_events.get_all_with_offset, group_id),
        page=page,
        page_size=page_size,
    )
    return await pagination.paginate()


@router.post(
    "/{group_id}/events",
    dependencies=[Depends(oidc)],
)
async def post_group_event(
    request: Request, group_id: GroupId, event: GroupEventCreate
) -> dict[str, GroupEventId]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    if event.end_time is not None:
        if event.start_time >= event.end_time:
            raise HTTPException(
                status_code=400,
                detail="Starttidsunktet må være før sluttidspunktet",
            )

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        res = await app.db.group_events.exists_between(
            group_id,
            event.start_time,
            event.end_time,
            conn=conn,
        )
        if res:
            raise HTTPException(
                status_code=400,
                detail="Det finnes allerede et arrangement i dette tidsrommet",
            )

        return await app.db.group_events.insert(
            group_id,
            event,
            user_id,
            conn=conn,
        )


@router.delete(
    "/{group_id}/events/{event_id}",
    dependencies=[Depends(oidc)],
)
async def delete_group_event(
    request: Request, group_id: GroupId, event_id: GroupEventId
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        await app.db.group_events.delete(
            event_id,
            conn=conn,
        )


@router.get(
    "/{group_id}/totalPunishmentValue",
    dependencies=[Depends(oidc)],
    response_model=TotalPunishmentValue,
)
async def total_punishment_value(
    request: Request,
    group_id: GroupId,
) -> TotalPunishmentValue:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        res = await app.db.groups.is_in_group(
            user_id,
            group_id,
            conn=conn,
        )
        if not res:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å se denne informasjonen",
            )

        return await app.db.groups.get_total_punishment_value(
            group_id,
            conn=conn,
        )


@router.get(
    "/{group_id}/joinRequests",
    dependencies=[Depends(oidc)],
)
async def get_group_join_requests(
    request: Request,
    group_id: GroupId,
) -> list[GroupJoinRequest]:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å se denne informasjonen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            user_id,
            "group.join_requests.view",
            conn=conn,
        )

        return await app.db.group_join_requests.get_all(
            group_id,
            conn=conn,
        )


join_request_cooldowns = {}


@router.post(
    "/{group_id}/joinRequests",
    dependencies=[Depends(oidc)],
)
async def create_group_join_request(
    request: Request,
    group_id: GroupId,
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_in_group = await app.db.groups.combined_group_check(
            group_id,
            user_id,
            conn=conn,
        )

        if is_in_group:
            raise HTTPException(
                status_code=400,
                detail="Du er allerede medlem av denne gruppen",
            )

        if is_ow_group:
            raise HTTPException(
                status_code=400,
                detail="Du kan ikke sende en forespørsel om å bli medlem av en automatisk administrert gruppe",
            )

        try:
            await app.db.group_join_requests.get(
                group_id,
                user_id,
                conn=conn,
            )
        except NotFound:
            pass
        else:
            raise HTTPException(
                status_code=400,
                detail="Du har allerede sendt en forespørsel om å bli medlem av denne gruppen",
            )

        if user_id in join_request_cooldowns:
            cooldown_time = time.time() - join_request_cooldowns[user_id]

            if cooldown_time < 30:
                raise HTTPException(
                    status_code=400,
                    detail="Vent 30 sekunder før du sender en ny forespørsel",
                )

        join_request_cooldowns[user_id] = time.time()

        await app.db.group_join_requests.insert(
            group_id,
            user_id,
            conn=conn,
        )


@router.post(
    "/{group_id}/joinRequests/{user_id}/accept",
    dependencies=[Depends(oidc)],
)
async def accept_group_join_request(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            requester_user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            requester_user_id,
            "group.join_requests.accept",
            conn=conn,
        )

        try:
            await app.db.group_join_requests.delete(
                group_id,
                user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="Medlemsforespørselen ble ikke funnet",
            ) from exc

        await app.db.groups.insert_member(
            group_id,
            GroupMemberCreate(user_id=user_id, ow_group_user_id=None, active=True),
            conn=conn,
        )


@router.post(
    "/{group_id}/joinGroup/{invite_code}",
    dependencies=[Depends(oidc)],
)
async def join_group(
    request: Request,
    group_id: GroupId,
    invite_code: InviteCode,
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        group = await app.db.groups.get(group_id, invite_code=invite_code, include_members=False, conn=conn)

        if not group:
            raise HTTPException(
                status_code=403,
                detail="Invitasjonskoden er ikke gyldig for denne gruppen",
            )
        
        if group.ow_group_id is not None:
            raise HTTPException(
                status_code=403,
                detail="Du kan ikke automatisk bli medlem i en offentlig gruppe",
            )

        await app.db.groups.insert_member(
            group_id,
            GroupMemberCreate(user_id=requester_user_id, ow_group_user_id=None, active=True),
            conn=conn,
        )

        try:
            await app.db.group_join_requests.delete(
                group_id,
                requester_user_id,
                conn=conn,
            )
        except NotFound:
            pass

@router.post(
    "/{group_id}/joinRequests/{user_id}/deny",
    dependencies=[Depends(oidc)],
)
async def deny_group_join_request(
    request: Request,
    group_id: GroupId,
    user_id: UserId,
) -> None:
    access_token = request.raise_if_missing_authorization()

    app = request.app
    requester_user_id, _ = await app.ow_sync.sync_for_access_token(access_token)

    async with app.db.pool.acquire() as conn:
        is_ow_group, is_group_member = await app.db.groups.combined_group_check(
            group_id,
            requester_user_id,
            conn=conn,
        )

        if not is_group_member:
            raise HTTPException(
                status_code=403,
                detail="Du må være et medlem av gruppen for å utføre denne handlingen",
            )

        permission_manager = app.get_permission_manager(is_ow_group=is_ow_group)
        await permission_manager.raise_if_missing_permission(
            group_id,
            requester_user_id,
            "group.join_requests.deny",
            conn=conn,
        )

        try:
            await app.db.group_join_requests.delete(
                group_id,
                user_id,
                conn=conn,
            )
        except NotFound as exc:
            raise HTTPException(
                status_code=404,
                detail="Medlemsforespørselen ble ikke funnet",
            ) from exc
