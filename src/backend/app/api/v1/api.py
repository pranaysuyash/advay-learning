"""API router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    data_export,
    games,
    issue_reports,
    profile_photos,
    progress,
    subscriptions,
    users,
    achievements,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(profile_photos.router, tags=["profile-photos"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["achievements"])
api_router.include_router(
    issue_reports.router,
    prefix="/issue-reports",
    tags=["issue-reports"],
)
api_router.include_router(
    subscriptions.router,
    prefix="/subscriptions",
    tags=["subscriptions"],
)
api_router.include_router(
    data_export.router,
    prefix="/export",
    tags=["data-export"],
)
