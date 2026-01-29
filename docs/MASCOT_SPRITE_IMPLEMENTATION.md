# Implementation Plan: Mascot Sprite Sheet Integration

## Goal Description
Integrate the newly generated "Pip" sprite sheet into the application to allow for expressive mascot animations (Idle, Wave, Jump, Think, ThumbsUp).

## User Review Required
> [!IMPORTANT]
> The sprite sheet will replace the single static image previously generated. The component logic will change from simple image switching to CSS sprite positioning.

## Proposed Changes

### Assets
#### [NEW] [pip_sprite_sheet.png]
- Process the generated sprite sheet to remove the white background.
- Save to `src/frontend/public/assets/images/pip_sprite_sheet.png`.

### Frontend Components
#### [MODIFY] [Mascot.tsx](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/components/Mascot.tsx)
- Update to use `pip_sprite_sheet.png`.
- Implement `getSpritePosition(state)` logic.
- Define sprite dimensions (approx grid based on generated image).
- Add mapped states:
  - `idle`: Pose 1
  - `waving`: Pose 2
  - `happy`: Pose 3 (Jumping)
  - `thinking`: Pose 4
  - `success`: Pose 6 (Thumbs up)

#### [MODIFY] [Game.tsx](file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/Game.tsx)
- No changes needed to props, just ensure state mapping in `Mascot.tsx` covers the values passed from Game.

## Verification Plan

### Manual Verification
1.  **Visual Check**: Open the Game page.
2.  **State Check**:
    - Observe "Idle" pose initially.
    - Trigger "Happy" (trace correctly) -> Verify Jump pose.
    - Trigger "Thinking" (loading/drawing) -> Verify Thinking pose.
