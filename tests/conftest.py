"""Pytest configuration and fixtures."""

import pytest
import numpy as np
from pathlib import Path


@pytest.fixture
def test_data_dir() -> Path:
    """Return path to test data directory."""
    return Path(__file__).parent / "assets"


@pytest.fixture
def sample_frame() -> np.ndarray:
    """Generate a sample camera frame (640x480 RGB)."""
    return np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)


@pytest.fixture
def empty_frame() -> np.ndarray:
    """Generate an empty (black) frame."""
    return np.zeros((480, 640, 3), dtype=np.uint8)


@pytest.fixture
def mock_hand_landmarks() -> dict:
    """Mock hand landmarks for testing."""
    return {
        "wrist": [0.5, 0.5, 0.0],
        "thumb_cmc": [0.45, 0.45, 0.0],
        "thumb_mcp": [0.4, 0.4, 0.0],
        "thumb_ip": [0.35, 0.35, 0.0],
        "thumb_tip": [0.3, 0.3, 0.0],
        "index_mcp": [0.55, 0.4, 0.0],
        "index_pip": [0.6, 0.35, 0.0],
        "index_dip": [0.65, 0.3, 0.0],
        "index_tip": [0.7, 0.25, 0.0],
    }
