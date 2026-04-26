import json
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Nuby Arango Perez API"
    api_prefix: str = "/api"
    debug: bool = False

    database_url: str = Field(default="sqlite:///./nuby.db", alias="DATABASE_URL")
    secret_key: str = Field(default="change-this-secret-key", alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=720, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "https://nuby-web-wqdz.vercel.app",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        alias="CORS_ORIGINS",
    )

    uploads_dir: str = Field(default="uploads", alias="UPLOAD_DIR")
    uploads_url_prefix: str = "/uploads"
    max_upload_size_mb: int = Field(default=5, alias="MAX_UPLOAD_SIZE_MB")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value

        if not value:
            return []

        raw_value = value.strip()
        if raw_value.startswith("["):
            return json.loads(raw_value)

        return [origin.strip() for origin in raw_value.split(",") if origin.strip()]

    @property
    def project_root(self) -> Path:
        return BASE_DIR

    @property
    def uploads_path(self) -> Path:
        path = Path(self.uploads_dir)
        if not path.is_absolute():
            path = self.project_root / path
        return path.resolve()


settings = Settings()
