import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class InterviewSessionCreateRequest(BaseModel):
    title: Optional[str] = "AI Mock Interview"
    target_role: str = "Software Engineer"
    interview_type: str = Field("COMBINED", description="TECHNICAL, HR, BEHAVIOURAL, COMBINED, RESUME_DEEP_DIVE, JD_SPECIFIC, FULL_SIMULATION, RAPID_FIRE")
    difficulty: str = Field("INTERMEDIATE", description="BEGINNER, INTERMEDIATE, ADVANCED, EXPERT")
    duration_minutes: int = Field(30, description="15, 30, 45, 60")
    mode: str = Field("REALISTIC_MOCK", description="GUIDED_PRACTICE, REALISTIC_MOCK, RAPID_FIRE, RESUME_DEEP_DIVE, JD_SPECIFIC, FULL_SIMULATION")
    format: str = Field("TEXT", description="TEXT, VOICE")
    resume_id: Optional[uuid.UUID] = None
    job_description_id: Optional[uuid.UUID] = None
    question_preferences: Optional[List[str]] = []


class InterviewTurnSubmitRequest(BaseModel):
    candidate_response: str
    response_time_seconds: Optional[int] = None
    audio_metadata: Optional[Dict[str, Any]] = None


class InterviewQuestionResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    order_index: int
    question_text: str
    question_type: str
    competency_tag: str
    target_dimension: str
    evaluation_criteria: Dict[str, Any] = {}
    is_follow_up: bool
    context_source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewTurnResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    question_id: uuid.UUID
    candidate_response: str
    response_time_seconds: Optional[int] = None
    score: float
    technical_accuracy_score: Optional[float] = None
    clarity_score: Optional[float] = None
    depth_score: Optional[float] = None
    star_completeness: Dict[str, bool] = {}
    what_was_done_well: List[str] = []
    what_was_missing: List[str] = []
    improvement_advice: str
    stronger_answer_example: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionSummaryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_role: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    mode: str
    format: str
    status: str
    total_questions: int
    current_question_index: int
    overall_score: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewSessionDetailResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_role: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    mode: str
    format: str
    status: str
    total_questions: int
    current_question_index: int
    current_question: Optional[InterviewQuestionResponse] = None
    questions: List[InterviewQuestionResponse] = []
    turns: List[InterviewTurnResponse] = []
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    hr_score: Optional[float] = None
    behavioural_score: Optional[float] = None
    evaluation_summary: Dict[str, Any] = {}
    learning_recommendations: List[Dict[str, Any]] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewReportResponse(BaseModel):
    session_id: uuid.UUID
    title: str
    target_role: str
    interview_type: str
    difficulty: str
    overall_score: float
    overall_percentage: float
    readiness_tier: str
    technical_score: float
    hr_score: float
    behavioural_score: float
    competency_scores: Dict[str, float]
    strongest_areas: List[str]
    weakest_areas: List[str]
    repeated_mistakes: List[str]
    improvement_priorities: List[str]
    learning_recommendations: List[Dict[str, Any]]
    turns: List[InterviewTurnResponse]
    completed_at: Optional[datetime] = None


class InterviewStudioDashboardResponse(BaseModel):
    total_sessions_completed: int
    total_questions_answered: int
    overall_readiness_score: float
    readiness_tier: str
    average_technical_score: float
    average_hr_score: float
    strongest_competency: str
    primary_growth_area: str
    recommended_interview: Dict[str, Any]
    recent_sessions: List[InterviewSessionSummaryResponse]

