"""Tests for GameService."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

import uuid

from app.services.game_service import GameService
from app.schemas.game import GameCreate, GameUpdate
from app.db.models.game import Game


@pytest.fixture
async def test_game(db_session: AsyncSession) -> Game:
    """Create a test game."""
    unique_id = str(uuid.uuid4())[:8]
    game = Game(
        id=f"test-game-{unique_id}",
        title="Test Game",
        slug=f"test-game-{unique_id}",
        description="A test game",
        icon="🎮",
        game_path="/games/test-game",
        category="math",
        difficulty="medium",
        age_range_min=5,
        age_range_max=10,
        is_published=True,
        created_by="admin",
    )
    db_session.add(game)
    await db_session.commit()
    await db_session.refresh(game)
    return game


@pytest.fixture
async def test_games(db_session: AsyncSession) -> list[Game]:
    """Create multiple test games."""
    unique_prefix = str(uuid.uuid4())[:8]
    games = [
        Game(
            id=f"test-game-batch-{unique_prefix}-{i}",
            title=f"Test Game {i}",
            slug=f"test-game-batch-{unique_prefix}-{i}",
            description=f"Test game {i}",
            icon="🎮",
            game_path=f"/games/test-game-{unique_prefix}-{i}",
            category="math" if i % 2 == 0 else "reading",
            difficulty="easy" if i < 2 else "hard",
            age_range_min=5,
            age_range_max=8 if i < 3 else 12,
            is_published=True,
            is_featured=(i == 0),
            created_by="admin",
        )
        for i in range(5)
    ]
    for game in games:
        db_session.add(game)
    await db_session.commit()
    return games


class TestGetAll:
    """Test get_all method."""

    async def test_get_all_games(self, db_session: AsyncSession, test_games: list[Game]):
        """Test getting all published games."""
        games, total = await GameService.get_all(db_session)
        
        # Should at least have our test games
        assert len(games) >= 5
        assert total >= 5

    async def test_get_all_with_category_filter(self, db_session: AsyncSession, test_games: list[Game]):
        """Test filtering by category."""
        games, total = await GameService.get_all(db_session, category="math")
        
        # Should have at least our 3 test games (indices 0, 2, 4)
        assert len(games) >= 3
        assert total >= 3
        for game in games:
            assert game.category == "math"

    async def test_get_all_with_difficulty_filter(self, db_session: AsyncSession, test_games: list[Game]):
        """Test filtering by difficulty."""
        games, total = await GameService.get_all(db_session, difficulty="easy")
        
        # Should have at least our 2 test games (indices 0, 1)
        assert len(games) >= 2
        assert total >= 2
        for game in games:
            assert game.difficulty == "easy"

    async def test_get_all_with_age_min_filter(self, db_session: AsyncSession, test_games: list[Game]):
        """Test filtering by minimum age."""
        games, total = await GameService.get_all(db_session, age_min=5)
        
        # All test games have age_range_min >= 5
        assert len(games) >= 5
        assert total >= 5

    async def test_get_all_with_age_max_filter(self, db_session: AsyncSession, test_games: list[Game]):
        """Test filtering by maximum age."""
        games, total = await GameService.get_all(db_session, age_max=8)
        
        # Test games 0, 1, 2 have age_range_max <= 8
        assert len(games) >= 3
        assert total >= 3

    async def test_get_all_with_featured_filter(self, db_session: AsyncSession, test_games: list[Game]):
        """Test filtering by featured status."""
        games, total = await GameService.get_all(db_session, is_featured=True)
        
        # Should have at least our 1 featured test game
        assert len(games) >= 1
        assert total >= 1
        assert games[0].is_featured is True

    async def test_get_all_with_unpublished(self, db_session: AsyncSession, test_games: list[Game]):
        """Test including unpublished games."""
        # Create an unpublished game
        unique_id = str(uuid.uuid4())[:8]
        unpublished = Game(
            id=f"unpublished-game-{unique_id}",
            title="Unpublished Game",
            slug=f"unpublished-game-{unique_id}",
            description="Not published",
            icon="🎯",
            game_path="/games/unpublished",
            category="math",
            difficulty="easy",
            age_range_min=5,
            age_range_max=10,
            is_published=False,
            created_by="admin",
        )
        db_session.add(unpublished)
        await db_session.commit()
        
        games, total = await GameService.get_all(db_session, is_published=False)
        
        assert len(games) == 1
        assert games[0].is_published is False

    async def test_get_all_pagination(self, db_session: AsyncSession, test_games: list[Game]):
        """Test pagination."""
        games, total = await GameService.get_all(db_session, page=1, page_size=2)
        
        assert len(games) == 2
        assert total >= 5

    async def test_get_all_pagination_page_2(self, db_session: AsyncSession, test_games: list[Game]):
        """Test pagination page 2."""
        games, total = await GameService.get_all(db_session, page=2, page_size=2)
        
        assert len(games) == 2
        assert total >= 5

    async def test_get_all_pagination_last_page(self, db_session: AsyncSession, test_games: list[Game]):
        """Test pagination last page."""
        games, total = await GameService.get_all(db_session, page=3, page_size=2)
        
        assert len(games) >= 1
        assert total >= 5

    async def test_get_all_no_results(self, db_session: AsyncSession):
        """Test when no games match filters."""
        # Use a unique category that shouldn't exist
        unique_cat = f"nonexistent-{uuid.uuid4()}"
        games, total = await GameService.get_all(db_session, category=unique_cat)
        
        assert len(games) == 0
        assert total == 0


class TestGetBySlug:
    """Test get_by_slug method."""

    async def test_get_by_slug_success(self, db_session: AsyncSession, test_game: Game):
        """Test getting game by slug."""
        result = await GameService.get_by_slug(db_session, test_game.slug)
        
        assert result is not None
        assert result.id == test_game.id
        assert result.title == "Test Game"

    async def test_get_by_slug_not_found(self, db_session: AsyncSession):
        """Test getting non-existent game by slug."""
        result = await GameService.get_by_slug(db_session, "nonexistent")
        
        assert result is None


class TestGetById:
    """Test get_by_id method."""

    async def test_get_by_id_success(self, db_session: AsyncSession, test_game: Game):
        """Test getting game by ID."""
        result = await GameService.get_by_id(db_session, test_game.id)
        
        assert result is not None
        assert result.id == test_game.id
        assert result.title == "Test Game"

    async def test_get_by_id_not_found(self, db_session: AsyncSession):
        """Test getting non-existent game by ID."""
        result = await GameService.get_by_id(db_session, "nonexistent-id")
        
        assert result is None


class TestCreate:
    """Test create method."""

    async def test_create_game(self, db_session: AsyncSession):
        """Test creating a new game."""
        unique_id = str(uuid.uuid4())[:8]
        game_data = GameCreate(
            title="New Game",
            slug=f"new-game-{unique_id}",
            description="A new game",
            icon="🎮",
            game_path=f"/games/new-game-{unique_id}",
            category="math",
            difficulty="easy",
            age_range_min=5,
            age_range_max=10,
        )
        
        game = await GameService.create(db_session, game_data, "admin")
        
        assert game.title == "New Game"
        assert f"new-game-{unique_id}" in game.slug
        assert game.created_by == "admin"
        assert game.id is not None

    async def test_create_game_with_config_json_dict(self, db_session: AsyncSession):
        """Test creating game with config_json as dict."""
        unique_id = str(uuid.uuid4())[:8]
        game_data = GameCreate(
            title="Game With Config",
            slug=f"game-with-config-{unique_id}",
            description="Has config",
            icon="🎮",
            game_path=f"/games/config-{unique_id}",
            category="math",
            difficulty="easy",
            age_range_min=5,
            age_range_max=10,
            config_json={"key": "value", "number": 123},
        )
        
        game = await GameService.create(db_session, game_data, "admin")
        
        assert game.config_json is not None
        # Verify it was stored as JSON string
        assert '"key": "value"' in game.config_json


class TestUpdate:
    """Test update method."""

    async def test_update_game(self, db_session: AsyncSession, test_game: Game):
        """Test updating a game."""
        original_slug = test_game.slug
        update_data = GameUpdate(
            title="Updated Title",
            description="Updated description",
        )
        
        updated = await GameService.update(db_session, test_game.id, update_data)
        
        assert updated is not None
        assert updated.title == "Updated Title"
        assert updated.description == "Updated description"
        # Unchanged fields remain
        assert updated.slug == original_slug

    async def test_update_game_not_found(self, db_session: AsyncSession):
        """Test updating non-existent game."""
        update_data = GameUpdate(title="New Title")
        
        result = await GameService.update(db_session, "nonexistent-id", update_data)
        
        assert result is None

    async def test_update_game_partial(self, db_session: AsyncSession, test_game: Game):
        """Test partial update (only some fields)."""
        update_data = GameUpdate(title="Only Title Updated")
        
        updated = await GameService.update(db_session, test_game.id, update_data)
        
        assert updated is not None
        assert updated.title == "Only Title Updated"
        assert updated.description == "A test game"  # Unchanged

    async def test_update_game_with_config_json_dict(self, db_session: AsyncSession, test_game: Game):
        """Test updating game with config_json as dict."""
        update_data = GameUpdate(
            config_json={"updated": True, "level": 5},
        )
        
        updated = await GameService.update(db_session, test_game.id, update_data)
        
        assert updated is not None
        assert '"updated": true' in updated.config_json


class TestDelete:
    """Test delete method."""

    async def test_delete_game(self, db_session: AsyncSession, test_game: Game):
        """Test deleting a game."""
        result = await GameService.delete(db_session, test_game.id)
        
        assert result is True
        
        # Verify it's gone
        deleted = await GameService.get_by_id(db_session, test_game.id)
        assert deleted is None

    async def test_delete_game_not_found(self, db_session: AsyncSession):
        """Test deleting non-existent game."""
        result = await GameService.delete(db_session, "nonexistent-id")
        
        assert result is False
