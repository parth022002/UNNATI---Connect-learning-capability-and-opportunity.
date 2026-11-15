import os
import pytest

# Configure isolated test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_suite.db"
os.environ["REDIS_ENABLED"] = "false"
os.environ["RATE_LIMIT_ENABLED"] = "false"

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
import app.models

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initializes schema for all models before running tests."""
    Base.metadata.create_all(bind=engine)
    yield
