from collections import namedtuple
from datetime import datetime

import pytest

from app.utils.streaks import calculate_punishment_streaks

_TestCase = namedtuple(
    "_TestCase",
    (
        "week_nums",
        "compare_to_week",
        "expected_result",
    ),
)
ExpectedResult = namedtuple(
    "ExpectedResult",
    (
        "current_streak",
        "current_inverse_streak",
        "longest_streak",
        "longest_inverse_streak",
    ),
)


def get_first_day_of_week(week: int, year: int = 2022) -> datetime:
    return datetime.strptime(f"{year}-W{week}-1", "%Y-W%W-%w")


class TestStreaks:
    def test_empty_rows(self) -> None:
        streaks = calculate_punishment_streaks([])
        assert streaks == {
            "current_streak": 0,
            "current_inverse_streak": 0,
            "longest_streak": 0,
            "longest_inverse_streak": 0,
        }

    def test_empty_rows_with_inverse_streak(self) -> None:
        streaks = calculate_punishment_streaks(
            [],
            compare_to=get_first_day_of_week(10),
            start_time=get_first_day_of_week(3),
        )

        # weeks: 4, 5, 6, 7, 8, 9 = 6
        assert streaks == {
            "current_streak": 0,
            "current_inverse_streak": 6,
            "longest_streak": 0,
            "longest_inverse_streak": 6,
        }

    @pytest.mark.parametrize(
        "week_nums,compare_to_week,expected_result",
        (
            _TestCase(
                week_nums=[4, 3, 2],
                compare_to_week=5,
                expected_result=ExpectedResult(3, 0, 3, 0),
            ),
            _TestCase(
                week_nums=[4, 3, 2],
                compare_to_week=4,
                expected_result=ExpectedResult(3, 0, 3, 0),
            ),
            _TestCase(
                week_nums=[4, 3, 2],
                compare_to_week=6,
                expected_result=ExpectedResult(0, 1, 3, 1),
            ),
            _TestCase(
                week_nums=[4, 3, 3, 3, 2, 2],
                compare_to_week=5,
                expected_result=ExpectedResult(3, 0, 3, 0),
            ),
            _TestCase(
                week_nums=[10, 9, 4, 3, 2],
                compare_to_week=11,
                expected_result=ExpectedResult(2, 0, 3, 4),
            ),
            _TestCase(
                week_nums=[10, 9, 4, 3, 2],
                compare_to_week=13,
                expected_result=ExpectedResult(0, 2, 3, 4),
            ),
            _TestCase(
                week_nums=[(52, 2021), (51, 2021)],
                compare_to_week=1,
                expected_result=ExpectedResult(2, 0, 2, 0),
            ),
            _TestCase(
                week_nums=[1, (52, 2021), (51, 2021)],
                compare_to_week=2,
                expected_result=ExpectedResult(3, 0, 3, 0),
            ),
            _TestCase(
                week_nums=[1, (52, 2021), (51, 2021)],
                compare_to_week=1,
                expected_result=ExpectedResult(3, 0, 3, 0),
            ),
            _TestCase(
                week_nums=[6, 5, 1, (52, 2021), (51, 2021)],
                compare_to_week=7,
                expected_result=ExpectedResult(2, 0, 3, 3),
            ),
            _TestCase(
                week_nums=[6, 5, 3, (50, 2021), (49, 2021)],
                compare_to_week=7,
                expected_result=ExpectedResult(2, 0, 2, 4),
            ),
        ),
    )
    def test_streaks(
        self,
        week_nums: list[int],
        compare_to_week: int,
        expected_result: ExpectedResult,
    ) -> None:
        rows = [
            {
                "created_at": (
                    get_first_day_of_week(*((n, 2022) if isinstance(n, int) else n))
                )
            }
            for n in week_nums
        ]
        compare_to = get_first_day_of_week(compare_to_week)

        streaks = calculate_punishment_streaks(
            rows,
            compare_to=compare_to,
        )
        assert streaks == {
            "current_streak": expected_result.current_streak,
            "current_inverse_streak": expected_result.current_inverse_streak,
            "longest_streak": expected_result.longest_streak,
            "longest_inverse_streak": expected_result.longest_inverse_streak,
        }
