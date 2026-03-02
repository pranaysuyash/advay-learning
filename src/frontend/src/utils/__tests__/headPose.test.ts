import { describe, it, expect } from 'vitest';
import { calculateHeadPose } from '../headPose';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

describe('calculateHeadPose', () => {
    it('returns zeros for empty or insufficient landmarks', () => {
        expect(calculateHeadPose([])).toEqual({ pitch: 0, yaw: 0, roll: 0 });
        expect(calculateHeadPose([{ x: 0, y: 0, z: 0 }])).toEqual({ pitch: 0, yaw: 0, roll: 0 });
    });

    it('calculates neutral pose for a perfectly centered face', () => {
        // We need 478 landmarks. We'll populate just the ones we need for the test.
        const mockLandmarks = new Array(478).fill({ x: 0, y: 0, z: 0 }) as NormalizedLandmark[];

        // Simulate a straight-on face
        mockLandmarks[1] = { x: 0.5, y: 0.5, z: 0 }; // Nose
        mockLandmarks[152] = { x: 0.5, y: 0.86, z: 0 }; // Chin
        mockLandmarks[10] = { x: 0.5, y: 0.2, z: 0 }; // Top of head
        mockLandmarks[234] = { x: 0.2, y: 0.5, z: 0 }; // Left cheek
        mockLandmarks[454] = { x: 0.8, y: 0.5, z: 0 }; // Right cheek
        mockLandmarks[33] = { x: 0.35, y: 0.35, z: 0 }; // Left eye
        mockLandmarks[263] = { x: 0.65, y: 0.35, z: 0 }; // Right eye

        const pose = calculateHeadPose(mockLandmarks);

        expect(pose.roll).toBeCloseTo(0, 1);
        expect(pose.yaw).toBeCloseTo(0, 1);
        // Neutral pitch base line is 1.2
        // distNoseToChin = 0.36
        // distNoseToTop = 0.3
        // ratio = 1.2.
        // normalizedRatio = 1 -> log(1) = 0 -> pitch = 0.
        expect(pose.pitch).toBeCloseTo(0, 1);
    });

    it('detects right yaw', () => {
        const mockLandmarks = new Array(478).fill({ x: 0, y: 0, z: 0 }) as NormalizedLandmark[];
        // Nose shifted to user's left means face is turned right.
        mockLandmarks[1] = { x: 0.3, y: 0.5, z: 0 };
        mockLandmarks[152] = { x: 0.3, y: 0.8, z: 0 };
        mockLandmarks[10] = { x: 0.3, y: 0.2, z: 0 };
        mockLandmarks[234] = { x: 0.2, y: 0.5, z: 0 }; // left cheek closer to nose
        mockLandmarks[454] = { x: 0.8, y: 0.5, z: 0 }; // right cheek further
        mockLandmarks[33] = { x: 0.25, y: 0.35, z: 0 };
        mockLandmarks[263] = { x: 0.55, y: 0.35, z: 0 };

        const pose = calculateHeadPose(mockLandmarks);
        expect(pose.yaw).toBeGreaterThan(0); // Positive yaw for looking right
    });

    it('detects left roll', () => {
        const mockLandmarks = new Array(478).fill({ x: 0, y: 0, z: 0 }) as NormalizedLandmark[];
        mockLandmarks[1] = { x: 0.5, y: 0.5, z: 0 };
        mockLandmarks[152] = { x: 0.5, y: 0.8, z: 0 };
        mockLandmarks[10] = { x: 0.5, y: 0.2, z: 0 };
        mockLandmarks[234] = { x: 0.2, y: 0.5, z: 0 };
        mockLandmarks[454] = { x: 0.8, y: 0.5, z: 0 };
        // Right eye is higher than left eye (smaller Y)
        mockLandmarks[33] = { x: 0.35, y: 0.45, z: 0 };
        mockLandmarks[263] = { x: 0.65, y: 0.25, z: 0 };

        const pose = calculateHeadPose(mockLandmarks);
        // Delta Y = rightEye.y - leftEye.y = 0.25 - 0.45 = -0.2
        // Math.atan2(-0.2, 0.3) -> negative angle
        expect(pose.roll).toBeLessThan(0);
    });
});
