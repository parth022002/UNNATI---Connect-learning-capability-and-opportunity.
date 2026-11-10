import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class CareerRoadmap(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "career_roadmaps"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    target_role: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    overall_readiness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_estimated_weeks: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    weekly_hours: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    # Status: ACTIVE, PAUSED, COMPLETED
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    summary_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="roadmaps")
    milestones: Mapped[List["RoadmapMilestone"]] = relationship(
        "RoadmapMilestone",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapMilestone.order_index"
    )

class RoadmapMilestone(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "roadmap_milestones"

    roadmap_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("career_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False
    )
    phase_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    # Status: LOCKED, IN_PROGRESS, COMPLETED
    status: Mapped[str] = mapped_column(String(30), default="LOCKED", nullable=False)
    estimated_weeks: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    target_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    learning_modules: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    project_deliverable: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    roadmap: Mapped["CareerRoadmap"] = relationship("CareerRoadmap", back_populates="milestones")

