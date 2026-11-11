import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class JobSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    source_code: str
    source_type: str
    region: str
    integration_method: str
    api_endpoint: Optional[str] = None
    auth_type: str
    is_active: bool
    rate_limit_rpm: int
    sync_frequency_minutes: int
    last_sync_at: Optional[datetime] = None
    last_sync_status: str
    last_error_message: Optional[str] = None
    total_jobs_ingested: int
    compliance_notes: Optional[str] = None


class ExternalJobReferenceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source_id: uuid.UUID
    portal_name: str
    external_job_id: str
    external_url: str
    portal_job_title: str
    portal_posted_at: Optional[datetime] = None
    is_primary_source: bool = True


class JobMatchSkillItem(BaseModel):
    skill: str
    evidence_state: str # VERIFIED, ASSESSED, CLAIMED, INFERRED
    confidence: float


class JobMissingSkillItem(BaseModel):
    skill: str
    is_mandatory: bool = True
    in_candidate_roadmap: bool = False
    suggested_roadmap_module: Optional[str] = None


class JobMatchDetail(BaseModel):
    overall_match_percentage: float
    skills_match_score: float
    role_relevance_score: float
    experience_compatibility_score: float
    education_compatibility_score: float
    career_alignment_score: float
    matched_skills: List[JobMatchSkillItem] = Field(default_factory=list)
    missing_skills: List[JobMissingSkillItem] = Field(default_factory=list)
    recommendation_explanation: str
    potential_concerns: List[str] = Field(default_factory=list)
    learning_recommendations: List[Dict[str, Any]] = Field(default_factory=list)


class CanonicalJobListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    company_name: str
    company_logo_url: Optional[str] = None
    city: Optional[str] = None
    state_region: Optional[str] = None
    country: str = "India"
    workplace_type: str
    employment_type: str
    experience_min_years: float = 0.0
    experience_max_years: Optional[float] = None
    experience_level: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "INR"
    salary_period: str = "PER_ANNUM"
    category: str
    industry: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    posted_at: datetime
    last_verified_at: datetime
    status: str
    primary_application_url: str
    is_direct_employer: bool = False
    primary_source_name: str = "Direct Employer"
    external_sources_count: int = 1
    match_score: Optional[float] = None


class CanonicalJobDetailResponse(CanonicalJobListItem):
    description_raw: str
    description_clean: str
    responsibilities: List[str] = Field(default_factory=list)
    min_qualifications: Optional[str] = None
    external_references: List[ExternalJobReferenceItem] = Field(default_factory=list)
    match_analysis: Optional[JobMatchDetail] = None
    is_saved: bool = False
    application_status: Optional[str] = None


class JobSearchFilterRequest(BaseModel):
    q: Optional[str] = None
    roles: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    cities: Optional[List[str]] = None
    workplace_types: Optional[List[str]] = None
    experience_levels: Optional[List[str]] = None
    employment_types: Optional[List[str]] = None
    sources: Optional[List[str]] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    category: Optional[str] = None
    is_direct_employer_only: Optional[bool] = None
    posted_within_days: Optional[int] = None
    sort_by: Optional[str] = "relevance" # relevance, match_score, date, salary_high
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class JobSearchResponse(BaseModel):
    jobs: List[CanonicalJobListItem]
    total: int
    page: int
    limit: int
    total_pages: int
    applied_filters: Dict[str, Any] = Field(default_factory=dict)
    parsed_natural_language: Optional[Dict[str, Any]] = None
    available_facets: Dict[str, Any] = Field(default_factory=dict)


class UserJobPreferencesRequest(BaseModel):
    target_roles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    workplace_types: Optional[List[str]] = None
    preferred_industries: Optional[List[str]] = None
    min_salary: Optional[float] = None
    salary_currency: Optional[str] = "INR"
    employment_types: Optional[List[str]] = None
    experience_level: Optional[str] = "ENTRY"
    open_to_relocation: Optional[bool] = True
    notify_new_matches: Optional[bool] = True


class UserJobPreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    target_roles: List[str]
    preferred_locations: List[str]
    workplace_types: List[str]
    preferred_industries: List[str]
    min_salary: Optional[float] = None
    salary_currency: str = "INR"
    employment_types: List[str]
    experience_level: str
    open_to_relocation: bool
    notify_new_matches: bool
    updated_at: datetime


class SaveJobRequest(BaseModel):
    notes: Optional[str] = None
    reminder_at: Optional[datetime] = None


class SavedJobItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    canonical_job_id: uuid.UUID
    notes: Optional[str] = None
    reminder_at: Optional[datetime] = None
    created_at: datetime
    job: CanonicalJobListItem


class JobApplicationActivityRequest(BaseModel):
    status: str # INTERESTED, SAVED, READY_TO_APPLY, LINK_OPENED, APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN
    candidate_notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None


class JobApplicationActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    canonical_job_id: uuid.UUID
    source_name: str
    redirect_url: str
    status: str
    applied_at: Optional[datetime] = None
    last_status_change_at: datetime
    candidate_notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    job: CanonicalJobListItem


class JobRedirectValidationResponse(BaseModel):
    job_id: uuid.UUID
    destination_url: str
    destination_domain: str
    portal_name: str
    is_trusted_domain: bool
    tracked_status: str
    message: str


class JobDiscoveryDashboardData(BaseModel):
    total_active_jobs: int
    best_matches: List[CanonicalJobListItem] = Field(default_factory=list)
    recent_opportunities: List[CanonicalJobListItem] = Field(default_factory=list)
    skills_in_learning_opportunities: List[CanonicalJobListItem] = Field(default_factory=list)
    entry_level_opportunities: List[CanonicalJobListItem] = Field(default_factory=list)
    remote_opportunities: List[CanonicalJobListItem] = Field(default_factory=list)
    saved_jobs_count: int = 0
    applications_active_count: int = 0
    user_target_role: Optional[str] = None

