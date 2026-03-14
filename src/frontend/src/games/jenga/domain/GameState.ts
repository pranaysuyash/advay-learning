import * as THREE from 'three';
import { JengaTower } from './Tower';
import { JengaBlock } from './Block';
import { 
  GameMode, 
  GAME_MODES, 
  TurnPhase,
  InputMode 
} from '../config/constants';

export interface GameStats {
  blocksRemoved: number;
  blocksPlaced: number;
  blocksInTower: number;
  totalBlocks: number;
  turnsTaken: number;
  towerHeight: number;
  stability: number;
  gameTime: number;
  score: number;
  streak: number;
  bestStreak: number;
  achievements: string[];
}

export interface MoveRecord {
  turn: number;
  player: number;
  blockNumber: number;
  action: 'removed' | 'placed';
  timestamp: number;
}

export class JengaGameState {
  readonly tower: JengaTower;
  readonly gameMode: GameMode;
  readonly playerCount: number;
  
  private _phase: TurnPhase = 'select';
  private _currentPlayer: number = 0;
  private _turn: number = 1;
  private _grabbedBlock: JengaBlock | null = null;
  private _targetNumbers: number[] = [];
  private _diceFaces: number[] = [];
  private _diceValue: number = 0;
  private _mathProblem: { question: string; answer: number } | null = null;
  private _gameOver: boolean = false;
  private _winner: number | null = null;
  private _collapseReason: string = '';
  private _moves: MoveRecord[] = [];
  private _startTime: number = Date.now();
  private _turnStartTime: number = Date.now();
  private _inputMode: InputMode = 'mouse';
  private _grabStartPosition: THREE.Vector3 | null = null;
  private _grabStartRotation: THREE.Quaternion | null = null;
  private _score: number = 0;
  private _streak: number = 0;
  private _bestStreak: number = 0;
  private _achievements: Set<string> = new Set();
  
  // Callbacks
  onPhaseChange?: (phase: TurnPhase) => void;
  onPlayerChange?: (player: number) => void;
  onGameOver?: (winner: number | null, reason: string) => void;
  onBlockGrabbed?: (block: JengaBlock) => void;
  onBlockRemoved?: (block: JengaBlock) => void;
  onBlockPlaced?: (block: JengaBlock) => void;
  onDiceRoll?: (value: number) => void;
  onMathProblem?: (problem: { question: string; answer: number }) => void;
  
  constructor(tower: JengaTower, gameMode: GameMode = 'classic', playerCount: number = 1) {
    this.tower = tower;
    this.gameMode = gameMode;
    this.playerCount = playerCount;
    
    this.resetTurnTarget();
  }
  
  // Getters
  get phase(): TurnPhase { return this._phase; }
  get currentPlayer(): number { return this._currentPlayer; }
  get turn(): number { return this._turn; }
  get grabbedBlock(): JengaBlock | null { return this._grabbedBlock; }
  get targetNumbers(): number[] { return [...this._targetNumbers]; }
  get diceFaces(): number[] { return [...this._diceFaces]; }
  get diceValue(): number { return this._diceValue; }
  get mathProblem() { return this._mathProblem; }
  get isGameOver(): boolean { return this._gameOver; }
  get winner(): number | null { return this._winner; }
  get collapseReason(): string { return this._collapseReason; }
  get moves(): MoveRecord[] { return [...this._moves]; }
  get inputMode(): InputMode { return this._inputMode; }
  get elapsedTime(): number { return Date.now() - this._startTime; }
  get score(): number { return this._score; }
  get streak(): number { return this._streak; }
  get bestStreak(): number { return this._bestStreak; }
  get achievements(): string[] { return Array.from(this._achievements); }
  
  get modeConfig() {
    return GAME_MODES[this.gameMode];
  }
  
  get isClassicMode(): boolean {
    return this.gameMode === 'classic';
  }
  
  get isDiceMode(): boolean {
    return this.gameMode === 'diceSingle' || this.gameMode === 'diceDouble';
  }
  
  get isSingleDiceMode(): boolean {
    return this.gameMode === 'diceSingle';
  }
  
  get isDoubleDiceMode(): boolean {
    return this.gameMode === 'diceDouble';
  }
  
  get isMathMode(): boolean {
    return this.gameMode === 'math';
  }
  
  get shouldShowTargetNumbers(): boolean {
    return this.modeConfig.showTargetNumbers;
  }

  get hasActiveTarget(): boolean {
    return this.gameMode === 'classic' || this._targetNumbers.length > 0;
  }
  
  // Set input mode
  setInputMode(mode: InputMode): void {
    this._inputMode = mode;
  }
  
  // Phase management
  private setPhase(phase: TurnPhase): void {
    this._phase = phase;
    this.onPhaseChange?.(phase);
  }

  private clearTargets(): void {
    this._diceFaces = [];
    this._diceValue = 0;
    this._targetNumbers = [];
    this._mathProblem = null;
  }
  
  private resetTurnTarget(): void {
    this.clearTargets();
    if (this.gameMode === 'classic') return;
  }

  private buildMathTargets(die1: number, die2: number): number[] {
    const valid = new Set<number>();
    valid.add(die1 + die2);
    valid.add(Math.abs(die1 - die2));
    valid.add(die1 * die2);

    if (die2 !== 0 && die1 % die2 === 0) valid.add(die1 / die2);
    if (die1 !== 0 && die2 % die1 === 0) valid.add(die2 / die1);

    const concat1 = parseInt(`${die1}${die2}`, 10);
    const concat2 = parseInt(`${die2}${die1}`, 10);
    if (concat1 >= 1 && concat1 <= 54) valid.add(concat1);
    if (concat2 >= 1 && concat2 <= 54) valid.add(concat2);
    valid.delete(0);

    return Array.from(valid)
      .filter((n) => n >= 1 && n <= 54)
      .sort((a, b) => a - b);
  }

  // Generate new target for dice/math modes
  generateNewTarget(): void {
    if (this._phase !== 'select' || this._gameOver) return;

    if (this.gameMode === 'diceSingle') {
      // Single die with "playable roll" guarantee.
      let die = Math.floor(Math.random() * 6) + 1;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        if (this.tower.getRemovableBlocksByNumber([die]).length > 0) {
          break;
        }
        die = Math.floor(Math.random() * 6) + 1;
      }
      this._diceFaces = [die];
      this._diceValue = die;
      this._targetNumbers = [die];
      this._mathProblem = null;
      this.onDiceRoll?.(die);
      return;
    }

    if (this.gameMode === 'diceDouble') {
      // Two dice with playable-target fallback.
      let die1 = Math.floor(Math.random() * 6) + 1;
      let die2 = Math.floor(Math.random() * 6) + 1;
      let total = die1 + die2;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (this.tower.getRemovableBlocksByNumber([total]).length > 0) {
          break;
        }
        die1 = Math.floor(Math.random() * 6) + 1;
        die2 = Math.floor(Math.random() * 6) + 1;
        total = die1 + die2;
      }
      this._diceFaces = [die1, die2];
      this._diceValue = total;
      this._targetNumbers = [total];
      this._mathProblem = { question: `${die1} + ${die2}`, answer: total };
      this.onDiceRoll?.(total);
      return;
    }

    if (this.gameMode === 'math') {
      // Math mode: ensure at least one currently removable target.
      let die1 = Math.floor(Math.random() * 6) + 1;
      let die2 = Math.floor(Math.random() * 6) + 1;
      let finalTargets = this.buildMathTargets(die1, die2);
      for (let attempt = 0; attempt < 12; attempt += 1) {
        if (this.tower.getRemovableBlocksByNumber(finalTargets).length > 0) {
          break;
        }
        die1 = Math.floor(Math.random() * 6) + 1;
        die2 = Math.floor(Math.random() * 6) + 1;
        finalTargets = this.buildMathTargets(die1, die2);
      }

      if (this.tower.getRemovableBlocksByNumber(finalTargets).length === 0) {
        // Last-resort fallback so kids are never blocked by impossible rolls.
        finalTargets = this.tower.getRemovableBlocks().slice(0, 3).map((block) => block.number);
      }

      this._diceFaces = [die1, die2];
      this._diceValue = die1 + die2;
      this._targetNumbers = finalTargets;
      this._mathProblem = {
        question: `${die1}, ${die2}`,
        answer: finalTargets[0] ?? 0,
      };
      this.onDiceRoll?.(this._diceValue);
      this.onMathProblem?.(this._mathProblem);
      return;
    }

    // Classic mode - all removable blocks are valid
    this.resetTurnTarget();
  }
  
  // Check if a block is a valid target
  isValidTarget(block: JengaBlock): boolean {
    if (this.gameMode === 'classic') {
      return this.tower.getRemovableBlocks().some(b => b.id === block.id);
    }
    
    // For dice/math modes, must match target AND be removable
    const isRemovable = this.tower.getRemovableBlocks().some(b => b.id === block.id);
    const matchesTarget = this._targetNumbers.includes(block.number);
    return isRemovable && matchesTarget;
  }
  
  // Get valid target blocks
  getValidTargets(): JengaBlock[] {
    if (this.gameMode === 'classic') {
      return this.tower.getRemovableBlocks();
    }
    if (!this._targetNumbers.length) {
      return [];
    }
    return this.tower.getRemovableBlocksByNumber(this._targetNumbers);
  }
  
  // Grab a block
  canGrabBlock(block: JengaBlock): boolean {
    if (this._phase !== 'select') return false;
    if (!this.hasActiveTarget) return false;
    if (!this.isValidTarget(block)) return false;
    return true;
  }
  
  grabBlock(block: JengaBlock): boolean {
    if (!this.canGrabBlock(block)) return false;
    
    if (block.grab()) {
      this._grabbedBlock = block;
      this._grabStartPosition = block.position;
      this._grabStartRotation = block.rotation;
      this.setPhase('grab');
      this.onBlockGrabbed?.(block);
      return true;
    }
    return false;
  }
  
  // Start extraction
  startExtract(): void {
    if (this._phase === 'grab' && this._grabbedBlock) {
      this.setPhase('extract');
    }
  }
  
  // Complete extraction (block is far enough from tower)
  completeExtract(): boolean {
    if (this._phase !== 'extract' || !this._grabbedBlock) return false;
    
    const extractedBlock = this._grabbedBlock;

    if (this.tower.removeBlock(extractedBlock)) {
      extractedBlock.markExtracted();
      
      // Record move
      this._moves.push({
        turn: this._turn,
        player: this._currentPlayer,
        blockNumber: extractedBlock.number,
        action: 'removed',
        timestamp: Date.now(),
      });
      
      this._grabbedBlock = null;
      this._grabStartPosition = null;
      this._grabStartRotation = null;
      this.setPhase('place');
      this.onBlockRemoved?.(extractedBlock);
      return true;
    }
    return false;
  }
  
  // Cancel grab (return block to tower)
  cancelGrab(): void {
    if (this._grabbedBlock) {
      if (this._grabStartPosition && this._grabStartRotation) {
        this._grabbedBlock.setPosition(this._grabStartPosition);
        this._grabbedBlock.setRotation(this._grabStartRotation);
        this._grabbedBlock.setVelocity(new THREE.Vector3(0, 0, 0));
      }
      this._grabbedBlock.release();
      this._grabbedBlock = null;
      this._grabStartPosition = null;
      this._grabStartRotation = null;
      this.setPhase('select');
    }
  }
  
  // Place on top
  canPlaceOnTop(): boolean {
    return this._phase === 'place' && this.tower.canPlaceOnTop();
  }
  
  placeOnTop(): boolean {
    if (!this.canPlaceOnTop()) return false;
    
    // Place the most recently extracted block to avoid stale extracted picks.
    const extractedBlocks = this.tower.extractedBlocks.filter((block) => block.isExtracted);
    const extractedBlock = extractedBlocks.length > 0 ? extractedBlocks[extractedBlocks.length - 1] : null;
    if (!extractedBlock) return false;
    
    const spot = this.tower.placeOnTop(extractedBlock);
    if (!spot) return false;
    
    // Record move
    this._moves.push({
      turn: this._turn,
      player: this._currentPlayer,
      blockNumber: extractedBlock.number,
      action: 'placed',
      timestamp: Date.now(),
    });

    const turnMs = Math.max(0, Date.now() - this._turnStartTime);
    const speedBonus = Math.max(0, 80 - Math.floor(turnMs / 1000) * 10);
    const streakBonus = this._streak * 12;
    this._score += 100 + speedBonus + streakBonus;
    this._streak += 1;
    this._bestStreak = Math.max(this._bestStreak, this._streak);
    if (this._streak >= 3) this._achievements.add('steady-hands');
    if (this.tower.placedOnTop.length >= 10) this._achievements.add('tower-builder');
    if (this._score >= 1500) this._achievements.add('jenga-star');
    
    this.onBlockPlaced?.(extractedBlock);
    this.setPhase('settle');
    return true;
  }
  
  // Check stability after placement
  checkStability(): void {
    if (this._phase !== 'settle') return;
    
    // Check if tower collapsed
    if (this.tower.hasCollapsed()) {
      this.endGame(false);
      return;
    }
    
    // Check if all blocks placed (win condition)
    if (this.tower.isComplete) {
      this.endGame(true);
      return;
    }
    
    // Next turn
    this.nextTurn();
  }
  
  // Force stability check (for settle timeout)
  forceStabilityCheck(): void {
    if (this._phase === 'settle') {
      this.checkStability();
    }
  }
  
  // Move to next turn
  private nextTurn(): void {
    this._currentPlayer = (this._currentPlayer + 1) % this.playerCount;
    if (this._currentPlayer === 0) {
      this._turn++;
    }
    
    this.setPhase('select');
    this._turnStartTime = Date.now();
    this.resetTurnTarget();
    this.onPlayerChange?.(this._currentPlayer);
  }
  
  // End game
  private endGame(isWin: boolean): void {
    this._gameOver = true;
    
    if (isWin) {
      this._winner = this._currentPlayer;
      this._collapseReason = 'All blocks placed! Tower complete!';
      this._achievements.add('tower-master');
    } else {
      // Previous player wins (they didn't knock it over)
      this._winner = (this._currentPlayer - 1 + this.playerCount) % this.playerCount;
      this._collapseReason = 'Tower collapsed!';
      this._streak = 0;
    }
    
    this.setPhase('check');
    this.onGameOver?.(this._winner, this._collapseReason);
  }
  
  // Get current stats
  getStats(): GameStats {
    const totalBlocks = this.tower.blocks.length;
    const blocksRemoved = this.tower.extractedBlocks.length;
    const blocksPlaced = this.tower.placedOnTop.length;
    const blocksInTower = totalBlocks - blocksRemoved;
    
    return {
      blocksRemoved,
      blocksPlaced,
      blocksInTower,
      totalBlocks,
      turnsTaken: this._turn,
      towerHeight: this.tower.getHighestOccupiedLayer() + 1,
      stability: this.tower.calculateStability(),
      gameTime: this.elapsedTime,
      score: this._score,
      streak: this._streak,
      bestStreak: this._bestStreak,
      achievements: Array.from(this._achievements),
    };
  }
  
  // Reset game
  reset(): void {
    this._phase = 'select';
    this._currentPlayer = 0;
    this._turn = 1;
    this._grabbedBlock = null;
    this._grabStartPosition = null;
    this._grabStartRotation = null;
    this._gameOver = false;
    this._winner = null;
    this._collapseReason = '';
    this._moves = [];
    this._startTime = Date.now();
    this._turnStartTime = Date.now();
    this._score = 0;
    this._streak = 0;
    this._bestStreak = 0;
    this._achievements = new Set();
    
    this.tower.reset();
    this.resetTurnTarget();
  }
  
  // Skip turn (forfeit - counts as collapse)
  skipTurn(): void {
    this.endGame(false);
  }
  
  // Serialize game state
  serialize(): object {
    return {
      gameMode: this.gameMode,
      playerCount: this.playerCount,
      phase: this._phase,
      currentPlayer: this._currentPlayer,
      turn: this._turn,
      gameOver: this._gameOver,
      winner: this._winner,
      tower: this.tower.serialize(),
      moves: this._moves,
      elapsedTime: this.elapsedTime,
      score: this._score,
      streak: this._streak,
      bestStreak: this._bestStreak,
      achievements: Array.from(this._achievements),
    };
  }
}
