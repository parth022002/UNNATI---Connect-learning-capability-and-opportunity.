import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class InterviewSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core interview session representing a candidate's mock or practice interview."""
    __tablename__ = "interview_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )
    resume_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True
    )
    job_description_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(200), default="AI Mock Interview", nullable=False)
    target_role: Mapped[str] = mapped_column(String(150), default="Software Engineer", nullable=False)
    
    # Types: TECHNICAL, HR, BEHAVIOURAL, COMBINED, RESUME_DEEP_DIVE, JD_SPECIFIC, FULL_SIMULATION, RAPID_FIRE
    interview_type: Mapped[str] = mapped_column(String(50), default="COMBINED", nullable=False)
    
    # Difficulty: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    difficulty: Mapped[str] = mapped_column(String(50), default="INTERMEDIATE", nullable=False)
    
    # Duration in minutes
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    
    # Mode: GUIDED_PRACTICE, REALISTIC_MOCK, RAPID_FIRE, RESUME_DEEP_DIVE, JD_SPECIFIC, FULL_SIMULATION
    mode: Mapped[str] = mapped_column(String(50), default="REALISTIC_MOCK", nullable=False)
    
    # Format: TEXT, VOICE
    format: Mapped[str] = mapped_column(String(20), default="TEXT", nullable=False)
    
    # Status: CONFIGURED, IN_PROGRESS, COMPLETED, ABANDONED
    status: Mapped[str] = mapped_column(String(30), default="CONFIGURED", nullable=False)
    
    total_questions: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    current_question_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Scores (0.0 to 5.0)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    technical_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    hr_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    behavioural_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Comprehensive feedback report
    evaluation_summary: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    # Expected: {
    #   "strongest_areas": ["System Design", "Problem Solving"],
    #   "weakest_areas": ["Concurrency Handling", "Metric Definition"],
    #   "repeated_mistakes": ["Omitted quantifiable results in STAR stories"],
    #   "competency_scores": {"System Design": 4.5, "Communication": 4.0},
    #   "readiness_tier": "Competitive"
    # }

    # Integration with UNNATI Career Roadmap & Learning modules
    learning_recommendations: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # Expected: [{"skill": "Docker", "module_name": "Docker Mastery", "roadmap_action": "..."}]

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    questions: Mapped[List["InterviewQuestion"]] = relationship(
        "InterviewQuestion", back_populates="session", cascade="all, delete-orphan",
        order_by="InterviewQuestion.order_index"
    )
    turns: Mapped[List["InterviewTurn"]] = relationship(
        "InterviewTurn", back_populates="session", cascade="all, delete-orphan",
        order_by="InterviewTurn.created_at"
    )


class InterviewQuestion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Individual question asked during an interview session."""
    __tablename__ = "interview_questions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Type: CONCEPTUAL, SCENARIO, PROJECT_DEEP_DIVE, BEHAVIOURAL, TECHNICAL_PROBLEM, FOLLOW_UP
    question_type: Mapped[str] = mapped_column(String(50), default="CONCEPTUAL", nullable=False)
    
    competency_tag: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    
    # Dimension: TECHNICAL, HR, BEHAVIOURAL
    target_dimension: Mapped[str] = mapped_column(String(50), default="TECHNICAL", nullable=False)
    
    evaluation_criteria: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    # Expected: {"ideal_points": [...], "rubric_focus": "..."}
    
    is_follow_up: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    parent_question_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("interview_questions.id", ondelete="SET NULL"), nullable=True
    )
    
    context_source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # e.g. "Resume Project: Cloud Engine" or "JD Requirement: Microservices"

    # Relationships
    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="questions")
    turns: Mapped[List["InterviewTurn"]] = relationship("InterviewTurn", back_populates="question")


class InterviewTurn(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Candidate's response to an interview question and the AI's rubric evaluation."""
    __tablename__ = "interview_turns"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_questions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    candidate_response: Mapped[str] = mapped_column(Text, nullable=False)
    response_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    audio_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    
    # Quantitative scores (0.0 to 5.0)
    score: Mapped[float] = mapped_column(Float, default=3.0, nullable=False)
    technical_accuracy_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    clarity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    depth_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # STAR framework completeness for behavioural answers
    star_completeness: Mapped[Dict[str, bool]] = mapped_column(JSONB, default=dict, nullable=False)
    # {"situation": true, "task": true, "action": true, "result": false, "reflection": true}
    
    what_was_done_well: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    what_was_missing: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    improvement_advice: Mapped[str] = mapped_column(Text, nullable=False)
    stronger_answer_example: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="turns")
    question: Mapped["InterviewQuestion"] = relationship("InterviewQuestion", back_populates="turns")

