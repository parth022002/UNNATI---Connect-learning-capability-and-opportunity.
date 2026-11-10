import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Text, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class CanonicalSkill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "canonical_skills"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="technical", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Gemini text-embedding-004 produces 768-dimensional vectors
    embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(768), nullable=True)

    aliases: Mapped[List["SkillAlias"]] = relationship(
        "SkillAlias", back_populates="canonical_skill", cascade="all, delete-orphan"
    )
    candidate_skills: Mapped[List["CandidateSkill"]] = relationship(
        "CandidateSkill", back_populates="canonical_skill"
    )

class SkillAlias(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "skill_aliases"

    canonical_skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("canonical_skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    alias: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)

    canonical_skill: Mapped["CanonicalSkill"] = relationship(
        "CanonicalSkill", back_populates="aliases"
    )

class CandidateSkill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Candidate Skill state representing the 4-tier Bayesian belief model:
    CLAIMED (self-reported) -> INFERRED (extracted from resume/projects) ->
    ASSESSED (validated via test) -> VERIFIED (externally backed).
    """
    __tablename__ = "candidate_skills"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    canonical_skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("canonical_skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Tiers: CLAIMED, INFERRED, ASSESSED, VERIFIED
    state: Mapped[str] = mapped_column(String(30), default="CLAIMED", nullable=False)
    proficiency: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    evidence_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    last_evidence_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="candidate_skills")
    canonical_skill: Mapped["CanonicalSkill"] = relationship(
        "CanonicalSkill", back_populates="candidate_skills"
    )

