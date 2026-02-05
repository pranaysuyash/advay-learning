"""API router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, profile_photos, progress, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(profile_photos.router, tags=["profile-photos"])
