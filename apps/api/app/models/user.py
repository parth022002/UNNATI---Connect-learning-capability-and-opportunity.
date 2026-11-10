import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    clerk_id: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="student", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    education: Mapped[List["EducationRecord"]] = relationship(
        "EducationRecord", back_populates="user", cascade="all, delete-orphan"
    )
    experience: Mapped[List["ExperienceRecord"]] = relationship(
        "ExperienceRecord", back_populates="user", cascade="all, delete-orphan"
    )
    candidate_skills: Mapped[List["CandidateSkill"]] = relationship(
        "CandidateSkill", back_populates="user", cascade="all, delete-orphan"
    )
    documents: Mapped[List["CandidateDocument"]] = relationship(
        "CandidateDocument", back_populates="user", cascade="all, delete-orphan"
    )
    roadmaps: Mapped[List["CareerRoadmap"]] = relationship(
        "CareerRoadmap", back_populates="user", cascade="all, delete-orphan"
    )

class UserProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    headline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_role: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    experience_years: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completeness_score: Mapped[int] = mapped_column(Integer, default=10, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="profile")

class EducationRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "education_records"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str] = mapped_column(String(150), nullable=False)
    field_of_study: Mapped[str] = mapped_column(String(150), nullable=False)
    start_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    grade_or_gpa: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="education")

class ExperienceRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "experience_records"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    start_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="experience")
