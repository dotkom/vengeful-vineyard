from typing import TYPE_CHECKING, Iterable, Optional, Sequence, Union

import networkx as nx
from asyncpg import Pool
from fastapi import HTTPException

from app.exceptions import NotFound
from app.types import GroupId, PermissionPrivilege, UserId

if TYPE_CHECKING:
    from app.api import FastAPI

StringAndOptionalIterable = Union[Sequence[str], tuple[str, Iterable[str]]]


class PermissionManager:
    def __init__(self, graph: nx.DiGraph) -> None:
        self._graph = graph
        self._tc = nx.transitive_closure(graph, reflexive=True)

    def inject_app(self, app: "FastAPI") -> None:
        self.app = app

    @staticmethod
    def build_graph_from_raw_permissions(
        raw_permissions: Iterable[StringAndOptionalIterable],
    ) -> nx.DiGraph:
        dag = nx.DiGraph()

        for permission in raw_permissions:
            if len(permission) == 1:
                dag.add_node(permission[0])
            else:
                for vertex in permission[1]:
                    dag.add_edge(permission[0], vertex)

        if any(nx.simple_cycles(dag)):
            raise ValueError("Permission tree has a cycle")

        return dag

    @classmethod
    def from_raw_permissions(
        cls, raw_permissions: Iterable[StringAndOptionalIterable]
    ) -> "PermissionManager":
        return cls(cls.build_graph_from_raw_permissions(raw_permissions))

    def permission_exists(self, permission: str) -> bool:
        ret = self._graph.has_node(permission)
        assert isinstance(ret, bool)  # mypy smh
        return ret

    def permission_has_descendant(self, permission: str, descendant: str) -> bool:
        ret = self._tc.has_edge(permission, descendant)
        assert isinstance(ret, bool)  # mypy smh
        return ret

    def internal_has_permission(
        self, permission: str, user_permissions: Union[str, Iterable[str]]
    ) -> bool:
        if isinstance(user_permissions, str):
            user_permissions = (user_permissions,)

        return any(
            self.permission_has_descendant(permission, user_permission)
            for user_permission in user_permissions
        )

    async def has_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: Iterable[PermissionPrivilege],
        *,
        ow_group_is_always_allowed: bool = True,
        conn: Optional[Pool] = None,
    ) -> bool:
        if ow_group_is_always_allowed:
            try:
                group = await self.app.db.groups.get(group_id, conn=conn)
            except NotFound:
                pass
            else:
                if group.ow_group_id is not None:
                    return True

        user_permissions = await self.app.db.permissions.get_permission_privileges(
            group_id,
            user_id,
            conn=conn,
        )

        return all(
            self.internal_has_permission(permission, user_permissions)
            for permission in privilege
        )

    async def has_permission(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: PermissionPrivilege,
        *,
        ow_group_is_always_allowed: bool = True,
        conn: Optional[Pool] = None,
    ) -> bool:
        return await self.has_permissions(
            group_id,
            user_id,
            (privilege,),
            ow_group_is_always_allowed=ow_group_is_always_allowed,
            conn=conn,
        )

    async def raise_if_missing_permissions(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: Iterable[PermissionPrivilege],
        *,
        ow_group_is_always_allowed: bool = True,
        conn: Optional[Pool] = None,
    ) -> None:
        if not await self.has_permissions(
            group_id,
            user_id,
            privilege,
            ow_group_is_always_allowed=ow_group_is_always_allowed,
            conn=conn,
        ):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to do this",
            )

    async def raise_if_missing_permission(
        self,
        group_id: GroupId,
        user_id: UserId,
        privilege: PermissionPrivilege,
        *,
        ow_group_is_always_allowed: bool = True,
        conn: Optional[Pool] = None,
    ) -> None:
        await self.raise_if_missing_permissions(
            group_id,
            user_id,
            (privilege,),
            ow_group_is_always_allowed=ow_group_is_always_allowed,
            conn=conn,
        )
