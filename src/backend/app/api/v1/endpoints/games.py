"""Games management endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.game import Game
from app.db.models.user import User as UserModel
from app.schemas.user import User, UserRole
from app.schemas.game import Game, GameCreate, GameFilter, GameList
from app.services.game_service import GameService

router = APIRouter()


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
        games=games,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{slug}", response_model=Game)
async def get_game(slug: str, db: AsyncSession = Depends(get_db)) -> Game:
    """Get game details by slug."""

    game = await GameService.get_by_slug(db, slug)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return game


@router.get("/{game_id}", response_model=Game, include_in_schema=False)
async def get_game_by_id(game_id: str, db: AsyncSession = Depends(get_db)) -> Game:
    """Get game details by ID."""

    game = await GameService.get_by_id(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return game


@router.post("/", response_model=Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_in: GameCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Game:
    """Create a new game (admin only)."""

    # Verify admin access
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create games",
        )

    existing = await GameService.get_by_slug(db, game_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game slug already exists",
        )

    return await GameService.create(db, game_in, created_by=current_user.id)


@router.put("/{game_id}", response_model=Game)
async def update_game(
    game_id: str,
    game_in: GameUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Game:
    """Update an existing game (admin only)."""

    # Verify admin access
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update games",
        )

    game = await GameService.update(db, game_id, game_in)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a game (admin only)."""

    # Verify admin access
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete games",
        )

    game = await GameService.get_by_id(db, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    await GameService.delete(db, game_id)
