"""Defines custom exceptions"""

from typing import Any, Optional


class VineyardException(Exception):
    pass


class OWException(VineyardException):
    pass


class NotAuthorizedException(OWException):
    pass


class DatabaseIntegrityException(VineyardException):
    def __init__(
        self,
        message: Optional[str] = None,
        detail: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.detail = detail


class NotFound(VineyardException):
    pass


class PunishmentTypeNotExists(VineyardException):
    def __init__(self, **kwargs: Any) -> None:
        self.kwargs = kwargs
