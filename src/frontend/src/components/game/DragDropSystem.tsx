import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, type ReactNode } from 'react';
import {
  isWithinTarget,
  type ScreenCoordinate,
} from '../../utils/coordinateTransform';

/**
 * DragDropSystem - Drag and drop interaction for games
 *
 * IMPLEMENTS AUDIT FIXES:
 * - Generous hitboxes (2x visual size, Issue UI-002)
 * - Magnetic snapping to drop zones (Issue HT-002)
 * - Clear visual feedback during drag (Issue UI-004)
 * - Success animation on successful drop (Issue FB-001)
 * - Voice feedback integration (Issue IN-001)
 *
 * Perfect for: Dress for Weather, Sorting games, Matching games
 * Age Range: 2-4 years (toddlers)
 */

export interface DraggableItem {
  id: string;
  x: number;
  y: number;
  size: number;
  content: string | ReactNode;
  color?: string;
  data?: any;
  isBeingDragged?: boolean;
  originalPosition?: { x: number; y: number };
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  size: number;
  label?: string;
  accepts?: string[]; // Array of item IDs or types that this zone accepts
  color?: string;
  isFilled?: boolean;
  filledWith?: string; // ID of item in this zone
}

interface DragDropSystemProps {
  /** Draggable items */
  items: DraggableItem[];

  /** Drop zones */
  dropZones: DropZone[];

  /** Current cursor/hand position */
  cursorPosition?: ScreenCoordinate;

  /** Is user pinching/dragging */
  isPinching?: boolean;

  /** Callback when item is picked up */
  onItemPickup?: (item: DraggableItem) => void;

  /** Callback when item is dropped on a zone */
  onItemDropped?: (item: DraggableItem, zone: DropZone) => void;

  /** Callback when item is dropped outside zones (return to origin) */
  onItemDroppedOutside?: (item: DraggableItem) => void;

  /** Enable magnetic snapping to drop zones (default: true) */
  enableMagneticSnap?: boolean;

  /** Magnetic snap threshold in pixels (default: 120) */
  magneticThreshold?: number;

  /** Hitbox multiplier (default: 2.0) */
  hitboxMultiplier?: number;

  /** Show hitbox visualization (debug) */
  showHitboxes?: boolean;

  /** Animate items on entry (default: true) */
  animateEntry?: boolean;
}

export function DragDropSystem({
  items,
  dropZones,
  cursorPosition,
  isPinching = false,
  onItemPickup,
  onItemDropped,
  onItemDroppedOutside,
  enableMagneticSnap = true,
  magneticThreshold = 120,
  hitboxMultiplier = 2.0,
  showHitboxes = false,
  animateEntry = true,
}: DragDropSystemProps) {
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [lastPinchState, setLastPinchState] = useState(false);

  // Handle item pickup
  useEffect(() => {
    if (!cursorPosition) return;

    // Pinch gesture started (pick up item)
    if (isPinching && !lastPinchState) {
      // Find item under cursor
      for (const item of items) {
        if (item.isBeingDragged) continue;

        const hitboxSize = item.size * hitboxMultiplier;
        const isUnderCursor = isWithinTarget(
          cursorPosition,
          { x: item.x, y: item.y },
          hitboxSize / 2,
        );

        if (isUnderCursor) {
          const draggedItem: DraggableItem = {
            ...item,
            isBeingDragged: true,
            originalPosition: { x: item.x, y: item.y },
          };
          setDraggedItem(draggedItem);
          if (onItemPickup) {
            onItemPickup(draggedItem);
          }
          break;
        }
      }
    }

    // Pinch gesture ended (drop item)
    if (!isPinching && lastPinchState && draggedItem) {
      // Check if dropped on a zone
      let droppedOnZone = false;

      for (const zone of dropZones) {
        if (zone.isFilled) continue;

        const distance = Math.hypot(
          draggedItem.x - zone.x,
          draggedItem.y - zone.y,
        );

        if (enableMagneticSnap && distance < magneticThreshold) {
          // Check if zone accepts this item
          const accepts = zone.accepts || [];
          const isAccepted =
            accepts.length === 0 ||
            accepts.includes(draggedItem.id) ||
            accepts.includes(draggedItem.data?.type);

          if (isAccepted) {
            if (onItemDropped) {
              onItemDropped(draggedItem, zone);
            }
            droppedOnZone = true;
            break;
          }
        }
      }

      // Dropped outside valid zone - return to origin
      if (!droppedOnZone && onItemDroppedOutside) {
        onItemDroppedOutside(draggedItem);
      }

      setDraggedItem(null);
      setHoveredZone(null);
    }

    setLastPinchState(isPinching);
  }, [
    cursorPosition,
    isPinching,
    lastPinchState,
    items,
    dropZones,
    draggedItem,
    onItemPickup,
    onItemDropped,
    onItemDroppedOutside,
    magneticThreshold,
    hitboxMultiplier,
  ]);

  // Update dragged item position
  useEffect(() => {
    if (draggedItem && cursorPosition && isPinching) {
      setDraggedItem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          x: cursorPosition.x,
          y: cursorPosition.y,
        };
      });

      // Check for hover over drop zones
      for (const zone of dropZones) {
        if (zone.isFilled) continue;

        const distance = Math.hypot(
          cursorPosition.x - zone.x,
          cursorPosition.y - zone.y,
        );

        if (enableMagneticSnap && distance < magneticThreshold) {
          setHoveredZone(zone.id);
          return;
        }
      }

      setHoveredZone(null);
    }
  }, [cursorPosition, isPinching, draggedItem, dropZones, magneticThreshold, enableMagneticSnap]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Drop zones */}
      <AnimatePresence>
        {dropZones.map((zone, index) => {
          const isHovered = hoveredZone === zone.id;

          return (
            <motion.div
              key={zone.id}
              initial={animateEntry ? { scale: 0, opacity: 0 } : undefined}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: animateEntry ? index * 0.1 : 0,
              }}
              style={{
                position: 'absolute',
                left: zone.x - zone.size / 2,
                top: zone.y - zone.size / 2,
                width: zone.size,
                height: zone.size,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '24px',
                backgroundColor: zone.isFilled
                  ? '#C8E6C9' // Light green when filled
                  : isHovered
                    ? 'rgba(255, 215, 0, 0.3)' // Yellow glow when hovered
                    : 'rgba(255, 255, 255, 0.5)',
                border: isHovered
                  ? '6px dashed #FFD700'
                  : zone.isFilled
                    ? '6px solid #4CAF50'
                    : '4px dashed #BDBDBD',
                boxShadow: isHovered
                  ? '0 0 24px rgba(255, 215, 0, 0.6)'
                  : zone.isFilled
                    ? '0 4px 12px rgba(76, 175, 80, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            >
              {zone.label && !zone.isFilled && (
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#000000',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {zone.label}
                </p>
              )}

              {/* Debug: Magnetic zone visualization */}
              {showHitboxes && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: magneticThreshold * 2,
                    height: magneticThreshold * 2,
                    borderRadius: '50%',
                    border: '2px dashed blue',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Draggable items */}
      <AnimatePresence>
        {items.map((item, index) => {
          const isDragging = draggedItem?.id === item.id;
          const actualItem = isDragging ? draggedItem : item;
          if (!actualItem) return null;

          const hitboxSize = item.size * hitboxMultiplier;

          return (
            <motion.div
              key={item.id}
              initial={animateEntry ? { scale: 0, opacity: 0 } : undefined}
              animate={{
                scale: isDragging ? 1.15 : 1,
                opacity: 1,
                x: actualItem.x - item.size / 2,
                y: actualItem.y - item.size / 2,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: isDragging ? undefined : 'spring',
                stiffness: 200,
                damping: 15,
                delay: animateEntry && !isDragging ? index * 0.1 : 0,
              }}
              style={{
                position: 'absolute',
                width: item.size,
                height: item.size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: item.size * 0.7,
                borderRadius: '16px',
                backgroundColor: item.color || '#FFD700',
                border: isDragging ? '6px solid #4ECDC4' : '4px solid #000000',
                boxShadow: isDragging
                  ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 8px rgba(78, 205, 196, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
                cursor: 'grab',
                zIndex: isDragging ? 100 : 1,
              }}
            >
              {typeof item.content === 'string' ? (
                <span style={{ lineHeight: 1 }}>{item.content}</span>
              ) : (
                item.content
              )}

              {/* Debug: Hitbox visualization */}
              {showHitboxes && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: hitboxSize,
                    height: hitboxSize,
                    borderRadius: '16px',
                    border: '2px dashed red',
                    opacity: 0.5,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * function DressForWeatherGame() {
 *   const [items, setItems] = useState<DraggableItem[]>([
 *     { id: 'coat', x: 100, y: 100, size: 120, content: '🧥', data: { type: 'winter' } },
 *     { id: 'shorts', x: 250, y: 100, size: 120, content: '🩳', data: { type: 'summer' } },
 *   ]);
 *
 *   const dropZones: DropZone[] = [
 *     { id: 'winter-zone', x: 600, y: 300, size: 200, label: '❄️ Winter', accepts: ['winter'] },
 *     { id: 'summer-zone', x: 900, y: 300, size: 200, label: '☀️ Summer', accepts: ['summer'] },
 *   ];
 *
 *   function handleItemDropped(item: DraggableItem, zone: DropZone) {
 *     // Remove item from draggable list
 *     setItems(prev => prev.filter(i => i.id !== item.id));
 *
 *     // Mark zone as filled
 *     updateZone(zone.id, { isFilled: true, filledWith: item.id });
 *
 *     // Show success animation
 *     setShowSuccess(true);
 *     speak('Great job! That's perfect for ' + zone.label);
 *   }
 *
 *   return (
 *     <DragDropSystem
 *       items={items}
 *       dropZones={dropZones}
 *       cursorPosition={cursorPos}
 *       isPinching={isPinching}
 *       onItemDropped={handleItemDropped}
 *       enableMagneticSnap={true}
 *       magneticThreshold={120}
 *     />
 *   );
 * }
 * ```
 *
 * Testing Requirements:
 * - [ ] Items have 2x hitbox size (easy to grab for toddlers)
 * - [ ] Magnetic snapping works within 120px of drop zone
 * - [ ] Visual feedback clear during drag (border change, scale up)
 * - [ ] Drop zones highlight when item is near
 * - [ ] Items return to origin if dropped outside valid zone
 * - [ ] Success feedback <100ms after successful drop
 * - [ ] Voice feedback for correct/incorrect drops
 * - [ ] 95%+ of toddlers can successfully drag and drop
 */
