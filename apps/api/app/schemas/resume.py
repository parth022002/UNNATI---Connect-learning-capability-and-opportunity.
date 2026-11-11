import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class PersonalInfoSchema(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""


class WorkExperienceEntry(BaseModel):
    id: Optional[str] = None
    company: str
    role: str
    location: Optional[str] = ""
    start_date: str = ""
    end_date: Optional[str] = ""
    is_current: bool = False
    highlights: List[str] = []


class EducationEntry(BaseModel):
    id: Optional[str] = None
    institution: str
    degree: str
    field: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = ""


class ProjectEntry(BaseModel):
    id: Optional[str] = None
    title: str
    role: Optional[str] = ""
    description: str = ""
    technologies: List[str] = []
    link: Optional[str] = ""
    highlights: List[str] = []


class CertificationEntry(BaseModel):
    id: Optional[str] = None
    name: str
    issuer: Optional[str] = ""
    issue_date: Optional[str] = ""
    credential_id: Optional[str] = ""
    credential_url: Optional[str] = ""


class InternshipEntry(BaseModel):
    id: Optional[str] = None
    company: str
    role: str
    duration: Optional[str] = ""
    highlights: List[str] = []


class ResumeCreateRequest(BaseModel):
    title: str = "My Resume"
    target_role: Optional[str] = "Software Engineer"
    template_id: str = "classic_professional"
    import_from_profile: bool = False


class ResumeUpdateRequest(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    template_id: Optional[str] = None
    is_primary: Optional[bool] = None


class ResumeVersionSaveRequest(BaseModel):
    version_label: str = "Updated Version"
    template_id: Optional[str] = "classic_professional"
    personal_info: PersonalInfoSchema
    professional_summary: Optional[str] = ""
    headline: Optional[str] = ""
    work_experience: List[WorkExperienceEntry] = []
    education: List[EducationEntry] = []
    technical_skills: List[str] = []
    business_skills: List[str] = []
    projects: List[ProjectEntry] = []
    internships: List[InternshipEntry] = []
    certifications: List[CertificationEntry] = []
    achievements: List[str] = []
    publications: List[Dict[str, Any]] = []
    leadership: List[Dict[str, Any]] = []
    languages: List[Dict[str, str]] = []
    section_config: Optional[Dict[str, Any]] = None


class ResumeVersionResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    version_number: int
    version_label: str
    template_id: str
    personal_info: Dict[str, Any]
    professional_summary: Optional[str] = None
    headline: Optional[str] = None
    work_experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    technical_skills: List[str] = []
    business_skills: List[str] = []
    projects: List[Dict[str, Any]] = []
    internships: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    achievements: List[str] = []
    publications: List[Dict[str, Any]] = []
    leadership: List[Dict[str, Any]] = []
    languages: List[Dict[str, str]] = []
    section_config: Dict[str, Any] = {}
    latest_ats_score: Optional[float] = None
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_role: Optional[str] = None
    is_primary: bool
    template_id: str
    latest_ats_score: Optional[float] = None
    version_count: int = 1
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeDetailResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_role: Optional[str] = None
    is_primary: bool
    template_id: str
    current_version: Optional[ResumeVersionResponse] = None
    versions: List[ResumeVersionResponse] = []
    latest_ats_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ATSReportResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    resume_version_id: Optional[uuid.UUID] = None
    overall_score: float
    readiness_level: str
    dimension_scores: Dict[str, float]
    formatting_warnings: List[Dict[str, Any]]
    missing_sections: List[str]
    weak_bullet_points: List[Dict[str, Any]]
    grammar_spelling_issues: List[Dict[str, Any]]
    recommended_keywords: List[str]
    actionable_recommendations: List[Dict[str, Any]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobDescriptionCreateRequest(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = "Full-time"
    experience_requirement_years: Optional[float] = None
    source_url: Optional[str] = None
    raw_text: str


class JobDescriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = "Full-time"
    experience_requirement_years: Optional[float] = None
    source_url: Optional[str] = None
    raw_text: str
    extracted_intelligence: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeJDMatchResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    resume_version_id: uuid.UUID
    job_description_id: uuid.UUID
    job_title: str
    company: Optional[str] = None
    overall_match_score: float
    skill_alignment_score: float
    experience_alignment_score: float
    education_alignment_score: float
    project_relevance_score: float
    keyword_coverage_score: float
    matched_skills: List[Dict[str, Any]]
    partially_matched_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    mandatory_gaps: List[str]
    preferred_gaps: List[str]
    improvement_suggestions: List[Dict[str, Any]]
    learning_recommendations: List[Dict[str, Any]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIAssistRequest(BaseModel):
    action_type: str = Field(..., description="'enhance_bullet', 'generate_summary', 'suggest_headline', 'extract_accomplishment'")
    context_text: str
    role_or_target: Optional[str] = None
    keywords: Optional[List[str]] = []


class AIAssistResponse(BaseModel):
    action_type: str
    original: str
    enhanced: str
    explanation: str
    metrics_introduced: bool = False


class MultipleJDCompareItem(BaseModel):
    job_id: uuid.UUID
    job_title: str
    company: Optional[str] = None
    overall_match_score: float
    strongest_area: str
    main_gap: str
    mandatory_unmet_count: int


class ResumeCompareMatrixResponse(BaseModel):
    resume_id: uuid.UUID
    resume_title: str
    target_role: Optional[str] = None
    comparisons: List[MultipleJDCompareItem] = []

