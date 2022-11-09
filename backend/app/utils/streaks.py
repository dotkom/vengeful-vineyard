from datetime import datetime
from typing import Optional, Union

from asyncpg import Record

from .date import utc_to_oslo


def _calc_inverse_streak(
    last_year: int,
    last_week: int,
    year: int,
    week: int,
) -> int:
    years = last_year - year
    weeks = max(last_week - (week - (years * 52)) - 1, 0)
    return weeks


def calculate_punishment_streaks(
    rows: list[Union[Record, dict[str, datetime]]],
    compare_to: Optional[datetime] = None,
    start_time: Optional[datetime] = None,
) -> dict[str, int]:
    """
    Calculate the streaks for a user.

    Parameters
    ----------
    rows: list[Union[Record, dict[str, datetime.datetime]]]
        The rows to calculate the streaks from. It is important that
        the rows are in descending order. That means that the newest
        punishment should be first in the list.
    compare_to: Optional[datetime.datetime]
        The datetime to compare to. Defaults to datetime.utcnow().
    start_time: Optional[datetime.datetime]
        The datetime to use for calculating inverse streaks if
        rows is empty. Defaults to datetime.utcnow().

    Returns
    -------
    dict[str, int]
        The streaks.
    """

    if start_time is None:
        start_time = utc_to_oslo(datetime.utcnow())
    else:
        start_time = utc_to_oslo(start_time)

    assert start_time is not None

    streaks = []
    inverse_streaks = []

    current_streak = 0
    has_now_streak = False

    if compare_to is None:
        now_dt = utc_to_oslo(datetime.utcnow())
    else:
        now_dt = utc_to_oslo(compare_to)

    now_iso_calendar = now_dt.isocalendar()
    now_year, now_week, _ = now_iso_calendar

    pre_dt = None
    pre_year = None
    pre_week = None

    for c, row in enumerate(rows):
        dt = utc_to_oslo(row["created_time"])
        year, week, _ = dt.isocalendar()

        if pre_dt is None:
            if (year == now_year - 1 and now_week == 1 and week == 52) or (
                year == now_year and week in (now_week, now_week - 1)
            ):
                has_now_streak = True

            current_streak += 1

            if c - 1 < 0:
                last_iso_calendar = now_iso_calendar
            else:
                try:
                    last_row = rows[c - 1]
                except IndexError:
                    last_iso_calendar = now_iso_calendar
                else:
                    last_dt = utc_to_oslo(last_row["created_time"])
                    last_iso_calendar = last_dt.isocalendar()

            last_year, last_week, _ = last_iso_calendar

            weeks = _calc_inverse_streak(last_year, last_week, year, week)
            inverse_streaks.append(weeks)

        else:
            if (  # Catch last year
                pre_year == year + 1 and pre_week == 1 and week == 52
            ) or pre_week == week + 1:
                current_streak += 1
            elif week == pre_week and year == pre_year:
                continue
            else:
                streaks.append(current_streak)
                current_streak = 1  # Start at one since we are already
                # on a new streak.

                last_dt = utc_to_oslo(rows[c - 1]["created_time"])
                last_year, last_week, _ = last_dt.isocalendar()

                weeks = _calc_inverse_streak(last_year, last_week, year, week)
                inverse_streaks.append(weeks)

        pre_dt = dt
        pre_year = year
        pre_week = week

    if rows:
        if current_streak > 0:
            streaks.append(current_streak)
    else:
        year, week, _ = start_time.isocalendar()
        inverse_streaks.append(
            _calc_inverse_streak(
                now_year,
                now_week,
                year,
                week,
            )
        )

    return {
        "current_streak": streaks[0] if has_now_streak else 0,
        "current_inverse_streak": inverse_streaks[0] if inverse_streaks else 0,
        "longest_streak": max(streaks) if streaks else 0,
        "longest_inverse_streak": max(inverse_streaks) if inverse_streaks else 0,
    }
