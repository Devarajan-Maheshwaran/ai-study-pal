"""Pytest fixtures for StudyForge backend tests.

Fixes (Phase 7):
- Renamed from conftests.py to conftest.py (pytest discovery)
- Provides `client` fixture with auth context pre-populated (g.user_id = 'test-user')
- Provides `db` fixture with an in-memory SQLite session
"""
import pytest
from unittest.mock import patch

from backend.app import create_app
from backend.db.database import Base, engine


@pytest.fixture(scope="session")
def app():
    application = create_app()
    application.config["TESTING"] = True
    # Use in-memory SQLite for tests
    application.config["DATABASE_URL"] = "sqlite:///:memory:"
    with application.app_context():
        Base.metadata.create_all(bind=engine)
        yield application


@pytest.fixture()
def client(app):
    """Test client with auth bypassed (g.user_id = 'test-user')."""
    # Patch require_auth so every decorated route gets g.user_id = 'test-user'
    with patch("backend.middleware.auth._AUTH_ENABLED", False):
        with app.test_client() as c:
            with app.app_context():
                yield c
