# SEO & Discoverability Review Prompt — v1.0

**Category:** Review / SEO  
**Use when:** Reviewing changes that touch page titles, meta tags, Open Graph, structured data, routing, sitemap, robots.txt, or any content that affects how the app is indexed and discovered by search engines and app stores.

---

## MISSION

Ensure the app is correctly discoverable, shareable, and indexable with:
1. Accurate, keyword-rich page titles and meta descriptions
2. Open Graph / Twitter Card tags for social sharing
3. Correct canonical URLs and routing structure
4. Structured data (JSON-LD) where appropriate
5. Accessibility attributes that also benefit SEO (alt text, heading hierarchy, landmark roles)
6. No SEO anti-patterns (duplicate titles, missing descriptions, blocked crawlers)

---

## OPERATING RULES

- Do NOT modify files unless explicitly authorized.
- Do NOT use /tmp.
- Focus on changes in the diff — not a full site audit.
- Flag only items with real discoverability or sharing impact.

---

## REVIEW WORKFLOW

### STEP 0 — Find SEO-relevant changes in the diff

```bash
# Title and meta tags
git diff --staged | grep -E "^\+" | grep -iE "(title|description|og:|twitter:|canonical|robots|sitemap|noindex)"

# New routes added
git diff --staged | grep -E "^\+" | grep -E "(path=|route|<Route|navigate\()"

# New page components (may need meta tags)
git diff --staged | grep -E "^\+" | grep -iE "(GameShell|PageTitle|Helmet|useHead|document\.title)"

# Heading tags
git diff --staged | grep -E "^\+" | grep -E "<h[1-6]"

# Alt text
git diff --staged | grep -E "^\+" | grep -E 'alt='
```

### STEP 1 — Check each new route / page

For every new page or route in the diff:

| Check | Criteria |
|-------|----------|
| **Page title** | Unique, descriptive, includes game name + brand. Format: `"Game Name — Advay Learning"`. 50–60 chars. |
| **Meta description** | 1–2 sentences describing the game and learning outcome. 120–160 chars. |
| **Open Graph title** | Same as page title or slightly more engaging for social sharing. |
| **OG description** | Social-friendly version of meta description. |
| **OG image** | Points to a real asset that exists. 1200×630px ideal. |
| **Canonical URL** | Set correctly if the page is accessible at multiple paths. |
| **`gameId` slug** | URL-safe, kebab-case, consistent with game name (e.g. `wash-hands-dance`). |
| **Heading hierarchy** | H1 present and unique per page. H2/H3 used for sub-sections. No skipped levels. |
| **Alt text** | All `<img>` tags have meaningful alt text (not "image" or empty for content images). |

### STEP 2 — Check routing consistency

```bash
# All routes in App.tsx
grep -n "path=" src/frontend/src/App.tsx | grep -v node_modules

# Game registry slugs
grep -n "gameId\|id:" src/frontend/src/data/gameRegistry.ts | head -30
```

Verify:
- New game routes use the same `gameId` slug as the registry entry
- No duplicate route paths
- No routes with PII or session tokens in the URL

### STEP 3 — Check social sharing

For any new game page:
- Does `GameShell` or equivalent set the page title dynamically?
- Is there an OG image defined for the game?
- Would a share link to this game show a meaningful preview on WhatsApp/Twitter/iMessage?

### STEP 4 — Classify findings

```
SEO-001
Severity: HIGH | MEDIUM | LOW
File: path/to/file.tsx  Line: 45
Issue: New game page "WashHandsDance" has no meta description
Impact: Search snippet shows raw page content; social shares show no description
Fix: Add <meta name="description" content="Help Advay learn healthy habits by dancing through hand-washing steps!"> 
```

**Severity guide:**
- **HIGH**: Missing title, broken canonical, page blocked from indexing, `gameId` mismatch causes 404
- **MEDIUM**: Missing meta description, no OG image, empty alt text on content images
- **LOW**: Title slightly over 60 chars, minor inconsistency in OG vs page title

### STEP 5 — Verdict

```
SEO APPROVED    — All new pages/routes have correct titles, descriptions, and routing.
SEO WITH NOTES  — Minor gaps flagged; safe to ship, improve before public launch.
SEO BLOCKED     — HIGH severity: broken route, missing title, indexing blocked.
```

---

## REPORT FORMAT

```markdown
## SEO & Discoverability Review — <date>

### New Routes / Pages Found
[List with gameId slugs]

### Findings

#### HIGH
[SEO-XXX or "None"]

#### MEDIUM
[SEO-XXX or "None"]

#### LOW
[SEO-XXX or "None"]

### Verdict
[SEO APPROVED / SEO WITH NOTES / SEO BLOCKED]
```

---

## SEO CONVENTIONS FOR THIS REPO

- **Title format:** `"<Game Name> — Advay Learning for Kids"` 
- **Meta description template:** `"<Game Name> helps children ages 3–8 learn <skill> through interactive <mechanic>. Free educational game."`
- **gameId format:** kebab-case, e.g. `alphabet-game`, `wash-hands-dance`, `math-monsters`
- **OG image path:** `/assets/og/<game-id>.png` (1200×630)
- **Canonical base URL:** `https://advaylearning.com`

---

*Prompt version: v1.0 | Created: 2026-03-10 | Owner: Copilot agent coordination*
