"""
Models for leaderboard data structures
"""

from .punishment import PunishmentOut
from .user import User


class LeaderboardUser(User):
    punishments: list[PunishmentOut]
    amount_punishments: int
