import datetime

import pytest

from app.utils.date import parse_naive_datetime, utc_to_oslo


class TestUtils:
    def test_utc_to_oslo(self) -> None:
        utcnow = datetime.datetime.utcnow()
        oslo = utc_to_oslo(utcnow)

        offsets = (
            datetime.timedelta(hours=1),
            datetime.timedelta(hours=2),
        )

        assert oslo.tzinfo is not None
        assert oslo.tzinfo.utcoffset(oslo) in offsets

    @pytest.mark.parametrize(
        "dtinput,expected",
        (
            ("2021-01-02T03:04:05", datetime.datetime(2021, 1, 2, 3, 4, 5)),
            ("2021-01-02T03:04:05Z", datetime.datetime(2021, 1, 2, 3, 4, 5)),
            ("2021-01-02T03:04:05.000Z", datetime.datetime(2021, 1, 2, 3, 4, 5)),
            ("2021-01-02T03:04:05.000000Z", datetime.datetime(2021, 1, 2, 3, 4, 5)),
        ),
    )
    def test_parse_naive_datetime(
        self,
        dtinput: str,
        expected: datetime.datetime,
    ) -> None:
        parsed = parse_naive_datetime(dtinput)
        assert parsed == expected
