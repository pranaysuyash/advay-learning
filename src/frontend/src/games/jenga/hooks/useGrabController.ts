import { useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3, Vector2 } from 'three';
import { JengaBlock } from '../domain/Block';
import { JengaGameState } from '../domain/GameState';
import { JENGA_CONSTANTS } from '../config/constants';

interface GrabControllerOptions {
  enabled?: boolean;
  onGrabStart?: (block: JengaBlock) => void;
  onGrabEnd?: (block: JengaBlock, success: boolean) => void;
  extractDistanceMultiplier?: number;
  springStrength?: number;
  springDamping?: number;
  maxSpeedMultiplier?: number;
  lateralWiggleMultiplier?: number;
}

export function useGrabController(
  gameState: JengaGameState | null,
  options: GrabControllerOptions = {},
) {
  const { camera, gl } = useThree();
  const grabbedBlock = useRef<JengaBlock | null>(null);
  const isDragging = useRef(false);
  const releaseRef = useRef<() => void>(() => {});
  const grabStartClient = useRef(new Vector2());
  const grabStartPosition = useRef(new Vector3());
  const pullAxis = useRef(new Vector3(1, 0, 0));
  const lateralAxis = useRef(new Vector3(0, 0, 1));
  const screenPullDirection = useRef(new Vector2(1, 0));
  const pixelsPerWorldUnit = useRef(1);
  const dragDistance = useRef(0);

  const {
    enabled = true,
    onGrabStart,
    onGrabEnd,
    extractDistanceMultiplier = 1,
    springStrength = 18,
    springDamping = 0.45,
    maxSpeedMultiplier = 1,
    lateralWiggleMultiplier = 1,
  } = options;

  const worldToClient = useCallback(
    (worldPoint: Vector3): Vector2 => {
      const rect = gl.domElement.getBoundingClientRect();
      const projected = worldPoint.clone().project(camera);
      return new Vector2(
        rect.left + (projected.x + 1) * 0.5 * rect.width,
        rect.top + (1 - (projected.y + 1) * 0.5) * rect.height,
      );
    },
    [camera, gl.domElement],
  );

  // Actually grab a specific block (called from component after raycast)
  const grabBlock = useCallback(
    (
      block: JengaBlock,
      _hitPoint: Vector3,
      pointerClient?: { x: number; y: number },
    ): boolean => {
      if (!enabled || !gameState || grabbedBlock.current) return false;

      if (!gameState.canGrabBlock(block)) return false;

      if (gameState.grabBlock(block)) {
        grabbedBlock.current = block;
        isDragging.current = true;

        const blockPosition = block.position;
        const axis =
          block.orientation === 'x'
            ? new Vector3(1, 0, 0)
            : new Vector3(0, 0, 1);
        const screenOrigin = worldToClient(blockPosition);
        const screenAxisEnd = worldToClient(blockPosition.clone().add(axis));
        const projectedAxis = screenAxisEnd.clone().sub(screenOrigin);
        const projectedAxisLength = projectedAxis.length();

        grabStartPosition.current.copy(blockPosition);
        pullAxis.current.copy(axis);
        lateralAxis.current.copy(
          block.orientation === 'x' ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0),
        );
        screenPullDirection.current.copy(
          projectedAxisLength > 0.001
            ? projectedAxis.normalize()
            : new Vector2(
                block.orientation === 'x' ? 1 : 0,
                block.orientation === 'z' ? -1 : 0,
              ),
        );
        pixelsPerWorldUnit.current = Math.max(projectedAxisLength, 24);
        dragDistance.current = 0;

        if (pointerClient) {
          grabStartClient.current.set(pointerClient.x, pointerClient.y);
        } else {
          grabStartClient.current.copy(screenOrigin);
        }

        onGrabStart?.(block);
        return true;
      }

      return false;
    },
    [enabled, gameState, onGrabStart, worldToClient],
  );

  // Update drag position
  const updateDrag = useCallback(
    (screenX: number, screenY: number): void => {
      if (!grabbedBlock.current || !isDragging.current) return;

      const pointerDelta = new Vector2(
        screenX - grabStartClient.current.x,
        screenY - grabStartClient.current.y,
      );
      const projectedDistance = pointerDelta.dot(screenPullDirection.current);
      const axisWeightedDistance =
        Math.abs(screenPullDirection.current.x) >= Math.abs(screenPullDirection.current.y)
          ? pointerDelta.x * Math.sign(screenPullDirection.current.x || 1)
          : pointerDelta.y * Math.sign(screenPullDirection.current.y || 1);
      const worldDistance =
        (projectedDistance * 0.75 + axisWeightedDistance * 0.25) / pixelsPerWorldUnit.current;
      dragDistance.current = worldDistance;

      const targetPos = grabStartPosition.current
        .clone()
        .add(pullAxis.current.clone().multiplyScalar(worldDistance));
      const perpendicularScreenDirection = new Vector2(
        -screenPullDirection.current.y,
        screenPullDirection.current.x,
      );
      const lateralProjectedDistance = pointerDelta.dot(perpendicularScreenDirection);
      const lateralMax =
        JENGA_CONSTANTS.BLOCK.WIDTH *
        JENGA_CONSTANTS.DRAG.LATERAL_WIGGLE *
        lateralWiggleMultiplier;
      const lateralDistance = Math.max(
        -lateralMax,
        Math.min(
          lateralMax,
          (lateralProjectedDistance / pixelsPerWorldUnit.current) *
            JENGA_CONSTANTS.DRAG.LATERAL_WIGGLE *
            lateralWiggleMultiplier,
        ),
      );
      targetPos.add(lateralAxis.current.clone().multiplyScalar(lateralDistance));
      const currentPos = grabbedBlock.current.position;
      const delta = targetPos.sub(currentPos);
      const distance = delta.length();

      if (distance < 0.01) {
        grabbedBlock.current.setVelocity(new Vector3(0, 0, 0));
      } else {
        // Spring-like pull for physically satisfying extraction.
        const body = grabbedBlock.current.physicsBody;
        const linvel = body?.linvel();
        const currentVelocity = new Vector3(linvel?.x ?? 0, linvel?.y ?? 0, linvel?.z ?? 0);

        const springVelocity = delta.clone().multiplyScalar(
          JENGA_CONSTANTS.DRAG.ACCELERATION * springStrength,
        );
        const dampedVelocity = springVelocity.sub(
          currentVelocity.multiplyScalar(JENGA_CONSTANTS.DRAG.ACCELERATION * springDamping),
        );

        const maxSpeed = JENGA_CONSTANTS.DRAG.MAX_SPEED * maxSpeedMultiplier;
        const speed = dampedVelocity.length();
        if (speed > maxSpeed) {
          dampedVelocity.multiplyScalar(maxSpeed / speed);
        }
        grabbedBlock.current.setVelocity(dampedVelocity);
      }

      // Promote into extract once the player has intentionally pulled far enough.
      if (
        gameState?.phase === 'grab' &&
        Math.abs(dragDistance.current) >=
          JENGA_CONSTANTS.DRAG.EXTRACT_DISTANCE * extractDistanceMultiplier
      ) {
        gameState.startExtract();
      }
    },
    [
      extractDistanceMultiplier,
      gameState,
      lateralWiggleMultiplier,
      maxSpeedMultiplier,
      springDamping,
      springStrength,
    ],
  );

  // Release the grabbed block
  const release = useCallback((): void => {
    if (!grabbedBlock.current) return;

    const block = grabbedBlock.current;
    let success = false;

    // If we were in extract phase, complete extraction and move to explicit place phase.
    const extractionReached =
      Math.abs(dragDistance.current) >=
        JENGA_CONSTANTS.DRAG.EXTRACT_DISTANCE * extractDistanceMultiplier ||
      gameState?.tower.isExtractionComplete(block) === true;

    if (gameState?.phase === 'extract' && extractionReached) {
      success = gameState.completeExtract();
    } else if (gameState?.phase === 'grab' && extractionReached) {
      gameState.startExtract();
      success = gameState.completeExtract();
    }

    if (!success) {
      gameState?.cancelGrab();
    }

    onGrabEnd?.(block, success);
    grabbedBlock.current = null;
    isDragging.current = false;
    dragDistance.current = 0;
  }, [extractDistanceMultiplier, gameState, onGrabEnd]);

  useEffect(() => {
    releaseRef.current = release;
  }, [release]);

  // Get current grabbed block
  const getGrabbedBlock = useCallback((): JengaBlock | null => {
    return grabbedBlock.current;
  }, []);

  // Check if currently grabbing
  const isGrabbing = useCallback((): boolean => {
    return isDragging.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (grabbedBlock.current) {
        releaseRef.current();
      }
    };
  }, []);

  return {
    grabBlock,
    updateDrag,
    release,
    getGrabbedBlock,
    isGrabbing,
  };
}
