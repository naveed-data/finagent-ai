from fastapi import FastAPI
from app.api.v1.document_routes import router as document_router

from app.config.settings import settings
from app.core.logger import logger

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise Banking Operations Platform powered by Agentic AI",
)

app.include_router(
    document_router,
    prefix=settings.api_v1_prefix,
)

@app.on_event("startup")
def startup_event():
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)


@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {
        "application": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "status": "running",
    }


@app.get("/health")
def health():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}