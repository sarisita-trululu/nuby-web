from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


engine_kwargs: dict[str, object] = {"pool_pre_ping": True, "future": True}

database_url = settings.database_url
parsed_url = make_url(database_url)
if parsed_url.get_backend_name().startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(database_url, **engine_kwargs)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False, class_=Session)


def initialize_directories() -> None:
    if settings.use_local_uploads:
        settings.uploads_path.mkdir(parents=True, exist_ok=True)

    if parsed_url.get_backend_name().startswith("sqlite") and parsed_url.database not in (None, ":memory:"):
        db_path = Path(parsed_url.database)
        if not db_path.is_absolute():
            db_path = settings.project_root / db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
