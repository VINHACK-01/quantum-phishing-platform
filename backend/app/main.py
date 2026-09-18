from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION
    )

    # Permissive CORS configuration for Frontend developers
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check & status endpoints
    @app.get("/", tags=["System"])
    def root():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs": "/docs"
        }

    # Mount routes under /api and root for maximum client compatibility
    app.include_router(router, prefix="/api", tags=["SentinelAI API"])
    app.include_router(router, tags=["SentinelAI Direct"])

    return app

app = create_app()
