# TCK-20260223-002 - P0 Frontend Stability + Performance Program

Date: 2026-02-23
Status: DONE

## Scope Delivered

1. Camera reliability boundaries
- Added `src/frontend/src/components/errors/CameraErrorBoundary.tsx`.
- Added `src/frontend/src/components/errors/CameraCrashFallback.tsx`.
- Wrapped camera-heavy game routes in `src/frontend/src/App.tsx` with `CameraSafeRoute`.
- Added error classification and structured console logging (`init`, `permission`, `runtime`, `unknown`).

2. MediaPipe worker offload path
- Added protocol: `src/frontend/src/workers/vision.protocol.ts`.
- Added worker runtime: `src/frontend/src/workers/vision.worker.ts`.
- Added bridge hook: `src/frontend/src/hooks/useVisionWorkerRuntime.ts`.
- Extended `src/frontend/src/hooks/useGameHandTracking.ts` with:
  - `runtimeMode?: 'main-thread' | 'worker'`
  - `workerConfig?: { enabled: boolean; targetFps?: number; transferMode?: 'imageData' | 'bitmap' }`
  - `onRuntimeFallback?: (reason: string) => void`
- Preserved page-level `onFrame` contract and automatic fallback to main-thread mode.

3. Image optimization (WebP + fallback + lazy-safe)
- Added manifest/helper: `src/frontend/src/utils/imageAssets.ts`.
- Wired weather background URL selection through helper in `src/frontend/src/utils/assets.ts`.
- Updated mascot rendering to `<picture>` source selection with fallback in `src/frontend/src/components/Mascot.tsx`.
- Added safe lazy loading on non-critical preview cards in `src/frontend/src/components/GameCard.tsx`.
- Generated WebP variants while preserving originals:
  - `src/frontend/public/assets/images/adventure-map.webp`
  - `src/frontend/public/assets/images/red_panda_no_bg.webp`
  - `src/frontend/public/assets/images/pip_sprite_sheet.webp`
  - `src/frontend/public/assets/backgrounds/bg_sunny.webp`
  - `src/frontend/public/assets/backgrounds/bg_rainy.webp`
  - `src/frontend/public/assets/backgrounds/bg_snowy.webp`

4. Config flags
- Added env keys in `src/frontend/.env.example` and `src/frontend/.env`:
  - `VITE_VISION_WORKER_ENABLED`
  - `VITE_VISION_WORKER_FORCE_MAIN_THREAD`
  - `VITE_IMAGE_OPTIMIZATION_ENABLED`

## Test and Verification Evidence

Command: `cd src/frontend && npm run type-check`
Result: pass

Command: `cd src/frontend && npm run lint`
Result: pass

Command:
`cd src/frontend && npm run test -- src/components/__tests__/CameraErrorBoundary.test.tsx src/workers/__tests__/vision.protocol.test.ts src/hooks/__tests__/useGameHandTracking.runtimeMode.test.ts src/utils/__tests__/imageAssets.test.ts`
Result: 4 files passed, 11 tests passed

Command: `cd src/frontend && npm run test -- src/pages/__tests__/GamePages.smoke.test.tsx`
Result: 1 file passed, 18 tests passed

## Added Tests

- `src/frontend/src/components/__tests__/CameraErrorBoundary.test.tsx`
- `src/frontend/src/workers/__tests__/vision.protocol.test.ts`
- `src/frontend/src/hooks/__tests__/useGameHandTracking.runtimeMode.test.ts`
- `src/frontend/src/utils/__tests__/imageAssets.test.ts`

## Known Follow-Ups

1. Run device-lab validation for Tier B iPad Safari to measure runtime fallback behavior under real camera conditions.
2. Add optional telemetry sink for runtime fallback reasons beyond console logging.
3. Expand `<picture>` migration to additional high-impact image surfaces where feasible without gameplay/layout regressions.
