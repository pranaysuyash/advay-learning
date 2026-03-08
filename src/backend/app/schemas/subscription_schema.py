"""Subscription schemas."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionPlanType(str, Enum):
    """Subscription plan types."""

    GAME_PACK_5 = "game_pack_5"
    GAME_PACK_10 = "game_pack_10"
    FULL_ANNUAL = "full_annual"


class SubscriptionStatus(str, Enum):
    """Subscription status types."""

    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    UPGRADED = "upgraded"


class SubscriptionBase(BaseModel):
    """Base subscription schema."""

    plan_type: SubscriptionPlanType
    amount_paid: int = Field(..., description="Amount in paise")
    currency: str = "INR"


class SubscriptionCreate(SubscriptionBase):
    """Subscription creation schema."""

    payment_reference: Optional[str] = None


class SubscriptionGameSelectionCreate(BaseModel):
    """Game selection creation schema."""

    game_ids: list[str] = Field(..., min_length=1)


class SubscriptionGameSwap(BaseModel):
    """Game swap schema."""

    old_game_id: Optional[str] = None
    new_game_id: str


class SubscriptionUpgrade(BaseModel):
    """Subscription upgrade schema."""

    new_plan: SubscriptionPlanType


class SubscriptionGameSelectionResponse(BaseModel):
    """Game selection response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    game_id: str
    selected_at: datetime
    swapped_at: Optional[datetime]
    original_game_id: Optional[str]


class SubscriptionResponse(BaseModel):
    """Subscription response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    parent_id: str
    plan_type: str
    amount_paid: int
    currency: str
    start_date: datetime
    end_date: datetime
    status: str
    upgraded_to_id: Optional[str]
    game_swap_used: bool
    payment_reference: Optional[str]
    created_at: datetime
    game_selections: list[SubscriptionGameSelectionResponse] = []


class SubscriptionAvailableGames(BaseModel):
    """Available games info for a subscription."""

    game_limit: int
    selected_count: int
    remaining_slots: int
    swap_available: bool
    plan_type: str
    refresh_available: bool = False
    current_cycle_index: int = 1
    total_cycles: int = 1
    last_refresh_cycle_used: int = 0
    next_refresh_at: Optional[datetime] = None
    refresh_window_label: Optional[str] = None
    renewal_prompt: Optional[str] = None


class SubscriptionStatusResponse(BaseModel):
    """Subscription status response."""

    has_active: bool
    subscription: Optional[SubscriptionResponse]
    days_remaining: Optional[int]
    available_games: Optional[SubscriptionAvailableGames]


class SubscriptionPurchaseResponse(BaseModel):
    """Subscription purchase response."""

    subscription: SubscriptionResponse
    message: str
