import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class JobSource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Registry of authorized external job platforms, aggregators, public government feeds,
    and employer ATS integrations.
    """
    __tablename__ = "job_sources"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    source_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    # INDIAN_PORTAL, INTERNATIONAL_PORTAL, PUBLIC_GOV_FEED, DIRECT_EMPLOYER_ATS, PARTNER_API
    source_type: Mapped[str] = mapped_column(String(50), default="INDIAN_PORTAL", nullable=False)
    
    # INDIA, GLOBAL, REMOTE
    region: Mapped[str] = mapped_column(String(50), default="INDIA", nullable=False)
    
    # PUBLIC_FEED, PARTNER_API, LICENSED_FEED, EMPLOYER_ATS_JSON
    integration_method: Mapped[str] = mapped_column(String(50), default="PUBLIC_FEED", nullable=False)
    
    api_endpoint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    auth_type: Mapped[str] = mapped_column(String(50), default="NONE", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rate_limit_rpm: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    sync_frequency_minutes: Mapped[int] = mapped_column(Integer, default=360, nullable=False)
    
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    # IDLE, SUCCESS, PARTIAL_ERROR, FAILED
    last_sync_status: Mapped[str] = mapped_column(String(50), default="IDLE", nullable=False)
    last_error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_jobs_ingested: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    compliance_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    canonical_references: Mapped[List["ExternalJobReference"]] = relationship(
        "ExternalJobReference", back_populates="source", cascade="all, delete-orphan"
    )
    sync_logs: Mapped[List["JobSyncLog"]] = relationship(
        "JobSyncLog", back_populates="source", cascade="all, delete-orphan"
    )


class CanonicalJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Central normalized and deduplicated job posting.
    Unified representation across multiple Indian and international platforms.
    """
    __tablename__ = "canonical_jobs"

    canonical_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_company: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    company_logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    description_raw: Mapped[str] = mapped_column(Text, nullable=False)
    description_clean: Mapped[str] = mapped_column(Text, nullable=False)
    responsibilities: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    required_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    preferred_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    min_qualifications: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    experience_min_years: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    experience_max_years: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # ENTRY, MID, SENIOR, LEAD, EXECUTIVE, INTERNSHIP
    experience_level: Mapped[str] = mapped_column(String(50), default="ENTRY", nullable=False)
    
    salary_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    # PER_ANNUM, PER_MONTH
    salary_period: Mapped[str] = mapped_column(String(20), default="PER_ANNUM", nullable=False)
    
    # FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    employment_type: Mapped[str] = mapped_column(String(50), default="FULL_TIME", nullable=False)
    # REMOTE, HYBRID, ONSITE
    workplace_type: Mapped[str] = mapped_column(String(50), default="HYBRID", nullable=False)
    
    city: Mapped[Optional[str]] = mapped_column(String(150), index=True, nullable=True)
    state_region: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    
    # Technology & Engineering, Data & Analytics, Product Management, Business & Strategy, Finance & Operations
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    primary_application_url: Mapped[str] = mapped_column(Text, nullable=False)
    is_direct_employer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # NEW, ACTIVE, POTENTIALLY_STALE, EXPIRED, REMOVED
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    apply_click_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    external_references: Mapped[List["ExternalJobReference"]] = relationship(
        "ExternalJobReference", back_populates="canonical_job", cascade="all, delete-orphan"
    )
    saved_by_users: Mapped[List["SavedJob"]] = relationship(
        "SavedJob", back_populates="job", cascade="all, delete-orphan"
    )
    applications: Mapped[List["JobApplicationActivity"]] = relationship(
        "JobApplicationActivity", back_populates="job", cascade="all, delete-orphan"
    )


class ExternalJobReference(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks provenance and alternative links for a canonical job across multiple platforms
    (e.g., Naukri, Cutshort, Instahyre, Remote OK).
    """
    __tablename__ = "external_job_references"

    canonical_job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("canonical_jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_sources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    external_job_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    external_url: Mapped[str] = mapped_column(Text, nullable=False)
    portal_name: Mapped[str] = mapped_column(String(100), nullable=False)
    portal_job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    portal_posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    raw_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_primary_source: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    canonical_job: Mapped["CanonicalJob"] = relationship("CanonicalJob", back_populates="external_references")
    source: Mapped["JobSource"] = relationship("JobSource", back_populates="canonical_references")


class JobSyncLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Audit log of job source aggregation runs."""
    __tablename__ = "job_sync_logs"

    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_sources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS", nullable=False)
    jobs_discovered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    jobs_created: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    jobs_updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duplicates_detected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    source: Mapped["JobSource"] = relationship("JobSource", back_populates="sync_logs")


class UserJobPreferences(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Candidate's job discovery preferences and criteria."""
    __tablename__ = "user_job_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    target_roles: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    preferred_locations: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    workplace_types: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    preferred_industries: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    min_salary: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    employment_types: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    experience_level: Mapped[str] = mapped_column(String(50), default="ENTRY", nullable=False)
    open_to_relocation: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_new_matches: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User")


class SavedJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Saved / bookmarked jobs for a candidate."""
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "canonical_job_id", name="uq_user_saved_job"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    canonical_job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("canonical_jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reminder_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User")
    job: Mapped["CanonicalJob"] = relationship("CanonicalJob", back_populates="saved_by_users")


class JobApplicationActivity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Application tracking pipeline.
    Records when a user opens an external apply link and tracks manual status transitions.
    """
    __tablename__ = "job_application_activities"
    __table_args__ = (UniqueConstraint("user_id", "canonical_job_id", name="uq_user_job_application"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    canonical_job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("canonical_jobs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    source_name: Mapped[str] = mapped_column(String(100), nullable=False)
    redirect_url: Mapped[str] = mapped_column(Text, nullable=False)
    
    # INTERESTED, SAVED, READY_TO_APPLY, LINK_OPENED, APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN
    status: Mapped[str] = mapped_column(String(50), default="LINK_OPENED", nullable=False)
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_status_change_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    candidate_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User")
    job: Mapped["CanonicalJob"] = relationship("CanonicalJob", back_populates="applications")


class UserJobSearchHistory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Recent queries for natural language and filter discovery."""
    __tablename__ = "user_job_search_history"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    raw_query: Mapped[str] = mapped_column(String(500), nullable=False)
    parsed_filters: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    result_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

