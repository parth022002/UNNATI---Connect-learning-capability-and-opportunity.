import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Resume(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core resume entity representing a candidate's managed resume."""
    __tablename__ = "resumes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), default="My Resume", nullable=False)
    target_role: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    template_id: Mapped[str] = mapped_column(String(50), default="classic_professional", nullable=False)
    
    # Relationships
    versions: Mapped[List["ResumeVersion"]] = relationship(
        "ResumeVersion", back_populates="resume", cascade="all, delete-orphan",
        order_by="desc(ResumeVersion.version_number)"
    )
    ats_reports: Mapped[List["ResumeATSReport"]] = relationship(
        "ResumeATSReport", back_populates="resume", cascade="all, delete-orphan",
        order_by="desc(ResumeATSReport.created_at)"
    )
    jd_matches: Mapped[List["ResumeJDMatch"]] = relationship(
        "ResumeJDMatch", back_populates="resume", cascade="all, delete-orphan",
        order_by="desc(ResumeJDMatch.created_at)"
    )


class ResumeVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Historical snapshot or specific tailored variant of a resume."""
    __tablename__ = "resume_versions"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    version_label: Mapped[str] = mapped_column(String(150), default="Initial Version", nullable=False)
    template_id: Mapped[str] = mapped_column(String(50), default="classic_professional", nullable=False)
    
    # Structured resume data fields
    personal_info: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    # Expected: {"full_name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""}
    
    professional_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    headline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Structured section entries
    work_experience: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"company": "", "role": "", "location": "", "start_date": "", "end_date": "", "is_current": false, "highlights": ["..."]}]
    
    education: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"institution": "", "degree": "", "field": "", "start_year": 2020, "end_year": 2024, "grade": ""}]
    
    technical_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    business_skills: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    
    projects: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"title": "", "role": "", "description": "", "technologies": [], "link": "", "highlights": []}]
    
    internships: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    certifications: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    achievements: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    publications: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    leadership: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    languages: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, default=list, nullable=False)
    
    # Section order and visibility configuration
    section_config: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    # {"order": ["summary", "experience", "education", "skills", "projects", "certifications"], "hidden": []}

    latest_ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    resume: Mapped["Resume"] = relationship("Resume", back_populates="versions")
    jd_matches: Mapped[List["ResumeJDMatch"]] = relationship("ResumeJDMatch", back_populates="resume_version")


class ResumeATSReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Detailed ATS compatibility and diagnostic score report."""
    __tablename__ = "resume_ats_reports"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resume_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True
    )
    
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    readiness_level: Mapped[str] = mapped_column(String(50), default="Needs Improvement", nullable=False)
    # Exceptional (85-100), Competitive (70-84), Needs Improvement (50-69), Critical Issues (<50)
    
    # Detailed dimensional scores (0-100)
    dimension_scores: Mapped[Dict[str, float]] = mapped_column(JSONB, default=dict, nullable=False)
    # {
    #   "contact_completeness": 90, "structure_organization": 85,
    #   "summary_quality": 75, "skills_presentation": 80,
    #   "experience_clarity": 70, "action_verbs_metric": 65,
    #   "formatting_consistency": 90, "date_consistency": 85
    # }
    
    formatting_warnings: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    missing_sections: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    weak_bullet_points: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"original": "...", "issue": "...", "suggestion": "...", "section": "experience"}]
    
    grammar_spelling_issues: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    recommended_keywords: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    actionable_recommendations: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    
    resume: Mapped["Resume"] = relationship("Resume", back_populates="ats_reports")


class JobDescription(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Job description entity provided by candidate (uploaded or manual)."""
    __tablename__ = "job_descriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    employment_type: Mapped[Optional[str]] = mapped_column(String(50), default="Full-time", nullable=True)
    experience_requirement_years: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Structured intelligence extracted by AI
    extracted_intelligence: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    # {
    #   "mandatory_skills": ["Python", "SQL"],
    #   "preferred_skills": ["Docker", "Kubernetes"],
    #   "tools_technologies": ["Git", "PostgreSQL"],
    #   "domain_knowledge": ["Fintech", "Payment Gateways"],
    #   "seniority_level": "Mid-Senior",
    #   "education_requirement": "Bachelor's in CS or equivalent",
    #   "key_responsibilities": ["..."]
    # }

    matches: Mapped[List["ResumeJDMatch"]] = relationship(
        "ResumeJDMatch", back_populates="job_description", cascade="all, delete-orphan"
    )


class ResumeJDMatch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Comprehensive semantic matching analysis between a Resume Version and Job Description."""
    __tablename__ = "resume_jd_matches"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resume_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resume_versions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_descriptions.id", ondelete="CASCADE"), index=True, nullable=False
    )

    overall_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Dimension scores (0-100)
    skill_alignment_score: Mapped[float] = mapped_column(Float, nullable=False)
    experience_alignment_score: Mapped[float] = mapped_column(Float, nullable=False)
    education_alignment_score: Mapped[float] = mapped_column(Float, nullable=False)
    project_relevance_score: Mapped[float] = mapped_column(Float, nullable=False)
    keyword_coverage_score: Mapped[float] = mapped_column(Float, nullable=False)

    # Detailed itemized matching evidence
    matched_skills: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"name": "SQL", "evidence_type": "DIRECT_EXPERIENCE" | "PROJECT" | "INFERRED", "context": "..."}]
    
    partially_matched_skills: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    missing_skills: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    mandatory_gaps: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    preferred_gaps: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)

    # Intelligent resume optimization suggestions (side-by-side)
    improvement_suggestions: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"section": "summary", "original": "...", "suggested": "...", "reason": "...", "expected_impact": "..."}]

    # Career Roadmap and Upskilling gap connections
    learning_recommendations: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)
    # [{"skill": "Docker", "module_name": "Containerization Foundations", "roadmap_action": "..."}]

    # Relationships
    resume: Mapped["Resume"] = relationship("Resume", back_populates="jd_matches")
    resume_version: Mapped["ResumeVersion"] = relationship("ResumeVersion", back_populates="jd_matches")
    job_description: Mapped["JobDescription"] = relationship("JobDescription", back_populates="matches")
