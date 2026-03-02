"""Games management endpoints."""

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from cachetools import TTLCache
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy import Float, Integer, and_, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.api.permissions import require_roles
from app.db.models.profile import Profile
from app.db.models.progress import Progress
from app.schemas.game import Game, GameCreate, GameList, GameUpdate, GlobalGameStat, GlobalGameStatsResponse
from app.schemas.user import User, UserRole
from app.services.game_service import GameService
from app.services.subscription_service import SubscriptionService

router = APIRouter()
logger = logging.getLogger(__name__)

UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.I)

CACHE_TTL_SECONDS = 3600
_GAME_STATS_CACHE: TTLCache[str, GlobalGameStatsResponse] = TTLCache(maxsize=100, ttl=CACHE_TTL_SECONDS)


def is_uuid(value: str) -> bool:
    """Check if value is a UUID."""
    return bool(UUID_PATTERN.match(value))


def _parse_age_group(age_group: str | None) -> tuple[float | None, float | None]:
    """Parse age group query param (e.g. 4-6) into min/max age."""
    if not age_group:
        return None, None

    match = re.match(r"^\s*(\d+(?:\.\d+)?)\s*[-:]\s*(\d+(?:\.\d+)?)\s*$", age_group)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="ageGroup must be in format min-max (e.g. 4-6)",
        )

    age_min = float(match.group(1))
    age_max = float(match.group(2))
    if age_min > age_max:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="ageGroup minimum age cannot be greater than maximum age",
        )
    return age_min, age_max


def _period_cutoff(period: str) -> datetime | None:
    """Resolve period filter cutoff timestamp."""
    now = datetime.now(timezone.utc)
    if period == "week":
        return now - timedelta(days=7)
    if period == "month":
        return now - timedelta(days=30)
    if period == "all":
        return None
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="period must be one of: week, month, all",
    )


def _popularity_score(total_plays: int, completion_rate: float) -> float:
    """Calculate weighted popularity score for sorting/trending."""
    return round((total_plays * 0.6) + ((completion_rate * 100.0) * 0.4), 2)


def _stats_cache_key(period: str, age_group: str | None) -> str:
    """Build cache key for stats request."""
    return f"period:{period}|age_group:{age_group or 'all'}"


async def resolve_game_identifier(
    identifier: str = Path(..., description="Game slug or ID"),
    db: AsyncSession = Depends(get_db),
) -> Game:
    """Resolve game by slug or ID. UUIDs are treated as IDs, others as slugs."""
    if is_uuid(identifier):
        game = await GameService.get_by_id(db, identifier)
    else:
        game = await GameService.get_by_slug(db, identifier)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return game


@router.get("/", response_model=GameList)
async def list_games(
    category: str = Query(None, description="Filter by category"),
    age_min: int = Query(None, ge=2, le=12, description="Minimum age"),
    age_max: int = Query(None, ge=2, le=12, description="Maximum age"),
    difficulty: str = Query(None, description="Filter by difficulty"),
    is_featured: bool = Query(None, description="Filter featured games"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> GameList:
    """List all published games with optional filters and pagination."""

    games, total = await GameService.get_all(
        db,
        category=category,
        age_min=age_min,
        age_max=age_max,
        difficulty=difficulty,
        is_published=True,
        is_featured=is_featured,
        page=page,
        page_size=page_size,
    )

    return GameList(
        games=games,  # type: ignore[arg-type]
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=GlobalGameStatsResponse)
async def get_games_stats(
    period: str = Query("week", description="Time window: week, month, or all"),
    age_group: str | None = Query(None, alias="ageGroup", description="Age cohort filter (e.g. 4-6)"),
    db: AsyncSession = Depends(get_db),
) -> GlobalGameStatsResponse:
    """Get global game statistics with optional time and age-cohort filtering."""
    cache_key = _stats_cache_key(period, age_group)
    cached = _GAME_STATS_CACHE.get(cache_key)
    if cached is not None:
        return cached

    try:
        cutoff = _period_cutoff(period)
        age_min, age_max = _parse_age_group(age_group)

        filters = [Progress.activity_type == "game"]
        if cutoff is not None:
            filters.append(Progress.completed_at >= cutoff)
        if age_min is not None:
            filters.append(Profile.age >= age_min)
        if age_max is not None:
            filters.append(Profile.age <= age_max)

        stmt = (
            select(
                Progress.content_id.label("game_name"),
                func.count(Progress.id).label("total_plays"),
                func.coalesce(func.avg(cast(Progress.duration_seconds, Float)) / 60.0, 0.0).label("avg_session_minutes"),
                func.coalesce(func.avg(cast(Progress.completed, Integer)), 0.0).label("completion_rate"),
            )
            .join(Profile, Profile.id == Progress.profile_id)
            .where(and_(*filters))
            .group_by(Progress.content_id)
        )

        result = await db.execute(stmt)
        rows = result.all()

        stats: list[dict] = []
        for row in rows:
            total_plays = int(row.total_plays or 0)
            completion_rate = float(row.completion_rate or 0.0)
            avg_session_minutes = round(float(row.avg_session_minutes or 0.0), 2)

            stats.append(
                {
                    "game_name": str(row.game_name),
                    "total_plays": total_plays,
                    "avg_session_minutes": avg_session_minutes,
                    "completion_rate": round(completion_rate, 4),
                    "popularity_score": _popularity_score(total_plays, completion_rate),
                }
            )

        stats.sort(key=lambda item: (item["popularity_score"], item["total_plays"]), reverse=True)

        games: list[GlobalGameStat] = []
        for idx, item in enumerate(stats, start=1):
            games.append(
                GlobalGameStat(
                    game_name=item["game_name"],
                    total_plays=item["total_plays"],
                    avg_session_minutes=item["avg_session_minutes"],
                    completion_rate=item["completion_rate"],
                    popularity_score=item["popularity_score"],
                    age_cohort_rank=idx,
                )
            )

        response = GlobalGameStatsResponse(
            period=period,
            age_group=age_group,
            generated_at=datetime.now(timezone.utc),
            games=games,
        )
        _GAME_STATS_CACHE[cache_key] = response
        return response

    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to compute games stats; returning empty response")
        return GlobalGameStatsResponse(
            period=period,
            age_group=age_group,
            generated_at=datetime.now(timezone.utc),
            games=[],
        )


@router.get("/{identifier}", response_model=Game)
async def get_game(identifier: str = Path(..., description="Game slug or ID"), db: AsyncSession = Depends(get_db)) -> Game:
    """Get game details by slug or ID."""
    return await resolve_game_identifier(identifier, db)


@router.get("/{identifier}/access")
async def check_game_access(
    identifier: str = Path(..., description="Game slug or ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Check if the current user can access a game.
    
    Returns:
        {
            "can_access": bool,
            "reason": str,
            "game_id": str,
            "subscription_status": "active" | "expired" | "none"
        }
    """
    # Get game
    game = await resolve_game_identifier(identifier, db)
    
    # Check subscription
    subscription = await SubscriptionService.get_active_subscription(
        db=db, parent_id=current_user.id
    )
    
    if not subscription:
        return {
            "can_access": False,
            "reason": "No active subscription",
            "game_id": game.id,
            "subscription_status": "none",
        }
    
    # Check game access
    can_access, reason = await SubscriptionService.can_access_game(
        db=db, parent_id=current_user.id, game_id=game.id
    )
    
    return {
        "can_access": can_access,
        "reason": reason,
        "game_id": game.id,
        "subscription_status": "active",
        "plan_type": subscription.plan_type.value,
    }


@router.post("/", response_model=Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_in: GameCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
) -> Game:
    """Create a new game (admin only)."""

    existing = await GameService.get_by_slug(db, game_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game slug already exists",
        )

    return await GameService.create(db, game_in, created_by=current_user.id)  # type: ignore[return-value]


@router.put("/{game_id}", response_model=Game)
async def update_game(
    game_id: str,
    game_in: GameUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
) -> Game:
    """Update an existing game (admin only)."""

    game = await GameService.update(db, game_id, game_in)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return game  # type: ignore[return-value]


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a game (admin only)."""

    game = await GameService.get_by_id(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    await GameService.delete(db, game_id)
