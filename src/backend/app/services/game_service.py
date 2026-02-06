"""Game service."""

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.game import Game
from app.schemas.game import GameCreate, GameUpdate


class GameService:
    """Service for game management."""

    @staticmethod
    async def get_all(
        db: AsyncSession,
        category: Optional[str] = None,
        age_min: Optional[int] = None,
        age_max: Optional[int] = None,
        difficulty: Optional[str] = None,
        is_published: bool = True,
        is_featured: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Game], int]:
        """Get games with optional filters and pagination."""

        query = select(Game).where(Game.is_published == is_published)

        if category:
            query = query.where(Game.category == category)
        if age_min is not None:
            query = query.where(Game.age_range_min >= age_min)
        if age_max is not None:
            query = query.where(Game.age_range_max <= age_max)
        if difficulty:
            query = query.where(Game.difficulty == difficulty)
        if is_featured is not None:
            query = query.where(Game.is_featured == is_featured)

        from sqlalchemy import func

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(Game.created_at.desc())
        query = query.offset((page - 1) * page_size)
        query = query.limit(page_size)

        result = await db.execute(query)
        games = result.scalars().all()

        return list(games), total

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> Optional[Game]:
        """Get game by slug."""

        query = select(Game).where(Game.slug == slug)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, game_id: str) -> Optional[Game]:
        """Get game by ID."""

        query = select(Game).where(Game.id == game_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, game_in: GameCreate, created_by: str) -> Game:
        """Create a new game (admin only)."""

        game = Game(**game_in.model_dump(), created_by=created_by)
        db.add(game)
        await db.commit()
        await db.refresh(game)

        return game

    @staticmethod
    async def update(db: AsyncSession, game_id: str, game_in: GameUpdate) -> Optional[Game]:
        """Update an existing game (admin only)."""

        game = await GameService.get_by_id(db, game_id)
        if not game:
            return None

        update_data = game_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(game, field, value)

        await db.commit()
        await db.refresh(game)

        return game

    @staticmethod
    async def delete(db: AsyncSession, game_id: str) -> bool:
        """Delete a game (admin only)."""

        game = await GameService.get_by_id(db, game_id)
        if not game:
            return False

        await db.delete(game)
        await db.commit()

        return True
