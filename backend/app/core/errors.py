"""
errors.py — Centralized Error Handling for SentinelAI (Phase 7)

Provides custom exceptions and FastAPI exception handlers to ensure
clean, predictable JSON error responses across all failure modes:
- Invalid request / malformed URL (400 / 422)
- ML service unavailable (503)
- Network service unavailable (503)
- Unexpected internal server error (500)

Security requirement:
Stack traces are logged to internal loggers and NEVER leaked to API consumers.
"""

import logging
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Custom Exceptions
# ─────────────────────────────────────────────────────────────────────────────

class SentinelAIException(Exception):
    """Base exception for SentinelAI domain errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, error_type: Optional[str] = None):
        self.detail = detail
        self.status_code = status_code
        self.error_type = error_type or self.__class__.__name__
        super().__init__(detail)


class InvalidRequestError(SentinelAIException):
    """Raised when an incoming request payload or parameter is semantically invalid."""
    def __init__(self, detail: str = "Invalid request payload or malformed parameter."):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST, error_type="InvalidRequest")


class MLServiceUnavailableError(SentinelAIException):
    """Raised when the ML inference service or model pipeline is unreachable or failing."""
    def __init__(self, detail: str = "Machine learning inference service is currently unavailable."):
        super().__init__(detail=detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, error_type="MLServiceUnavailable")


class NetworkServiceUnavailableError(SentinelAIException):
    """Raised when the network threat intelligence or packet parser service is unavailable."""
    def __init__(self, detail: str = "Network threat intelligence service is currently unavailable."):
        super().__init__(detail=detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, error_type="NetworkServiceUnavailable")


# ─────────────────────────────────────────────────────────────────────────────
# Exception Handler Registrations
# ─────────────────────────────────────────────────────────────────────────────

def register_error_handlers(app: FastAPI) -> None:
    """Registers standard and custom exception handlers on the FastAPI application."""

    @app.exception_handler(SentinelAIException)
    async def handle_sentinelai_exception(request: Request, exc: SentinelAIException) -> JSONResponse:
        logger.warning(f"[{exc.error_type}] {request.method} {request.url.path}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "error_type": exc.error_type,
                "status_code": exc.status_code
            }
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        # Use jsonable_encoder to safely encode Pydantic v2 ctx errors (e.g. ValueError)
        safe_errors = jsonable_encoder(exc.errors())
        logger.info(f"[ValidationError] {request.method} {request.url.path}: {safe_errors}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": safe_errors,
                "error_type": "ValidationError",
                "message": "Request validation failed for one or more fields."
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        logger.info(f"[HTTPException {exc.status_code}] {request.method} {request.url.path}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "error_type": "HTTPException",
                "status_code": exc.status_code
            }
        )

    @app.exception_handler(Exception)
    async def handle_unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
        # Catch-all: log stack trace on server, but return sanitized JSON to client
        logger.exception(f"[UnhandledException] Error handling {request.method} {request.url.path}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An internal server error occurred. Please contact the system administrator.",
                "error_type": "InternalServerError",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }
        )
