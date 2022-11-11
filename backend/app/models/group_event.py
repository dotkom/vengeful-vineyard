"""
Models for group event data structures.
"""

import datetime
from typing import Optional

from app.types import GroupEventId, GroupId, UserId
from app.utils.validator import validate_naive_datetime
from pydantic import BaseModel  # pylint: disable=no-name-in-module


class GroupEventBase(BaseModel):
    name: str
    description: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime] = None

    _start_time = validate_naive_datetime("start_time")
    _end_time = validate_naive_datetime("end_time")


class GroupEvent(GroupEventBase):
    group_id: GroupId
    event_id: GroupEventId
    created_by: UserId
    created_time: datetime.datetime


class GroupEventCreate(GroupEventBase):
    pass
