import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import { JENGA_CONSTANTS, BlockState } from '../config/constants';

export interface BlockConfig {
  id: string;
  layerIndex: number;
  slotIndex: number;
  number: number;  // For dice/math modes
}

export class JengaBlock {
  readonly id: string;
  readonly number: number;
  readonly orientation: 'x' | 'z';
  
  private _layerIndex: number;
  private _slotIndex: number;
  
  private _state: BlockState = 'inTower';
  private _physicsBody: RAPIER.RigidBody | null = null;
  private _initialPosition: THREE.Vector3;
  private _initialRotation: THREE.Quaternion;
  
  // Visual properties
  woodColor: number;
  isHighlighted: boolean = false;
  highlightColor: number | null = null;
  
  constructor(config: BlockConfig) {
    this.id = config.id;
    this._layerIndex = config.layerIndex;
    this._slotIndex = config.slotIndex;
    this.number = config.number;
    this.orientation = config.layerIndex % 2 === 0 ? 'z' : 'x';
    
    // Vary wood color slightly for realism
    const baseColor = new THREE.Color(JENGA_CONSTANTS.COLORS.WOOD);
    const variation = (this.seededUnitNoise(11) - 0.5) * 0.1;
    baseColor.r += variation;
    baseColor.g += variation;
    baseColor.b += variation;
    this.woodColor = baseColor.getHex();
    
    // Calculate initial transform
    this._initialPosition = this.calculateInitialPosition();
    this._initialRotation = this.calculateInitialRotation();
  }
  
  // Getters
  get layerIndex(): number { return this._layerIndex; }
  get slotIndex(): number { return this._slotIndex; }
  get state(): BlockState { return this._state; }
  get isInTower(): boolean { return this._state === 'inTower'; }
  get isGrabbed(): boolean { return this._state === 'grabbed'; }
  get isExtracted(): boolean { return this._state === 'extracted'; }
  get isOnTop(): boolean { return this._state === 'onTop'; }
  get hasFallen(): boolean { return this._state === 'fallen'; }
  
  get dimensions() {
    return JENGA_CONSTANTS.BLOCK;
  }
  
  get position(): THREE.Vector3 {
    if (this._physicsBody) {
      const t = this._physicsBody.translation();
      return new THREE.Vector3(t.x, t.y, t.z);
    }
    return this._initialPosition.clone();
  }
  
  get rotation(): THREE.Quaternion {
    if (this._physicsBody) {
      const r = this._physicsBody.rotation();
      return new THREE.Quaternion(r.x, r.y, r.z, r.w);
    }
    return this._initialRotation.clone();
  }
  
  get initialPosition(): THREE.Vector3 {
    return this._initialPosition.clone();
  }
  
  get initialRotation(): THREE.Quaternion {
    return this._initialRotation.clone();
  }
  
  // Calculate initial position based on layer and slot
  private calculateInitialPosition(): THREE.Vector3 {
    const { WIDTH, HEIGHT } = JENGA_CONSTANTS.BLOCK;
    const { GAP, JITTER } = JENGA_CONSTANTS.TOWER;
    
    // Add jitter to prevent perfect stacking
    const jitterX = (this.seededUnitNoise(23) - 0.5) * JITTER;
    const jitterZ = (this.seededUnitNoise(47) - 0.5) * JITTER;
    
    const layerY = HEIGHT + 0.1 + this.layerIndex * (HEIGHT * 2 + GAP);
    
    if (this.orientation === 'z') {
      // Blocks run along Z axis
      const spacing = WIDTH * 2 + GAP;
      return new THREE.Vector3(
        (this.slotIndex - 1) * spacing + jitterX,
        layerY,
        jitterZ
      );
    } else {
      // Blocks run along X axis
      const spacing = WIDTH * 2 + GAP;
      return new THREE.Vector3(
        jitterX,
        layerY,
        (this.slotIndex - 1) * spacing + jitterZ
      );
    }
  }

  private seededUnitNoise(salt: number): number {
    let hash = 2166136261 ^ salt;
    const key = `${this.id}:${this._layerIndex}:${this._slotIndex}:${salt}`;
    for (let index = 0; index < key.length; index += 1) {
      hash ^= key.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 0xffffffff;
  }
  
  // Calculate initial rotation based on layer orientation
  private calculateInitialRotation(): THREE.Quaternion {
    if (this.orientation === 'z') {
      // No rotation - aligned with Z
      return new THREE.Quaternion(0, 0, 0, 1);
    } else {
      // Rotate 90 degrees around Y (PI/2)
      return new THREE.Quaternion(0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4));
    }
  }
  
  // Bind physics body
  bindPhysics(body: RAPIER.RigidBody): void {
    this._physicsBody = body;
  }
  
  get physicsBody(): RAPIER.RigidBody | null {
    return this._physicsBody;
  }
  
  // State management
  canRemove(currentTopLayer: number, hasSupport: boolean): boolean {
    if (this._state !== 'inTower') return false;
    if (this.layerIndex >= currentTopLayer) return false; // Top layer blocks
    if (!hasSupport) return false;
    return true;
  }
  
  grab(): boolean {
    if (this._state !== 'inTower' && this._state !== 'onTop') return false;
    
    this._state = 'grabbed';
    if (this._physicsBody) {
      this._physicsBody.wakeUp();
      this._physicsBody.setLinearDamping(JENGA_CONSTANTS.DRAG.GRAB_LINEAR_DAMPING);
      this._physicsBody.setAngularDamping(JENGA_CONSTANTS.DRAG.GRAB_ANGULAR_DAMPING);
    }
    return true;
  }
  
  release(): void {
    if (this._state === 'grabbed') {
      this._state = 'inTower';
      if (this._physicsBody) {
        this._physicsBody.setLinearDamping(JENGA_CONSTANTS.DRAG.RELEASE_LINEAR_DAMPING);
        this._physicsBody.setAngularDamping(JENGA_CONSTANTS.DRAG.RELEASE_ANGULAR_DAMPING);
      }
    }
  }
  
  markExtracted(): void {
    this._state = 'extracted';
    if (this._physicsBody) {
      this._physicsBody.setLinearDamping(JENGA_CONSTANTS.DRAG.RELEASE_LINEAR_DAMPING);
      this._physicsBody.setAngularDamping(JENGA_CONSTANTS.DRAG.RELEASE_ANGULAR_DAMPING);
    }
  }
  
  markPlacedOnTop(newLayer: number, newSlot: number): void {
    this._state = 'onTop';
    // Update layer and slot index for future calculations
    this._layerIndex = newLayer;
    this._slotIndex = newSlot;
  }
  
  markFallen(): void {
    this._state = 'fallen';
  }
  
  // Physics manipulation
  setVelocity(velocity: THREE.Vector3): void {
    if (this._physicsBody) {
      this._physicsBody.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
    }
  }
  
  setPosition(position: THREE.Vector3): void {
    if (this._physicsBody) {
      this._physicsBody.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
    }
  }
  
  setRotation(rotation: THREE.Quaternion): void {
    if (this._physicsBody) {
      this._physicsBody.setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }, true);
    }
  }
  
  wakeUp(): void {
    if (this._physicsBody) {
      this._physicsBody.wakeUp();
    }
  }
  
  // Visual helpers
  setHighlight(color: number | null): void {
    this.highlightColor = color;
    this.isHighlighted = color !== null;
  }
  
  clearHighlight(): void {
    this.highlightColor = null;
    this.isHighlighted = false;
  }
  
  // Get the color to render
  getRenderColor(isHovered: boolean, isRemovable: boolean): number {
    if (this.isGrabbed) {
      return JENGA_CONSTANTS.COLORS.GRABBED;
    }
    if (this.highlightColor) {
      return this.highlightColor;
    }
    if (isHovered) {
      return JENGA_CONSTANTS.COLORS.HOVER;
    }
    if (isRemovable && this.isInTower) {
      return JENGA_CONSTANTS.COLORS.REMOVABLE;
    }
    return this.woodColor;
  }
  
  // Check if this block supports another block
  supports(other: JengaBlock): boolean {
    if (this.layerIndex !== other.layerIndex - 1) return false;
    
    const thisPos = this.position;
    const otherPos = other.position;
    const { WIDTH, LENGTH } = this.dimensions;
    
    // Simple overlap check based on orientation
    if (this.orientation === 'z') {
      // This block runs along Z
      const overlapX = Math.abs(thisPos.x - otherPos.x) < WIDTH * 1.5;
      const overlapZ = Math.abs(thisPos.z - otherPos.z) < LENGTH * 0.5;
      return overlapX && overlapZ;
    } else {
      // This block runs along X
      const overlapX = Math.abs(thisPos.x - otherPos.x) < LENGTH * 0.5;
      const overlapZ = Math.abs(thisPos.z - otherPos.z) < WIDTH * 1.5;
      return overlapX && overlapZ;
    }
  }
  
  // Check if block has fallen (y position too low)
  hasFallenBelow(threshold: number): boolean {
    return this.position.y < threshold;
  }
  
  // Reset to initial state
  reset(): void {
    this._state = 'inTower';
    this.clearHighlight();
    if (this._physicsBody) {
      this._physicsBody.setTranslation({
        x: this._initialPosition.x,
        y: this._initialPosition.y,
        z: this._initialPosition.z,
      }, true);
      this._physicsBody.setRotation({
        x: this._initialRotation.x,
        y: this._initialRotation.y,
        z: this._initialRotation.z,
        w: this._initialRotation.w,
      }, true);
      this._physicsBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      this._physicsBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
      this._physicsBody.setLinearDamping(JENGA_CONSTANTS.DRAG.RELEASE_LINEAR_DAMPING);
      this._physicsBody.setAngularDamping(JENGA_CONSTANTS.DRAG.RELEASE_ANGULAR_DAMPING);
    }
  }
}
