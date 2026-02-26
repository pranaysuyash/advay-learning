# Game Pack/Bundle Pricing - Research & Recommendation

**Date**: 2026-02-26  
**Status**: DECIDED

---

## 1. Market Research Findings

### 1.1 Global Kids Ed-Tech Pricing (USD)

| App | Monthly | Annual | Annual/Month |
|-----|---------|--------|--------------|
| Lingokids | $13.49 | $5.99/mo ($71.88/yr) | 44% discount |
| SplashLearn | $7.49 | $2.75-4.14/mo | 63% discount |
| IXL | ~$12.99 | ~$9.99/mo | 23% discount |
| Khan Academy | Free | Free | N/A |

**Key insight**: Annual plans typically 40-60% cheaper than monthly.

### 1.2 Gaming Subscription Models (Xbox Game Pass)

| Tier | Games | Price (USD) | Key Feature |
|------|-------|-------------|-------------|
| Essential | 50+ | ~$10/mo | Basic library |
| Premium | 200+ | ~$15/mo | More games |
| Ultimate | 500+ | ~$17/mo | All features, day-1 titles |

**Key insight**: Tiered pricing works - users self-select based on commitment level.

### 1.3 Rolling vs Fixed-Term Subscriptions

| Model | Pros | Cons |
|-------|------|------|
| **Rolling** (3 mo from purchase) | Simpler UX, predictable expiry | No cohort marketing |
| **Fixed** (e.g., Jan-Mar) | Cohort analysis, renewal campaigns | Complex UX, mid-quarter confusion |

**Key insight**: Most apps use rolling (Simpler, better UX for kids/parents).

---

## 2. Recommendation

### 2.1 Pricing Structure

| Tier | Games | Duration | Price (INR) | Price (USD) | Annualized |
|------|-------|----------|-------------|-------------|------------|
| **Explorer Pack** | 5 | 3 months | ₹1,500 | ~$18 | ₹6,000 |
| **Explorer Pack+** | 10 | 3 months | ₹2,500 | ~$30 | ₹10,000 |
| **Full Annual** | All | 12 months | ₹6,000 | ~$72 | ₹6,000 |

**Why these prices:**
- Explorer Pack at ₹1,500 = 25% of annual = clear "try it" entry point
- Explorer Pack+ at ₹2,500 = 42% of annual = 1.67x for double games
- Annual at ₹6,000 = best value, encourage upgrade

### 2.2 Validity: Rolling 3 Months (NOT Calendar Quarters)

**Why rolling over calendar quarters:**
- Simpler UX: "3 months from today" not "until March 31"
- No confusion: User buys Jan 15 → expires April 15, clear
- No awkward mid-quarter start dates

### 2.3 Game Selection: Keep Same Games (No Quarterly Refresh)

**Why not quarterly refresh:**
- Parents already overwhelmed, don't add admin work
- Kids need repetition to learn - changing games every 3 months disrupts learning
- Reduces support burden (no "I didn't know I had to re-select!")

### 2.4 Upgrade Credit: 100% Credit Toward Annual

**Mechanics:**
- Pack price × (remaining_days / 90) = credit
- Example: ₹1,500 pack, 45 days used → ₹750 credit toward annual
- Applied as discount at checkout

**Why generous credit:**
- Builds trust, not "rip-off" feeling
- Encourages upgrade path
- Better PR / word of mouth

### 2.5 Key Design Decisions

| Decision | Recommendation |
|----------|----------------|
| Default renewal | OFF (opt-in) |
| Expiry warning | 14 days before, then 7 days |
| Unused games | Lapse with pack, not transferable |
| Game removed from catalog | Auto-replace or notify parent |

---

## 3. Implementation Priority

### Phase 1 (MVP - Ship First)
1. Rolling 3-month packs (5 and 10 games)
2. Game selection at purchase time only
3. Simple upgrade to annual with credit

### Phase 2 (Enhancement)
1. Change games mid-pack (1 free swap)
2. Parent dashboard with pack status

### Phase 3 (Advanced)
1. Quarterly "game refresh" as optional feature
2. Family packs (multiple children)
3. Regional pricing (different markets)

---

## 4. DECIDED: Final Plan

### Pricing (DECIDED)
| Tier | Games | Duration | Price (INR) | Price (USD) |
|------|-------|----------|-------------|-------------|
| Explorer Pack | 5 | 3 months rolling | ₹1,500 | ~$18 |
| Explorer Pack+ | 10 | 3 months rolling | ₹2,500 | ~$30 |
| Full Annual | All | 12 months | ₹6,000 | ~$72 |

### Validity (DECIDED)
- Rolling 3 months from purchase date (not calendar quarters)
- Simplest UX, no confusion

### Game Selection (DECIDED)
- Select games at time of purchase
- Keep same games for full 3 months (no refresh)
- Allow 1 free game swap mid-pack

### Upgrade (DECIDED)
- 100% credit toward annual: (remaining_days / 90) × pack_price
- Example: ₹1,500 pack, 45 days used → ₹750 credit

### Notes (TBD during implementation)
- Payment gateway: Dodo Payments (per user input)
- Catalog size: 10-game pack requires 10+ games (scope for future if <10 games)
- Regional pricing: Out of scope for V1
- Free tier: Out of scope for V1
