# Emoji Match Video Analysis Frames

Extracted from `emoji_match.mov` (60fps, 2798×1986) on 2026-02-20.

## Frames

| File | Timestamp | Description |
|------|-----------|-------------|
| `celebration.jpg` | 00:22 | Level 1 complete celebration with "You traced beautifully!" |
| `level1_complete.jpg` | 00:22 | Gameplay showing "Find: Surprised" with 15s remaining |
| `level1_again.jpg` | 00:40 | Another gameplay moment with "Yes! That's Happy!" success |
| `pinch_hint.jpg` | 00:26 | Hint "Pinch directly on an emoji" appears (player struggling) |
| `final.jpg` | 01:55 | Final/end screen |

## Key Observations

1. **No visible hand cursor** - Critical blocker for toddler use
2. **Cyan pinch indicator** visible in `pinch_hint.jpg` but too small (~15px)
3. **Colored rings** on emojis: orange, pink, red, blue - good color coding
4. **Timer** visible top-right, white on dark - low contrast
5. **Progress** shows "X/10" - confusing for pre-readers

## Latency Measurement

Cannot measure - no visible cursor to track from hand to screen.

## Tools Used

- `ffmpeg` for frame extraction
- `zai-mcp-server_extract_text_from_screenshot` for OCR
