from fastapi import FastAPI

from app.config.settings import settings
from app.core.logger import logger

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise Banking Operations Platform powered by Agentic AI",
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