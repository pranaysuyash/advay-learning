import os
import time
import google.generativeai as genai

# Setup API Key
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyDYXPY95PneMi0m7UTiI6ciY8sQyst2jV8")
genai.configure(api_key=api_key)

video_path = "/Users/pranay/Desktop/emoji_match.mov"

print(f"Uploading {video_path} to Gemini API...")
video_file = genai.upload_file(path=video_path)

print(f"Completed upload: {video_file.uri}")
print("Waiting for file to process...")

# Wait for file to become active
while video_file.state.name == "PROCESSING":
    print(".", end="", flush=True)
    time.sleep(10)
    video_file = genai.get_file(video_file.name)

if video_file.state.name == "FAILED":
    print("\nFile processing failed.")
    exit(1)

print("\nFile is active. Generating review...")

prompt = """
You are a brutally honest UI/UX + QA reviewer for a kids (toddler) learning game.

INPUT
- I will provide a screen recording of ONE full gameplay session (one game per video).

KNOWN SUSPECT AREAS (you must explicitly evaluate and report on these)
1) Hand-tracking lag: delay between the real hand movement and the on-screen dot/cursor/indicator.
2) Dot/cursor design: size too small, low contrast, hard to notice, unclear what it represents.
3) Target sizes: tap/interaction targets too small for toddler motor control; hitboxes too strict.
4) Speed/pacing: game moves too fast (prompts, transitions, timers), insufficient time to react.
5) Clarity of instruction and feedback: child cannot infer “what to do next” without reading.
6) Tracking stability: jitter, snapping, drift, occlusion handling, loss of tracking recovery.

MEASUREMENT REQUIREMENT (don’t hand-wave)
- For lag: estimate latency in milliseconds or frames where possible.
  - Use the video frame rate: if 30 fps, 1 frame ≈ 33 ms; if 60 fps, 1 frame ≈ 16 ms.
  - Provide a range like “~100–200 ms” and show the timestamp range you used to estimate it.
- For sizes: compare dot/targets to screen size.
  - Give a practical judgment: “likely too small for 2–4 yrs” plus what size it should be instead
    (e.g., dot 2–3× bigger; primary targets at least ~9–12 mm equivalent, with forgiving hitboxes).
- For pacing: identify timers, countdowns, and transition durations; call out anything under ~1–2 seconds that requires precision.

OPERATING RULES (non-negotiable)
1) Be evidence-based. Every claim must include timestamp range + what changed on screen/audio.
2) Think like a toddler and a parent. Toddlers have low working memory, poor precision, short attention spans.
3) UX and functionality are inseparable. If the player can’t reliably understand it, it is a bug.
4) Don’t praise. Don’t speculate beyond what the video supports. If uncertain, label “uncertain” + what would confirm it.
5) Small issues matter: micro-lag, tiny targets, subtle contrast, flicker, audio timing drift, inconsistent animations.

ANALYSIS PROCESS
A) First pass: Map the experience
- Identify game loop states (intro, instructions, detect hand, active play, success, failure, level end, retry).
- For each state: user goal, system signals, what “success” looks like, what “failure” looks like.

B) Second pass: Frame-level audit (minute detail)
- Scrub through and flag issues with timestamps.
- Specifically look for:
  1) Latency/stutter: input-to-feedback delay, dropped frames, freezes, jitter.
  2) Dot/cursor legibility: visibility, contrast, size, motion clarity, confusion with background.
  3) Target/interaction sizing: smallest meaningful target, spacing between targets, hitbox forgiveness.
  4) Pacing: prompt duration, transition speed, time given after success/failure before next demand.
  5) Clarity: visual hierarchy, affordances, instruction readability, icon meaning.
  6) Feedback loops: does the game explain why success/failure happened and what to do next?
  7) Error handling: tracking loss, wrong gesture, partial gesture, leaving frame, random taps.
  8) Accessibility: contrast, color-only signals, sound-only signals, motion sensitivity.
  9) Consistency: repeated patterns behave the same; fonts/spacing/buttons coherent.
  10) Cognitive load: too many moving/changing elements at once.

C) Third pass: “What broke trust?”
- Identify moments a child/parent would think “broken/unfair/confusing/too intense”.
- Rank severity: S1 blocker / S2 major / S3 minor.

OUTPUT FORMAT (strict)
1) One-paragraph summary:
- What the game is, and the top 3 experience failures (likely including lag/size/pacing if present).

2) Metrics Snapshot (must include these if observable)
- Estimated tracking latency (ms range) + timestamps used
- Jitter rating (none/low/med/high) + examples
- Smallest target size observed (relative estimate) + why it fails toddler use
- Fastest transition/prompt duration observed + why it fails
- Fail recovery time (how long to get back into play after a failure)

3) State Machine Table:
- State | User goal | System signals | Failure modes observed | Fix ideas

4) Issues List (prioritized backlog)
For each issue:
- ID
- Severity (S1/S2/S3)
- Category: Performance / UI / UX / Child-friendly / Accessibility / Audio / Tracking / Logic / Copy
- Timestamp(s)
- Evidence (what I saw/heard)
- Impact (who it hurts and how)
- Likely cause (mark as hypothesis)
- Fix recommendation (specific)
- Acceptance criteria (measurable)

5) Design Principles Violated
- 5–10 principles (visibility of system status, feedback, consistency, error prevention, cognitive load)
- Each tied to timestamped evidence.

6) Quick Wins vs Deep Work
- Quick wins (≤2 hours each): exact changes
- Deep work (multi-day): scope + risks

7) Regression Test Checklist
- What to re-record and what “good” looks like after fixes.

KIDS HEURISTICS (use while judging)
- One obvious next action at any time.
- Forgiving interaction: big targets, generous hitboxes, stable cursor.
- Immediate, clear success feedback.
- Gentle failure feedback with fast recovery.
- No sudden loud sounds, flashing, or rapid motion.
- Minimal reading required; rely on visuals + voice cues.
"""

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

try:
    response = model.generate_content(
        [video_file, prompt],
        request_options={"timeout": 600}
    )
    print("Generation complete.\n")
    print("-" * 80)
    print(response.text)
    print("-" * 80)
    
    with open("/Users/pranay/Projects/learning_for_kids/docs/audit/emoji_match_review.md", "w") as f:
        f.write("# UI/UX + QA Review: Emoji Match\n\n")
        f.write(response.text)
        
    print("Saved to /Users/pranay/Projects/learning_for_kids/docs/audit/emoji_match_review.md")
except Exception as e:
    print(f"Error generating content: {e}")

# Clean up
genai.delete_file(video_file.name)
print("Deleted file from API")
