# ==============================================================================
# UNNATI — Examination & Assessment Integrity System Schemas
# Pydantic v2 schemas for question delivery, proctoring telemetry,
# attempt lifecycle, AI recommendations, and reviewer decisions.
# ==============================================================================
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ------------------------------------------------------------------------------
# Question & Option Models
# ------------------------------------------------------------------------------
class ExamQuestionOption(BaseModel):
    id: str = Field(..., description="Option key, e.g. 'A', 'B', 'C', 'D'")
    text: str = Field(..., description="Option content")


class ExamQuestionPublicResponse(BaseModel):
    """
    Public question view delivered during an active examination.
    Note: Private correct answers and explanations are STRICTLY OMITTED.
    """
    id: uuid.UUID
    question_number: int
    question_type: str
    prompt: str
    scenario: Optional[str] = None
    code_snippet: Optional[str] = None
    options: Optional[List[ExamQuestionOption]] = None
    marks: float
    competency_tag: str
    topic: str

    model_config = ConfigDict(from_attributes=True)


class ExamQuestionDetailResponse(ExamQuestionPublicResponse):
    """
    Full question detail including private answer key and rubric.
    Delivered only to administrators or post-submission reviews when released.
    """
    correct_answers: List[str]
    explanation: Optional[str] = None
    evaluation_rubric: Optional[List[str]] = None


# ------------------------------------------------------------------------------
# Examination Metadata Models
# ------------------------------------------------------------------------------
class ProctoringConfigSchema(BaseModel):
    require_webcam: bool = False
    require_microphone: bool = False
    require_fullscreen: bool = True
    block_tab_switch: bool = True
    block_copy_paste: bool = True
    max_tab_switches_warning: int = 3
    record_audio_spikes: bool = False


class ExaminationPublicSummary(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    course_id: Optional[str] = None
    course_name: str
    module_name: str
    track: str
    category: str
    difficulty: str
    total_marks: int
    passing_percentage: float
    duration_minutes: int
    max_attempts: int
    negative_marking_percentage: float
    proctoring_enabled: bool
    proctoring_config: Dict[str, Any]
    certificate_eligible: bool
    question_count: int
    user_attempts_count: Optional[int] = 0
    user_best_score: Optional[float] = None
    user_has_passed: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Attempt Initiation & Session Models
# ------------------------------------------------------------------------------
class ExaminationStartRequest(BaseModel):
    proctoring_consent: bool = Field(
        ...,
        description="Explicit user consent for device checks & non-punitive integrity monitoring"
    )
    device_info: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Client browser platform, screen resolution, and permissions metadata"
    )


class SavedAnswerState(BaseModel):
    question_id: uuid.UUID
    selected_options: List[str] = []
    text_response: Optional[str] = None
    is_marked_for_review: bool = False


class ExamAttemptSessionResponse(BaseModel):
    attempt_id: uuid.UUID
    examination_id: uuid.UUID
    examination_title: str
    course_name: str
    attempt_number: int
    status: str
    started_at: datetime
    expires_at: datetime
    server_time: datetime
    time_remaining_seconds: int
    duration_minutes: int
    proctoring_enabled: bool
    proctoring_config: Dict[str, Any]
    questions: List[ExamQuestionPublicResponse]
    saved_answers: Dict[str, SavedAnswerState]

    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Autosave & Telemetry Models
# ------------------------------------------------------------------------------
class SaveAnswerRequest(BaseModel):
    question_id: uuid.UUID
    selected_options: Optional[List[str]] = Field(default_factory=list)
    text_response: Optional[str] = None
    is_marked_for_review: Optional[bool] = False


class SaveAnswerResponse(BaseModel):
    success: bool
    question_id: uuid.UUID
    saved_at: datetime


class ProctoringEventRequest(BaseModel):
    event_type: str = Field(
        ...,
        description="Type: TAB_SWITCH, WINDOW_BLUR, FULLSCREEN_EXIT, COPY_ATTEMPT, CAMERA_OBSTRUCTED, etc."
    )
    severity: Optional[str] = Field(default="INFO", description="INFO, WARNING, SUSPICIOUS")
    metadata_payload: Optional[Dict[str, Any]] = Field(default_factory=dict)
    client_timestamp: Optional[str] = None


class ProctoringEventResponse(BaseModel):
    id: uuid.UUID
    event_type: str
    severity: str
    timestamp: datetime
    metadata_payload: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Submission & Result Models
# ------------------------------------------------------------------------------
class ExamSubmissionRequest(BaseModel):
    feedback_notes: Optional[str] = None


class QuestionResultBreakdown(BaseModel):
    question_id: uuid.UUID
    question_number: int
    prompt: str
    question_type: str
    marks: float
    marks_awarded: float
    is_correct: Optional[bool]
    selected_options: List[str]
    correct_answers: List[str]
    explanation: Optional[str]
    ai_feedback: Optional[str] = None
    competency_tag: str
    topic: str


class CompetencyPerformance(BaseModel):
    competency_tag: str
    total_marks: float
    obtained_marks: float
    percentage: float
    proficiency_level: str # Mastered, Proficient, Developing, Needs Focus


class ExamResultResponse(BaseModel):
    attempt_id: uuid.UUID
    examination_id: uuid.UUID
    title: str
    course_name: str
    module_name: str
    track: str
    attempt_number: int
    total_marks: float
    score_obtained: float
    percentage: float
    is_passed: bool
    passing_percentage: float
    status: str
    started_at: datetime
    submitted_at: datetime
    time_taken_seconds: int
    
    question_breakdown: List[QuestionResultBreakdown]
    competency_performance: List[CompetencyPerformance]
    knowledge_gaps: List[str]
    strengths: List[str]
    
    ai_learning_recommendations: Optional[Dict[str, Any]] = None
    certificate_id: Optional[uuid.UUID] = None
    certificate_number: Optional[str] = None
    
    can_retake: bool
    attempts_remaining: int

    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Certificate Model
# ------------------------------------------------------------------------------
class CertificateResponse(BaseModel):
    certificate_id: uuid.UUID
    certificate_number: str
    title: str
    recipient_name: str
    course_name: str
    score_percentage: float
    issued_at: datetime
    credential_hash: str
    verification_url: str

    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Administrator & Integrity Review Models
# ------------------------------------------------------------------------------
class AdminReviewItemResponse(BaseModel):
    attempt_id: uuid.UUID
    user_id: uuid.UUID
    candidate_name: str
    candidate_email: str
    examination_title: str
    course_name: str
    attempt_number: int
    started_at: datetime
    submitted_at: Optional[datetime]
    score_obtained: float
    total_marks: float
    percentage: float
    is_passed: bool
    status: str
    integrity_risk_category: str
    event_count: int
    reviewer_decision: str

    model_config = ConfigDict(from_attributes=True)


class AdminReviewDetailResponse(BaseModel):
    attempt_id: uuid.UUID
    user_id: uuid.UUID
    candidate_name: str
    candidate_email: str
    examination_title: str
    course_name: str
    attempt_number: int
    status: str
    score_obtained: float
    percentage: float
    is_passed: bool
    integrity_risk_category: str
    integrity_summary: Optional[Dict[str, Any]]
    events: List[ProctoringEventResponse]
    reviewer_decision: str
    reviewer_notes: Optional[str]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class AdminDecisionRequest(BaseModel):
    decision: str = Field(
        ...,
        description="APPROVED, CONFIRMED_VIOLATION, DISMISSED, FURTHER_REVIEW"
    )
    reviewer_notes: str = Field(
        ...,
        description="Audit justification and reasoning for the decision"
    )


class ExamAnalyticsResponse(BaseModel):
    total_examinations: int
    total_attempts: int
    completion_rate: float
    pass_rate: float
    average_score_percentage: float
    integrity_risk_distribution: Dict[str, int]
    top_knowledge_gaps: List[Dict[str, Any]]
    recent_flagged_count: int
