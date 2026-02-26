# Feature: Game Pack/Bundle Subscription System

**Status**: 🔲 Planned
**Priority**: P1
**Owner**: Pranay
**Created**: 2026-02-26
**Last Updated**: 2026-02-26
**Pricing Decided**: ₹1,500 (5-game), ₹2,500 (10-game), ₹6,000 (annual)
**Validity**: Rolling 3 months from purchase (not calendar quarters)

---

## 1. Overview

### 1.1 Description

A flexible subscription model allowing parents to purchase game packs (5 or 10 games) valid for 3 months (rolling from purchase date). Users select games at time of purchase and keep same games for the duration. Upgrade to annual subscription available with prorated credit.

### 1.2 Problem Statement

- Current pricing: 6,000 INR/year (full access) is too high for some families
- Need a lower entry point to attract price-sensitive customers
- Users want flexibility to try different games before committing to annual subscription
- Quarterly model creates recurring revenue opportunity while reducing commitment barrier

### 1.3 Success Criteria

- [ ] Parents can purchase 5-game (₹1,500) or 10-game (₹2,500) packs
- [ ] Packs are valid for 3 months from purchase date (rolling)
- [ ] Users select games at time of purchase
- [ ] Same games kept for full 3 months (no quarterly refresh)
- [ ] Allow 1 free game swap mid-pack
- [ ] Users can upgrade from pack to full subscription (₹6,000) with prorated credit
- [ ] Parent dashboard shows pack status, expiration, and game selections

---

## 2. User Stories

### Story 1: Purchase Game Pack

**As a** parent  
**I want** to buy a game pack (5 or 10 games)  
**So that** my child can access selected games for 3 months at a lower price than annual subscription

**Acceptance Criteria:**

- Given parent is on pricing page, when they view options, then both 5-game and 10-game pack options are visible with pricing
- Given parent selects a pack, when they complete payment, then pack is activated with 3-month validity
- Given pack is activated, when parent logs in, then they see pack status in dashboard

### Story 2: Select Games for Pack

**As a** parent  
**I want** to choose which games my child can access from the pack  
**So that** I can tailor the experience to my child's learning needs

**Acceptance Criteria:**

- Given parent has an active pack, when they go to game selection, then they see all available games with selection checkboxes
- Given pack has 5-game limit, when parent selects 6 games, then system shows error and prevents selection
- Given parent saves game selection, when child logs in, then only selected games are accessible

### Story 3: Game Swap Mid-Pack

**As a** parent  
**I want** to change one game in my pack if my child loses interest  
**So that** I don't waste the remaining subscription time

**Acceptance Criteria:**

- Given pack is active, when parent requests game swap, then they can replace 1 game
- Given game is swapped, when child logs in, then new game is accessible and old game is removed
- Given swap is used, when parent requests another swap, then system shows limit reached

### Story 4: View Pack Dashboard

**As a** parent  
**I want** to see pack status, expiration date, and current game selection  
**So that** I know when to renew or make changes

**Acceptance Criteria:**

- Given parent logs in, when they view dashboard, then pack status shows: pack type (5/10), days remaining, selected games list
- Given pack expires in less than 14 days, when parent views dashboard, then expiration warning is displayed
- Given pack expires, when child logs in, then they see upgrade prompt for full subscription

### Story 5: Upgrade to Full Subscription

**As a** parent  
**I want** to upgrade from game pack to full annual subscription  
**So that** my child gets unlimited access to all games

**Acceptance Criteria:**

- Given parent has active pack, when they choose to upgrade, then:
  - Credit = (remaining_days / 90) × pack_price
  - Example: ₹1,500 pack, 45 days used → ₹750 credit toward ₹6,000 annual
  - Parent pays ₹5,250 for annual
  - Full access is immediately granted
  - Old pack is marked as "upgraded"

---

## 3. Functional Requirements

### 3.1 Core Functionality

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| GP-01 | Display 5-game (₹1,500) and 10-game (₹2,500) pack options on pricing page | P0 | Show pricing |
| GP-02 | Process payment for game pack via Dodo Payments | P0 | Payment integration |
| GP-03 | Create subscription record with 3-month rolling expiration | P0 | Store: pack_type, start_date, end_date, status |
| GP-04 | Game selection UI for pack holders (at purchase) | P0 | Checkbox grid with pack limit enforcement |
| GP-05 | Store game selections per subscription | P0 | Link selected games to subscription record |
| GP-06 | Enforce game access based on pack selection | P0 | Check subscription + game selection before granting access |
| GP-07 | 1 free game swap per pack | P1 | Allow replacing 1 game mid-pack |
| GP-08 | Pack expiration handling | P0 | 14-day warning, upgrade prompts |
| GP-09 | Upgrade to full annual with prorated credit | P0 | (remaining_days / 90) × pack_price |
| GP-10 | Parent dashboard pack status | P0 | Display pack details, expiration, selections |

### 3.2 Pricing Structure (Proposed)

| Pack Type | Duration | Price (INR) | Price (USD) |
|-----------|----------|-------------|-------------|
| 5-Game Pack | 3 months rolling | ₹1,500 | ~$18 |
| 10-Game Pack | 3 months rolling | ₹2,500 | ~$30 |
| Full Annual | 12 months | ₹6,000 | ~$72 |

### 3.3 Validity: Rolling 3 Months

- Packs are valid for 3 months from date of purchase
- Example: Purchased Jan 15 → expires April 15
- No calendar quarter sync - simpler UX
- Upgrade credit calculated as: (remaining_days / 90) × pack_price

### 3.4 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Pack expires mid-game session | Complete current game, then show expiration on next access |
| User selects fewer than pack limit | Remaining slots are unused, no partial refund |
| All selected games removed from catalog | Notify parent, allow re-selection |
| Game swap used | Only 1 swap allowed per pack |
| Payment fails after pack purchase | Retry logic, rollback on persistent failure |

### 3.5 Error Handling

| Error Condition | User Message | System Action |
|-----------------|--------------|---------------|
| Selected games exceed pack limit | "You can only select X games. Please deselect some games." | Prevent save, highlight excess |
| Pack expired during selection | "Your pack has expired. Please renew to continue." | Redirect to pricing |
| Payment gateway unavailable | "Payment service is temporarily unavailable. Please try again." | Retry with exponential backoff |
| Game unavailable after selection | "One of your selected games is no longer available. Please choose another." | Mark unavailable, require re-selection |

---

## 4. Technical Specification

### 4.1 Data Model

```python
# New table: subscriptions
class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    parent_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Plan type: "full_annual", "pack_5", "pack_10"
    plan_type: Mapped[str] = mapped_column(String, nullable=False)
    
    # Pricing
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="INR")
    
    # Validity
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Status: "active", "expired", "cancelled", "upgraded"
    status: Mapped[str] = mapped_column(String, default="active")
    
    # For upgraded subscriptions - reference to new subscription
    upgraded_to_id: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=utc_now)


# New table: subscription_game_selections
class SubscriptionGameSelection(Base):
    __tablename__ = "subscription_game_selections"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    subscription_id: Mapped[str] = mapped_column(ForeignKey("subscriptions.id"), nullable=False)
    game_id: Mapped[str] = mapped_column(String, nullable=False)
    
    # Quarter when this selection is active: "2026-Q1", "2026-Q2", etc.
    quarter: Mapped[str] = mapped_column(String, nullable=False)
    
    selected_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
```

### 4.2 Quarter Utility

```python
def get_current_quarter() -> str:
    """Returns current quarter as 'YYYY-QN'"""
    now = datetime.now()
    quarter = (now.month - 1) // 3 + 1
    return f"{now.year}-Q{quarter}"

def get_quarter_start_end(quarter: str) -> tuple[datetime, datetime]:
    """Returns (start_date, end_date) for a quarter"""
    year, q = quarter.split("-Q")
    year, q = int(year), int(q)
    start_month = (q - 1) * 3 + 1
    start = datetime(year, start_month, 1)
    if q == 4:
        end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
    else:
        end = datetime(year, start_month + 3, 1) - timedelta(seconds=1)
    return start, end

def get_next_quarter(quarter: str) -> str:
    """Returns the next quarter after given quarter"""
    year, q = quarter.split("-Q")
    year, q = int(year), int(q)
    if q == 4:
        return f"{year + 1}-Q1"
    return f"{year}-Q{q + 1}"
```

### 4.3 API Endpoints

```
POST /api/v1/subscriptions/purchase
- Body: { plan_type: "pack_5" | "pack_10", payment_token: string }
- Response: { subscription_id, status, end_date }

GET /api/v1/subscriptions/current
- Response: { subscription_id, plan_type, status, end_date, game_selections: [...] }

PUT /api/v1/subscriptions/games
- Body: { game_ids: string[] }
- Response: { success, game_selections: [...] }
- Validates: game_ids.length <= pack limit

GET /api/v1/subscriptions/games/available
- Response: { games: [...], pack_limit: number, selected_count: number }

POST /api/v1/subscriptions/upgrade
- Body: { plan_type: "full_annual", payment_token: string }
- Response: { new_subscription_id, status, credit_applied }

GET /api/v1/subscriptions/quarter-info
- Response: { current_quarter: string, next_refresh_date: string, can_refresh: boolean }
```

### 4.4 Game Access Check Logic

```python
def can_access_game(user_id: str, game_id: str) -> bool:
    subscription = get_active_subscription(user_id)
    if not subscription:
        return False
    
    if subscription.plan_type == "full_annual":
        return True
    
    # For packs, check game selection
    current_quarter = get_current_quarter()
    selection = get_game_selection(subscription.id, current_quarter)
    
    return game_id in selection.game_ids
```

---

## 5. UX/UI Specification

### 5.1 Pricing Page

```
┌─────────────────────────────────────────────────────────┐
│                    Choose Your Plan                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  5-Game Pack │  │ 10-Game Pack │  │  Full Year   │  │
│  │              │  │              │  │              │  │
│  │   ₹2,000     │  │   ₹3,500     │  │    ₹6,000    │  │
│  │  /quarter    │  │  /quarter    │  │   /year      │  │
│  │              │  │              │  │              │  │
│  │  5 games     │  │  10 games    │  │  All games   │  │
│  │  3 months     │  │  3 months    │  │  12 months   │  │
│  │              │  │              │  │              │  │
│  │  [Select]    │  │  [Select]    │  │  [Select]    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Game Selection Page

```
┌─────────────────────────────────────────────────────────┐
│              Select Games for Your Pack                 │
│                                                          │
│  Pack: 5-Game Pack | 3 months remaining                 │
│  Selected: 3 of 5 | [View Selected]                     │
├─────────────────────────────────────────────────────────┤
│  🔍 Search games...                                     │
│  Category: All ▼                                         │
├─────────────────────────────────────────────────────────┤
│  ☐ Draw Letters        Alphabets    ★ Featured        │
│  ☑ Finger Counting     Numbers      ★ Featured        │
│  ☑ Connect Dots        Drawing      ★ Featured        │
│  ☐ Find Letter         Alphabets                        │
│  ...                                                   │
├─────────────────────────────────────────────────────────┤
│  [Cancel]                           [Save Selection]   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Parent Dashboard - Pack Status

```
┌─────────────────────────────────────────────────────────┐
│  Your Subscription                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Plan: 10-Game Pack                  Status: Active││
│  │  Valid until: March 31, 2026                         ││
│  │  Days remaining: 33 days           [Renew Pack]   ││
│  │                                                     ││
│  │  Selected Games (4/10):                             ││
│  │  • Finger Counting    • Connect Dots               ││
│  │  • Draw Letters       • Find Letter                ││
│  │                          [Change Games]             ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 6. Work Breakdown by Role

### 6.1 Backend Developer

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Create Subscription and SubscriptionGameSelection models | 4h | None |
| Add database migration for new tables | 2h | Models |
| Implement subscription purchase endpoint | 6h | Models, Payment integration |
| Implement game selection endpoints | 4h | Models |
| Implement game access check logic | 3h | Game service |
| Implement quarterly refresh logic | 4h | Game selection |
| Implement upgrade endpoint with prorated credit | 5h | Subscription endpoints |
| Add subscription status to user response | 2h | User endpoints |

### 6.2 Frontend Developer

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Add pricing page pack options | 4h | Design mockups |
| Create game selection component | 6h | Game catalog API |
| Add pack status to parent dashboard | 4h | Subscription API |
| Add expiration warning UI | 2h | Dashboard |
| Add upgrade flow UI | 4h | Pricing page |
| Add quarter refresh notification | 2h | Subscription API |

### 6.3 UX/UI Designer

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Design pricing page with pack options | 4h | None |
| Design game selection grid UI | 4h | None |
| Design pack status dashboard card | 3h | None |
| Design expiration/renewal prompts | 2h | None |
| Review game access denied states | 2h | Wireframes |

### 6.4 QA

| Task | Estimate | Dependencies |
|------|----------|--------------|
| Test pack purchase flow | 3h | Backend + Frontend |
| Test game selection limits | 2h | Backend |
| Test quarterly refresh | 3h | Backend |
| Test upgrade flow | 3h | Backend + Frontend |
| Test access control | 2h | Full system |
| Test edge cases | 4h | All components |

---

## 7. Security & Privacy

### 7.1 Considerations

- **Payment Security**: Use established payment gateway (Razorpay, Stripe India)
- **Subscription Validation**: Server-side check always, never trust client state
- **Data Retention**: Keep subscription history for accounting, but game selections can be purged after 1 year
- **Parent Gate**: All subscription management requires parent authentication

### 7.2 Access Control

- Game access is validated server-side on every game load request
- Client-side UI hiding is for UX only, not security
- Subscription status is checked against database, not cached long-term

---

## 8. Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment integration complexity | High | Use existing payment infrastructure, integrate early |
| Quarter boundary edge cases | Medium | Thorough testing of Jan 1, Apr 1, Jul 1, Oct 1 transitions |
| User confusion about refresh timing | Medium | Clear UI messaging, email reminders before quarter end |
| Pack vs full access conflict | High | Explicit status check, full annual always overrides pack |

---

## 9. Out of Scope (For This Feature)

- Monthly subscription options (future consideration)
- Family sharing (multiple children with different selections)
- Free trial for packs
- Referral program for packs
- Regional pricing variations
- Refund processing (handled manually)
