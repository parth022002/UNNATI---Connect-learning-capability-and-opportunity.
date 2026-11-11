# ==============================================================================
# UNNATI — Examination & Assessment Integrity System Models
# Supports learning module integration, multi-format questions, server-authoritative
# attempts, privacy-preserving proctoring event telemetry, AI integrity evaluation,
# reviewer decision audits, and verifiable certificates.
# ==============================================================================
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    Float,
    ForeignKey,
    DateTime,
    func,
    Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Examination(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Formal examination or practice assessment associated with courses,
    modules, and target competency benchmarks.
    """
    __tablename__ = "examinations"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Associated learning integration
    course_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    course_name: Mapped[str] = mapped_column(String(200), default="Career Upskilling Track", nullable=False)
    module_name: Mapped[str] = mapped_column(String(200), default="Comprehensive Evaluation", nullable=False)
    track: Mapped[str] = mapped_column(String(50), default="business", index=True, nullable=False) # business, data, tech, finance
    
    # Category & Difficulty
    category: Mapped[str] = mapped_column(String(50), default="FORMAL_EXAM", index=True, nullable=False)
    # Options: PRACTICE_QUIZ, MODULE_ASSESSMENT, FORMAL_EXAM, CERTIFICATION
    difficulty: Mapped[str] = mapped_column(String(50), default="Intermediate", nullable=False)
    
    # Rules & Scoring
    total_marks: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    passing_percentage: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    negative_marking_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    randomize_questions: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    randomize_options: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    certificate_eligible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Proctoring Configuration (Configurable per exam - Never forced on practice quizzes)
    proctoring_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    proctoring_config: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        default=lambda: {
            "require_webcam": False,
            "require_microphone": False,
            "require_fullscreen": True,
            "block_tab_switch": True,
            "block_copy_paste": True,
            "max_tab_switches_warning": 3,
            "record_audio_spikes": False
        },
        nullable=False
    )
    
    # Relationships
    questions: Mapped[List["ExamQuestion"]] = relationship(
        "ExamQuestion",
        back_populates="examination",
        cascade="all, delete-orphan",
        order_by="ExamQuestion.question_number"
    )
    attempts: Mapped[List["ExamAttempt"]] = relationship(
        "ExamAttempt",
        back_populates="examination",
        cascade="all, delete-orphan"
    )


class ExamQuestion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual question within an examination supporting multiple objective
    and subjective pedagogical formats.
    """
    __tablename__ = "exam_questions"

    examination_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_number: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: MCQ, MULTIPLE_SELECT, TRUE_FALSE, SHORT_ANSWER, DESCRIPTIVE, SCENARIO, CASE_STUDY, NUMERICAL, CODE
    
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    scenario: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    code_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Options for choice-based questions: [{"id": "A", "text": "..."}]
    options: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, default=list, nullable=True)
    
    # Private answer keys and rubrics (never returned to learner in pre-submission payloads)
    correct_answers: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    marks: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evaluation_rubric: Mapped[Optional[List[str]]] = mapped_column(JSONB, default=list, nullable=True)
    
    # Skills mapping
    competency_tag: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    topic: Mapped[str] = mapped_column(String(100), default="General", nullable=False)

    examination: Mapped["Examination"] = relationship("Examination", back_populates="questions")


class ExamAttempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual learner attempt for an examination with server-authoritative timer,
    proctoring integrity telemetry, and AI evaluation results.
    """
    __tablename__ = "exam_attempts"

    examination_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Status: IN_PROGRESS, SUBMITTED, EVALUATED, UNDER_REVIEW, APPROVED, FLAGGED, REJECTED
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS", index=True, nullable=False)
    
    # Server-Authoritative Timing
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Scoring
    score_obtained: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Device Consent & Integrity Metadata
    proctoring_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    device_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # AI Integrity Evaluation (Explainable, non-punitive, human-in-the-loop)
    # Risk Categories: NORMAL, LOW, MODERATE, HIGH, INCONCLUSIVE
    integrity_risk_category: Mapped[str] = mapped_column(String(50), default="NORMAL", index=True, nullable=False)
    integrity_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Reviewer Decision (Audit Trail)
    # Status: NONE, APPROVED, CONFIRMED_VIOLATION, DISMISSED, FURTHER_REVIEW
    reviewer_decision: Mapped[str] = mapped_column(String(50), default="NONE", nullable=False)
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Personalised AI Learning Recommendations
    learning_recommendations: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationships
    examination: Mapped["Examination"] = relationship("Examination", back_populates="attempts")
    user: Mapped["User"] = relationship("User")
    answers: Mapped[List["ExamAttemptAnswer"]] = relationship(
        "ExamAttemptAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )
    proctoring_events: Mapped[List["ExamProctoringEvent"]] = relationship(
        "ExamProctoringEvent",
        back_populates="attempt",
        cascade="all, delete-orphan",
        order_by="ExamProctoringEvent.timestamp"
    )


class ExamAttemptAnswer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Candidate's saved or submitted answer for a specific question.
    """
    __tablename__ = "exam_attempt_answers"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exam_attempts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exam_questions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # Answers based on type
    selected_options: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    text_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Evaluation
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    marks_awarded: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    evaluator_type: Mapped[str] = mapped_column(String(50), default="AUTOMATIC", nullable=False)
    # Options: AUTOMATIC, AI_ASSISTED, MANUAL_REVIEW
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_marked_for_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="answers")
    question: Mapped["ExamQuestion"] = relationship("ExamQuestion")


class ExamProctoringEvent(Base, UUIDPrimaryKeyMixin):
    """
    Chronological tamper-evident proctoring telemetry record.
    Preserves privacy: no raw video/audio retention, purely event metadata.
    """
    __tablename__ = "exam_proctoring_events"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exam_attempts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Event types:
    # TAB_SWITCH, WINDOW_BLUR, FULLSCREEN_EXIT, COPY_ATTEMPT, PASTE_ATTEMPT,
    # RIGHT_CLICK, CAMERA_DISCONNECTED, CAMERA_OBSTRUCTED, MULTIPLE_FACES_DETECTED,
    # FACE_NOT_VISIBLE, AUDIO_SPIKE, NETWORK_OFFLINE, SESSION_RESTARTED
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    severity: Mapped[str] = mapped_column(String(30), default="INFO", nullable=False) # INFO, WARNING, SUSPICIOUS
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    metadata_payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    
    attempt: Mapped["ExamAttempt"] = relationship("ExamAttempt", back_populates="proctoring_events")

    __table_args__ = (
        Index("ix_proctoring_attempt_time", "attempt_id", "timestamp"),
    )


class ExamCertificate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Verifiable course completion or examination achievement credential
    with cryptographic SHA-256 integrity hash.
    """
    __tablename__ = "exam_certificates"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    examination_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("examinations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exam_attempts.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    certificate_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    recipient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    course_name: Mapped[str] = mapped_column(String(200), nullable=False)
    score_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    credential_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    metadata_payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    examination: Mapped["Examination"] = relationship("Examination")
    user: Mapped["User"] = relationship("User")

