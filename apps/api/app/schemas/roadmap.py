import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class SkillGapItem(BaseModel):
    skill_name: str
    target_proficiency: float
    current_proficiency: float
    gap: float
    state: str
    confidence: float
    weight: float
    prerequisites: List[str]
    is_met: bool

class GapAnalysisResponse(BaseModel):
    target_role: str
    readiness_score: float
    total_skills_required: int
    skills_met_count: int
    skills_breakdown: List[SkillGapItem]

class GenerateRoadmapRequest(BaseModel):
    target_role: Optional[str] = None
    weekly_hours: int = 10

class UpdateMilestoneStatusRequest(BaseModel):
    status: str # LOCKED, IN_PROGRESS, COMPLETED

class ToggleModuleProgressRequest(BaseModel):
    completed: Optional[bool] = None # If None, toggles current state

class MilestoneProgressResponse(BaseModel):
    roadmap_id: uuid.UUID
    milestone_id: uuid.UUID
    phase_number: int
    milestone_status: str
    completed_modules_count: int
    total_modules_count: int
    milestone_completion_percentage: float
    overall_roadmap_progress_percentage: float
    learning_modules: List[Dict[str, Any]]

class RoadmapMilestoneResponse(BaseModel):
    id: uuid.UUID
    phase_number: int
    title: str
    description: Optional[str] = None
    order_index: int
    status: str
    estimated_weeks: int
    target_skills: List[str]
    learning_modules: List[Dict[str, Any]]
    project_deliverable: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class CareerRoadmapResponse(BaseModel):
    id: uuid.UUID
    target_role: str
    title: str
    description: Optional[str] = None
    overall_readiness_score: float
    total_estimated_weeks: int
    weekly_hours: int
    status: str
    summary_metadata: Optional[Dict[str, Any]] = None
    milestones: List[RoadmapMilestoneResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

