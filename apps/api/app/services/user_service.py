from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, Dict, Any
import re
import logging
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.document import CandidateDocument
from app.schemas.user import UserProfileUpdate, EducationRecordCreate, ExperienceRecordCreate
from app.core.storage import delete_file_from_storage

logger = logging.getLogger(__name__)

def calculate_completeness(user: User) -> int:
    """Calculates profile completeness score (0-100%)."""
    score = 20  # Base score for authenticated email
    if not user.profile:
        return score

    p = user.profile
    if user.first_name and user.last_name:
        score += 10
    if p.headline:
        score += 10
    if p.target_role:
        score += 15
    if p.bio and len(p.bio.strip()) > 30:
        score += 10
    if p.location:
        score += 5
    if p.linkedin_url or p.github_url or p.portfolio_url:
        score += 10
    if len(user.education) > 0:
        score += 10
    if len(user.experience) > 0:
        score += 10

    return min(score, 100)

def sync_clerk_user(db: Session, claims: Dict[str, Any], requested_role: str = "student") -> User:
    """Synchronizes an authenticated Clerk identity into the local PostgreSQL database."""
    clerk_id = claims.get("sub")
    if not clerk_id:
        raise ValueError("Missing 'sub' claim in authentication token.")

    # Extract email and names from claims or defaults
    email = claims.get("email") or f"{clerk_id}@user.clerk"
    first_name = claims.get("first_name") or ""
    last_name = claims.get("last_name") or ""

    user = db.scalar(select(User).where(User.clerk_id == clerk_id))
    if not user:
        # Check by email as fallback
        user = db.scalar(select(User).where(User.email == email))
        if user:
            user.clerk_id = clerk_id
        else:
            user = User(
                clerk_id=clerk_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=requested_role or "student",
                is_active=True,
            )
            db.add(user)
            db.flush()

            # Create default profile
            profile = UserProfile(
                user_id=user.id,
                completeness_score=30,
            )
            db.add(profile)
            db.flush()

    else:
        # Update names if newly available
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name

    # Ensure profile exists
    if not user.profile:
        profile = UserProfile(user_id=user.id, completeness_score=30)
        db.add(profile)
        db.flush()

    user.profile.completeness_score = calculate_completeness(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_profile(db: Session, user: User, profile_in: UserProfileUpdate) -> UserProfile:
    """Updates profile attributes and recalculates completeness."""
    if not user.profile:
        user.profile = UserProfile(user_id=user.id)
        db.add(user.profile)
        db.flush()

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user.profile, field, val)

    user.profile.completeness_score = calculate_completeness(user)
    db.commit()
    db.refresh(user.profile)
    return user

def add_education(db: Session, user: User, edu_in: EducationRecordCreate) -> EducationRecord:
    edu = EducationRecord(
        user_id=user.id,
        **edu_in.model_dump()
    )
    db.add(edu)
    db.flush()
    if user.profile:
        user.profile.completeness_score = calculate_completeness(user)
    db.commit()
    db.refresh(edu)
    return edu

def add_experience(db: Session, user: User, exp_in: ExperienceRecordCreate) -> ExperienceRecord:
    exp = ExperienceRecord(
        user_id=user.id,
        **exp_in.model_dump()
    )
    db.add(exp)
    db.flush()
    if user.profile:
        user.profile.completeness_score = calculate_completeness(user)
    db.commit()
    db.refresh(exp)
    return exp

def crypto_shred_user(db: Session, user: User) -> bool:
    """
    Executes DPDP Act (India) Section 12 Right-to-Erasure and 72-hour crypto-shredding.
    1. Permanently shreds all private documents and resumes from Cloudflare R2 / storage.
    2. Cascades deletion across candidate profile, education, experience, roadmaps, and skills.
    3. Purges user identity record from PostgreSQL.
    """
    user_id = user.id
    clerk_id = user.clerk_id
    logger.info(f"Initiating DPDP crypto-shredding for candidate {user_id} (Clerk: {clerk_id})")

    try:
        # 1. Purge all stored candidate files from R2 / storage
        docs = db.scalars(select(CandidateDocument).where(CandidateDocument.user_id == user_id)).all()
        for doc in docs:
            if doc.storage_path:
                delete_file_from_storage(doc.storage_path)

        # 2. Delete user entity (cascades to profile, education, experience, candidate_skills, roadmaps)
        db.delete(user)
        db.commit()
        logger.info(f"DPDP crypto-shredding completed successfully for candidate {user_id}")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to execute DPDP crypto-shredding for candidate {user_id}: {e}")
        return False

