from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Any, List
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserDetailResponse,
    UserProfileUpdate,
    UserProfileResponse,
    EducationRecordCreate,
    EducationRecordResponse,
    ExperienceRecordCreate,
    ExperienceRecordResponse,
    UserSyncRequest
)
from app.services.user_service import (
    sync_clerk_user,
    update_user_profile,
    add_education,
    add_experience
)

router = APIRouter(prefix="/api/v1/users", tags=["users"])

def get_db_user(
    current_claims: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Helper dependency that resolves the authenticated database user from JWT claims."""
    clerk_id = current_claims.get("sub")
    user = db.scalar(select(User).where(User.clerk_id == clerk_id))
    if not user:
        # Auto-sync on first authenticated call
        user = sync_clerk_user(db, current_claims)
    return user

@router.post("/sync", response_model=UserDetailResponse)
def sync_user(
    body: UserSyncRequest = UserSyncRequest(),
    current_claims: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Syncs the authenticated Clerk user identity into PostgreSQL."""
    user = sync_clerk_user(db, current_claims, requested_role=body.role or "student")
    return user

@router.get("/me", response_model=UserDetailResponse)
def get_current_user_profile(user: User = Depends(get_db_user)):
    """Retrieves full profile, education, and experience for the logged-in candidate."""
    return user

@router.put("/me/profile", response_model=UserProfileResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Updates candidate headline, bio, target role, and location."""
    updated = update_user_profile(db, user, profile_in)
    return updated

@router.post("/me/education", response_model=EducationRecordResponse)
def create_education(
    edu_in: EducationRecordCreate,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Adds an academic education record."""
    edu = add_education(db, user, edu_in)
    return edu

@router.post("/me/experience", response_model=ExperienceRecordResponse)
def create_experience(
    exp_in: ExperienceRecordCreate,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Adds a professional work or internship experience record."""
    exp = add_experience(db, user, exp_in)
    return exp

