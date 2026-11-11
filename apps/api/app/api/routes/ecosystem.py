import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.ecosystem import (
    InstitutionResponse, CohortSummary, CohortAnalyticsResponse,
    TalentSearchFilterRequest, TalentSearchResponse,
    OpportunityCreateRequest, OpportunityResponse, MarketIntelligenceResponse
)
from app.services.ecosystem_service import (
    get_institution_summary, get_cohort_analytics,
    search_talent_pool, list_opportunities, create_opportunity,
    get_market_intelligence
)

router = APIRouter(prefix="/api/v1", tags=["ecosystem"])

# ==============================================================================
# INSTITUTION & CAMPUS ANALYTICS (Phase 5.1)
# ==============================================================================
@router.get("/institution/summary", response_model=InstitutionResponse)
def get_institution(db: Session = Depends(get_db)):
    """Retrieve institution profile, active cohorts, and aggregate statistics."""
    return get_institution_summary(db)

@router.get("/institution/cohorts", response_model=List[CohortSummary])
def get_cohorts(db: Session = Depends(get_db)):
    """List all registered academic cohorts and their student counts."""
    summary = get_institution_summary(db)
    return summary.cohorts

@router.get("/institution/cohorts/{cohort_id}/analytics", response_model=CohortAnalyticsResponse)
def get_cohort_details(cohort_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Retrieve deep cohort skill analytics:
    - Job-readiness distribution (Job-Ready >=75%, Developing, Foundations)
    - Curriculum blind spots and missing competencies
    - Target career role preferences
    """
    return get_cohort_analytics(db, cohort_id)

# ==============================================================================
# EMPLOYER TALENT DISCOVERY & OPPORTUNITIES (Phase 5.2)
# ==============================================================================
@router.post("/talent/candidates/search", response_model=TalentSearchResponse)
def search_candidates_post(filter_req: TalentSearchFilterRequest, db: Session = Depends(get_db)):
    """
    Filter candidate talent pool using transparent, merit-based criteria.
    Guarantees privacy: DPDP Act compliance, anonymized identifiers, zero demographic bias.
    """
    return search_talent_pool(db, filter_req)

@router.get("/talent/candidates/search", response_model=TalentSearchResponse)
def search_candidates_get(
    target_role: Optional[str] = Query(None, description="Filter by target career role"),
    skills: Optional[str] = Query(None, description="Comma-separated required skills"),
    min_readiness: float = Query(0.0, ge=0.0, le=100.0, description="Minimum readiness score"),
    has_capstone: Optional[bool] = Query(None, description="Filter by completed capstone project"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """GET query-string alternative for transparent candidate filtering."""
    req_skills = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    filter_req = TalentSearchFilterRequest(
        target_role=target_role,
        required_skills=req_skills,
        min_readiness_score=min_readiness,
        has_capstone=has_capstone,
        limit=limit
    )
    return search_talent_pool(db, filter_req)

@router.get("/talent/opportunities", response_model=List[OpportunityResponse])
def get_opportunities(
    sector: Optional[str] = Query(None, description="Filter opportunities by sector"),
    db: Session = Depends(get_db)
):
    """Retrieve available employer opportunities with required skill rubrics."""
    return list_opportunities(db, sector)

@router.post("/talent/opportunities", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def post_opportunity(
    opp_data: OpportunityCreateRequest,
    db: Session = Depends(get_db)
):
    """Post a new verified opportunity with required skill criteria and minimum readiness score."""
    return create_opportunity(db, opp_data.model_dump())

# ==============================================================================
# LABOR MARKET & CURRICULUM INTELLIGENCE (Phase 5.3)
# ==============================================================================
@router.get("/analytics/market-intelligence", response_model=MarketIntelligenceResponse)
def get_intelligence(
    sector: str = Query("technology", description="Industry sector (technology, business, finance)")
):
    """
    Returns real-time labor market intelligence:
    - Surging skills with demand vs supply index
    - In-demand career roles and compensation benchmarks
    - Curriculum blind spots actionable by academic leaders
    """
    return get_market_intelligence(sector)
