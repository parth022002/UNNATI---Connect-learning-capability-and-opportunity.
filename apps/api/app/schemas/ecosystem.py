from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class CohortSummary(BaseModel):
    id: str
    name: str
    department: str
    target_degree: str
    graduation_year: int
    total_students: int
    average_readiness_score: float = 0.0

class InstitutionResponse(BaseModel):
    id: str
    name: str
    code: str
    institution_type: str
    domain: Optional[str] = None
    location: Optional[str] = None
    is_verified: bool
    contact_email: Optional[str] = None
    cohorts: List[CohortSummary] = []

class CohortDistributionTier(BaseModel):
    tier: str # "Job-Ready (>=75%)", "Developing (50-74%)", "Foundations (<50%)"
    count: int
    percentage: float

class CurriculumGapItem(BaseModel):
    skill_name: str
    category: str
    importance: str # High, Critical, Moderate
    affected_students_count: int
    gap_percentage: float
    recommended_action: str

class CohortAnalyticsResponse(BaseModel):
    cohort_id: str
    cohort_name: str
    department: str
    total_learners: int
    average_readiness_score: float
    job_ready_percentage: float
    active_roadmaps_count: int
    distribution: List[CohortDistributionTier]
    top_curriculum_gaps: List[CurriculumGapItem]
    top_target_roles: List[Dict[str, Any]]

class CandidateTalentProfile(BaseModel):
    candidate_id: str
    anonymized_identifier: str # e.g. "Candidate #UN-8492"
    target_role: str
    headline: Optional[str] = None
    readiness_score: float
    experience_years: float
    verified_skills: List[str]
    assessed_skills: List[str]
    inferred_skills: List[str]
    match_percentage: float = 0.0
    capstone_completed: bool = False
    dpdp_consent_verified: bool = True

class TalentSearchFilterRequest(BaseModel):
    target_role: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    min_readiness_score: float = Field(default=0.0, ge=0.0, le=100.0)
    has_capstone: Optional[bool] = None
    limit: int = Field(default=20, ge=1, le=100)

class TalentSearchResponse(BaseModel):
    total_matches: int
    filter_criteria: Dict[str, Any]
    candidates: List[CandidateTalentProfile]

class OpportunityCreateRequest(BaseModel):
    title: str = Field(..., min_length=3)
    role_category: str = Field(..., min_length=2)
    location: str = "Hybrid (India)"
    employment_type: str = "Full-Time"
    min_readiness_score: float = Field(default=65.0, ge=0.0, le=100.0)
    required_skills: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    salary_range: Optional[str] = None

class OpportunityResponse(BaseModel):
    id: str
    title: str
    role_category: str
    location: str
    employment_type: str
    min_readiness_score: float
    required_skills: List[str]
    description: Optional[str] = None
    salary_range: Optional[str] = None
    company_name: str
    is_verified_company: bool
    status: str
    created_at: datetime
    matched_candidates_count: int = 0

class MarketSkillTrend(BaseModel):
    skill_name: str
    category: str
    industry_demand_index: float # 0 - 100
    supply_in_cohorts: float # 0 - 100
    market_gap: float # demand - supply
    trend_direction: str # "SURGING", "GROWING", "STABLE"

class MarketIntelligenceResponse(BaseModel):
    sector: str
    top_demanded_roles: List[Dict[str, Any]]
    surging_skills: List[MarketSkillTrend]
    curriculum_blind_spots: List[Dict[str, Any]]
    quarterly_insight: str

