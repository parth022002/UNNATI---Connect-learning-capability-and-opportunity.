# ==============================================================================
# UNNATI — Learning Resource Discovery & Skill Intelligence Models
# Supports multi-platform course aggregation (Free & Paid), legitimate learning
# resource models, personalized learning sequence paths, user learning progress,
# and assessment readiness audit trails.
# ==============================================================================
import uuid
from datetime import datetime, timezone
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


class LearningResource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Curated and verified educational course or tutorial from legitimate
    free (YouTube, FreeCodeCamp, MDN, Microsoft Learn, Kaggle) or
    paid (Coursera, Udemy, upGrad, edX, LinkedIn Learning) platforms.
    """
    __tablename__ = "learning_resources"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    platform_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Platforms: FreeCodeCamp, MDN Web Docs, YouTube, Microsoft Learn, Kaggle, Coursera, Udemy, edX, upGrad, LinkedIn Learning
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instructor_or_provider: Mapped[str] = mapped_column(String(200), default="Official Academy", nullable=False)
    
    # Topic & Categorization
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    skill_category: Mapped[str] = mapped_column(String(50), default="technology", nullable=False, index=True)
    # Categories: technology, data, business, finance, management
    
    difficulty: Mapped[str] = mapped_column(String(50), default="Beginner", nullable=False, index=True)
    # Beginner, Intermediate, Advanced, Expert
    
    language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    
    # Pricing Model
    pricing_type: Mapped[str] = mapped_column(String(50), default="FREE", nullable=False, index=True)
    # FREE, PAID, FREEMIUM, SUBSCRIPTION, FREE_TRIAL
    price_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    
    # Verification & Metadata
    duration_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reviews_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    has_certificate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    resource_type: Mapped[str] = mapped_column(String(50), default="VIDEO_COURSE", nullable=False, index=True)
    # VIDEO_COURSE, INTERACTIVE, DOCUMENTATION, PROJECT, EXERCISE
    
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    
    # Learning Sequence & Explainability
    sequence_stage: Mapped[str] = mapped_column(String(50), default="FOUNDATIONAL", nullable=False)
    # FOUNDATIONAL, CORE_CONCEPTS, ADVANCED_TECHNIQUES, CAPSTONE
    key_concepts_covered: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    why_recommended: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    user_progress: Mapped[List["UserLearningProgress"]] = relationship(
        "UserLearningProgress",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_learning_skill_diff_price", "skill_name", "difficulty", "pricing_type"),
    )


class UserLearningProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Learner's personal progress, bookmarks, and completion records
    for external and integrated learning resources.
    """
    __tablename__ = "user_learning_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("learning_resources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    # Status: SAVED, STARTED, IN_PROGRESS, COMPLETED
    status: Mapped[str] = mapped_column(String(50), default="SAVED", index=True, nullable=False)
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    # User Notes & Verification Evidence
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    certificate_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    user_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    resource: Mapped["LearningResource"] = relationship("LearningResource", back_populates="user_progress")
    user: Mapped["User"] = relationship("User")

    __table_args__ = (
        Index("ix_user_resource_unique", "user_id", "resource_id", unique=True),
    )


class AssessmentReadinessLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Audit log of learner assessment readiness gate interactions,
    capturing self-declaration vs diagnostic choices.
    """
    __tablename__ = "assessment_readiness_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    topic_or_skill: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    target_difficulty: Mapped[str] = mapped_column(String(50), default="Intermediate", nullable=False)
    
    # Choice: KNOW_TOPIC (proceed), NEED_TO_LEARN (learning resources), WANT_DIAGNOSTIC (pre-test)
    readiness_choice: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Context
    examination_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("examinations.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    user: Mapped["User"] = relationship("User")
