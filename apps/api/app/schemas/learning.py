# ==============================================================================
# UNNATI — Learning Resource & Assessment Readiness Schemas
# ==============================================================================
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class LearningResourceItem(BaseModel):
    id: uuid.UUID
    title: str
    platform_name: str
    description: Optional[str] = None
    instructor_or_provider: str
    topic: str
    skill_name: str
    skill_category: str
    difficulty: str
    language: str
    pricing_type: str  # FREE, PAID, FREEMIUM, SUBSCRIPTION, FREE_TRIAL
    price_amount: Optional[float] = None
    price_currency: str = "INR"
    duration_hours: Optional[float] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    has_certificate: bool
    resource_type: str  # VIDEO_COURSE, INTERACTIVE, DOCUMENTATION, PROJECT, EXERCISE
    url: str
    source_url: Optional[str] = None
    sequence_stage: str
    key_concepts_covered: List[str] = Field(default_factory=list)
    why_recommended: Optional[str] = None
    is_active: bool
    last_verified_at: datetime

    # User progress state if authenticated
    user_status: Optional[str] = None  # SAVED, STARTED, IN_PROGRESS, COMPLETED
    user_progress_percentage: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class LearningResourceFilterRequest(BaseModel):
    skill: Optional[str] = None
    topic: Optional[str] = None
    category: Optional[str] = None
    pricing_type: Optional[str] = None  # ALL, FREE, PAID
    platforms: Optional[List[str]] = None
    difficulties: Optional[List[str]] = None
    resource_types: Optional[List[str]] = None
    has_certificate_only: Optional[bool] = None
    max_duration_hours: Optional[float] = None
    search_query: Optional[str] = None
    sort_by: Optional[str] = "relevance"  # relevance, rating_desc, duration_asc, price_asc
    page: int = 1
    limit: int = 20


class LearningResourceListResponse(BaseModel):
    resources: List[LearningResourceItem]
    total: int
    page: int
    limit: int
    total_pages: int
    available_platforms: List[Dict[str, Any]] = Field(default_factory=list)
    available_pricing_types: List[Dict[str, Any]] = Field(default_factory=list)
    available_difficulties: List[Dict[str, Any]] = Field(default_factory=list)


class SequenceStagePlan(BaseModel):
    stage_name: str  # Foundational, Core Concepts, Advanced Techniques, Capstone Practice
    description: str
    concepts: List[str]
    recommended_free_resources: List[LearningResourceItem] = Field(default_factory=list)
    recommended_paid_resources: List[LearningResourceItem] = Field(default_factory=list)
    estimated_hours: float


class PersonalizedLearningSequence(BaseModel):
    skill_name: str
    target_role: Optional[str] = None
    current_proficiency_estimate: str
    target_proficiency: str
    overall_explanation: str
    stages: List[SequenceStagePlan]
    estimated_total_hours: float
    free_alternative_available: bool = True
    roadmap_bridge_milestone: Optional[str] = None


class UserLearningProgressItem(BaseModel):
    id: uuid.UUID
    resource_id: uuid.UUID
    status: str  # SAVED, STARTED, IN_PROGRESS, COMPLETED
    progress_percentage: float
    notes: Optional[str] = None
    certificate_url: Optional[str] = None
    user_rating: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_accessed_at: datetime
    resource: LearningResourceItem

    model_config = ConfigDict(from_attributes=True)


class UpdateLearningProgressRequest(BaseModel):
    status: str  # SAVED, STARTED, IN_PROGRESS, COMPLETED
    progress_percentage: Optional[float] = None
    notes: Optional[str] = None
    certificate_url: Optional[str] = None
    user_rating: Optional[int] = None


class AssessmentReadinessRequest(BaseModel):
    topic_or_skill: str
    target_difficulty: Optional[str] = "Intermediate"
    readiness_choice: str  # KNOW_TOPIC, NEED_TO_LEARN, WANT_DIAGNOSTIC
    examination_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class AssessmentReadinessResponse(BaseModel):
    readiness_choice: str
    status: str
    message: str
    topic_or_skill: str
    target_difficulty: str
    can_proceed_to_assessment: bool
    
    # Contextual payloads
    examination_id: Optional[uuid.UUID] = None
    examination_details: Optional[Dict[str, Any]] = None
    diagnostic_exam_id: Optional[uuid.UUID] = None
    learning_recommendations: Optional[PersonalizedLearningSequence] = None
    saved_log_id: Optional[uuid.UUID] = None


class LearningDashboardSummary(BaseModel):
    total_saved: int
    total_in_progress: int
    total_completed: int
    estimated_hours_invested: float
    skills_in_learning: List[str]
    recent_resources: List[UserLearningProgressItem]
    recommended_next_actions: List[Dict[str, Any]]
