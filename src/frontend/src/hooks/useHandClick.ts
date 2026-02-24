import { useEffect, useRef } from 'react';

/**
 * Hook to translate spatial hand tracking pinch gestures into synthetic DOM click events.
 * Enables children to interact with menus and standard UI elements using hand tracking.
 * 
 * @param isPinching - Current pinch state (e.g., from useGameHandTracking)
 * @param cursorCoordinate - Current normalized cursor coordinate (x: 0-1, y: 0-1)
 * @param enabled - Whether this hook should actively process clicks
 */
export function useHandClick(
    isPinching: boolean,
    cursorCoordinate: { x: number; y: number } | null,
    enabled: boolean = true
) {
    const previousPinchRef = useRef(isPinching);
    const hoveredElementRef = useRef<Element | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (hoveredElementRef.current) {
                removeHoverEffects(hoveredElementRef.current);
                hoveredElementRef.current = null;
            }
            return;
        }

        if (cursorCoordinate) {
            // Convert normalized (0-1) to viewport coordinates
            const clientX = cursorCoordinate.x * window.innerWidth;
            const clientY = cursorCoordinate.y * window.innerHeight;

            const target = document.elementFromPoint(clientX, clientY);

            // Handle custom hover class for visual feedback
            if (target !== hoveredElementRef.current) {
                if (hoveredElementRef.current) {
                    removeHoverEffects(hoveredElementRef.current);
                }

                let interactable = null;
                if (target) {
                    interactable = target.closest('button') || target.closest('a') || target.closest('[data-hand-interactable="true"]');
                }

                if (interactable) {
                    addHoverEffects(interactable);
                    hoveredElementRef.current = interactable;
                } else {
                    hoveredElementRef.current = target;
                }
            }

            // Handle Click (Trigger only on pinch start: false -> true)
            if (isPinching && !previousPinchRef.current) {
                if (target) {
                    // We generally want to avoid triggering clicks on the canvas itself if the game handles that,
                    // but bubbling clicks to buttons is exactly what we want.
                    if (target.tagName.toLowerCase() !== 'canvas') {
                        const clickEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX,
                            clientY
                        });
                        target.dispatchEvent(clickEvent);

                        // Add a small ripple or click effect
                        if (hoveredElementRef.current) {
                            hoveredElementRef.current.classList.add('scale-95');
                            setTimeout(() => {
                                if (hoveredElementRef.current) {
                                    hoveredElementRef.current.classList.remove('scale-95');
                                }
                            }, 150);
                        }
                    }
                }
            }
        } else {
            // Clear hover if cursor is lost
            if (hoveredElementRef.current) {
                removeHoverEffects(hoveredElementRef.current);
                hoveredElementRef.current = null;
            }
        }

        previousPinchRef.current = isPinching;

    }, [isPinching, cursorCoordinate, enabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hoveredElementRef.current) {
                removeHoverEffects(hoveredElementRef.current);
            }
        };
    }, []);
}

function addHoverEffects(el: Element) {
    // Add a highly visible ring and slight scale up to indicate focus
    el.classList.add('ring-4', 'ring-green-400', 'ring-opacity-70', 'transform', 'scale-105', 'transition-all', 'z-50');
}

function removeHoverEffects(el: Element) {
    el.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-70', 'transform', 'scale-105', 'transition-all', 'z-50', 'scale-95');
}
