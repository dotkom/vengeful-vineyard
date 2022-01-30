from typing import Any

FAST_RESPONSE_MS = 50  # Milliseconds


def check_response_time(response: Any, max_time: float = FAST_RESPONSE_MS) -> None:
    assert float(response.headers["Process-Time-Ms"]) <= max_time
