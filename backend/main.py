#!/usr/bin/env python

import argparse
import logging
from typing import Any

import uvicorn
from app.config import settings


def parse_args() -> Any:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Development version with on-disk database",
    )
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_args()
    log_level = logging.INFO
    if args.dev:
        log_level = logging.DEBUG

    uvicorn.run(
        "app.api.init_api:asgi_app",
        reload=settings.debug,
        log_level=log_level,
        server_header=False,
        date_header=False,
    )
