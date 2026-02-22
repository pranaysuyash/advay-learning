# Technical Architecture: The Intelligent Learning Engine

**Date:** 2026-02-21
**Status:** Architectural Design Document
**Purpose:** Outlining the React/MediaPipe architecture required to support "Invisible Rubber Banding" (Physical DDA) and Camera-Based Parental Controls.

---

## 1. The Core Differentiator: Physical vs. Cognitive Tracking

Traditional EdTech tracks **Cognitive** failure:
*Child selects 'A' instead of 'B' -> Mark as incorrect -> Lower difficulty.*

Advay Vision tracks **Physical** struggle (before cognitive failure occurs):
*Child's hand is trembling towards 'B' -> Velocity is low -> Expand hitbox of 'B' to guarantee success -> Maintain confidence.*

This requires a centralized "Intelligence Manager" that sits between the MediaPipe raw data and the Game rendered state.

---

## 2. Invisible "Rubber Banding" Engine (Physical DDA)

### The Component: `AdaptiveDifficultyManager.ts`
A singleton or high-level React Context that ingests real-time telemetry from `useHandTracking` and outputs modified game physics variables.

### How it Works (The Telemetry Loop)

1.  **Gather Metrics (per frame or per 500ms):**
    *   `handVelocity`: Speed of the index finger landmark.
    *   `pathJitter`: Deviation from a straight line (measures fine motor control capability).
    *   `timeToTarget`: How long the hand has hovered without making a decision.
    *   `frustrationAudioFlag`: (Future) Mic detects sighs, whining, or "I can't".

2.  **Calculate the "Struggle Index" (0.0 to 1.0):**
    *   `Struggle Index` increases if jitter is high, velocity is low, or time-to-target > 5 seconds.
    *   `Struggle Index` decreases if the child smoothly swiped the last 3 targets perfectly.

3.  **Apply Engine Modifiers (Silently):**
    *   **If Struggle > 0.7 (Need Help):**
        *   `targetHitboxRadius` = BaseRadius * 1.5 (Make the target 50% bigger invisibly).
        *   `magneticPullStrength` = 0.2 (The target literally pulls the cursor/hand proxy into the center if they get close).
        *   `gameSpeed` = BaseSpeed * 0.8 (Slow down falling objects).
    *   **If Struggle < 0.2 (In the Zone / Too Easy):**
        *   `targetHitboxRadius` = BaseRadius * 0.9 (Tighten precision requirements).
        *   `distractorCount` += 1 (Add a wrong answer to the screen to challenge working memory).
        *   `gameSpeed` = BaseSpeed * 1.1 (Speed up slightly).

### React Implementation Concept
`GameCard.tsx` consumes the modifiers rather than hardcoding physics:
```tsx
const { magneticPull, hitboxScale, gameSpeed } = useAdaptiveDifficulty();

// The visual circle is 50px, but the actual hit detection scales dynamically based on how much the child is struggling.
<HitZone 
  radius={50 * hitboxScale} 
  magnetic={magneticPull} 
/>
```

---

## 3. Camera-Based Parental Controls (The "Safety Lock")

The user identified a brilliant use-case for a camera-first app: **Enforcing screen time and parental supervision without relying on the honor system or annoying OS-level timers.**

### Feature A: "Adult Presence Required" Mode

**The Problem:** Parents want their 3-year-old using the app, but *only* if an adult is actively sitting next to them to guide them.
**The Solution:** 
1.  **MediaPipe Pose/Face Scanner:** The engine actively counts the number of detected faces/poses in the frame.
2.  **Size/Height Check:** It evaluates the bounding box size or estimated shoulder width of the detected skeletons.
3.  **The Logic:** If it only detects one small skeleton (the child), a 10-second timer starts.
4.  **The Lockout:** After 10 seconds of "No Adult Detected", the game pauses, blurs the screen, and Pip appears: *"Let's wait for mommy or daddy to sit with us!"*
5.  **Resume:** The moment an adult frame enters the camera view, the blur lifts instantly.

### Feature B: "Posture & Distance" Enforcer

**The Problem:** Kids shove the iPad 2 inches from their eyeballs.
**The Solution:**
1.  **Face Mesh Depth Estimation:** We track the `z` coordinate (depth) of the face landmarks or the relative distance between the eyes.
2.  **The Logic:** If `estimatedDistance < 12_inches` for more than 3 seconds.
3.  **The Lockout:** Screen blur. Pip says: *"Whoa! Too close! Let's back up so I can see you."*
4.  **Resume:** They move back, the game instantly unblurs. It trains healthy physical habits automatically.

### Feature C: "Fatigue/Engagement" Early Exit

**The Problem:** Parents don't want kids staring blankly at educational apps when they are actually exhausted.
**The Solution:**
1.  **Blink/Yawn Tracking:** Using Face Landmarks, detect eye aspect ratio (closing eyes) and mouth aspect ratio (yawning).
2.  **Gaze Disengagement:** Count how often the child looks completely away from the screen payload for > 5 seconds.
3.  **The Logic:** If fatigue score hits a threshold, the app doesn't wait for the 15-minute timer to end.
4.  **The Lockout:** Pip interrupts: *"You did amazing today! I'm getting sleepy. Let's play tomorrow!"* and gracefully initiates the end-of-session sequence early.

---

## 4. System Architecture Diagram (Conceptual)

```
[ Camera Feed ] 
       │
       ▼
[ MediaPipe Runtime Worker ]  ───(Face, Pose, Hand Data)───┐
       │                                                   │
       ▼                                                   ▼
[ Intelligent Engine (Context)  ]                 [ Safety Monitor (Context) ]
  • Calculates Velocity/Jitter                      • Checks for Adult Skeleton
  • Calculates Struggle Index                       • Checks Eye Distance
       │                                            • Checks Fatigue
       ▼                                                   │
[ Game Components ] ◀──────────────────────────────────────┘
  • Receives scaled hitboxes
  • Receives magnetic pull strength
  • Checks 'isLocked' state (If adult left, render Blur overlay)
```

## Summary
By utilizing the physical tracking data we *already collect* for the games, we can build an invisible layer of intelligence that guarantees a frustration-free learning curve (Physical DDA) and strictly enforces healthy digital habits (Adult Presence, Posture Locks) without requiring parents to constantly hover and nag.
