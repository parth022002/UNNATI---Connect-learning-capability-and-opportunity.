from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.db.session import get_db
from app.models.skill import CanonicalSkill, CandidateSkill
from app.models.user import User
from app.api.routes.users import get_db_user
from app.schemas.skill import (
    CanonicalSkillResponse,
    CandidateSkillClaim,
    CandidateSkillAssessRequest,
    CandidateSkillResponse
)
from app.services.skill_service import claim_candidate_skill, assess_candidate_skill

router = APIRouter(prefix="/api/v1/skills", tags=["skills"])

@router.get("/canonical", response_model=List[CanonicalSkillResponse])
def search_canonical_skills(
    q: Optional[str] = Query(None, description="Search query for skill name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Searches canonical skills taxonomy."""
    stmt = select(CanonicalSkill)
    if q:
        stmt = stmt.where(CanonicalSkill.name.ilike(f"%{q.strip()}%"))
    if category:
        stmt = stmt.where(CanonicalSkill.category == category)
    stmt = stmt.order_by(CanonicalSkill.name).limit(limit)
    skills = db.scalars(stmt).all()
    return skills

@router.get("/me", response_model=List[CandidateSkillResponse])
def get_my_skills(user: User = Depends(get_db_user)):
    """Returns all claimed, inferred, or assessed skills for the candidate."""
    results = []
    for cs in user.candidate_skills:
        results.append(
            CandidateSkillResponse(
                id=cs.id,
                skill_name=cs.canonical_skill.name,
                category=cs.canonical_skill.category,
                state=cs.state,
                proficiency=cs.proficiency,
                confidence=cs.confidence,
                evidence_count=cs.evidence_count,
                last_evidence_at=cs.last_evidence_at
            )
        )
    return results

@router.post("/me/claim", response_model=CandidateSkillResponse)
def claim_skill(
    claim_in: CandidateSkillClaim,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Allows candidate to claim a skill with self-rated proficiency."""
    cs = claim_candidate_skill(
        db=db,
        user=user,
        skill_name=claim_in.skill_name,
        category=claim_in.category or "technical",
        proficiency=claim_in.proficiency
    )
    return CandidateSkillResponse(
        id=cs.id,
        skill_name=cs.canonical_skill.name,
        category=cs.canonical_skill.category,
        state=cs.state,
        proficiency=cs.proficiency,
        confidence=cs.confidence,
        evidence_count=cs.evidence_count,
        last_evidence_at=cs.last_evidence_at
    )

@router.post("/me/assess", response_model=CandidateSkillResponse)
def assess_skill(
    assess_in: CandidateSkillAssessRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Records an assessment diagnostic result and advances skill state
    (e.g. CLAIMED / INFERRED -> ASSESSED) with Bayesian calibration.
    """
    cs = assess_candidate_skill(
        db=db,
        user=user,
        skill_name=assess_in.skill_name,
        category=assess_in.category or "general",
        score=assess_in.score
    )
    return CandidateSkillResponse(
        id=cs.id,
        skill_name=cs.canonical_skill.name,
        category=cs.canonical_skill.category,
        state=cs.state,
        proficiency=cs.proficiency,
        confidence=cs.confidence,
        evidence_count=cs.evidence_count,
        last_evidence_at=cs.last_evidence_at
    )


