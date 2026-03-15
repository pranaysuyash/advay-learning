/**
 * Pose matching utilities for camera-based games.
 * Provides reusable functions for detecting body poses using MediaPipe landmarks.
 */

export interface PoseLandmarks {
  nose: { x: number; y: number };
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  leftWrist: { x: number; y: number };
  rightWrist: { x: number; y: number };
}

export type PoseAction = 'head' | 'armsUp' | 'handsOnHips' | 'shoulders' | 'wave' | 'tRex';

/**
 * Extract key landmarks from MediaPipe pose array
 */
export function extractPoseLandmarks(landmarks: any[]): PoseLandmarks {
  return {
    nose: landmarks[0],
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftWrist: landmarks[15],
    rightWrist: landmarks[16],
  };
}

/**
 * Calculate pose match score (0-100) based on landmark positions and action type
 */
export function calculatePoseMatchScore(
  landmarks: any[],
  action: PoseAction
): number {
  const pose = extractPoseLandmarks(landmarks);

  switch (action) {
    case 'head':
      return (pose.leftWrist.y < 0.3 && Math.abs(pose.leftWrist.x - pose.nose.x) < 0.2) ||
             (pose.rightWrist.y < 0.3 && Math.abs(pose.rightWrist.x - pose.nose.x) < 0.2)
        ? 100 : 0;
    case 'armsUp':
      return pose.leftWrist.y < pose.leftShoulder.y - 0.1 &&
             pose.rightWrist.y < pose.rightShoulder.y - 0.1
        ? 100 : 0;
    case 'handsOnHips':
      return pose.leftWrist.y > 0.4 && pose.leftWrist.y < 0.6 &&
             pose.rightWrist.y > 0.4 && pose.rightWrist.y < 0.6
        ? 100 : 0;
    case 'shoulders':
      return Math.abs(pose.leftWrist.x - pose.leftShoulder.x) < 0.15 &&
             Math.abs(pose.leftWrist.y - pose.leftShoulder.y) < 0.15 &&
             Math.abs(pose.rightWrist.x - pose.rightShoulder.x) < 0.15 &&
             Math.abs(pose.rightWrist.y - pose.rightShoulder.y) < 0.15
        ? 100 : 0;
    case 'wave':
      return (pose.leftWrist.y < pose.leftShoulder.y - 0.15 ||
             pose.rightWrist.y < pose.rightShoulder.y - 0.15)
        ? 100 : 0;
    case 'tRex':
      return Math.abs(pose.leftWrist.x - pose.leftShoulder.x) < 0.3 &&
             pose.leftWrist.y > pose.leftShoulder.y &&
             Math.abs(pose.rightWrist.x - pose.rightShoulder.x) < 0.3 &&
             pose.rightWrist.y > pose.rightShoulder.y
        ? 100 : 0;
    default:
      return 0;
  }
}

/**
 * Check if finger count matches target (for combo mode games)
 */
export function checkFingerMatch(
  gameMode: 'classic' | 'combo',
  targetFingers: number | null,
  detectedFingers: number
): boolean {
  if (gameMode !== 'combo') return true;
  return targetFingers !== null && detectedFingers === targetFingers;
}
