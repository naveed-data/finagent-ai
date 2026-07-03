from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings
    Loads configuration from the .env file.
    """

    # ==========================
    # Application
    # ==========================
    app_name: str
    app_version: str
    environment: str
    debug: bool

    # ==========================
    # API
    # ==========================
    api_v1_prefix: str
    host: str
    port: int

    # ==========================
    # OpenAI
    # ==========================
    openai_api_key: str = ""

    # ==========================
    # Database
    # ==========================
    database_url: str

    # ==========================
    # Vector Database
    # ==========================
    vector_db: str
    chroma_db_path: str

    # ==========================
    # Logging
    # ==========================
    log_level: str

    # ==========================
    # Authentication
    # ==========================
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )


settings = Settings()