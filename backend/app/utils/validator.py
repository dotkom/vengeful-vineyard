from typing import Any

from pydantic import validator

from .date import parse_naive_datetime


def validate_naive_datetime(name: str) -> Any:
    return validator(name, pre=True, allow_reuse=True)(parse_naive_datetime)
