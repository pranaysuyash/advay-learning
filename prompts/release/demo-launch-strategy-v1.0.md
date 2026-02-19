# Demo Launch Strategy - v1.0

**Persona**: Solo Founder (Pranay) - technical, time-constrained, building in public

## Context

You are Pranay, a solo founder building Advay Vision Learning (AI-powered educational games for kids using camera hand tracking).

**Current State:**

- Core functionality works: 4 playable games, authentication, progress tracking
- Not production-ready: Missing deployment scripts, monitoring, SSL setup
- **Goal**: Portfolio showcase on LinkedIn/X, attract feedback/funding opportunities
- **Timeline**: Want to launch THIS WEEK

**Technical Stack:**

- Frontend: React + Vite
- Backend: Python + FastAPI + PostgreSQL
- AI: MediaPipe hand tracking
- Package Manager: uv (Python), npm (frontend)

---

## Your Mission

Create a comprehensive **demo launch strategy** for portfolio showcase. This is NOT production deployment - it's public beta/demo for credibility and feedback.

## Required Output

### 1. Demo Readiness Assessment

Answer with binary YES/NO for each:

**Core Functionality:**

- [ ] Can I play all 4 games successfully?
- [ ] Can I register and login?
- [ ] Does camera/hand tracking work?
- [ ] Does progress save to database?

**Portfolio-Ready (lower bar than production):**

- [ ] Can I record gameplay video (30-60 seconds)?
- [ ] Can I take screenshots of mascot + UI?
- [ ] Is the UI visually polished enough for showcase?
- [ ] Can I explain the tech stack clearly?

**Decision Matrix:**

| Criterion | Demo Ready? | Production Ready? |
|-----------|-------------|-------------------|
| Core gameplay | Yes/No | Yes/No |
| Authentication | Yes/No | Yes/No |
| Database | Yes/No | Yes/No |
| Deployment scripts | N/A | Yes/No |
| Production server | N/A | Yes/No |
| SSL/HTTPS | N/A | Yes/No |
| Monitoring/Logging | N/A | Yes/No |
| Error tracking | N/A | Yes/No |

**Verdict:**

- If ≥3/4 Core Functionality = **DEMO READY**
- If all Production Ready = **PRODUCTION READY**
- If neither = **NOT READY**

### 2. Launch Options (3 Options)

Provide 3 launch options with:

**Option 1: Quick Video/Screenshot Showcase**

- Time: X hours
- Cost: Free
- Steps: [list 3-5 steps]
- Pros: [2-3]
- Cons: [2-3]
- Recommended for: [who/when]

**Option 2: Live Demo URL (Vercel + Railway)**

- Time: X hours
- Cost: $X/month (or free)
- Steps: [list 5-7 detailed steps]
- Pros: [2-3]
- Cons: [2-3]
- Recommended for: [who/when]

**Option 3: Self-Hosted Demo (ngrok)**

- Time: X hours
- Cost: Free (temporary)
- Steps: [list 3-5 steps]
- Pros: [2-3]
- Cons: [2-3]
- Recommended for: [who/when]

### 3. LinkedIn/X Post Copy

Write 3 versions:

**Version 1: Technical/Hacker Audience**

- Length: ≤280 chars
- Tone: Technical, concise
- Hashtags: 3-5
- Call to action: GitHub link

**Version 2: Entrepreneur/Founder Audience**

- Length: LinkedIn-friendly (500-800 chars)
- Tone: Story-driven, building-in-public
- Key points: Problem, solution, tech, ask
- Hashtags: 4-6
- Call to action: Feedback/Demo link

**Version 3: General/Audience-Neutral**

- Length: Twitter-friendly (≤280 chars)
- Tone: Excited, simple
- Key points: What it is, who it's for
- Hashtags: 3-5
- Call to action: Try demo/Read more

### 4. Demo Video Content Outline

Script a 60-second video:

**0:00-0:15 (Intro):**

- Visual: [what to show]
- Audio: [what to say]
- Text overlay: [what to display]

**0:15-0:45 (Gameplay):**

- Visual: [which game to play]
- Key moments: [3 specific moments to highlight]
- Audio: [narration if any]

**0:45-1:00 (Outro):**

- Visual: [what to show]
- Call to action: [what to ask]
- Text overlay: [link/hashtag]

### 5. Post-Launch Action Plan

For 7 days post-launch, track:

**Day 0 (Launch Day):**

- [ ] Post to LinkedIn (Version 2)
- [ ] Post to X (Version 1 or 3)
- [ ] Respond to first 10 comments within 2 hours
- [ ] Track views/engagement metrics

**Day 1-3 (Follow-up):**

- [ ] Respond to ALL comments
- [ ] Update GitHub README with demo link
- [ ] Post 1 follow-up with feedback summary
- [ ] Collect 3 specific pieces of feedback (technical, UX, product)

**Day 4-7 (Iterate):**

- [ ] Implement 1-2 quick wins from feedback
- [ ] Post "v0.1.1 - What we learned & built" update
- [ ] Reach out to 5 key people who engaged
- [ ] Document insights for production launch

### 6. Worklog Integration

Create/Update worklog ticket:

**Ticket Format:**

```
### TCK-YYYYMMDD-### :: Demo Launch - Portfolio Showcase

Type: DEMO_LAUNCH
Owner: Pranay
Created: [timestamp]
Status: DONE
Priority: P0 (portfolio/credibility)

Scope:
- Demo readiness assessment
- LinkedIn/X post creation
- Demo video recording
- Post-launch engagement tracking
- Feedback collection

Acceptance Criteria:
- [x] Demo readiness assessment complete
- [x] 3 post versions written
- [x] 60-second demo video recorded
- [x] Posted to LinkedIn/X
- [x] GitHub updated with demo link
- [x] 3 pieces of feedback collected

Evidence:
- [screenshots/videos links]
- [post URLs]
- [feedback documentation]
- [worklog updated]
```

---

## Constraints

**Time Budget:**

- Assessment: 30 minutes
- Launch option selection: 15 minutes
- Post copy: 30 minutes
- Demo video: 1-2 hours
- Total: 2-3 hours

**Quality Standards:**

- Demo video must be smooth, no lag visible
- Post copy must be typo-free
- Links must work (GitHub, demo URL if live)
- Tone must match persona (authentic, not salesy)

**Transparency Requirements:**

- MUST label as "beta/demo" not "production"
- MUST set expectations: "building in public, feedback welcome"
- MUST be honest about limitations
- NO over-promising features

---

## Execution Protocol

1. **Assess readiness** (30 min) - Use criteria above
2. **Choose launch option** (15 min) - Pick Option 1, 2, or 3
3. **Write post copy** (30 min) - 3 versions as specified
4. **Record demo video** (1-2 hours) - Script, record, edit
5. **Launch** (15 min) - Post to LinkedIn/X
6. **Update documentation** (30 min) - Worklog, GitHub README
7. **Monitor engagement** (7 days) - Respond, collect feedback

---

## Success Metrics

**Portfolio Credibility:**

- LinkedIn: ≥500 views, ≥20 reactions, ≥5 comments
- X (Twitter): ≥1,000 views, ≥10 likes, ≥5 replies
- GitHub: ≥5 new stars, ≥2 new watchers

**Product Validation:**

- At least 3 specific pieces of actionable feedback
- At least 1 meaningful technical discussion
- At least 1 "this is cool" validation (non-technical but encouraging)

**Learning:**

- Document 3 key insights from feedback
- Identify 1-2 prioritized improvements for v0.2
- Track which post version performed best

---

## Output Format

Provide output in this exact structure:

### 1. Demo Readiness Assessment

[Assessment results + verdict]

### 2. Launch Options (Chosen: Option X)

[Details of chosen option + why]

### 3. LinkedIn/X Post Copy (All 3 Versions)

[Version 1, 2, 3 as specified]

### 4. Demo Video Content Outline (60 seconds)

[Script as specified]

### 5. Post-Launch Action Plan (7 Days)

[Day-by-day checklist]

### 6. Worklog Ticket Draft

[Ticket in worklog format]

---

## Appendix: Examples for Reference

**Good Demo Launch Example:**

- Authentic tone: "I've been working on..."
- Visual proof: Video of gameplay
- Transparency: "Still in early beta"
- Call to action: "Feedback welcome"
- Technical depth: Shows MediaPipe integration

**Bad Demo Launch Example:**

- Salesy tone: "The best kids learning app!"
- No visuals: Text-only post
- Over-promising: "Production-ready, enterprise-scale"
- No technical depth: Doesn't show what makes it unique
- No engagement: Doesn't ask for feedback

---

**Last Updated**: 2026-01-31
**Version**: 1.0
**Next Review**: After demo launch, refine for production launch prompt
