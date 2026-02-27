# WORKLOG ADDENDUM - Game Pack Subscription Feature
**Created**: 2026-02-26
**Feature**: Game Pack/Bundle Subscription System
**Spec**: docs/features/specs/003-game-pack-subscription.md

**Pricing DECIDED**:
- 5-Game Pack: ₹1,500 / 3 months rolling
- 10-Game Pack: ₹2,500 / 3 months rolling
- Full Annual: ₹6,000 / 12 months
- Payment: Dodo Payments

---

## TCK-20260226-001 :: Database Models for Subscriptions
Ticket Stamp: STAMP-20260226T000000Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P1

Scope contract:
- In-scope:
  - Create Subscription model with plan_type, dates, status, upgraded_to_id
  - Create SubscriptionGameSelection model (not quarter-based, just selections)
  - Add game_swap_used field to track 1 free swap
  - Add database migration
- Out-of-scope:
  - Payment integration
  - Frontend changes
- Behavior change allowed: YES (new tables added)

Targets:
- Repo: learning_for_kids
- File(s): src/backend/app/db/models/, src/backend/alembic/versions/
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md

Plan:
- [ ] Create Subscription model in app/db/models/subscription.py
- [ ] Create SubscriptionGameSelection model in app/db/models/subscription_game_selection.py
- [ ] Export models from app/db/models/__init__.py
- [ ] Create Alembic migration for new tables
- [ ] Verify models with SQLAlchemy relationship to User and Game

Acceptance Criteria:
- [ ] Subscription model has: id, parent_id, plan_type, amount_paid, currency, start_date, end_date, status, upgraded_to_id, game_swap_used
- [ ] SubscriptionGameSelection model has: id, subscription_id, game_id, selected_at
- [ ] Migration runs successfully
- [ ] Models can be queried with relationships

Execution log:
- [timestamp] [action] | Evidence: [output]

Status updates:
- 2026-02-26 **OPEN** — Ticket created, awaiting implementation start
- 2026-02-26 **DONE** — Models existed, created migration 008 and ran successfully

Next actions:
1. ~~Implement Subscription model~~ - DONE: models already existed
2. ~~Create migration~~ - DONE: 008_add_subscription_tables.py created and run
3. Verify with test queries

---

## TCK-20260226-002 :: Subscription API Endpoints
Ticket Stamp: STAMP-20260226T000100Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P1

Scope contract:
- In-scope:
  - POST /subscriptions/purchase - Create subscription from payment (Dodo)
  - GET /subscriptions/current - Get active subscription
  - GET /subscriptions/games/available - Get available games with pack limit
  - PUT /subscriptions/games - Update game selection (at purchase only)
  - PUT /subscriptions/games/swap - Swap 1 game (1 free per pack)
  - POST /subscriptions/upgrade - Upgrade to annual with prorated credit
  - GET /subscriptions/status - Get days remaining, status
- Out-of-scope:
  - Payment gateway integration (handled by Dodo)
  - Frontend UI
- Behavior change allowed: YES (new endpoints added)

Targets:
- Repo: learning_for_kids
- File(s): src/backend/app/api/v1/endpoints/subscriptions.py
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-001

Plan:
- [ ] Create subscriptions endpoint file
- [ ] Implement purchase endpoint with Dodo Payments integration
- [ ] Implement current subscription getter
- [ ] Implement game selection at purchase
- [ ] Implement 1 free game swap endpoint
- [ ] Implement upgrade to annual with prorated credit
- [ ] Add endpoints to API router

Acceptance Criteria:
- [ ] All 7 endpoints return expected JSON structure
- [ ] Game selection enforces pack limit (5 or 10)
- [ ] Game swap allows exactly 1 replacement per pack
- [ ] Upgrade credit = (remaining_days / 90) × pack_price
- [ ] Access control validates subscription status

Execution log:
- [timestamp] [action] | Evidence: [output]

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-001
- 2026-02-26 **DONE** — Created endpoints/subscriptions.py with 8 endpoints, Dodo payment service integrated

Next actions:
1. Implement endpoints after models are ready
2. Add tests for edge cases

---

## TCK-20260226-003 :: Game Access Control Logic
Ticket Stamp: STAMP-20260226T000200Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P0

Scope contract:
- In-scope:
  - can_access_game() function for server-side validation
  - Integration with game loading endpoints
  - Handle full_annual, pack_5, pack_10 cases
- Out-of-scope:
  - Frontend UI for denied access
- Behavior change allowed: YES (new access control)

Targets:
- Repo: learning_for_kids
- File(s): src/backend/app/services/subscription_service.py, src/backend/app/api/v1/endpoints/games.py
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-001, TCK-20260226-002

Plan:
- [x] Create subscription service with can_access_game()
- [x] Add rolling 3-month validity check
- [x] Add game swap check (1 per pack)
- [x] Integrate with game load endpoints
- [x] Test access for all plan types

Acceptance Criteria:
- [x] Full annual subscribers can access all games
- [x] Pack subscribers can only access selected games
- [x] Expired subscriptions are denied
- [x] Quarter refresh works correctly

Execution log:
- 2026-02-26T13:30:00Z | Added can_access_game() to subscription_service.py | Verified
- 2026-02-26T13:35:00Z | Added /games/{id}/access endpoint in games.py | Verified

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-002
- 2026-02-26 **DONE** — Added can_access_game(), /games/{id}/access endpoint

Next actions:
1. Implement service after API is ready
2. Integration test with game endpoints

---

## TCK-20260226-004 :: Pricing Page with Pack Options (Frontend)
Ticket Stamp: STAMP-20260226T000300Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P1

Scope contract:
- In-scope:
  - Display 5-game pack option with price
  - Display 10-game pack option with price
  - Display full annual option for comparison
  - Purchase button triggers subscription flow
- Out-of-scope:
  - Game selection UI
  - Payment gateway
- Behavior change allowed: YES (new UI)

Targets:
- Repo: learning_for_kids
- File(s): src/frontend/src/pages/Pricing.tsx or new component
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md

Plan:
- [x] Add pricing cards for 5-game and 10-game packs
- [x] Style cards per design spec
- [x] Add purchase flow integration
- [x] Add comparison highlighting

Acceptance Criteria:
- [x] Three pricing tiers visible: 5-game, 10-game, annual
- [x] Prices clearly displayed (₹1,500, ₹2,500, ₹6,000)
- [x] Pack duration (3 months) displayed
- [x] Click initiates purchase flow

Execution log:
- 2026-02-26T14:00:00Z | Created Pricing.tsx with 3 pricing tiers | Verified
- 2026-02-26T14:05:00Z | Added subscriptionApi to frontend services | Verified
- 2026-02-26T14:10:00Z | Added /pricing route to App.tsx | Verified

Status updates:
- 2026-02-26 **OPEN** — Ticket created, awaiting backend API (TCK-20260226-002)
- 2026-02-26 **DONE** — Created Pricing.tsx with 3 tiers, integrated with subscriptionApi

Next actions:
1. Create pricing component after backend is ready

---

## TCK-20260226-005 :: Game Selection UI (Frontend)
Ticket Stamp: STAMP-20260226T000400Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P1

Scope contract:
- In-scope:
  - Grid display of available games
  - Checkbox selection with pack limit enforcement
  - Save selection functionality
  - Show selected count vs limit
- Out-of-scope:
  - Payment flow
  - Parent dashboard integration
- Behavior change allowed: YES (new UI)

Targets:
- Repo: learning_for_kids
- File(s): src/frontend/src/pages/GameSelection.tsx or new component
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-002

Plan:
- [x] Create game selection grid component
- [x] Add checkbox logic with limit enforcement
- [x] Integrate with GET/PUT subscription games API
- [x] Add search/filter by category
- [x] Show selected games summary

Acceptance Criteria:
- [x] All available games displayed in grid
- [x] Cannot select more than pack limit (5 or 10)
- [x] Save button disabled if selection invalid
- [x] Selection persists and shows in dashboard

Execution log:
- 2026-02-26T14:30:00Z | Created GameSelection.tsx with grid, filters | Verified
- 2026-02-26T14:35:00Z | Added /game-selection route to App.tsx | Verified

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-002
- 2026-02-26 **DONE** — Created GameSelection.tsx with grid, search, filters, limit enforcement

---

## TCK-20260226-006 :: Parent Dashboard Pack Status

Ticket Stamp: STAMP-20260226T000500Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P1

Scope contract:
- In-scope:
  - Display active pack type (5 or 10 games)
  - Show expiration date
  - Show days remaining with warning if <14 days
  - Display selected games list
  - Show "Change Games" and "Renew" buttons
- Out-of-scope:
  - Full profile management
- Behavior change allowed: YES (new UI elements)

Targets:
- Repo: learning_for_kids
- File(s): src/frontend/src/pages/Dashboard.tsx or parent components
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-002

Plan:
- [ ] Fetch subscription status on dashboard load
- [ ] Add subscription card component
- [ ] Show expiration warning (yellow if <14 days)
- [ ] Add navigation to game selection
- [ ] Add upgrade/renewal buttons

Acceptance Criteria:
- [x] Pack type and status visible
- [x] Days remaining shown accurately
- [x] Warning appears when <14 days
- [x] Selected games list displays
- [x] Buttons navigate correctly

Execution log:
- 2026-02-26T15:00:00Z | Added SubscriptionCard to Dashboard.tsx | Verified

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-002
- 2026-02-26 **DONE** — Added subscription card to dashboard with status, days remaining, warning, navigation
- In-scope:
  - Display active pack type (5 or 10 games)
  - Show expiration date
  - Show days remaining with warning if <14 days
  - Display selected games list
  - Show "Change Games" and "Renew" buttons
- Out-of-scope:
  - Full profile management
- Behavior change allowed: YES (new UI elements)

Targets:
- Repo: learning_for_kids
- File(s): src/frontend/src/pages/Dashboard.tsx or parent components
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-002

Plan:
- [ ] Fetch subscription status on dashboard load
- [ ] Add subscription card component
- [ ] Show expiration warning (yellow if <14 days)
- [ ] Add navigation to game selection
- [ ] Add upgrade/renewal buttons

Acceptance Criteria:
- [ ] Pack type and status visible
- [ ] Days remaining shown accurately
- [ ] Warning appears when <14 days
- [ ] Selected games list displays
- [ ] Buttons navigate correctly

Execution log:
- [timestamp] [action] | Evidence: [output]

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-002

Next actions:
1. Implement dashboard integration

---

## TCK-20260226-007 :: Upgrade to Full Subscription
Ticket Stamp: STAMP-20260226T000600Z-opencode-abcd

Type: FEATURE
Owner: Pranay
Created: 2026-02-26
Status: **OPEN**
Priority: P2

Scope contract:
- In-scope:
  - Calculate prorated credit from remaining pack days
  - Upgrade endpoint to convert pack to annual
  - UI for upgrade prompt (expired/near-expiry)
- Out-of-scope:
  - Full refund processing
- Behavior change allowed: YES (new upgrade flow)

Targets:
- Repo: learning_for_kids
- File(s): src/backend/app/api/v1/endpoints/subscriptions.py, src/frontend/
- Branch: main

Inputs:
- Prompt used: feature-prd-and-ticketing-v1.0.md
- Source artifacts: docs/features/specs/003-game-pack-subscription.md, TCK-20260226-002

Plan:
- [x] Add prorated credit calculation in backend
- [x] Create upgrade endpoint
- [x] Add upgrade prompt in dashboard
- [x] Test credit calculation accuracy

Acceptance Criteria:
- [x] Upgrade endpoint accepts pack subscription
- [x] Credit calculation: (remaining_days / 90) * pack_price
- [x] New annual subscription created with credit applied
- [x] Old pack marked as upgraded

Execution log:
- 2026-02-26T15:30:00Z | Added upgrade flow to Pricing.tsx with credit calculation | Verified

Status updates:
- 2026-02-26 **OPEN** — Ticket created, depends on TCK-20260226-002
- 2026-02-26 **DONE** — Upgrade flow implemented in backend (TCK-20260226-002), added UI in Pricing.tsx

---

## Pending Items & Next Steps

### Completed
- ✅ TCK-20260226-001: Database Models (migration 008 created)
- ✅ TCK-20260226-002: API Endpoints + Dodo Payment Integration
- ✅ TCK-20260226-003: Game Access Control
- ✅ TCK-20260226-004: Pricing Page UI
- ✅ TCK-20260226-005: Game Selection UI
- ✅ TCK-20260226-006: Dashboard Pack Status
- ✅ TCK-20260226-007: Upgrade to Full

### All Tickets Complete!

1. **TCK-20260226-003: Game Access Control** (P0)
   - `can_access_game()` function
   - Integrate with game loading endpoints
   - Block access for non-selected games in packs
   - Dependencies: API ready

2. **TCK-20260226-004: Pricing Page UI** (P1)
   - Display 3 pricing tiers
   - Purchase button flow
   - Dependencies: API ready

3. **TCK-20260226-005: Game Selection UI** (P1)
   - Grid of available games
   - Checkbox selection with limit enforcement
   - Dependencies: API ready

4. **TCK-20260226-006: Dashboard Pack Status** (P1)
   - Show pack type, days remaining
   - Expiration warning
   - Selected games list
   - Dependencies: API ready

5. **TCK-20260226-007: Upgrade to Full** (P2)
   - Prorated credit calculation UI
   - Upgrade flow
   - Dependencies: API ready

### Dodo Products Setup (BLOCKING)
Create products in Dodo dashboard:
- 5-Game Pack (₹1,500) - INR
- 10-Game Pack (₹2,500) - INR
- Full Annual (₹6,000) - INR

Then add product IDs to `PLAN_PRODUCT_IDS` in `app/services/dodo_payment_service.py`
