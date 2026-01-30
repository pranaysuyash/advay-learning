# Exploration: MPS (Metal Performance Shaders) for GPU Acceleration

**Date:** 2026-01-30  
**Exploration By:** AI Assistant  
**Status:** Completed - Not Required for Current Architecture  
**Ticket Reference:** TCK-20260130-016 (Model & Delegate Fallback)

---

## What Was Explored

During the implementation of GPU → CPU delegate fallback for hand tracking (TCK-20260130-016), we investigated whether **MPS (Metal Performance Shaders)** could provide additional GPU acceleration benefits for Apple Silicon devices.

---

## What is MPS?

**Metal Performance Shaders (MPS)** is Apple's GPU-accelerated framework for machine learning computations on macOS and iOS. It provides optimized kernels for:
- Neural network operations
- Image processing
- Linear algebra
- Computer vision tasks

**Key Benefits:**
- Native Apple Silicon optimization (M1/M2/M3)
- Lower power consumption than CPU
- Better performance than generic GPU compute
- Integrated with PyTorch and TensorFlow

---

## Current Architecture Analysis

### Frontend (Browser - MediaPipe JavaScript)

| Aspect | Implementation | GPU Backend |
|--------|---------------|-------------|
| Hand Tracking | MediaPipe Tasks Vision (JS) | **WebGL** |
| Rendering | Canvas 2D API | Browser-accelerated |
| Device Support | Cross-platform | Automatic fallback |

**Why WebGL, not MPS:**
- MediaPipe JS uses **WebGL** for GPU acceleration
- WebGL is a cross-platform web standard
- On Apple Silicon Macs: WebGL → Metal (automatic translation by browser)
- No explicit MPS code needed - abstraction handled by browser

### Backend (Python - FastAPI)

| Aspect | Implementation | GPU Backend |
|--------|---------------|-------------|
| ML Processing | MediaPipe Python (CPU only) | **CPU** |
| CV Operations | OpenCV | CPU optimized |
| Dependencies | mediapipe, opencv-python | No GPU frameworks |

---

## Investigation Findings

### 1. MPS Dependencies in Lockfile

**Observed:** `pyobjc-framework-metal*` packages in `uv.lock`

```
pyobjc-framework-metal
pyobjc-framework-metalfx
pyobjc-framework-metalkit
pyobjc-framework-metalperformanceshaders
```

**Analysis:** These are transitive dependencies from PyObjC (macOS system bindings), not actively used ML frameworks. They enable Python to call macOS Metal APIs but are not utilized in our current codebase.

### 2. No PyTorch/TensorFlow in Dependencies

**Current backend dependencies:**
```toml
numpy>=1.26.0
opencv-python>=4.8.0
mediapipe>=0.10.0
```

**Missing:** `torch`, `tensorflow`, `onnxruntime`

MPS acceleration requires PyTorch or TensorFlow with MPS device support. Neither is currently in the backend.

### 3. Hand Tracking Happens Client-Side

**Critical Finding:** All ML inference (hand tracking) happens in the **browser**, not on the server.

```
User Camera → Browser (MediaPipe JS) → WebGL GPU → Canvas Overlay
                ↑
         No server ML processing
```

Server-side ML would require:
- Video upload to server (privacy concern)
- Server-side MediaPipe with GPU support
- Significant latency increase

---

## Decision: MPS Not Required

### Why MPS Doesn't Fit Current Architecture

| Factor | Current State | MPS Requirement | Match? |
|--------|--------------|-----------------|--------|
| ML Runtime | MediaPipe JS (browser) | PyTorch/TensorFlow | ❌ No |
| GPU Abstraction | WebGL | Direct Metal | ❌ No |
| Compute Location | Client-side | Server-side | ❌ No |
| Cross-platform | Yes (WebGL) | macOS only | ❌ No |

### What We Use Instead

1. **WebGL (via MediaPipe JS)**
   - Cross-platform GPU acceleration
   - Automatic Metal usage on Apple devices (browser handles this)
   - No code changes needed for different platforms

2. **GPU/CPU Delegate Fallback** (implemented in TCK-20260130-016)
   ```typescript
   // Tries GPU first, falls back to CPU
   const delegatesToTry = ['GPU', 'CPU'];
   ```

---

## When Would MPS Be Useful?

### Future Scenarios Where MPS Could Help:

1. **Server-Side Video Processing**
   - If we move hand tracking to backend
   - Processing pre-recorded videos for analytics
   - Batch processing of learning sessions

2. **PyTorch-Based Models**
   - Custom gesture recognition models
   - Educational content personalization
   - Learning analytics with neural networks

3. **macOS Native App**
   - If building a native macOS app (not web-based)
   - Direct Metal control without browser abstraction

### Implementation Pattern (if needed later):

```python
import torch

# Check MPS availability
device = torch.device(
    "mps" if torch.backends.mps.is_available() 
    else "cuda" if torch.cuda.is_available()
    else "cpu"
)

# Use MPS-accelerated model
model = MyNeuralNetwork().to(device)
```

---

## Conclusion

**MPS is not required for the current Advay architecture.**

The web-based approach using MediaPipe JS + WebGL provides:
- ✅ Cross-platform GPU acceleration (including Apple Silicon via WebGL→Metal)
- ✅ Better privacy (processing on-device)
- ✅ Lower latency (no server round-trip)
- ✅ Simpler deployment (no GPU server infrastructure)

The existing GPU → CPU delegate fallback (TCK-20260130-016) provides sufficient device compatibility without adding MPS complexity.

---

## Related Documentation

- [MediaPipe WebGL Backend](https://developers.google.com/mediapipe/framework/framework_concepts/gpu)
- [Apple MPS Documentation](https://developer.apple.com/documentation/metalperformanceshaders)
- [PyTorch MPS Backend](https://pytorch.org/docs/stable/notes/mps.html)
- Ticket: TCK-20260130-016 - Model & Delegate Fallback

---

**Last Updated:** 2026-01-30  
**Next Review:** If considering server-side ML or native macOS app
