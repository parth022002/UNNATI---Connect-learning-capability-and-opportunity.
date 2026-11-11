# ==============================================================================
# UNNATI — Learning Resource Discovery & Skill Intelligence API Routes
# ==============================================================================
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.api.routes.users import get_db_user
from app.core.security import decode_clerk_jwt
from app.models.learning import LearningResource
from app.schemas.learning import (
    LearningResourceItem,
    LearningResourceFilterRequest,
    LearningResourceListResponse,
    PersonalizedLearningSequence,
    AssessmentReadinessRequest,
    AssessmentReadinessResponse,
    UserLearningProgressItem,
    UpdateLearningProgressRequest,
    LearningDashboardSummary
)
from app.services.learning_service import (
    search_learning_resources,
    get_personalized_learning_sequence,
    evaluate_assessment_readiness,
    update_user_learning_progress,
    get_user_learning_dashboard,
    seed_learning_resources
)

router = APIRouter(prefix="/api/v1/learning", tags=["learning"])


def get_optional_db_user(request: Request, db: Session) -> Optional[User]:
    """Extracts authenticated user if Bearer token is provided, else None."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        claims = decode_clerk_jwt(token)
        clerk_id = claims.get("sub")
        if clerk_id:
            return db.scalar(select(User).where(User.clerk_id == clerk_id))
    except Exception:
        pass
    return None


@router.get("/resources", response_model=LearningResourceListResponse)
def list_learning_resources(
    request: Request,
    skill: Optional[str] = Query(None, description="Target skill e.g. SQL, Python, React"),
    topic: Optional[str] = Query(None, description="Topic or subtopic"),
    category: Optional[str] = Query(None, description="Category e.g. technology, data, business"),
    pricing_type: Optional[str] = Query(None, description="Filter: ALL, FREE, PAID"),
    platform: Optional[str] = Query(None, description="Platform name e.g. FreeCodeCamp, Coursera"),
    difficulty: Optional[str] = Query(None, description="Difficulty: Beginner, Intermediate, Advanced"),
    resource_type: Optional[str] = Query(None, description="VIDEO_COURSE, INTERACTIVE, DOCUMENTATION"),
    has_certificate_only: Optional[bool] = Query(None, description="Filter accredited certificate courses"),
    search_query: Optional[str] = Query(None, description="Free text search term"),
    sort_by: Optional[str] = Query("relevance", description="Sort: relevance, rating_desc, duration_asc, price_asc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Discovers curated and verified learning resources from legitimate
    free (FreeCodeCamp, MDN, YouTube, Microsoft Learn) and paid (Coursera, Udemy) platforms.
    """
    user = get_optional_db_user(request, db)
    
    platforms_list = [platform] if platform else None
    diff_list = [difficulty] if difficulty else None
    types_list = [resource_type] if resource_type else None

    filter_req = LearningResourceFilterRequest(
        skill=skill,
        topic=topic,
        category=category,
        pricing_type=pricing_type,
        platforms=platforms_list,
        difficulties=diff_list,
        resource_types=types_list,
        has_certificate_only=has_certificate_only,
        search_query=search_query,
        sort_by=sort_by,
        page=page,
        limit=limit
    )

    return search_learning_resources(db=db, filter_req=filter_req, user=user)


@router.get("/resources/{resource_id}", response_model=LearningResourceItem)
def get_resource_detail(
    resource_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Retrieves full details, syllabus, and concepts for an individual learning resource."""
    user = get_optional_db_user(request, db)
    resource = db.scalar(select(LearningResource).where(LearningResource.id == resource_id))
    if not resource or not resource.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning resource not found or inactive."
        )

    dto = LearningResourceItem.model_validate(resource)
    if user:
        from app.models.learning import UserLearningProgress
        progress = db.scalar(
            select(UserLearningProgress).where(
                UserLearningProgress.user_id == user.id,
                UserLearningProgress.resource_id == resource_id
            )
        )
        if progress:
            dto.user_status = progress.status
            dto.user_progress_percentage = progress.progress_percentage

    return dto


@router.get("/recommendations", response_model=PersonalizedLearningSequence)
def get_recommendations(
    request: Request,
    skill: str = Query(..., description="Target skill e.g. SQL, Python, React"),
    target_role: Optional[str] = Query(None, description="Optional target job role e.g. Backend Developer"),
    db: Session = Depends(get_db)
):
    """
    Generates a structured 4-stage sequential learning pathway
    (Foundational -> Core Concepts -> Advanced -> Capstone Practice)
    pairing free community resources with accredited certifications.
    """
    user = get_optional_db_user(request, db)
    return get_personalized_learning_sequence(
        db=db,
        skill_name=skill,
        target_role=target_role,
        user=user
    )


@router.post("/readiness", response_model=AssessmentReadinessResponse)
def evaluate_readiness(
    req: AssessmentReadinessRequest,
    current_user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates learner readiness selection before formal assessment:
    - KNOW_TOPIC: Continues to proctoring setup and pre-exam consent.
    - NEED_TO_LEARN: Returns personalized learning pathway with free/paid alternatives.
    - WANT_DIAGNOSTIC: Directs to low-stakes 5-min diagnostic quiz without proctoring.
    """
    return evaluate_assessment_readiness(
        db=db,
        user=current_user,
        req=req
    )


@router.post("/resources/{resource_id}/progress", response_model=UserLearningProgressItem)
def update_progress(
    resource_id: uuid.UUID,
    req: UpdateLearningProgressRequest,
    current_user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Updates candidate's learning progress on a course
    (SAVED, STARTED, IN_PROGRESS, COMPLETED, progress percentage, notes, rating).
    """
    resource = db.scalar(select(LearningResource).where(LearningResource.id == resource_id))
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning resource not found."
        )

    return update_user_learning_progress(
        db=db,
        user=current_user,
        resource_id=resource_id,
        req=req
    )


@router.get("/my-learning", response_model=LearningDashboardSummary)
def get_my_learning_dashboard(
    current_user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves learner's personal learning dashboard with saved, active, and completed courses."""
    return get_user_learning_dashboard(db=db, user=current_user)


@router.post("/admin/seed", response_model=dict)
def trigger_seed_resources(
    db: Session = Depends(get_db)
):
    """Administrative utility to seed or refresh verified multi-platform catalog."""
    count = seed_learning_resources(db)
    return {"status": "SUCCESS", "resources_seeded": count}
