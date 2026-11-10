from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "student"

class UserSyncRequest(BaseModel):
    role: Optional[str] = "student"

class UserProfileBase(BaseModel):
    headline: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    experience_years: float = 0.0

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: uuid.UUID
    completeness_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EducationRecordCreate(BaseModel):
    institution_name: str = Field(..., min_length=2)
    degree: str = Field(..., min_length=2)
    field_of_study: str = Field(..., min_length=2)
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade_or_gpa: Optional[str] = None

class EducationRecordResponse(EducationRecordCreate):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ExperienceRecordCreate(BaseModel):
    company_name: str = Field(..., min_length=2)
    title: str = Field(..., min_length=2)
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None

class ExperienceRecordResponse(ExperienceRecordCreate):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class UserDetailResponse(BaseModel):
    id: uuid.UUID
    clerk_id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    is_active: bool
    profile: Optional[UserProfileResponse]
    education: List[EducationRecordResponse] = []
    experience: List[ExperienceRecordResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

