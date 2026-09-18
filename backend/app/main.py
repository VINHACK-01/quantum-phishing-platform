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

    @app.get("/health", tags=["System"])
    def health_check():
        return {
            "status": "healthy",
            "service": "sentinelai-backend",
            "model_mode": "production_ml" if settings.USE_REAL_MODEL else "heuristic_engine"
        }

    # Mount routes under /api and root for maximum client compatibility
    app.include_router(router, prefix="/api", tags=["SentinelAI API"])
    app.include_router(router, tags=["SentinelAI Direct"])

    return app

app = create_app()
