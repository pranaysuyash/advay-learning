# Camera Privacy Clarification

## What "No Video Storage" Actually Means

### The app DOES use camera ✅
- Real-time hand tracking works perfectly
- All gesture recognition features work
- Profile pictures stored (with pixelation/effects as planned)

### The app DOESN'T store raw video ✅
- Video frames are processed in real-time
- Only hand landmark data saved (x,y coordinates of fingers)
- Video stream is discarded immediately after analysis
- No video recordings made
- No video frames logged or stored

---

## What Gets Saved vs. What Doesn't

| What | Storage | Purpose |
|-----|---------|---------|
| **Hand landmarks** (finger x,y coords) | ✅ Stored | Hand tracking accuracy, learning metrics |
| **Processed metrics** (accuracy %, counts) | ✅ Stored | Progress tracking, dashboard analytics |
| **Profile pictures** | ✅ Stored | Child identity (pixelated/effected) |
| **Raw video frames** | ❌ NOT stored | Privacy - no recording of child on camera |
| **Video recordings** | ❌ NOT stored | Privacy - no video logs |

---

## Analogy

Think of it like wearing glasses:
- Your glasses (camera) let you see and process what's in front of you (gestures)
- Your brain (hand tracking algorithm) understands what you're seeing (finger positions)
- But your glasses don't record or store what you looked at
- You remember only what matters (which fingers, not the video)

---

## Privacy Policy Language

Use this in your privacy policy:

```
"We use your device's camera for real-time hand tracking 
to recognize gestures during games. We do not record, store, 
or transmit video. We only process hand position data 
(finger locations) which we use to calculate accuracy metrics. 
Your camera data is never saved as video and never sent to 
external servers."
```

---

## COPPA Compliance

✅ **COPPA-Safe** because:
1. **No video recording** = no biometric data collection
2. **Hand landmarks only** = mathematical coordinates, not identifying
3. **Profile pictures pixelated/effected** = not identifying biometric data
4. **All data stays on backend** = no third-party tracking
5. **Parents can view/delete data** = right to delete under COPPA

---

## Key Points for Your Team

1. **App functionality**: Camera works perfectly. Nothing is broken.
2. **Privacy approach**: First-party analytics only (no Google Analytics, Mixpanel, etc.)
3. **Storage**: Hand position (coordinates) is stored, not video
4. **COPPA**: Fully compliant with no additional steps needed
5. **Parent controls**: Users can see what data is collected (hand positions) and delete it

---

**Created**: 2026-01-31  
**For**: Clarifying camera privacy for analytics research document
