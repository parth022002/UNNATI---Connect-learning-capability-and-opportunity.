from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class AssessmentOption(BaseModel):
    id: str
    text: str

class AssessmentQuestionResponse(BaseModel):
    id: int
    track: str  # business, data, tech, finance
    skill: str
    difficulty: str  # Foundational, Intermediate, Advanced
    prompt: str
    scenario: Optional[str] = None
    options: List[AssessmentOption]
    estimated_minutes: int = 2

class AssessmentSubmissionRequest(BaseModel):
    question_id: int
    selected_option_id: str
    time_taken_seconds: Optional[int] = None

class SkillUpdateDetail(BaseModel):
    skill_name: str
    category: str
    state: str  # ASSESSED
    proficiency: float
    confidence: float
    evidence_count: int

class AssessmentSubmissionResponse(BaseModel):
    question_id: int
    is_correct: bool
    correct_option_id: str
    score: float
    explanation: str
    practical_takeaway: str
    skill_update: Optional[SkillUpdateDetail] = None

class InterviewPrepQuestionResponse(BaseModel):
    id: int
    role: str
    track: str
    category: str  # technical, behavioral, system_design, case_study
    question: str
    scenario: Optional[str] = None
    evaluation_rubric: List[str]
    sample_approach: str
    tips: List[str]
