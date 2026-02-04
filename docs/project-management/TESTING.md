# Testing Strategy

## Overview

We follow a pragmatic testing approach that balances thoroughness with development velocity for a small team.

## Testing Pyramid

```
       /\
      /  \  E2E Tests (Few)
     /----\
    /      \  Integration Tests (Some)
   /--------\
  /          \  Unit Tests (Many)
 /------------\
```

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual functions/classes in isolation
**Location**: `tests/unit/`
**Tools**: pytest, pytest-mock

#### Coverage Targets

| Module | Target Coverage | Critical Paths |
|--------|-----------------|----------------|
| hand_tracking | 85% | Gesture recognition, coordinate mapping |
| face_tracking | 80% | Face detection, expression recognition |
| storage | 90% | Data persistence, migrations |
| games | 80% | Scoring logic, state management |
| learning_modules | 85% | Progress tracking, assessment |
| ui | 60% | Component behavior (visual tested manually) |

#### Unit Test Example

```python
# tests/unit/hand_tracking/test_gestures.py
import pytest
import numpy as np
from src.hand_tracking.gestures import GestureRecognizer, Gesture


class TestGestureRecognizer:
    @pytest.fixture
    def recognizer(self):
        return GestureRecognizer()
    
    @pytest.fixture
    def pinch_landmarks(self):
        # Mock hand landmarks for pinch gesture
        return np.array([
            [0.5, 0.5],  # thumb tip
            [0.51, 0.51],  # index tip (close to thumb)
            # ... other landmarks
        ])
    
    def test_recognize_pinch(self, recognizer, pinch_landmarks):
        gesture = recognizer.recognize(pinch_landmarks)
        assert gesture == Gesture.PINCH
    
    def test_recognize_no_gesture(self, recognizer):
        empty_landmarks = np.array([])
        gesture = recognizer.recognize(empty_landmarks)
        assert gesture == Gesture.NONE
```

### 2. Integration Tests

**Purpose**: Test interaction between components
**Location**: `tests/integration/`
**Tools**: pytest, real dependencies (where feasible)

#### Integration Test Areas

1. **Camera + Tracking**: Verify camera feed properly processed by trackers
2. **Tracking + UI**: Verify gestures correctly update UI
3. **Game + Storage**: Verify progress saved correctly
4. **Storage + Backup**: Verify sync works

#### Integration Test Example

```python
# tests/integration/test_camera_tracking.py
import pytest
from src.utils.camera import Camera
from src.hand_tracking.detector import HandDetector


class TestCameraTrackingIntegration:
    @pytest.fixture
    def camera(self):
        return Camera(device_id=0)
    
    @pytest.fixture
    def detector(self):
        return HandDetector()
    
    def test_camera_feed_processed_by_detector(self, camera, detector):
        frame = camera.capture()
        hands = detector.detect(frame)
        
        # Verify structure of output
        assert isinstance(hands, list)
        if hands:
            assert hasattr(hands[0], 'landmarks')
            assert hasattr(hands[0], 'confidence')
```

### 3. Manual Testing

**Purpose**: Test user experience, visual elements, real-world usage
**Method**: Structured test plans

#### Manual Test Checklist

**Camera & Tracking:**
- [ ] Camera initializes correctly
- [ ] Hand detected in various lighting
- [ ] Tracking works at different distances
- [ ] Tracking handles occlusion gracefully
- [ ] Face tracking works with/without glasses

**UI/UX:**
- [ ] All buttons respond to gestures
- [ ] Visual feedback is clear
- [ ] Sounds play correctly
- [ ] No UI freezing during processing

**Learning Modules:**
- [ ] Progress saves correctly
- [ ] Progress loads correctly
- [ ] Rewards display properly
- [ ] Difficulty adjusts appropriately

## Test Data

### Fixtures

Create reusable test data in `conftest.py`:

```python
# tests/conftest.py
import pytest
import numpy as np
from pathlib import Path


@pytest.fixture
def sample_frame():
    """Generate a sample camera frame."""
    return np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)


@pytest.fixture
def test_data_dir():
    """Path to test data directory."""
    return Path(__file__).parent / "assets"


@pytest.fixture
def mock_hand_landmarks():
    """Mock hand landmarks for testing."""
    return {
        "thumb_tip": [0.5, 0.5],
        "index_tip": [0.6, 0.4],
        # ...
    }
```

### Test Assets

Store in `tests/assets/`:
- Sample images (small, compressed)
- Mock data files (JSON)
- Test databases (SQLite)

## Test Database Setup

Before running tests, ensure the test database exists and migrations are applied:

```bash
# Run the test database bootstrap script
./scripts/test-db-bootstrap.sh
```

This script:
- Checks if PostgreSQL is running
- Creates `advay_learning_test` database if it doesn't exist
- Runs alembic migrations on the test database
- Sets up the database with the latest schema

**Note**: The test database is separate from the development database (`advay_learning`).

## Running Tests

### Commands

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=term-missing

# Run with HTML report
pytest --cov=src --cov-report=html
open htmlcov/index.html

# Run specific test file
pytest tests/unit/hand_tracking/test_detector.py

# Run specific test
pytest tests/unit/hand_tracking/test_detector.py::TestHandDetector::test_detect_single_hand

# Run with verbose output
pytest -v

# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/

# Run tests matching pattern
pytest -k "test_detect"

# Run with debugger on failure
pytest --pdb

# Run in parallel (if many tests)
pytest -n auto
```

### Pre-Commit Testing

Tests run automatically on commit (via pre-commit):

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: pytest tests/unit -v
        language: system
        types: [python]
        pass_filenames: false
        always_run: true
```

## Test Quality Guidelines

### Good Tests

✅ **Do:**
- Test one thing per test
- Use descriptive test names
- Arrange-Act-Assert structure
- Use fixtures for common setup
- Test edge cases and errors
- Keep tests independent
- Use mocking for external dependencies

❌ **Don't:**
- Test implementation details
- Have conditional logic in tests
- Depend on test execution order
- Test third-party code
- Write tests that always pass
- Copy-paste test code (use fixtures/helpers)

### Test Naming

```python
# Good
def test_detect_single_hand_returns_one_hand():
def test_detect_empty_frame_returns_empty_list():
def test_recognize_pinch_with_fingers_touching():

# Bad
def test1():
def test_hand():
def test_detect():
```

## Performance Testing

### FPS Benchmarks

```python
# tests/perf/test_tracking_perf.py
import time
import pytest
from src.hand_tracking.detector import HandDetector


class TestTrackingPerformance:
    def test_detection_fps(self, sample_frame):
        detector = HandDetector()
        
        # Warm up
        for _ in range(10):
            detector.detect(sample_frame)
        
        # Benchmark
        start = time.time()
        iterations = 100
        for _ in range(iterations):
            detector.detect(sample_frame)
        elapsed = time.time() - start
        
        fps = iterations / elapsed
        assert fps >= 30, f"Detection FPS {fps} below target 30"
```

### Memory Testing

```bash
# Profile memory usage
mprof run pytest tests/integration/
mprof plot
```

## Regression Testing

Before each release:

1. Run full test suite: `pytest`
2. Run manual test checklist
3. Test on target hardware (laptop)
4. Verify no performance degradation

## Test Documentation

Document complex test scenarios:

```python
def test_complex_scenario():
    \"\"\"
    Test scenario: Child traces letter 'A'
    
    Steps:
    1. Load alphabet module
    2. Select letter 'A'
    3. Trace with hand gesture
    4. Verify completion detected
    5. Verify progress saved
    
    Expected: Letter marked complete, score updated
    \"\"\"
    # Test implementation
```

## Continuous Testing

Since we don't use CI, establish manual testing rhythm:

| Trigger | Tests to Run |
|---------|--------------|
| Every commit | Unit tests for changed modules |
| Before PR | Full unit test suite |
| Before merge to develop | Unit + Integration tests |
| Before release | All tests + Manual checklist |

## Debugging Failed Tests

```bash
# Run with maximum verbosity
pytest -vvv --tb=long

# Run with local variables shown
pytest -vvv --showlocals

# Run specific test with pdb
pytest test_file.py::test_name --pdb

# Run and stop on first failure
pytest -x
```
