import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.roadmap import CareerRoadmap
from app.api.routes.users import get_db_user
from app.schemas.roadmap import (
    GapAnalysisResponse,
    GenerateRoadmapRequest,
    CareerRoadmapResponse
)
from app.services.roadmap_service import (
    calculate_skill_gap_analysis,
    synthesize_career_roadmap
)

router = APIRouter(prefix="/api/v1/roadmaps", tags=["roadmaps"])

@router.get("/gap-analysis", response_model=GapAnalysisResponse)
def get_gap_analysis(
    target_role: Optional[str] = Query(None, description="Target career role"),
    user: User = Depends(get_db_user)
):
    """
    Computes Evidence-Weighted Skill Gap Analysis (Algorithm B).
    Evaluates candidate's claimed, inferred, and assessed capabilities
    against benchmark role taxonomies with confidence penalties.
    """
    role = target_role or (user.profile.target_role if user.profile else None) or "Full-Stack Software Engineer"
    analysis = calculate_skill_gap_analysis(user, role)
    return analysis

@router.post("/generate", response_model=CareerRoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    body: GenerateRoadmapRequest = GenerateRoadmapRequest(),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes an Algorithm C Topologically Sorted 3-Phase Roadmap.
    Structures curriculum milestones, targeted skills, learning modules,
    and portfolio project deliverables based on candidate gaps.
    """
    role = body.target_role or (user.profile.target_role if user.profile else None) or "Full-Stack Software Engineer"
    weekly_hours = body.weekly_hours or 10

    roadmap = synthesize_career_roadmap(
        db=db,
        user=user,
        target_role=role,
        weekly_hours=weekly_hours
    )
    return roadmap

@router.get("/me", response_model=Optional[CareerRoadmapResponse])
def get_my_active_roadmap(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves the candidate's active roadmap with milestones."""
    stmt = (
        select(CareerRoadmap)
        .where(CareerRoadmap.user_id == user.id, CareerRoadmap.status == "ACTIVE")
        .order_by(CareerRoadmap.created_at.desc())
    )
    roadmap = db.scalar(stmt)
    return roadmap

@router.get("/{roadmap_id}", response_model=CareerRoadmapResponse)
def get_roadmap_by_id(
    roadmap_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific roadmap by ID."""
    stmt = select(CareerRoadmap).where(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == user.id
    )
    roadmap = db.scalar(stmt)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found."
        )
    return roadmap

