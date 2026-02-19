# Games Management API - Implementation Plan

**Created**: 2025-02-05  
**Status**: PLANNING  
**Priority**: P0 (Production Critical)  
**Estimated Effort**: 8-16 hours

---

## Overview

Games are currently hardcoded in the frontend (`availableGames` array in `Games.tsx`). This blocks:

- Adding new games without code deployment
- Configuring game settings (age range, difficulty, duration)
- A/B testing game variations
- Measuring game popularity/engagement

**Goal**: Create a dynamic games management system with full CRUD API.

---

## Phase 1: Database Models (1-2 hours)

### 1.1 Create Game Model

**File**: `src/backend/app/db/models/game.py`

```python
"""Game model for game/activity management."""

from datetime import datetime
from typing import TYPE_CHECKING, List
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.db.models.user import User

class Game(Base):
    """Game model."""
    
    __tablename__ = "games"
    
    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)  # URL-friendly identifier
    description: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)  # IconName from frontend
    
    # Game Configuration
    category: Mapped[str] = mapped_column(String, nullable=False, index=True)  # 'Alphabets', 'Numbers', 'Drawing', 'Music'
    age_range_min: Mapped[int] = mapped_column(Integer, nullable=False)
    age_range_max: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)  # 'Easy', 'Medium', 'Hard'
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=True)  # Estimated play time
    
    # Content Paths
    game_path: Mapped[str] = mapped_column(String, nullable=False)  # Frontend route: '/games/{slug}'
    
    # Publishing & Configuration
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)  # Highlight in UI
    config_json: Mapped[str] = mapped_column(String, nullable=True)  # Game-specific settings
    
    # Metrics (computed from progress data)
    total_plays: Mapped[int] = mapped_column(Integer, default=0)
    avg_score: Mapped[float] = mapped_column(Integer, nullable=True)
    completion_rate: Mapped[float] = mapped_column(Integer, nullable=True)  # Percentage
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by: Mapped[str] = mapped_column(String, nullable=True)  # Admin user ID
    
    # Relationships
    achievements: Mapped[List["Achievement"]] = relationship(
        "Achievement", back_populates="game", cascade="all, delete-orphan"
    )
```

**Migration needed**: Yes - create `games` table

---

### 1.2 Create Activity/GameContent Model (Optional - can add later)

**File**: `src/backend/app/db/models/activity.py`

If we need to support different activity types within games (e.g., letter hunting levels, dot connection puzzles):

```python
"""Activity/GameContent model for structured game content."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

class Activity(Base):
    """Individual activity/level within a game."""
    
    __tablename__ = "activities"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False)  # Level number
    skill: Mapped[str] = mapped_column(String, nullable=True)  # 'Letter A', 'Counting', etc.
    metadata_json: Mapped[str] = mapped_column(String, nullable=True)  # Level-specific data
    
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # Display order
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)  # Unlock after previous level
    is_bonus: Mapped[bool] = mapped_column(Boolean, default=False)  # Optional bonus content
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Decision**: **Start with Game model only**, add Activity model in Phase 2 or later.

---

## Phase 2: Schemas (1-2 hours)

### 2.1 Game Schemas

**File**: `src/backend/app/schemas/game.py`

```python
"""Game schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserRole


class GameBase(BaseModel):
    """Base game schema."""
    
    title: str
    slug: str
    description: str
    icon: str
    
    category: str  # 'Alphabets', 'Numbers', 'Drawing', 'Music'
    age_range_min: int = Field(ge=2, le=12)
    age_range_max: int = Field(ge=2, le=12, gt=lambda v: v.age_range_min)
    difficulty: str  # 'Easy', 'Medium', 'Hard'
    duration_minutes: Optional[int] = Field(gt=0)
    game_path: str
    is_published: bool = True
    is_featured: bool = False
    config_json: Optional[dict] = None


class GameCreate(GameBase):
    """Schema for creating a game (admin only)."""
    
    pass


class GameUpdate(BaseModel):
    """Schema for updating a game (admin only)."""
    
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    
    category: Optional[str] = None
    age_range_min: Optional[int] = Field(None, ge=2, le=12)
    age_range_max: Optional[int] = Field(None, ge=2, le=12)
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    config_json: Optional[dict] = None


class Game(GameBase):
    """Response schema for a game."""
    
    id: str
    total_plays: int = 0
    avg_score: Optional[float] = None
    completion_rate: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class GameList(BaseModel):
    """List of games with optional filters."""
    
    games: List[Game]
    total: int
    page: int
    page_size: int


# Filter schemas for list endpoint
class GameFilter(BaseModel):
    """Query parameters for filtering games."""
    
    category: Optional[str] = None
    age_min: Optional[int] = Field(None, ge=2, le=12)
    age_max: Optional[int] = Field(None, ge=2, le=12)
    difficulty: Optional[str] = None
    is_published: bool = True
    is_featured: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
```

---

## Phase 3: Service Layer (2-3 hours)

### 3.1 Game Service

**File**: `src/backend/app/services/game_service.py`

```python
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
        
        # Get total count
        from sqlalchemy import func
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
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
    
    @staticmethod
    async def update_metrics(db: AsyncSession, game_id: str) -> None:
        """Update game metrics (triggered by progress updates).
        
        # This would be called when progress is saved
        # Re-calculates total_plays, avg_score, completion_rate
        pass  # Implementation details in Phase 4
```

---

## Phase 4: API Endpoints (2-4 hours)

### 4.1 Games Router

**File**: `src/backend/app/api/v1/endpoints/games.py`

```python
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
    if not current_user.is_superuser and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create games",
        )
    
    # Validate slug uniqueness
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
    if not current_user.is_superuser and current_user.role != UserRole.ADMIN:
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
    if not current_user.is_superuser and current_user.role != UserRole.ADMIN:
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
```

---

### 4.2 Register Router

**File**: Update `src/backend/app/api/v1/api.py`

```python
"""API router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, profile_photos, progress, users, games

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(profile_photos.router, tags=["profile-photos"])
api_router.include_router(games.router, prefix="/games", tags=["games"])  # Add this line
```

---

### 4.3 Export Game Data (for frontend migration)

**File**: `src/backend/app/data/games_data.py`

```python
"""Initial game data for migration."""

INITIAL_GAMES = [
    {
        "id": "alphabet-tracing",
        "slug": "alphabet-tracing",
        "title": "Draw Letters",
        "description": "Draw letters with your finger and see them come alive! 🎉",
        "icon": "letters",
        "category": "Alphabets",
        "age_range_min": 2,
        "age_range_max": 8,
        "difficulty": "Easy",
        "duration_minutes": 10,
        "game_path": "/games/alphabet-tracing",
        "is_published": True,
        "is_featured": True,
        "config_json": {},
    },
    {
        "id": "finger-number-show",
        "slug": "finger-number-show",
        "title": "Finger Counting",
        "description": "Show numbers with your fingers and Pip will count them! 🔢",
        "icon": "hand",
        "category": "Numbers",
        "age_range_min": 3,
        "age_range_max": 7,
        "difficulty": "Easy",
        "duration_minutes": 10,
        "game_path": "/games/finger-number-show",
        "is_published": True,
        "is_featured": True,
        "config_json": {},
    },
    {
        "id": "connect-the-dots",
        "slug": "connect-the-dots",
        "title": "Connect Dots",
        "description": "Connect the dots to make fun pictures! 🎨",
        "icon": "target",
        "category": "Drawing",
        "age_range_min": 3,
        "age_range_max": 6,
        "difficulty": "Easy",
        "duration_minutes": 15,
        "game_path": "/games/connect-the-dots",
        "is_published": True,
        "is_featured": True,
        "config_json": {},
    },
    {
        "id": "letter-hunt",
        "slug": "letter-hunt",
        "title": "Find Letter",
        "description": "Find hidden letters and win stars! ⭐",
        "icon": "target",
        "category": "Alphabets",
        "age_range_min": 2,
        "age_range_max": 6,
        "difficulty": "Easy",
        "duration_minutes": 10,
        "game_path": "/games/letter-hunt",
        "is_published": True,
        "is_featured": False,
        "config_json": {},
    },
]
```

---

## Phase 5: Database Migration (1 hour)

### 5.1 Create Migration

**File**: `src/backend/alembic/versions/005_add_games_table.py`

```python
"""Add games table

Revision ID: 005
Revises: 004
Create Date: 2025-02-05 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create games table
    op.create_table(
        'games',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False, index=True),
        sa.Column('age_range_min', sa.Integer(), nullable=False),
        sa.Column('age_range_max', sa.Integer(), nullable=False),
        sa.Column('difficulty', sa.String(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('game_path', sa.String(), nullable=False),
        sa.Column('is_published', sa.Boolean(), default=True, index=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('config_json', sa.String(), nullable=True),
        sa.Column('total_plays', sa.Integer(), default=0),
        sa.Column('avg_score', sa.Integer(), nullable=True),
        sa.Column('completion_rate', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('created_by', sa.String(), nullable=True),
    )
    
    # Add foreign key to achievements table
    op.add_column('achievements', sa.Column('game_id', sa.String(), sa.ForeignKey('games.id', ondelete='CASCADE')))


def downgrade() -> None:
    op.drop_table('games')
```

---

## Phase 6: Frontend Integration (2-3 hours)

### 6.1 Update Games Page to Use API

**File**: `src/frontend/src/pages/Games.tsx`

**Changes**:

1. Remove hardcoded `availableGames` array
2. Add `useState` for games data
3. Add `useEffect` to fetch games from API on mount
4. Add loading state
5. Add error handling
6. Keep GameCard component (works with game data)

```typescript
// Replace hardcoded array with:
const [games, setGames] = useState<Game[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchGames = async () => {
    try {
      const response = await gameApi.listGames(filters);
      setGames(response.data.games);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchGames();
}, [filters]);
```

### 6.2 Create Game API Service

**File**: `src/frontend/src/services/api.ts` (or create `src/frontend/src/services/gameApi.ts`)

```typescript
import axios from 'axios';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  age_range_min: number;
  age_range_max: number;
  difficulty: string;
  game_path: string;
  is_featured: boolean;
}

interface GamesListResponse {
  games: Game[];
  total: number;
  page: number;
  page_size: number;
}

export const gameApi = {
  listGames: async (filters?: {
    category?: string;
    age_min?: number;
    age_max?: number;
    difficulty?: string;
    is_featured?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.age_min) params.append('age_min', filters.age_min.toString());
    if (filters?.age_max) params.append('age_max', filters.age_max.toString());
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
    
    const response = await axios.get<GamesListResponse>('/api/v1/games', { params });
    return response.data;
  },
  
  getGame: async (slug: string) => {
    const response = await axios.get<Game>(`/api/v1/games/${slug}`);
    return response.data;
  },
};
```

---

## Phase 7: Testing (1-2 hours)

### 7.1 Backend Tests

**File**: `src/backend/tests/test_games.py`

```python
"""Tests for games API."""

import pytest
from httpx import AsyncClient

from app.main import app
from app.db.models.user import User as UserModel
from app.schemas.user import UserRole


@pytest.mark.asyncio
async def test_list_games_unauthenticated(async_client: AsyncClient):
    """Test that unauthenticated users can list published games."""
    response = await async_client.get("/api/v1/games")
    assert response.status_code == 200
    data = response.json()
    assert "games" in data
    assert len(data["games"]) > 0


@pytest.mark.asyncio
async def test_list_games_with_filters(async_client: AsyncClient):
    """Test filtering games by category."""
    response = await async_client.get("/api/v1/games?category=Alphabets")
    assert response.status_code == 200
    data = response.json()
    assert "games" in data
    assert all(g["category"] == "Alphabets" for g in data["games"])


@pytest.mark.asyncio
async def test_create_game_requires_admin(async_client: AsyncClient, db_session):
    """Test that creating games requires admin access."""
    # Create regular user
    user = await create_test_user(db_session, role=UserRole.PARENT)
    token = await login_user(user)
    
    response = await async_client.post(
        "/api/v1/games",
        json={"title": "Test Game", "slug": "test-game"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_game_by_slug(async_client: AsyncClient):
    """Test getting game details by slug."""
    # Create test game via DB
    response = await async_client.get("/api/v1/games/alphabet-tracing")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "alphabet-tracing"
    assert data["title"] == "Draw Letters"
```

---

## Implementation Order

### Day 1 (4-6 hours)

1. Create Game model (`app/db/models/game.py`)
2. Create Game schemas (`app/schemas/game.py`)
3. Create migration (`alembic/versions/005_add_games_table.py`)
4. Run migration: `alembic upgrade head`
5. Create game data export (`app/data/games_data.py`)
6. Create seed script to load initial games

### Day 2 (4-6 hours)

7. Create Game service (`app/services/game_service.py`)
2. Create Games API endpoints (`app/api/v1/endpoints/games.py`)
3. Register router in `app/api/v1/api.py`
4. Write backend tests (`tests/test_games.py`)
5. Run backend tests

### Day 3 (2-3 hours)

12. Create frontend game API service
2. Update Games.tsx to use API
3. Update GameCard to handle loading/error states
4. End-to-end test: Load Games page, verify games display

---

## Acceptance Criteria

- [ ] Game model created with all required fields
- [ ] Game schemas with validation
- [ ] Game service with CRUD operations
- [ ] Games API endpoints registered
- [ ] Admin access control enforced (superuser or ADMIN role)
- [ ] List games endpoint with filters and pagination
- [ ] Get game by slug/ID endpoints
- [ ] Create/Update/Delete endpoints (admin only)
- [ ] Database migration created and applied
- [ ] Initial game data seeded
- [ ] Frontend updated to use API instead of hardcoded data
- [ ] Backend tests passing
- [ ] Frontend tests passing

---

## Risks & Considerations

### Critical

- **Slug uniqueness**: Must ensure game slugs are unique to avoid routing conflicts
- **Admin access**: Only superusers AND admins should manage games (double protection)
- **Progress metrics**: Need to decide when/how to calculate `avg_score`, `completion_rate`, `total_plays`

### Considerations for Later

- **Game activities/levels**: May need Activity model for structured content
- **Game categories**: Consider adding subcategories for better filtering
- **A/B testing**: Add `variant_id` to Game model for testing variations
- **Game versioning**: Track game versions for rollback capability

---

## Related Work

- Backend audit: `docs/BACKEND_MISSING_FEATURES.md` (this plan addresses P0 item #1)
- User role management: `TCK-20250205-013` (just completed)
- Frontend Games page: `src/frontend/src/pages/Games.tsx` (needs migration)

---

**Planned By**: Agent
**Status**: Ready for implementation
**Next**: User approval to proceed with implementation
