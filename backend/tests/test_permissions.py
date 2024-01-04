# flake8: noqa

from collections import namedtuple
from typing import Any, Union

import pytest

from app.utils.permissions import PermissionManager

_TestCase = namedtuple(
    "_TestCase",
    (
        "permission",
        "user_permission",
        "expected",
    ),
)


VALID_PERMISSIONS: list[Union[tuple[str], tuple[str, Union[list[Any], list[str]]]]] = [
    ("group.admin",),
    ("group.useless", []),
    (
        "group.moderator",
        [
            "group.admin",
        ],
    ),
    (
        "group.manage_members",
        [
            "group.moderator",
        ],
    ),
    (
        "group.punishments.add",
        [
            "group.moderator",
        ],
    ),
    (
        "group.punishments.remove",
        [
            "group.moderator",
        ],
    ),
]


@pytest.fixture
def permission_manager() -> PermissionManager:
    return PermissionManager.from_raw_permissions(VALID_PERMISSIONS)


class TestPermissions:
    def test_cycles_not_allowed(self) -> None:
        with pytest.raises(ValueError):
            PermissionManager.from_raw_permissions(
                [
                    ("a", "b"),
                    ("b", "c"),
                    ("c", "a"),
                ]
            )

    def test_self_reflexivity_not_allowed(self) -> None:
        with pytest.raises(ValueError):
            PermissionManager.from_raw_permissions(
                [
                    ("a", "a"),
                ]
            )

    @pytest.mark.parametrize(
        "permission,user_permission,expected",
        (
            _TestCase("group.admin", "group.admin", True),
            _TestCase("group.admin", "group.moderator", False),
            _TestCase("group.admin", "group.useless", False),
            _TestCase("group.moderator", "group.admin", True),
            _TestCase("group.moderator", "group.moderator", True),
            _TestCase("group.moderator", "group.useless", False),
            _TestCase("group.useless", "group.admin", False),
            _TestCase("group.useless", "group.moderator", False),
            _TestCase("group.punishments.add", "group.admin", True),
            _TestCase("group.punishments.add", "group.moderator", True),
            _TestCase("group.punishments.add", "group.useless", False),
            _TestCase("group.punishments.remove", "group.admin", True),
        ),
    )
    def test_permissions(
        self,
        permission: str,
        user_permission: str,
        permission_manager: PermissionManager,
        expected: bool,
    ) -> None:
        assert (
            permission_manager.internal_has_permission(permission, user_permission)
            == expected
        )
