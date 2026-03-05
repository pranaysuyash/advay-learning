export interface Gesture {
  type: 'tap' | 'pinch' | 'swipe' | 'hold';
  position: { x: number; y: number };
  direction?: 'left' | 'right' | 'up' | 'down';
}

/**
 * HandTracker is an input-state holder for physics playground.
 *
 * A camera-backed runtime can feed position/gestures through `setFrameData`,
 * while keyboard/touch fallback remains fully functional when unavailable.
 */
export class HandTracker {
  private isReady = false;
  private handPosition: { x: number; y: number } | null = null;
  private gestures: Gesture[] = [];

  constructor(autoReady = false) {
    this.isReady = autoReady;
  }

  async startCamera(_videoElement: HTMLVideoElement): Promise<void> {
    this.isReady = true;
  }

  async stopCamera(): Promise<void> {
    this.handPosition = null;
    this.gestures = [];
    this.isReady = false;
  }

  setFrameData(
    handPosition: { x: number; y: number } | null,
    gestures: Gesture[] = [],
  ): void {
    this.handPosition = handPosition;
    this.gestures = gestures;
    if (handPosition) {
      this.isReady = true;
    }
  }

  clearFrameData(): void {
    this.handPosition = null;
    this.gestures = [];
  }

  getHandPosition(): { x: number; y: number } | null {
    return this.handPosition;
  }

  getGestures(): Gesture[] {
    return this.gestures;
  }

  isHandTrackerReady(): boolean {
    return this.isReady;
  }
}
