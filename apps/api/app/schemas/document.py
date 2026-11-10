import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class DocumentUploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    document_type: str
    file_size_bytes: int
    mime_type: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExtractedEducationItem(BaseModel):
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None

class ExtractedExperienceItem(BaseModel):
    company_name: str
    job_title: str
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None

class ExtractedSkillItem(BaseModel):
    name: str
    category: Optional[str] = "technical"
    proficiency_hint: Optional[float] = 0.6
    source_context: Optional[str] = None

class ParsedResumePayload(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    target_role: Optional[str] = None
    location: Optional[str] = None
    education: List[ExtractedEducationItem] = []
    experience: List[ExtractedExperienceItem] = []
    skills: List[ExtractedSkillItem] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []

class DocumentDetailResponse(BaseModel):
    id: uuid.UUID
    filename: str
    document_type: str
    file_size_bytes: int
    mime_type: str
    status: str
    raw_text: Optional[str] = None
    parsed_payload: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentApplyRequest(BaseModel):
    apply_profile: bool = True
    apply_education: bool = True
    apply_experience: bool = True
    apply_skills: bool = True

