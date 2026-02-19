# Prompt: AI Feature Health Check

**Version:** 1.0.0
**Purpose:** Verify AI features are working correctly
**When to Use:** After deployment, after updates, during debugging
**Estimated Time:** 10-15 minutes

---

## Context

You are checking the health and functionality of AI-native features in the Advay Vision Learning app. This includes LLM responses, TTS, STT, and vision services.

## Pre-Check Requirements

Before running this check, ensure:

- [ ] Backend is running (`cd src/backend && uv run uvicorn app.main:app`)
- [ ] Frontend is running (`cd src/frontend && npm run dev`)
- [ ] Ollama is running (if using local LLM): `ollama serve`
- [ ] Required models are pulled: `ollama pull llama3.2:3b`

## Health Check Tasks

### 1. LLM Service Check

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test basic generation
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Say hello to a 5 year old named Maya in one short sentence.",
  "stream": false
}'
```

**Expected:** Response within 2 seconds, child-appropriate language

**Verify:**

- [ ] Ollama responds with model list
- [ ] Generation completes without error
- [ ] Response is age-appropriate
- [ ] Latency < 2000ms

### 2. TTS Service Check

```javascript
// Run in browser console on the app
const utterance = new SpeechSynthesisUtterance("Hello Maya! Let's learn together!");
utterance.rate = 1.1;
utterance.pitch = 1.2;
speechSynthesis.speak(utterance);
```

**Expected:** Audio plays with warm, friendly tone

**Verify:**

- [ ] Speech synthesis available (`speechSynthesis` exists)
- [ ] Voices available (`speechSynthesis.getVoices().length > 0`)
- [ ] Audio plays without errors
- [ ] Volume and pitch are appropriate

### 3. STT Service Check

```javascript
// Run in browser console
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (e) => console.log('Heard:', e.results[0][0].transcript);
recognition.onerror = (e) => console.error('Error:', e.error);
recognition.start();
// Say something, then check console
```

**Expected:** Transcription appears in console

**Verify:**

- [ ] Speech recognition available
- [ ] Microphone permission granted
- [ ] Transcription is reasonably accurate
- [ ] Handles silence gracefully

### 4. Vision Service Check

```javascript
// Check MediaPipe hand tracking (existing feature)
// Navigate to Game page, enable camera
// Wave hand in front of camera
```

**Expected:** Hand landmarks detected, cursor moves

**Verify:**

- [ ] Camera permission granted
- [ ] Hand detection works
- [ ] Latency < 100ms
- [ ] No frames stored (check Network tab)

### 5. Provider Fallback Check

```bash
# Stop Ollama to test fallback
# pkill ollama

# Then trigger LLM request in app
# Should fall back to templates or cloud provider
```

**Expected:** App continues working with degraded features

**Verify:**

- [ ] No crash when Ollama unavailable
- [ ] Fallback message displayed or template used
- [ ] User experience remains functional

## Integration Check

### 6. End-to-End Flow

1. Open the app in browser
2. Navigate to Game page
3. Enable voice features (if available)
4. Say "Hello Pip"
5. Observe Pip's response (text + voice)
6. Trace a letter
7. Observe feedback (Pip reaction + voice)

**Verify:**

- [ ] Voice input recognized
- [ ] Pip responds contextually
- [ ] TTS plays response
- [ ] Feedback is encouraging
- [ ] No errors in console

## Reporting Template

```markdown
## AI Feature Health Check Report
**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [dev/staging/prod]

### Results Summary
| Service | Status | Latency | Notes |
|---------|--------|---------|-------|
| LLM (Ollama) | PASS/FAIL | XXXms | |
| TTS | PASS/FAIL | XXXms | |
| STT | PASS/FAIL | XXXms | |
| Vision | PASS/FAIL | XXXms | |
| Fallback | PASS/FAIL | N/A | |
| E2E Flow | PASS/FAIL | N/A | |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

## Troubleshooting

### LLM Not Responding

```bash
# Check Ollama status
systemctl status ollama  # Linux
brew services info ollama  # macOS

# Check model is loaded
ollama list

# Pull model if missing
ollama pull llama3.2:3b
```

### TTS Not Working

- Check browser compatibility (Chrome, Edge recommended)
- Verify audio output device
- Check for browser permissions

### STT Not Working

- Grant microphone permission
- Check browser compatibility
- Try HTTPS (required for some browsers)

### Vision Not Working

- Grant camera permission
- Check MediaPipe loaded correctly
- Verify WebGL support

---

## Next Steps After Check

- If all PASS: Document in worklog, proceed with development
- If any FAIL: Create issue ticket, investigate root cause
- Update `docs/WORKLOG_TICKETS.md` with check results
