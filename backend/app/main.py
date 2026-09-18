"""
main.py — FastAPI Application Entrypoint for SentinelAI

Hardened for production and development:
- Centralized configuration loading from app.core.config
- Strict and permissive CORS for local React development (http://localhost:5173, etc.)
- Centralized error handlers masking stack traces and returning clean JSON
- Health endpoint mounted at /api/health and /health
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION
    )

    # 1. CORS Configuration allowing the local React development origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Register hardened JSON error handlers
    register_error_handlers(app)

    # 3. System root info endpoint
    @app.get("/", tags=["System"])
    def root():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs": "/docs"
        }

    # 4. Mount routes under /api and direct root for client compatibility
    app.include_router(router, prefix="/api", tags=["SentinelAI API"])
    app.include_router(router, tags=["SentinelAI Direct"])

    return app


app = create_app()
