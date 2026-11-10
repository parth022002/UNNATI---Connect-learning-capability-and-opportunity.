from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from typing import Generator
from app.core.config import settings

# ==============================================================================
# UNNATI — Three-Identity Database Connection Architecture
# 1. unnati_owner: Direct compute (port 5432) for Alembic DDL & migrations.
# 2. unnati_api: Pooled PgBouncer (port 6543) for transactional session-scoped CRUD.
# 3. unnati_ro: Read-only replica/analytics connection with read-committed isolation.
# ==============================================================================

# Primary API Engine (unnati_api identity - high-concurrency connection pool)
engine = create_engine(
    settings.resolved_database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Read-Only Engine (unnati_ro identity - optimized for analytics & reporting)
engine_ro = create_engine(
    settings.resolved_database_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    execution_options={"isolation_level": "AUTOCOMMIT"}
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

SessionReadOnly = sessionmaker(
    bind=engine_ro,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding transactional database sessions (unnati_api)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_ro_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding read-only analytical database sessions (unnati_ro)."""
    db = SessionReadOnly()
    try:
        yield db
    finally:
        db.close()

