import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface HeadPose {
    pitch: number; // degrees (positive is looking down, negative looking up)
    yaw: number; // degrees (positive looking right, negative looking left)
    roll: number; // degrees (positive head tilt right, negative head tilt left)
}

/**
 * Calculates approximate head pose (pitch, yaw, roll) from 2D facial landmarks.
 * This uses simple geometric heuristics suitable for basic attention tracking,
 * avoiding the overhead of full 3D Perspective-n-Point (PnP) solving.
 */
export function calculateHeadPose(landmarks: NormalizedLandmark[]): HeadPose {
    if (!landmarks || landmarks.length < 478) {
        return { pitch: 0, yaw: 0, roll: 0 };
    }

    // Key MediaPipe Face Mesh landmarks
    const nose = landmarks[1];
    const chin = landmarks[152];
    const topOfHead = landmarks[10];
    const leftCheekEdge = landmarks[234];
    const rightCheekEdge = landmarks[454];

    // Outer eyes
    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];

    // 1. Roll: angle between the eyes
    const deltaX = rightEyeOuter.x - leftEyeOuter.x;
    const deltaY = rightEyeOuter.y - leftEyeOuter.y;
    const roll = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // 2. Yaw: ratio of nose-to-right-cheek vs nose-to-left-cheek distances
    const distNoseToLeft = Math.hypot(nose.x - leftCheekEdge.x, nose.y - leftCheekEdge.y);
    const distNoseToRight = Math.hypot(nose.x - rightCheekEdge.x, nose.y - rightCheekEdge.y);

    let yaw = 0;
    if (distNoseToLeft > 0 && distNoseToRight > 0) {
        const yawRatio = distNoseToRight / distNoseToLeft;
        // Scale logarithmically to get roughly symmetric degrees
        yaw = (Math.log(yawRatio) / Math.LN2) * 45;
    }

    // 3. Pitch: ratio of nose-to-top vs nose-to-chin distances
    const distNoseToTop = Math.hypot(nose.x - topOfHead.x, nose.y - topOfHead.y);
    const distNoseToChin = Math.hypot(nose.x - chin.x, nose.y - chin.y);

    let pitch = 0;
    if (distNoseToTop > 0 && distNoseToChin > 0) {
        const pitchRatio = (distNoseToChin / distNoseToTop);
        // Empirical baseline: neutral is ~1.2
        const baselineRatio = 1.2;
        const normalizedRatio = pitchRatio / baselineRatio;
        pitch = (Math.log(normalizedRatio) / Math.LN2) * -45; // If looking up, chin dist increases -> negative pitch.
    }

    return {
        pitch: Math.max(-90, Math.min(90, pitch)),
        yaw: Math.max(-90, Math.min(90, yaw)),
        roll: Math.max(-90, Math.min(90, roll))
    };
}
