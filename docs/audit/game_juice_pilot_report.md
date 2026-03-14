# Game Juice & Kid-Friendly Audit Report: Pilot

**Ticket**: TCK-20260314-005
**Date**: 2026-03-14
**Auditor**: Antigravity (Juice Expert)

---

## 1. Digital Jenga (3D)
**Current Score**: 6/10

### Analysis
Digital Jenga is technically impressive with its Rapier physics and "Rayman Hand" interaction, but it feels more like a simulation than a toy. It lacks the rewarding "pop" that keeps children engaged.

#### 🛠️ Axis Findings
| Axis | Finding | Impact |
| :--- | :--- | :--- |
| **Visual** | No particles on extraction or collapse. | Stiff. Feels "dry". |
| **Visual** | Target blocks have static green glow. | Low salience for kids. |
| **Audio** | Basic SFX triggers; no voice reinforcement. | Clinical. Needs a "cheerleader". |
| **UX** | HUD is text-heavy ("Choose a block", "Stack it up"). | Not preschool-friendly. |

#### 💡 Remediation Strategy
1.  **PulseTarget**: Animate `emissiveIntensity` for valid blocks (Sine wave loop).
2.  **SuccessBurst**: Trigger a `Confetti` or `Sparkle` emitter when a block is placed on top.
3.  **VoiceGuide**: Integrate `useVoiceInstructions` to say "Ooh, pick the shaky one!" or "Steady hands...".
4.  **Directional Arror**: Add a faint 3D arrow showing the pull direction when a block is grabbed.

---

## 2. Fruit Ninja Air (2D)
**Current Score**: 8/10

### Analysis
Fruit Ninja Air is the "Juice Gold Standard" in this repo. It uses `framer-motion` effectively for streaks and popups. However, the "slice" moment itself is visually thin.

#### 🛠️ Axis Findings
| Axis | Finding | Impact |
| :--- | :--- | :--- |
| **Visual** | Sliced fruits just disappear; no splash/splatter. | Lacks visceral satisfaction. |
| **Visual** | Score popups are good but static emojis are used. | Lower premium feel. |
| **Audio** | Excellent use of `playPop` and `speak`. | High engagement. |
| **Interaction** | Generous 40px hitbox. | High success rate for kids. |

#### 💡 Remediation Strategy
1.  **Emoji Splat**: On slice, replace the fruit emoji with a "splat" emoji (e.g., 💦 colored to match fruit) and two "half-fruit" debris particles flying apart.
2.  **Webcam Overlay Juice**: When the hand is detected, add a subtle border glow to the `CameraThumbnail`.

---

## 3. Balloon Pop Fitness
**Current Score**: 7.5/10

### Analysis
A great physical workout game with strong menu visuals. The gameplay is clear, but the "pop" event is mechanically simple on the canvas.

#### 🛠️ Axis Findings
| Axis | Finding | Impact |
| :--- | :--- | :--- |
| **Visual** | Balloons disappear instantly; no custom pop particles. | Lacks a tactile feel. |
| **Visual** | Combo text pulses but lacks "impact" animation. | Feedback could be more urgent. |
| **Audio** | Good variety of SFX (`pop`, `success`). | Engaging. |
| **UX** | Instructions are very clear and color-coded. | High accessibility. |

#### 💡 Remediation Strategy
1.  **PopFragments**: On pop, draw 5-8 small colored arcs flying away from the center of the balloon for 10 frames.
2.  **In-Game Voice**: Have the mascot say "Jump higher!" or "Great clap!" during specific action detections.
3.  **Haptic Combo**: Increase haptic intensity as the Combo count goes up.

---

## 🚀 Global Recommendations
1.  **Shared Juice Components**: We should create `src/frontend/src/components/game/Juice/` for reusable effects:
    - `<PulseWrapper />`
    - `<ConfettiBurst />`
    - `<VibrantText />`
2.  **Voice-First HUD**: Ensure every game uses `useVoiceInstructions` by default for phase transitions.
3.  **Haptic Standard**: Always trigger `success` haptics on score events.
