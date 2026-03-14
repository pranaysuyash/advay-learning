# Digital Jenga - Technical Specification

**Version:** 1.0  
**Date:** 2026-03-12  
**Status:** Draft for Review

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DigitalJenga3D.tsx                       │
│                    (Main Game Component)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    ▼                   ▼                   ▼
┌──────────┐     ┌──────────┐      ┌──────────────┐
│  Tower   │     │  Grab    │      │    UI/HUD    │
│Generator │     │Controller│      │   Overlay    │
└────┬─────┘     └────┬─────┘      └──────────────┘
     │                │
     ▼                ▼
┌─────────────────────────────┐
│      JengaGameState         │
│   (Domain Model + Logic)    │
└─────────────┬───────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐      ┌──────────┐
│  Block  │      │  Physics │
│ Entity  │      │  World   │
└────┬────┘      └────┬─────┘
     │                │
     └────────┬───────┘
              │
              ▼
       ┌────────────┐
       │   Rapier   │
       │   Physics  │
       │   (WASM)   │
       └────────────┘
```

---

## 2. Core Domain Models

### 2.1 Block Entity

```typescript
// src/games/jenga/domain/Block.ts

export type BlockState = 
  | 'inTower'    // Part of tower, physics active
  | 'grabbed'    // Currently being dragged
  | 'removed'    // Taken from tower, awaiting placement
  | 'onTop'      // Placed on top layer
  | 'fallen';    // Fell off, game over condition

export interface BlockDimensions {
  width: number;   // Short dimension (x)
  height: number;  // Thickness (y)  
  length: number;  // Long dimension (z)
}

export interface BlockPhysics {
  mass: number;           // kg
  friction: number;       // 0-1
  restitution: number;    // 0-1 (bounciness)
  linearDamping: number;
  angularDamping: number;
  ccdEnabled: boolean;    // Continuous collision detection
}

export interface BlockConfig {
  id: string;
  layerIndex: number;     // 0-17
  slotIndex: number;      // 0-2
  dimensions: BlockDimensions;
  physics: BlockPhysics;
  woodColor: number;      // Hex color
}

export class JengaBlock {
  readonly id: string;
  readonly layerIndex: number;
  readonly slotIndex: number;
  readonly orientation: 'x' | 'z';
  readonly dimensions: BlockDimensions;
  
  private _state: BlockState = 'inTower';
  private _physicsBody: RAPIER.RigidBody | null = null;
  private _visualMesh: THREE.Mesh | null = null;
  
  constructor(config: BlockConfig) {
    this.id = config.id;
    this.layerIndex = config.layerIndex;
    this.slotIndex = config.slotIndex;
    this.orientation = config.layerIndex % 2 === 0 ? 'z' : 'x';
    this.dimensions = config.dimensions;
    this.woodColor = config.woodColor;
  }
  
  // State access
  get state(): BlockState { return this._state; }
  get isInTower(): boolean { return this._state === 'inTower'; }
  get isGrabbed(): boolean { return this._state === 'grabbed'; }
  
  // Position/rotation from physics
  get position(): THREE.Vector3 {
    if (!this._physicsBody) return this.calculateInitialPosition();
    const t = this._physicsBody.translation();
    return new THREE.Vector3(t.x, t.y, t.z);
  }
  
  get rotation(): THREE.Quaternion {
    if (!this._physicsBody) return this.calculateInitialRotation();
    const r = this._physicsBody.rotation();
    return new THREE.Quaternion(r.x, r.y, r.z, r.w);
  }
  
  // Game logic
  get isInTopLayer(topLayerIndex: number): boolean {
    return this.layerIndex >= topLayerIndex;
  }
  
  canRemove(topLayerIndex: number, supportCount: number): boolean {
    if (this._state !== 'inTower') return false;
    if (this.isInTopLayer(topLayerIndex)) return false;
    return supportCount > 0;
  }
  
  // Physics binding
  bindPhysics(body: RAPIER.RigidBody): void {
    this._physicsBody = body;
  }
  
  bindVisual(mesh: THREE.Mesh): void {
    this._visualMesh = mesh;
  }
  
  // Actions
  grab(): boolean {
    if (this._state !== 'inTower') return false;
    this._state = 'grabbed';
    if (this._physicsBody) {
      this._physicsBody.wakeUp();
      this._physicsBody.setAngularDamping(2.0);
    }
    return true;
  }
  
  release(): void {
    if (this._state === 'grabbed') {
      this._state = 'inTower';
      if (this._physicsBody) {
        this._physicsBody.setAngularDamping(0.1);
      }
    }
  }
  
  markRemoved(): void {
    this._state = 'removed';
  }
  
  markPlacedOnTop(newLayer: number): void {
    this._state = 'onTop';
    this.layerIndex = newLayer;
  }
  
  setVelocity(velocity: THREE.Vector3): void {
    if (this._physicsBody) {
      this._physicsBody.setLinvel({ 
        x: velocity.x, y: velocity.y, z: velocity.z 
      }, true);
    }
  }
  
  // Private helpers
  private calculateInitialPosition(): THREE.Vector3 {
    const gap = 0.005;
    const { width, height, length } = this.dimensions;
    const spacing = width * 2 + gap;
    
    const layerY = height + 0.1 + this.layerIndex * (height * 2 + gap);
    
    if (this.orientation === 'x') {
      // Blocks run along X axis
      return new THREE.Vector3(
        (this.slotIndex - 1) * spacing,
        layerY,
        0
      );
    } else {
      // Blocks run along Z axis  
      return new THREE.Vector3(
        0,
        layerY,
        (this.slotIndex - 1) * spacing
      );
    }
  }
  
  private calculateInitialRotation(): THREE.Quaternion {
    if (this.orientation === 'x') {
      return new THREE.Quaternion(0, 0, 0, 1);
    } else {
      // Rotate 90 degrees around Y
      return new THREE.Quaternion(0, Math.sin(Math.PI/4), 0, Math.cos(Math.PI/4));
    }
  }
}
```

### 2.2 Tower Aggregate

```typescript
// src/games/jenga/domain/Tower.ts

export interface TowerConfig {
  layers: number;           // 18 for standard Jenga
  blocksPerLayer: number;   // 3
  gap: number;              // 0.005
  jitter: number;           // 0.002 (random imperfection)
}

export class JengaTower {
  readonly blocks: JengaBlock[] = [];
  readonly config: TowerConfig;
  
  private _topLayerIndex: number;
  private _topLayerFill: number = 0;
  private _removedBlocks: JengaBlock[] = [];
  
  constructor(config: TowerConfig, blocks: JengaBlock[]) {
    this.config = config;
    this.blocks = blocks;
    this._topLayerIndex = config.layers - 1;
  }
  
  // Queries
  get topLayerIndex(): number { return this._topLayerIndex; }
  get topLayerFill(): number { return this._topLayerFill; }
  get isComplete(): boolean { 
    return this._topLayerIndex >= this.config.layers * 2 - 1; 
  }
  
  getRemovableBlocks(): JengaBlock[] {
    return this.blocks.filter(b => 
      b.canRemove(this._topLayerIndex, this.calculateSupport(b))
    );
  }
  
  getBlocksInLayer(layerIndex: number): JengaBlock[] {
    return this.blocks.filter(b => b.layerIndex === layerIndex);
  }
  
  // Game actions
  removeBlock(block: JengaBlock): boolean {
    if (!block.canRemove(this._topLayerIndex, this.calculateSupport(block))) {
      return false;
    }
    
    block.markRemoved();
    this._removedBlocks.push(block);
    return true;
  }
  
  canPlaceOnTop(): boolean {
    return this._topLayerFill < this.config.blocksPerLayer;
  }
  
  placeOnTop(block: JengaBlock): boolean {
    if (!this.canPlaceOnTop()) return false;
    if (block.state !== 'removed') return false;
    
    const newLayer = this._topLayerFill === 0 
      ? this._topLayerIndex + 1 
      : this._topLayerIndex;
    
    block.markPlacedOnTop(newLayer);
    this._topLayerFill++;
    
    if (this._topLayerFill >= this.config.blocksPerLayer) {
      this._topLayerIndex = newLayer;
      this._topLayerFill = 0;
    }
    
    return true;
  }
  
  // Stability calculation
  calculateStability(): number {
    // Calculate center of mass
    let totalMass = 0;
    let comX = 0, comZ = 0;
    
    for (const block of this.blocks) {
      if (block.state === 'inTower' || block.state === 'onTop') {
        const pos = block.position;
        const mass = 1; // Simplified - use actual mass
        totalMass += mass;
        comX += pos.x * mass;
        comZ += pos.z * mass;
      }
    }
    
    if (totalMass === 0) return 0;
    
    comX /= totalMass;
    comZ /= totalMass;
    
    // Base half-width (from center)
    const baseWidth = this.blocks[0].dimensions.width * 1.5 + this.config.gap;
    
    // Deviation as ratio of base width
    const deviation = Math.sqrt(comX * comX + comZ * comZ) / baseWidth;
    
    // Stability: 1.0 = perfectly centered, 0.0 = on edge, <0 = fallen
    return 1.0 - deviation;
  }
  
  isCollapsed(): boolean {
    return this.calculateStability() < 0.3;
  }
  
  // Private helpers
  private calculateSupport(block: JengaBlock): number {
    // Count blocks in layer below that overlap with this block
    if (block.layerIndex === 0) return 3; // Base layer always supported
    
    const below = this.getBlocksInLayer(block.layerIndex - 1);
    let support = 0;
    
    for (const other of below) {
      if (this.blocksOverlap(block, other)) {
        support++;
      }
    }
    
    return support;
  }
  
  private blocksOverlap(a: JengaBlock, b: JengaBlock): boolean {
    // Simple AABB overlap check
    const posA = a.position;
    const posB = b.position;
    const dimA = a.dimensions;
    const dimB = b.dimensions;
    
    return Math.abs(posA.x - posB.x) < (dimA.width + dimB.width) &&
           Math.abs(posA.z - posB.z) < (dimA.length + dimB.length);
  }
}
```

### 2.3 Game State

```typescript
// src/games/jenga/domain/JengaGameState.ts

export type TurnPhase = 
  | 'select'      // Hovering, finding blocks
  | 'grab'        // Holding a block
  | 'extract'     // Pulling block from tower
  | 'place'       // Moving to top
  | 'settle'      // Waiting for physics
  | 'check';      // Checking win/loss

export interface JengaGameConfig {
  totalLayers: number;
  playerCount: number;
  enableHandTracking: boolean;
  showRemovableHighlight: boolean;
  placementSnap: boolean;
}

export class JengaGameState {
  readonly tower: JengaTower;
  readonly config: JengaGameConfig;
  
  private _phase: TurnPhase = 'select';
  private _currentPlayer: number = 0;
  private _grabbedBlock: JengaBlock | null = null;
  private _extractedBlock: JengaBlock | null = null;
  private _gameOver: boolean = false;
  private _winner: number | null = null;
  private _moves: MoveRecord[] = [];
  
  constructor(tower: JengaTower, config: JengaGameConfig) {
    this.tower = tower;
    this.config = config;
  }
  
  // State access
  get phase(): TurnPhase { return this._phase; }
  get currentPlayer(): number { return this._currentPlayer; }
  get grabbedBlock(): JengaBlock | null { return this._grabbedBlock; }
  get extractedBlock(): JengaBlock | null { return this._extractedBlock; }
  get isGameOver(): boolean { return this._gameOver; }
  get winner(): number | null { return this._winner; }
  
  // Actions
  canGrabBlock(block: JengaBlock): boolean {
    return this._phase === 'select' && 
           block.canRemove(this.tower.topLayerIndex, 1); // Simplified
  }
  
  grabBlock(block: JengaBlock): boolean {
    if (!this.canGrabBlock(block)) return false;
    
    if (block.grab()) {
      this._grabbedBlock = block;
      this._phase = 'grab';
      return true;
    }
    return false;
  }
  
  startExtract(): void {
    if (this._phase === 'grab' && this._grabbedBlock) {
      this._phase = 'extract';
    }
  }
  
  completeExtract(): boolean {
    if (this._phase !== 'extract' || !this._grabbedBlock) return false;
    
    if (this.tower.removeBlock(this._grabbedBlock)) {
      this._extractedBlock = this._grabbedBlock;
      this._grabbedBlock = null;
      this._phase = 'place';
      return true;
    }
    return false;
  }
  
  placeOnTop(): boolean {
    if (this._phase !== 'place' || !this._extractedBlock) return false;
    
    if (this.tower.placeOnTop(this._extractedBlock)) {
      this._extractedBlock = null;
      this._phase = 'settle';
      return true;
    }
    return false;
  }
  
  checkStability(): void {
    if (this._phase !== 'settle') return;
    
    if (this.tower.isCollapsed()) {
      this._gameOver = true;
      // Previous player wins (the one who didn't knock it over)
      this._winner = (this._currentPlayer - 1 + this.config.playerCount) 
                     % this.config.playerCount;
      this._phase = 'check';
    } else if (this.tower.isComplete) {
      this._gameOver = true;
      this._winner = this._currentPlayer;
      this._phase = 'check';
    } else {
      // Next player
      this._currentPlayer = (this._currentPlayer + 1) % this.config.playerCount;
      this._phase = 'select';
    }
  }
  
  releaseGrab(): void {
    if (this._grabbedBlock) {
      this._grabbedBlock.release();
      this._grabbedBlock = null;
      this._phase = 'select';
    }
  }
}
```

---

## 3. Physics Integration

### 3.1 Rapier World Setup

```typescript
// src/games/jenga/physics/RapierPhysics.ts

import RAPIER from '@dimforge/rapier3d-compat';

export interface PhysicsConfig {
  gravity: { x: number; y: number; z: number };
  timestep: number;
  substeps: number;
}

export class RapierPhysics {
  world: RAPIER.World;
  eventQueue: RAPIER.EventQueue;
  
  constructor(config: PhysicsConfig) {
    this.world = new RAPIER.World(config.gravity);
    this.eventQueue = new RAPIER.EventQueue(true);
  }
  
  step(): void {
    this.world.step(this.eventQueue);
  }
  
  createBlockBody(config: BlockConfig): RAPIER.RigidBody {
    const { width, height, length } = config.dimensions;
    const { mass, friction, restitution, ccdEnabled } = config.physics;
    
    const bodyDesc = RAPIER.RigidBodyDesc
      .dynamic()
      .setTranslation(
        config.initialPosition.x,
        config.initialPosition.y,
        config.initialPosition.z
      )
      .setRotation(config.initialRotation)
      .setCcdEnabled(ccdEnabled)
      .setLinearDamping(config.physics.linearDamping)
      .setAngularDamping(config.physics.angularDamping);
    
    const body = this.world.createRigidBody(bodyDesc);
    
    const colliderDesc = RAPIER.ColliderDesc
      .cuboid(width, height, length)
      .setMass(mass)
      .setFriction(friction)
      .setRestitution(restitution);
    
    this.world.createCollider(colliderDesc, body);
    
    return body;
  }
  
  createGround(): void {
    const groundDesc = RAPIER.RigidBodyDesc
      .fixed()
      .setTranslation(0, -0.1, 0);
    
    const ground = this.world.createRigidBody(groundDesc);
    
    const colliderDesc = RAPIER.ColliderDesc
      .cuboid(25, 0.1, 25)
      .setFriction(1.0);
    
    this.world.createCollider(colliderDesc, ground);
  }
}
```

### 3.2 Constants

```typescript
// src/games/jenga/config/constants.ts

export const JENGA_CONSTANTS = {
  // Block dimensions (in world units)
  // Standard Jenga: 7.5cm × 2.5cm × 1.5cm
  // Ratio: 3:1:0.6 (scaled to game world)
  BLOCK: {
    WIDTH: 0.75,   // x (short)
    HEIGHT: 0.25,  // y (thickness)
    LENGTH: 2.25,  // z (long)
  },
  
  // Tower configuration
  TOWER: {
    LAYERS: 18,
    BLOCKS_PER_LAYER: 3,
    GAP: 0.005,
    JITTER: 0.002,
  },
  
  // Physics tuning
  PHYSICS: {
    MASS: 0.8,
    FRICTION: 0.6,
    RESTITUTION: 0.0,
    LINEAR_DAMPING: 0.1,
    ANGULAR_DAMPING: 0.1,
    GRAVITY: -9.81,
    TIMESTEP: 1/60,
    SUBSTEPS: 4,
  },
  
  // Drag behavior
  DRAG: {
    MAX_SPEED: 1.5,        // m/s
    ACCELERATION: 10,
    GRAB_DAMPING: 2.0,     // While holding
    RELEASE_DAMPING: 0.1,  // After release
  },
  
  // Stability
  STABILITY: {
    COLLAPSE_THRESHOLD: 0.3,
    SLEEP_THRESHOLD: 0.1,
    SETTLE_TIME: 0.5,
  },
  
  // Visual
  COLORS: {
    WOOD: 0xd4a373,
    HOVER: 0xffd700,
    REMOVABLE: 0x90ee90,
    GRABBED: 0xff6b6b,
    POINTER: 0x00ff00,
  },
};
```

---

## 4. Component Architecture

### 4.1 PhysicsBlock Component

```tsx
// src/games/jenga/components/PhysicsBlock.tsx

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { JengaBlock } from '../domain/Block';

interface PhysicsBlockProps {
  block: JengaBlock;
  isHovered: boolean;
  isRemovable: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

export function PhysicsBlock({ 
  block, 
  isHovered, 
  isRemovable,
  onHover, 
  onClick 
}: PhysicsBlockProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Sync mesh to physics body
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(block.position);
      meshRef.current.quaternion.copy(block.rotation);
    }
  });
  
  // Bind mesh to block for raycasting
  useEffect(() => {
    if (meshRef.current) {
      block.bindVisual(meshRef.current);
    }
  }, [block]);
  
  // Determine color based on state
  const color = block.isGrabbed 
    ? JENGA_CONSTANTS.COLORS.GRABBED
    : isHovered 
      ? JENGA_CONSTANTS.COLORS.HOVER
      : isRemovable && block.state === 'inTower'
        ? JENGA_CONSTANTS.COLORS.REMOVABLE
        : JENGA_CONSTANTS.COLORS.WOOD;
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <boxGeometry 
        args={[
          block.dimensions.width * 2,
          block.dimensions.height * 2,
          block.dimensions.length * 2
        ]} 
      />
      <meshStandardMaterial 
        color={color}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}
```

### 4.2 GrabController Hook

```typescript
// src/games/jenga/hooks/useGrabController.ts

import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3, Plane, Raycaster } from 'three';
import { JengaBlock } from '../domain/Block';
import { JengaGameState } from '../domain/JengaGameState';

export function useGrabController(gameState: JengaGameState) {
  const { camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const dragPlane = useRef(new Plane());
  const grabOffset = useRef(new Vector3());
  const grabbedBlock = useRef<JengaBlock | null>(null);
  
  const attemptGrab = useCallback((point: Vector3, block: JengaBlock): boolean => {
    if (!gameState.canGrabBlock(block)) return false;
    
    if (gameState.grabBlock(block)) {
      grabbedBlock.current = block;
      
      // Setup drag plane
      const cameraDir = new Vector3();
      camera.getWorldDirection(cameraDir);
      dragPlane.current.setFromNormalAndCoplanarPoint(
        cameraDir.negate(),
        point
      );
      
      // Calculate offset
      grabOffset.current.subVectors(point, block.position);
      
      return true;
    }
    return false;
  }, [gameState, camera]);
  
  const updateDrag = useCallback((mouseX: number, mouseY: number): void => {
    if (!grabbedBlock.current) return;
    
    // Get ray from mouse
    raycaster.current.setFromCamera(
      { x: mouseX, y: mouseY },
      camera
    );
    
    // Intersect with drag plane
    const hitPoint = new Vector3();
    if (!raycaster.current.ray.intersectPlane(dragPlane.current, hitPoint)) {
      return;
    }
    
    // Calculate target position
    const targetPos = hitPoint.sub(grabOffset.current);
    const currentPos = grabbedBlock.current.position;
    
    // Calculate velocity with soft cap
    const diff = new Vector3().subVectors(targetPos, currentPos);
    const dist = diff.length();
    const dir = diff.normalize();
    
    const maxSpeed = JENGA_CONSTANTS.DRAG.MAX_SPEED;
    const speed = Math.min(dist * JENGA_CONSTANTS.DRAG.ACCELERATION, maxSpeed);
    
    grabbedBlock.current.setVelocity(dir.multiplyScalar(speed));
  }, [camera]);
  
  const release = useCallback((): void => {
    if (grabbedBlock.current) {
      gameState.releaseGrab();
      grabbedBlock.current = null;
    }
  }, [gameState]);
  
  return {
    attemptGrab,
    updateDrag,
    release,
    isGrabbing: !!grabbedBlock.current,
  };
}
```

### 4.3 Main Game Component

```tsx
// src/games/jenga/DigitalJenga3D.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { JengaTower } from './domain/Tower';
import { JengaGameState, JengaGameConfig } from './domain/JengaGameState';
import { RapierPhysics } from './physics/RapierPhysics';
import { PhysicsBlock } from './components/PhysicsBlock';
import { useGrabController } from './hooks/useGrabController';
import { JENGA_CONSTANTS } from './config/constants';
import { generateTowerBlocks } from './utils/generateTower';

interface DigitalJenga3DProps {
  level?: number;
  onComplete?: () => void;
}

export function DigitalJenga3D({ level = 1, onComplete }: DigitalJenga3DProps) {
  // Physics world
  const physicsRef = useRef<RapierPhysics | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<JengaGameState | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  
  // Initialize physics and game
  useEffect(() => {
    const init = async () => {
      // Initialize Rapier
      const RAPIER = await import('@dimforge/rapier3d-compat');
      await RAPIER.init();
      
      // Create physics world
      physicsRef.current = new RapierPhysics({
        gravity: { x: 0, y: JENGA_CONSTANTS.PHYSICS.GRAVITY, z: 0 },
        timestep: JENGA_CONSTANTS.PHYSICS.TIMESTEP,
        substeps: JENGA_CONSTANTS.PHYSICS.SUBSTEPS,
      });
      
      physicsRef.current.createGround();
      
      // Generate blocks
      const blocks = generateTowerBlocks({
        layers: JENGA_CONSTANTS.TOWER.LAYERS,
        blocksPerLayer: JENGA_CONSTANTS.TOWER.BLOCKS_PER_LAYER,
        gap: JENGA_CONSTANTS.TOWER.GAP,
        jitter: JENGA_CONSTANTS.TOWER.JITTER,
      });
      
      // Create physics bodies
      for (const block of blocks) {
        const body = physicsRef.current.createBlockBody({
          ...block,
          initialPosition: block.calculateInitialPosition(),
          initialRotation: block.calculateInitialRotation(),
        });
        block.bindPhysics(body);
      }
      
      // Create tower and game state
      const tower = new JengaTower(
        {
          layers: JENGA_CONSTANTS.TOWER.LAYERS,
          blocksPerLayer: JENGA_CONSTANTS.TOWER.BLOCKS_PER_LAYER,
          gap: JENGA_CONSTANTS.TOWER.GAP,
          jitter: JENGA_CONSTANTS.TOWER.JITTER,
        },
        blocks
      );
      
      const config: JengaGameConfig = {
        totalLayers: JENGA_CONSTANTS.TOWER.LAYERS,
        playerCount: 1,
        enableHandTracking: false,
        showRemovableHighlight: true,
        placementSnap: true,
      };
      
      setGameState(new JengaGameState(tower, config));
    };
    
    init();
  }, [level]);
  
  // Physics step
  useFrame(() => {
    if (physicsRef.current) {
      physicsRef.current.step();
    }
  });
  
  // Grab controller
  const grabController = useGrabController(gameState!);
  
  // Mouse handlers
  const handlePointerMove = useCallback((e: PointerEvent) => {
    grabController.updateDrag(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
  }, [grabController]);
  
  const handlePointerUp = useCallback(() => {
    grabController.release();
  }, [grabController]);
  
  // Setup mouse events
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);
  
  if (!gameState) return <div>Loading...</div>;
  
  const removableBlocks = gameState.tower.getRemovableBlocks();
  const removableIds = new Set(removableBlocks.map(b => b.id));
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* HUD */}
      <div className="jenga-hud">
        <div>Phase: {gameState.phase}</div>
        <div>Blocks: {gameState.tower.blocks.filter(b => b.state === 'inTower').length}</div>
        <div>Stability: {(gameState.tower.calculateStability() * 100).toFixed(1)}%</div>
      </div>
      
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 9, 18], fov: 40 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 15, 8]} 
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.6} />
        </mesh>
        
        {/* Blocks */}
        {gameState.tower.blocks.map(block => (
          <PhysicsBlock
            key={block.id}
            block={block}
            isHovered={hoveredBlock === block.id}
            isRemovable={removableIds.has(block.id)}
            onHover={(hovered) => setHoveredBlock(hovered ? block.id : null)}
            onClick={() => {
              // Raycast to find point
              // grabController.attemptGrab(point, block);
            }}
          />
        ))}
        
        <OrbitControls
          target={[0, 4, 0]}
          minDistance={10}
          maxDistance={30}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
```

---

## 5. File Structure

```
src/games/jenga/
├── domain/
│   ├── Block.ts              # Block entity
│   ├── Tower.ts              # Tower aggregate
│   ├── JengaGameState.ts     # Game state machine
│   └── types.ts              # Shared types
├── physics/
│   ├── RapierPhysics.ts      # Physics world wrapper
│   └── constants.ts          # Physics constants
├── components/
│   ├── PhysicsBlock.tsx      # Block visual component
│   ├── TowerView.tsx         # Tower container
│   ├── PointerDot.tsx        # Targeting indicator
│   └── HUD.tsx               # Game UI overlay
├── hooks/
│   ├── useGrabController.ts  # Drag interaction hook
│   ├── usePhysicsSync.ts     # Sync physics to visuals
│   └── useGameLoop.ts        # Game loop hook
├── utils/
│   ├── generateTower.ts      # Block generation
│   ├── stabilityCheck.ts     # Stability calculations
│   └── placement.ts          # Placement helpers
├── config/
│   └── constants.ts          # Game constants
├── DigitalJenga3D.tsx        # Main game component
└── index.ts                  # Public exports
```

---

## 6. Migration Plan

### Step 1: Install Dependencies

```bash
npm install @dimforge/rapier3d-compat
npm install -D @types/three  # If not present
```

### Step 2: Create Domain Models

1. Copy `Block.ts`, `Tower.ts`, `JengaGameState.ts` to domain/
2. Add unit tests for each

### Step 3: Create Physics Layer

1. Copy `RapierPhysics.ts` to physics/
2. Create ground plane and block creation

### Step 4: Create Components

1. Copy `PhysicsBlock.tsx` to components/
2. Copy `useGrabController.ts` to hooks/

### Step 5: Replace Main Component

1. Update `DigitalJenga3D.tsx` with new implementation
2. Add HUD and game state display

### Step 6: Testing

1. Unit tests for domain models
2. Integration tests for game loop
3. Manual playtesting

### Step 7: Cleanup

1. Remove old 2D implementation files
2. Update imports in game registry
3. Update documentation

---

## 7. Acceptance Criteria

### Functional Requirements

- [ ] Tower generates with 54 blocks in correct pattern
- [ ] Physics is stable on startup (no explosions)
- [ ] Can hover over blocks and see highlight
- [ ] Can grab removable blocks (green highlight)
- [ ] Cannot grab top layer blocks
- [ ] Dragging uses velocity-based control (not constraints)
- [ ] Release works and block settles
- [ ] Can place block on top
- [ ] Tower stability calculates correctly
- [ ] Collapse detection works
- [ ] Game over triggers when tower falls

### Technical Requirements

- [ ] 60 FPS maintained during gameplay
- [ ] Physics timestep independent of render
- [ ] Clean separation of domain/physics/presentation
- [ ] TypeScript compiles with no errors
- [ ] Unit tests pass
- [ ] No memory leaks on unmount

### UX Requirements

- [ ] Clear visual feedback for all states
- [ ] Smooth, responsive drag interaction
- [ ] Camera controls work (orbit)
- [ ] Sound feedback for grab/release
- [ ] Tutorial or instructions available

---

*End of Technical Specification*
