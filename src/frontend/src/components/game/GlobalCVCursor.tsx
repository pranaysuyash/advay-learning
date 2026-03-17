/**
 * GlobalCVCursor - Global CV button control via hand tracking
 *
 * Makes ALL existing buttons/links/clickable elements work with hand tracking
 * without any per-game migration. Mounted once at the App root.
 *
 * Architecture (useEffect-minimal, per https://react.dev/learn/you-might-not-need-an-effect):
 * - Single rAF loop subscription (mount/unmount lifecycle)
 * - All per-frame logic (hit-testing, hover, click) runs inside the loop
 * - No reactive useEffect chains watching cursor state
 *
 * @example
 * ```tsx
 * <SpatialInputProvider>
 *   <AppContent />
 *   <GlobalCVCursor />
 * </SpatialInputProvider>
 * ```
 */

import { useEffect, useRef, useContext } from 'react';
import { SpatialInputContext, DEFAULT_CURSOR_STATE } from '../../context/SpatialInputContext';
import { KenneyHandCursor } from './KenneyHandCursor';
import { useCommonCvController } from '../../controllers/commonCvController';

interface GlobalCVCursorProps {
  enabled?: boolean;
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  size?: number;
  showTrail?: boolean;
  clickDebounceMs?: number;
}

export function GlobalCVCursor({
  enabled = true,
  color = 'yellow',
  size = 64,
  showTrail = true,
  clickDebounceMs = 500,
}: GlobalCVCursorProps) {
  const { isReady, cursor: _cvCursor, startTracking, stopTracking } = useCommonCvController('GlobalCVCursor');
  // cvCursor is the 2D coordinate produced by the CV hook; actual rendering
  // still relies on SpatialInputContext's cursor state which is updated by the common controller.
  const { cursor } = useContext(SpatialInputContext) ?? { cursor: DEFAULT_CURSOR_STATE };

  // Refs for the rAF loop — no state, no re-renders for per-frame work
  const cursorRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<HTMLElement | null>(null);
  const lastClickRef = useRef(0);
  const wasPinchingRef = useRef(false);
  const rafRef = useRef(0);

  // Keep cursor in a ref so the rAF loop always reads latest without deps
  const cursorStateRef = useRef(cursor);
  cursorStateRef.current = cursor;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const debounceRef = useRef(clickDebounceMs);
  debounceRef.current = clickDebounceMs;

  const startTrackingRef = useRef(startTracking);
  const stopTrackingRef = useRef(stopTracking);
  startTrackingRef.current = startTracking;
  stopTrackingRef.current = stopTracking;

  // Single mount effect: start/stop hand tracking
  useEffect(() => {
    if (!enabled) return;
    startTrackingRef.current();
    return () => stopTrackingRef.current();
  }, [enabled]);

  // Single mount effect: rAF loop for hit-testing + click handling
  useEffect(() => {
    function tick() {
      rafRef.current = requestAnimationFrame(tick);

      if (!enabledRef.current) return;

      const cur = cursorStateRef.current;
      const prev = hoveredRef.current;

      // Hand not active — clear hover
      if (!cur.isActive) {
        if (prev) {
          prev.classList.remove('cv-cursor-hover');
          prev.removeAttribute('data-cv-hover');
          hoveredRef.current = null;
        }
        wasPinchingRef.current = cur.isPinching;
        return;
      }

      // --- Hit-test (elementFromPoint) ---
      if (cursorRef.current) {
        cursorRef.current.style.pointerEvents = 'none';
      }
      const el = document.elementFromPoint(cur.position.x, cur.position.y);
      if (cursorRef.current) {
        cursorRef.current.style.pointerEvents = '';
      }

      const target = findClickableElement(el);

      // Update hover classes only on change
      if (target !== prev) {
        prev?.classList.remove('cv-cursor-hover');
        prev?.removeAttribute('data-cv-hover');
        if (target) {
          target.classList.add('cv-cursor-hover');
          target.setAttribute('data-cv-hover', 'true');
        }
        hoveredRef.current = target;
      }

      // --- Pinch-to-click (edge-triggered: rising edge only) ---
      const isPinching = cur.isPinching;
      const wasPinching = wasPinchingRef.current;
      wasPinchingRef.current = isPinching;

      if (isPinching && !wasPinching && target) {
        const now = Date.now();
        if (now - lastClickRef.current >= debounceRef.current) {
          lastClickRef.current = now;
          target.classList.add('cv-cursor-clicking');
          simulateClick(target);
          setTimeout(() => target.classList.remove('cv-cursor-clicking'), 200);
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      // Cleanup hover state
      hoveredRef.current?.classList.remove('cv-cursor-hover', 'cv-cursor-clicking');
      hoveredRef.current?.removeAttribute('data-cv-hover');
    };
  }, []);

  // Auto-start tracking - the hook calls are unconditional; render gating below handles enablement
  useEffect(() => {
    // Start tracking when CV is ready
    if (isReady) {
      startTracking();
    }
  }, [isReady, startTracking]);
  if (!isReady) return null;

  // Derive cursor visual state directly — no effect needed (Rule 1)
  const cursorState = cursor.isPinching ? 'pinch' : hoveredRef.current ? 'point' : 'idle';

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <KenneyHandCursor
        position={cursor.position}
        state={cursorState}
        isHandDetected={cursor.isActive}
        color={color}
        size={size}
        showTrail={showTrail}
      />
    </div>
  );
}

// --- Pure helper functions (no hooks, no state) ---

function findClickableElement(element: Element | null): HTMLElement | null {
  if (!element) return null;

  if (isClickable(element)) return element as HTMLElement;

  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    if (isClickable(parent)) return parent;
    parent = parent.parentElement;
    depth++;
  }
  return null;
}

function isClickable(element: Element): boolean {
  const tag = element.tagName.toLowerCase();

  if (tag === 'button') return true;
  if (tag === 'a' && element.hasAttribute('href')) return true;
  if (element.hasAttribute('onclick')) return true;
  if (element.getAttribute('role') === 'button') return true;
  if (tag === 'label') return true;

  if (tag === 'input') {
    const type = (element as HTMLInputElement).type;
    return ['button', 'submit', 'reset', 'checkbox', 'radio'].includes(type);
  }

  const style = window.getComputedStyle(element);
  if (style.cursor === 'pointer') return true;

  return false;
}

function simulateClick(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const shared = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: cx,
    clientY: cy,
  };

  element.dispatchEvent(new MouseEvent('mousedown', shared));
  element.dispatchEvent(new MouseEvent('mouseup', shared));
  element.dispatchEvent(new MouseEvent('click', shared));
}

export default GlobalCVCursor;
