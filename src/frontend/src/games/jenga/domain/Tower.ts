import * as THREE from 'three';
import { JengaBlock } from './Block';
import { JENGA_CONSTANTS } from '../config/constants';
import type { RapierPhysics } from '../physics/RapierPhysics';

export interface TowerConfig {
  layers: number;
  blocksPerLayer: number;
}

export interface PlacementSpot {
  layerIndex: number;
  slotIndex: number;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
}

export class JengaTower {
  readonly blocks: JengaBlock[];
  readonly config: TowerConfig;
  
  private _currentTopLayer: number;
  private _currentTopFill: number;  // 0, 1, 2, or 3 blocks in current top layer
  private _extractedBlocks: JengaBlock[] = [];
  private _placedOnTop: JengaBlock[] = [];
  private _physics: RapierPhysics | null = null;
  
  constructor(config: TowerConfig, blocks: JengaBlock[]) {
    this.config = config;
    this.blocks = blocks;
    this._currentTopLayer = config.layers - 1;
    this._currentTopFill = 0;
  }
  
  // Getters
  get currentTopLayer(): number { return this._currentTopLayer; }
  get currentTopFill(): number { return this._currentTopFill; }
  get extractedBlocks(): JengaBlock[] { return [...this._extractedBlocks]; }
  get placedOnTop(): JengaBlock[] { return [...this._placedOnTop]; }
  get physics(): RapierPhysics | null { return this._physics; }
  
  get totalBlocksInTower(): number {
    return this.blocks.filter(b => b.isInTower || b.isOnTop).length;
  }
  
  get isComplete(): boolean {
    // Use unique ids so accidental duplicate pushes cannot false-trigger completion.
    return new Set(this._placedOnTop.map((block) => block.id)).size >= this.blocks.length;
  }
  
  // Get blocks in a specific layer
  getBlocksInLayer(layerIndex: number): JengaBlock[] {
    return this.blocks.filter(b => b.layerIndex === layerIndex);
  }
  
  // Get all blocks currently in the tower (not extracted)
  getTowerBlocks(): JengaBlock[] {
    return this.blocks.filter(b => b.isInTower || b.isOnTop);
  }

  attachPhysics(physics: RapierPhysics): void {
    this._physics = physics;
  }

  getExtractionDisplacement(block: JengaBlock): number {
    const position = block.position;
    const initial = block.initialPosition;

    return block.orientation === 'z'
      ? Math.abs(position.z - initial.z)
      : Math.abs(position.x - initial.x);
  }

  isBlockLoose(block: JengaBlock): boolean {
    return this.getSupportCount(block) === 0;
  }

  isExtractionComplete(block: JengaBlock): boolean {
    return this.getExtractionDisplacement(block) >= JENGA_CONSTANTS.DRAG.EXTRACT_DISTANCE;
  }
  
  // Check if a block has support (at least one block below it)
  hasSupport(block: JengaBlock): boolean {
    if (block.layerIndex === 0) return true; // Bottom layer always supported
    
    const belowLayer = this.getBlocksInLayer(block.layerIndex - 1)
      .filter(b => b.isInTower || b.isOnTop);
    
    if (belowLayer.length === 0) return false;
    
    // Check if any block in the layer below overlaps with this block
    return belowLayer.some(supportBlock => supportBlock.supports(block));
  }
  
  // Get count of supporting blocks
  getSupportCount(block: JengaBlock): number {
    if (block.layerIndex === 0) return 3;

    if (this._physics) {
      return this._physics.getSupportInfo(block.id).supportCount;
    }
    
    const belowLayer = this.getBlocksInLayer(block.layerIndex - 1)
      .filter(b => b.isInTower || b.isOnTop);
    
    return belowLayer.filter(supportBlock => supportBlock.supports(block)).length;
  }
  
  // Get all removable blocks
  getRemovableBlocks(): JengaBlock[] {
    return this.blocks.filter(b => {
      const hasSupport = this.getSupportCount(b) > 0;
      return b.canRemove(this._currentTopLayer, hasSupport);
    });
  }
  
  // Get removable blocks by number (for dice/math modes)
  getRemovableBlocksByNumber(numbers: number[]): JengaBlock[] {
    const removable = this.getRemovableBlocks();
    return removable.filter(b => numbers.includes(b.number));
  }
  
  // Remove a block from the tower
  removeBlock(block: JengaBlock): boolean {
    if (block.isExtracted) {
      return true;
    }

    const isEligibleTowerBlock =
      block.isGrabbed ||
      block.canRemove(this._currentTopLayer, this.getSupportCount(block) > 0);

    if (!isEligibleTowerBlock || block.layerIndex >= this._currentTopLayer) {
      return false;
    }

    block.markExtracted();
    if (!this._extractedBlocks.some((candidate) => candidate.id === block.id)) {
      this._extractedBlocks.push(block);
    }
    return true;
  }
  
  // Check if we can place a block on top
  canPlaceOnTop(): boolean {
    return this._currentTopFill < this.config.blocksPerLayer;
  }
  
  // Get the next placement spot on top
  getNextPlacementSpot(): PlacementSpot | null {
    if (!this.canPlaceOnTop()) return null;
    
    const { WIDTH, HEIGHT } = JENGA_CONSTANTS.BLOCK;
    const { GAP } = JENGA_CONSTANTS.TOWER;
    
    const newLayer = this._currentTopFill === 0 
      ? this._currentTopLayer + 1 
      : this._currentTopLayer;
    
    const orientation = newLayer % 2 === 0 ? 'z' : 'x';
    const spacing = WIDTH * 2 + GAP;
    const layerY = HEIGHT + 0.1 + newLayer * (HEIGHT * 2 + GAP);
    
    let position: THREE.Vector3;
    let rotation: THREE.Quaternion;
    
    if (orientation === 'z') {
      position = new THREE.Vector3(
        (this._currentTopFill - 1) * spacing,
        layerY,
        0
      );
      rotation = new THREE.Quaternion(0, 0, 0, 1);
    } else {
      position = new THREE.Vector3(
        0,
        layerY,
        (this._currentTopFill - 1) * spacing
      );
      rotation = new THREE.Quaternion(0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4));
    }
    
    return {
      layerIndex: newLayer,
      slotIndex: this._currentTopFill,
      position,
      rotation,
    };
  }
  
  // Place a block on top
  placeOnTop(block: JengaBlock): PlacementSpot | null {
    if (!this.canPlaceOnTop()) return null;
    if (block.state !== 'extracted') return null;
    
    const spot = this.getNextPlacementSpot();
    if (!spot) return null;
    
    // Move block to new position
    block.setPosition(spot.position);
    block.setRotation(spot.rotation);
    block.wakeUp();
    
    // Update block state
    block.markPlacedOnTop(spot.layerIndex, spot.slotIndex);
    
    // Update tower state
    if (!this._placedOnTop.some((candidate) => candidate.id === block.id)) {
      this._placedOnTop.push(block);
    }
    this._currentTopFill++;
    
    if (this._currentTopFill >= this.config.blocksPerLayer) {
      this._currentTopLayer = spot.layerIndex;
      this._currentTopFill = 0;
    }
    
    return spot;
  }
  
  // Calculate center of mass
  calculateCenterOfMass(): THREE.Vector3 {
    const towerBlocks = this.getTowerBlocks();
    if (towerBlocks.length === 0) return new THREE.Vector3(0, 0, 0);
    
    let totalMass = 0;
    let comX = 0, comY = 0, comZ = 0;
    
    for (const block of towerBlocks) {
      const pos = block.position;
      const mass = JENGA_CONSTANTS.PHYSICS.MASS;
      totalMass += mass;
      comX += pos.x * mass;
      comY += pos.y * mass;
      comZ += pos.z * mass;
    }
    
    return new THREE.Vector3(
      comX / totalMass,
      comY / totalMass,
      comZ / totalMass
    );
  }
  
  // Calculate stability (0-1, where 1 is perfectly stable)
  calculateStability(): number {
    const heuristic = this.calculateHeuristicStability();
    if (!this._physics) {
      return heuristic;
    }

    const contact = this.calculateContactStability();
    const blended = contact * 0.65 + heuristic * 0.35;
    return Math.max(0, Math.min(1, blended));
  }

  private calculateHeuristicStability(): number {
    const com = this.calculateCenterOfMass();
    
    // Base dimensions
    const { WIDTH } = JENGA_CONSTANTS.BLOCK;
    const baseWidth = WIDTH * 3 + JENGA_CONSTANTS.TOWER.GAP * 2;
    
    // Calculate deviation from center as ratio of base half-width
    const maxDeviation = Math.max(
      Math.abs(com.x) / (baseWidth / 2),
      Math.abs(com.z) / (baseWidth / 2)
    );
    
    // Stability decreases as COM moves away from center
    // 1.0 = perfectly centered, 0.0 = at edge, <0 = outside base
    return 1.0 - maxDeviation;
  }

  private calculateContactStability(): number {
    const towerBlocks = this.getTowerBlocks();
    if (towerBlocks.length === 0) return 1;

    let weightedScore = 0;
    let maxScore = 0;

    for (const block of towerBlocks) {
      const layerWeight = Math.max(1, this._currentTopLayer - block.layerIndex + 1);
      const supportScore =
        block.layerIndex === 0 ? 1 : Math.min(1, this.getSupportCount(block) / 2);

      weightedScore += supportScore * layerWeight;
      maxScore += layerWeight;
    }

    return maxScore === 0 ? 1 : weightedScore / maxScore;
  }

  private checkStability(towerBlocks: JengaBlock[]): boolean {
    if (this._physics) {
      const stability = this.calculateStability();
      const unsupportedLowerBlocks = towerBlocks.filter((block) => {
        if (block.layerIndex === 0) return false;
        if (block.layerIndex > Math.max(1, this._currentTopLayer - 3)) return false;
        return this.getSupportCount(block) === 0;
      }).length;

      return (
        stability < JENGA_CONSTANTS.STABILITY.COLLAPSE_THRESHOLD ||
        unsupportedLowerBlocks >= 2
      );
    }

    const stability = this.calculateHeuristicStability();
    if (stability < JENGA_CONSTANTS.STABILITY.COLLAPSE_THRESHOLD) {
      return true;
    }

    for (const block of this.blocks) {
      if (block.layerIndex < this._currentTopLayer - 2 && block.isInTower) {
        const initialY = block.initialPosition.y;
        const currentY = block.position.y;
        const heightDiff = Math.abs(currentY - initialY);
        if (heightDiff > JENGA_CONSTANTS.BLOCK.HEIGHT * 2) {
          return true;
        }
      }
    }

    return false;
  }
  
  // Check if tower has collapsed
  hasCollapsed(): boolean {
    // Check if any block has fallen
    const threshold = -2; // Below ground level
    const towerBlocks = this.getTowerBlocks();
    
    for (const block of towerBlocks) {
      if (block.hasFallenBelow(threshold)) {
        block.markFallen();
        return true;
      }
    }
    return this.checkStability(towerBlocks);
  }
  
  // Get blocks that have fallen
  getFallenBlocks(): JengaBlock[] {
    return this.blocks.filter(b => b.hasFallen);
  }
  
  // Get the highest layer with blocks
  getHighestOccupiedLayer(): number {
    let highest = 0;
    for (const block of this.blocks) {
      if ((block.isInTower || block.isOnTop) && block.layerIndex > highest) {
        highest = block.layerIndex;
      }
    }
    return highest;
  }
  
  // Reset tower to initial state
  reset(): void {
    this._currentTopLayer = this.config.layers - 1;
    this._currentTopFill = 0;
    this._extractedBlocks = [];
    this._placedOnTop = [];
    
    for (const block of this.blocks) {
      block.reset();
    }
  }
  
  // Serialize tower state (for save/load)
  serialize(): object {
    return {
      config: this.config,
      currentTopLayer: this._currentTopLayer,
      currentTopFill: this._currentTopFill,
      blocks: this.blocks.map(b => ({
        id: b.id,
        layerIndex: b.layerIndex,
        slotIndex: b.slotIndex,
        state: b.state,
        number: b.number,
      })),
    };
  }
}
