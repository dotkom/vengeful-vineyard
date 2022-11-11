import datetime

import pytz


def utc_to_oslo(utc_dt: datetime.datetime) -> datetime.datetime:
    tz = pytz.timezone("Europe/Oslo")
    return utc_dt.replace(tzinfo=datetime.timezone.utc).astimezone(tz=tz)


def parse_naive_datetime(v: str) -> datetime.datetime:
    if isinstance(v, str):
        try:
            return datetime.datetime.fromisoformat(v)
        except ValueError:
            try:
                return datetime.datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                return datetime.datetime.strptime(v, "%Y-%m-%dT%H:%M:%SZ")
    return v
