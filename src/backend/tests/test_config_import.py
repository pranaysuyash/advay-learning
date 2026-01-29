"""Test configuration import resilience."""



def test_import_app_with_test_env():
    """Test that app can be imported with test environment.
    
    This verifies the fix for M2 (import-time settings instantiation).
    """
    # Ensure .env.test is loaded (conftest.py should do this)
    from app.main import app

    # Basic sanity checks
    assert app is not None
    assert app.title == "Advay Vision Learning API"

    # Verify settings are accessible
    from app.core.config import get_settings
    settings = get_settings()

    assert settings.APP_ENV == "test"
    assert settings.SECRET_KEY is not None
    assert settings.DATABASE_URL is not None


def test_get_settings_cached():
    """Test that get_settings returns cached instance."""
    from app.core.config import get_settings

    settings1 = get_settings()
    settings2 = get_settings()

    # Should be same object due to @lru_cache
    assert settings1 is settings2
