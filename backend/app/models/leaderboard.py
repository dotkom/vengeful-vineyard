"""
Models for leaderboard data structures
"""

from .punishment import PunishmentOut
from .user import User


class LeaderboardUser(User):
    punishments: list[PunishmentOut]
    total_value: int
