import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class Institution(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    institution_type: Mapped[str] = mapped_column(String(50), default="University", nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    cohorts: Mapped[List["Cohort"]] = relationship(
        "Cohort", back_populates="institution", cascade="all, delete-orphan"
    )

class Cohort(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cohorts"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    target_degree: Mapped[str] = mapped_column(String(100), nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    institution: Mapped["Institution"] = relationship("Institution", back_populates="cohorts")
    members: Mapped[List["CohortMember"]] = relationship(
        "CohortMember", back_populates="cohort", cascade="all, delete-orphan"
    )

class CohortMember(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cohort_members"

    cohort_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cohorts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    enrollment_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    target_role: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    current_readiness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    cohort: Mapped["Cohort"] = relationship("Cohort", back_populates="members")
    user: Mapped["User"] = relationship("User")

class Employer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "employers"

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    opportunities: Mapped[List["Opportunity"]] = relationship(
        "Opportunity", back_populates="employer", cascade="all, delete-orphan"
    )

class Opportunity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "opportunities"

    employer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    role_category: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(150), default="Hybrid (India)", nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-Time", nullable=False)
    min_readiness_score: Mapped[float] = mapped_column(Float, default=65.0, nullable=False)
    required_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    salary_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)

    employer: Mapped["Employer"] = relationship("Employer", back_populates="opportunities")
