from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth_routes import router as auth_router
from app.api.v1.chat_routes import router as chat_router
from app.api.v1.document_routes import router as document_router
from app.config.settings import settings
from app.core.logger import logger
from app.database.session import Base, engine
from app.models import chat as chat_models  # noqa: F401
from app.models import user as user_models  # noqa: F401

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise Banking Operations Platform powered by Agentic AI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    document_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    chat_router,
    prefix=settings.api_v1_prefix,
)
app.include_router(
    auth_router,
    prefix=settings.api_v1_prefix,
)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)


@app.get("/")
def root():
    return {
        "application": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}