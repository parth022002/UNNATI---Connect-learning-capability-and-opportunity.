# ==============================================================================
# UNNATI — Examination & Assessment Integrity System API Routes
# Handles examination discovery, device checks & consent, server-authoritative
# session timers, autosave telemetry, explainable AI evaluation, and reviewer audits.
# ==============================================================================
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.api.routes.users import get_db_user
from app.core.security import decode_clerk_jwt
from app.models.examination import ExamCertificate
from app.schemas.examination import (
    ExaminationPublicSummary,
    ExamQuestionPublicResponse,
    ExaminationStartRequest,
    ExamAttemptSessionResponse,
    SavedAnswerState,
    SaveAnswerRequest,
    SaveAnswerResponse,
    ProctoringEventRequest,
    ProctoringEventResponse,
    ExamSubmissionRequest,
    ExamResultResponse,
    CertificateResponse,
    AdminReviewItemResponse,
    AdminReviewDetailResponse,
    AdminDecisionRequest,
    ExamAnalyticsResponse,
)
from app.services.examination_service import (
    get_examinations_list,
    get_examination_detail,
    start_or_resume_attempt,
    autosave_answer,
    ingest_proctoring_event,
    finalize_attempt_submission,
    get_attempt_result_response,
    admin_get_reviews_list,
    admin_get_attempt_detail,
    admin_record_reviewer_decision,
    get_examination_analytics,
)

router = APIRouter(prefix="/api/v1/examinations", tags=["examinations"])


def get_optional_db_user(request: Request, db: Session) -> Optional[User]:
    """Extracts authenticated user if Bearer token is provided, else returns None."""
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


# ------------------------------------------------------------------------------
# Learner: Catalog & Metadata
# ------------------------------------------------------------------------------
@router.get("", response_model=List[ExaminationPublicSummary])
def list_examinations(
    request: Request,
    track: Optional[str] = Query(None, description="Filter: business, data, tech, finance"),
    category: Optional[str] = Query(None, description="Filter: PRACTICE_QUIZ, MODULE_ASSESSMENT, FORMAL_EXAM, CERTIFICATION"),
    db: Session = Depends(get_db)
):
    """Lists published examinations with user-specific attempt counts and scores if authenticated."""
    user = get_optional_db_user(request, db)
    return get_examinations_list(db=db, user=user, track=track, category=category)


@router.get("/{exam_id}", response_model=ExaminationPublicSummary)
def get_examination_info(
    exam_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Retrieves single examination details, rules, and proctoring requirements."""
    user = get_optional_db_user(request, db)
    exam = get_examination_detail(db, exam_id)
    if not exam or not exam.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examination not found or unavailable."
        )

    user_attempts_count = 0
    user_best_score = None
    user_has_passed = False
    if user:
        from app.models.examination import ExamAttempt
        attempts = db.scalars(
            select(ExamAttempt).where(ExamAttempt.examination_id == exam.id, ExamAttempt.user_id == user.id)
        ).all()
        user_attempts_count = len(attempts)
        completed = [a for a in attempts if a.status in ["EVALUATED", "APPROVED"]]
        if completed:
            user_best_score = max(a.percentage for a in completed)
            user_has_passed = any(a.is_passed for a in completed)

    return ExaminationPublicSummary(
        id=exam.id,
        title=exam.title,
        description=exam.description,
        course_id=exam.course_id,
        course_name=exam.course_name,
        module_name=exam.module_name,
        track=exam.track,
        category=exam.category,
        difficulty=exam.difficulty,
        total_marks=exam.total_marks,
        passing_percentage=exam.passing_percentage,
        duration_minutes=exam.duration_minutes,
        max_attempts=exam.max_attempts,
        negative_marking_percentage=exam.negative_marking_percentage,
        proctoring_enabled=exam.proctoring_enabled,
        proctoring_config=exam.proctoring_config,
        certificate_eligible=exam.certificate_eligible,
        question_count=len(exam.questions),
        user_attempts_count=user_attempts_count,
        user_best_score=user_best_score,
        user_has_passed=user_has_passed
    )


# ------------------------------------------------------------------------------
# Learner: Examination Session Lifecycle
# ------------------------------------------------------------------------------
@router.post("/{exam_id}/start", response_model=ExamAttemptSessionResponse)
def start_examination(
    exam_id: uuid.UUID,
    body: ExaminationStartRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Starts a new attempt or resumes an ongoing session.
    Calculates server-authoritative timer, returns questions without answer keys,
    and returns previously saved answer states.
    """
    try:
        attempt, questions, saved_answers, time_remaining = start_or_resume_attempt(
            db=db,
            user=user,
            exam_id=exam_id,
            proctoring_consent=body.proctoring_consent,
            device_info=body.device_info
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    public_questions = [
        ExamQuestionPublicResponse(
            id=q.id,
            question_number=q.question_number,
            question_type=q.question_type,
            prompt=q.prompt,
            scenario=q.scenario,
            code_snippet=q.code_snippet,
            options=q.options,
            marks=q.marks,
            competency_tag=q.competency_tag,
            topic=q.topic
        )
        for q in questions
    ]

    saved_state_map = {
        k: SavedAnswerState(**v) for k, v in saved_answers.items()
    }

    from datetime import datetime, timezone
    return ExamAttemptSessionResponse(
        attempt_id=attempt.id,
        examination_id=attempt.examination_id,
        examination_title=attempt.examination.title,
        course_name=attempt.examination.course_name,
        attempt_number=attempt.attempt_number,
        status=attempt.status,
        started_at=attempt.started_at,
        expires_at=attempt.expires_at,
        server_time=datetime.now(timezone.utc),
        time_remaining_seconds=time_remaining,
        duration_minutes=attempt.examination.duration_minutes,
        proctoring_enabled=attempt.examination.proctoring_enabled,
        proctoring_config=attempt.examination.proctoring_config,
        questions=public_questions,
        saved_answers=saved_state_map
    )


@router.post("/attempts/{attempt_id}/answers", response_model=SaveAnswerResponse)
def save_answer(
    attempt_id: uuid.UUID,
    body: SaveAnswerRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Autosaves a candidate answer with server-authoritative timer enforcement."""
    try:
        saved_at = autosave_answer(
            db=db,
            user=user,
            attempt_id=attempt_id,
            question_id=body.question_id,
            selected_options=body.selected_options,
            text_response=body.text_response,
            is_marked_for_review=body.is_marked_for_review or False
        )
        return SaveAnswerResponse(success=True, question_id=body.question_id, saved_at=saved_at)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/attempts/{attempt_id}/proctoring-events", response_model=ProctoringEventResponse)
def record_telemetry_event(
    attempt_id: uuid.UUID,
    body: ProctoringEventRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Records privacy-preserving proctoring telemetry event (tab switch, camera, mic)."""
    try:
        event = ingest_proctoring_event(
            db=db,
            user=user,
            attempt_id=attempt_id,
            event_type=body.event_type,
            severity=body.severity or "INFO",
            metadata_payload=body.metadata_payload
        )
        return ProctoringEventResponse(
            id=event.id,
            event_type=event.event_type,
            severity=event.severity,
            timestamp=event.timestamp,
            metadata_payload=event.metadata_payload
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/attempts/{attempt_id}/submit", response_model=ExamResultResponse)
def submit_examination(
    attempt_id: uuid.UUID,
    body: ExamSubmissionRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Submits examination attempt, evaluates questions, updates Bayesian skills,
    computes explainable AI integrity analysis, and generates learning recommendations.
    """
    try:
        finalize_attempt_submission(
            db=db,
            user=user,
            attempt_id=attempt_id,
            feedback_notes=body.feedback_notes
        )
        result_data = get_attempt_result_response(db, user, attempt_id)
        return ExamResultResponse(**result_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/attempts/{attempt_id}/results", response_model=ExamResultResponse)
def get_examination_results(
    attempt_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves full question-wise results, competency breakdown, and AI recommendations."""
    try:
        result_data = get_attempt_result_response(db, user, attempt_id)
        return ExamResultResponse(**result_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ------------------------------------------------------------------------------
# Certificate Verification (Public)
# ------------------------------------------------------------------------------
@router.get("/certificates/{certificate_number}", response_model=CertificateResponse)
def verify_certificate(
    certificate_number: str,
    db: Session = Depends(get_db)
):
    """Public verification endpoint for digitally signed examination certificates."""
    cert = db.scalar(
        select(ExamCertificate).where(ExamCertificate.certificate_number == certificate_number.strip())
    )
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate {certificate_number} not found."
        )

    verification_url = f"{settings.cors_origins.split(',')[0]}/certificates/{cert.certificate_number}"
    return CertificateResponse(
        certificate_id=cert.id,
        certificate_number=cert.certificate_number,
        title=cert.title,
        recipient_name=cert.recipient_name,
        course_name=cert.course_name,
        score_percentage=cert.score_percentage,
        issued_at=cert.issued_at,
        credential_hash=cert.credential_hash,
        verification_url=verification_url
    )


# ------------------------------------------------------------------------------
# Administrator & Proctoring Integrity Review
# ------------------------------------------------------------------------------
@router.get("/admin/reviews", response_model=List[AdminReviewItemResponse])
def get_admin_reviews(
    risk: Optional[str] = Query(None, description="NORMAL, LOW, MODERATE, HIGH, INCONCLUSIVE"),
    status: Optional[str] = Query(None, description="IN_PROGRESS, EVALUATED, UNDER_REVIEW, APPROVED, REJECTED"),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Lists attempts requiring integrity audit or oversight."""
    # Ensure user has staff/admin role or allow reviewer
    return admin_get_reviews_list(db, risk_filter=risk, status_filter=status)


@router.get("/admin/reviews/{attempt_id}", response_model=AdminReviewDetailResponse)
def get_admin_review_detail(
    attempt_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves full proctoring event telemetry and AI assessment for human audit."""
    detail = admin_get_attempt_detail(db, attempt_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt review detail not found."
        )
    return AdminReviewDetailResponse(**detail)


@router.post("/admin/reviews/{attempt_id}/decision", response_model=AdminReviewDetailResponse)
def record_admin_decision(
    attempt_id: uuid.UUID,
    body: AdminDecisionRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Records human reviewer's final decision (Approved, Confirmed Violation, Dismissed)."""
    try:
        admin_record_reviewer_decision(
            db=db,
            reviewer=user,
            attempt_id=attempt_id,
            decision=body.decision,
            notes=body.reviewer_notes
        )
        detail = admin_get_attempt_detail(db, attempt_id)
        return AdminReviewDetailResponse(**detail)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/admin/analytics", response_model=ExamAnalyticsResponse)
def get_admin_analytics(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Computes examination participation, completion rates, and integrity distribution."""
    return get_examination_analytics(db)
