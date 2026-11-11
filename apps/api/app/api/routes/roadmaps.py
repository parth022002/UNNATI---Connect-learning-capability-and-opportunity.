import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.api.routes.users import get_db_user
from app.schemas.roadmap import (
    GapAnalysisResponse,
    GenerateRoadmapRequest,
    CareerRoadmapResponse,
    RoadmapMilestoneResponse,
    UpdateMilestoneStatusRequest,
    ToggleModuleProgressRequest,
    MilestoneProgressResponse
)
from app.services.roadmap_service import (
    calculate_skill_gap_analysis,
    synthesize_career_roadmap
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/roadmaps", tags=["roadmaps"])

@router.get("/gap-analysis", response_model=GapAnalysisResponse)
def get_gap_analysis(
    target_role: Optional[str] = Query(None, description="Target career role"),
    user: User = Depends(get_db_user)
):
    """
    Computes Evidence-Weighted Skill Gap Analysis (Algorithm B).
    Evaluates candidate's claimed, inferred, and assessed capabilities
    against benchmark role taxonomies with confidence penalties.
    """
    role = target_role or (user.profile.target_role if user.profile else None) or "Full-Stack Software Engineer"
    analysis = calculate_skill_gap_analysis(user, role)
    return analysis

@router.post("/generate", response_model=CareerRoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    body: GenerateRoadmapRequest = GenerateRoadmapRequest(),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes an Algorithm C Topologically Sorted 3-Phase Roadmap.
    Structures curriculum milestones, targeted skills, learning modules,
    and portfolio project deliverables based on candidate gaps.
    """
    role = body.target_role or (user.profile.target_role if user.profile else None) or "Full-Stack Software Engineer"
    weekly_hours = body.weekly_hours or 10

    roadmap = synthesize_career_roadmap(
        db=db,
        user=user,
        target_role=role,
        weekly_hours=weekly_hours
    )
    return roadmap

@router.get("/me", response_model=Optional[CareerRoadmapResponse])
def get_my_active_roadmap(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves the candidate's active roadmap with milestones."""
    stmt = (
        select(CareerRoadmap)
        .where(CareerRoadmap.user_id == user.id, CareerRoadmap.status == "ACTIVE")
        .order_by(CareerRoadmap.created_at.desc())
    )
    roadmap = db.scalar(stmt)
    return roadmap

@router.get("/{roadmap_id}", response_model=CareerRoadmapResponse)
def get_roadmap_by_id(
    roadmap_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific roadmap by ID."""
    stmt = select(CareerRoadmap).where(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == user.id
    )
    roadmap = db.scalar(stmt)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found."
        )
    return roadmap

@router.patch("/{roadmap_id}/milestones/{milestone_id}", response_model=RoadmapMilestoneResponse)
def update_milestone_status(
    roadmap_id: uuid.UUID,
    milestone_id: uuid.UUID,
    body: UpdateMilestoneStatusRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Updates the status of a specific roadmap milestone (LOCKED, IN_PROGRESS, COMPLETED).
    When completed, automatically unlocks the next chronological milestone in the DAG.
    """
    valid_statuses = {"LOCKED", "IN_PROGRESS", "COMPLETED"}
    new_status = body.status.upper().strip()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{body.status}'. Must be one of {valid_statuses}"
        )

    stmt = select(CareerRoadmap).where(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == user.id
    )
    roadmap = db.scalar(stmt)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found."
        )

    target_milestone = None
    all_milestones = sorted(roadmap.milestones, key=lambda m: m.order_index)
    for m in all_milestones:
        if m.id == milestone_id:
            target_milestone = m
            break

    if not target_milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found in specified roadmap."
        )

    target_milestone.status = new_status

    # If completed, auto-unlock next milestone if locked
    if new_status == "COMPLETED":
        for next_m in all_milestones:
            if next_m.order_index == target_milestone.order_index + 1:
                if next_m.status == "LOCKED":
                    next_m.status = "IN_PROGRESS"
                break

    # If all milestones completed, update roadmap status
    if all(m.status == "COMPLETED" for m in all_milestones):
        roadmap.status = "COMPLETED"
    elif roadmap.status == "COMPLETED":
        roadmap.status = "ACTIVE"

    log_action(
        db=db,
        action="MILESTONE_STATUS_UPDATED",
        user_id=user.id,
        resource_id=str(milestone_id),
        metadata={
            "roadmap_id": str(roadmap_id),
            "new_status": new_status,
            "phase_number": target_milestone.phase_number
        }
    )

    db.commit()
    db.refresh(target_milestone)
    return target_milestone

@router.post(
    "/{roadmap_id}/milestones/{milestone_id}/modules/{module_index}/toggle",
    response_model=MilestoneProgressResponse
)
def toggle_module_progress(
    roadmap_id: uuid.UUID,
    milestone_id: uuid.UUID,
    module_index: int,
    body: ToggleModuleProgressRequest = ToggleModuleProgressRequest(),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Toggles completion state of a specific learning module within a milestone.
    Recalculates milestone completion and overall roadmap progress percentage.
    """
    stmt = select(CareerRoadmap).where(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == user.id
    )
    roadmap = db.scalar(stmt)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found."
        )

    target_milestone = None
    all_milestones = sorted(roadmap.milestones, key=lambda m: m.order_index)
    for m in all_milestones:
        if m.id == milestone_id:
            target_milestone = m
            break

    if not target_milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found in roadmap."
        )

    modules = list(target_milestone.learning_modules)
    if module_index < 0 or module_index >= len(modules):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Module index {module_index} out of bounds (0..{len(modules)-1})."
        )

    curr_mod = dict(modules[module_index])
    new_completed = body.completed if body.completed is not None else not curr_mod.get("completed", False)
    curr_mod["completed"] = new_completed
    modules[module_index] = curr_mod

    # Assign new list back to trigger JSON mutation tracking
    target_milestone.learning_modules = modules

    # Calculate milestone completion metrics
    milestone_completed_count = sum(1 for mod in modules if mod.get("completed", False))
    milestone_total = len(modules)
    milestone_pct = round((milestone_completed_count / milestone_total * 100.0) if milestone_total > 0 else 0.0, 1)

    # Auto-advance milestone status if in progress and modules completed
    if milestone_pct == 100.0 and target_milestone.status == "IN_PROGRESS":
        # Check if project deliverable exists or auto-complete
        target_milestone.status = "COMPLETED"
        # Auto-unlock next milestone
        for next_m in all_milestones:
            if next_m.order_index == target_milestone.order_index + 1:
                if next_m.status == "LOCKED":
                    next_m.status = "IN_PROGRESS"
                break
    elif milestone_pct < 100.0 and target_milestone.status == "COMPLETED":
        target_milestone.status = "IN_PROGRESS"

    # Calculate overall roadmap metrics
    total_roadmap_modules = 0
    completed_roadmap_modules = 0
    for m in all_milestones:
        m_mods = m.learning_modules if m.id != milestone_id else modules
        for mod in m_mods:
            total_roadmap_modules += 1
            if mod.get("completed", False):
                completed_roadmap_modules += 1

    overall_pct = round(
        (completed_roadmap_modules / total_roadmap_modules * 100.0) if total_roadmap_modules > 0 else 0.0,
        1
    )

    db.commit()
    db.refresh(target_milestone)

    return MilestoneProgressResponse(
        roadmap_id=roadmap.id,
        milestone_id=target_milestone.id,
        phase_number=target_milestone.phase_number,
        milestone_status=target_milestone.status,
        completed_modules_count=milestone_completed_count,
        total_modules_count=milestone_total,
        milestone_completion_percentage=milestone_pct,
        overall_roadmap_progress_percentage=overall_pct,
        learning_modules=target_milestone.learning_modules
    )

