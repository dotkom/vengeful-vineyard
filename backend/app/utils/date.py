import datetime

import pytz


def utc_to_oslo(utc_dt: datetime.datetime) -> datetime.datetime:
    tz = pytz.timezone("Europe/Oslo")
    return utc_dt.replace(tzinfo=datetime.timezone.utc).astimezone(tz=tz)
