from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class CanonicalSkillBase(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    category: str = "technical"
    description: Optional[str] = None

class CanonicalSkillResponse(CanonicalSkillBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateSkillClaim(BaseModel):
    skill_name: str = Field(..., min_length=1)
    category: Optional[str] = "technical"
    proficiency: float = Field(default=0.5, ge=0.0, le=1.0)

class CandidateSkillResponse(BaseModel):
    id: uuid.UUID
    skill_name: str
    category: str
    state: str
    proficiency: float
    confidence: float
    evidence_count: int
    last_evidence_at: datetime

    class Config:
        from_attributes = True

