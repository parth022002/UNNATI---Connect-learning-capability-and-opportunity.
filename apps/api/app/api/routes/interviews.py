import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.db.session import get_db
from app.models.user import User
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewTurn,
)
from app.models.resume import Resume, JobDescription
from app.api.routes.users import get_db_user
from app.schemas.interview import (
    InterviewSessionCreateRequest,
    InterviewTurnSubmitRequest,
    InterviewQuestionResponse,
    InterviewTurnResponse,
    InterviewSessionSummaryResponse,
    InterviewSessionDetailResponse,
    InterviewReportResponse,
    InterviewStudioDashboardResponse,
)
from app.services.interview_service import (
    generate_initial_interview_questions,
    generate_adaptive_follow_up,
    evaluate_candidate_response,
    conclude_interview_session,
    get_interview_studio_dashboard,
)

router = APIRouter(prefix="/api/v1/interviews", tags=["interviews"])


# ==============================================================================
# 1. STUDIO DASHBOARD & HISTORY
# ==============================================================================

@router.get("/dashboard", response_model=InterviewStudioDashboardResponse)
def get_dashboard(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves aggregated interview practice metrics, recent sessions, and recommendations."""
    dash_data = get_interview_studio_dashboard(user.id, db)
    recent = [InterviewSessionSummaryResponse.model_validate(s) for s in dash_data["recent_sessions"]]
    return InterviewStudioDashboardResponse(
        total_sessions_completed=dash_data["total_sessions_completed"],
        total_questions_answered=dash_data["total_questions_answered"],
        overall_readiness_score=dash_data["overall_readiness_score"],
        readiness_tier=dash_data["readiness_tier"],
        average_technical_score=dash_data["average_technical_score"],
        average_hr_score=dash_data["average_hr_score"],
        strongest_competency=dash_data["strongest_competency"],
        primary_growth_area=dash_data["primary_growth_area"],
        recommended_interview=dash_data["recommended_interview"],
        recent_sessions=recent
    )


@router.get("/sessions", response_model=List[InterviewSessionSummaryResponse])
def get_user_sessions(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Lists all interview sessions created by the candidate."""
    sessions = db.scalars(
        select(InterviewSession)
        .where(InterviewSession.user_id == user.id)
        .order_by(desc(InterviewSession.created_at))
    ).all()
    return [InterviewSessionSummaryResponse.model_validate(s) for s in sessions]


# ==============================================================================
# 2. SESSION LIFECYCLE (CREATE, START, SUBMIT ANSWER, FINISH)
# ==============================================================================

@router.post("/sessions", response_model=InterviewSessionDetailResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    req: InterviewSessionCreateRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Initializes and configures a new tailored interview session."""
    resume = None
    if req.resume_id:
        resume = db.scalar(
            select(Resume).where(Resume.id == req.resume_id, Resume.user_id == user.id)
        )

    jd = None
    if req.job_description_id:
        jd = db.scalar(
            select(JobDescription).where(JobDescription.id == req.job_description_id, JobDescription.user_id == user.id)
        )

    total_q = 5
    if req.duration_minutes <= 15: total_q = 3
    elif req.duration_minutes >= 45: total_q = 7

    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=user.id,
        resume_id=resume.id if resume else None,
        job_description_id=jd.id if jd else None,
        title=req.title or f"{req.target_role} Interview Practice",
        target_role=req.target_role,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        duration_minutes=req.duration_minutes,
        mode=req.mode,
        format=req.format,
        status="IN_PROGRESS",
        total_questions=total_q,
        current_question_index=0
    )
    db.add(session)
    db.flush()

    # Generate initial questions grounded in role, resume, and JD
    questions = generate_initial_interview_questions(session, db, resume, jd)
    db.refresh(session)

    current_q = questions[0] if questions else None

    return InterviewSessionDetailResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        duration_minutes=session.duration_minutes,
        mode=session.mode,
        format=session.format,
        status=session.status,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        current_question=InterviewQuestionResponse.model_validate(current_q) if current_q else None,
        questions=[InterviewQuestionResponse.model_validate(q) for q in questions],
        turns=[],
        overall_score=None,
        started_at=session.started_at,
        created_at=session.created_at
    )


@router.get("/sessions/{session_id}", response_model=InterviewSessionDetailResponse)
def get_session_detail(
    session_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves current state of an interview session, active question, and answered turns."""
    session = db.scalar(
        select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions = session.questions
    curr_idx = session.current_question_index
    current_q = questions[curr_idx] if 0 <= curr_idx < len(questions) else None

    return InterviewSessionDetailResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        duration_minutes=session.duration_minutes,
        mode=session.mode,
        format=session.format,
        status=session.status,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        current_question=InterviewQuestionResponse.model_validate(current_q) if current_q else None,
        questions=[InterviewQuestionResponse.model_validate(q) for q in questions],
        turns=[InterviewTurnResponse.model_validate(t) for t in session.turns],
        overall_score=session.overall_score,
        technical_score=session.technical_score,
        hr_score=session.hr_score,
        behavioural_score=session.behavioural_score,
        evaluation_summary=session.evaluation_summary,
        learning_recommendations=session.learning_recommendations,
        started_at=session.started_at,
        completed_at=session.completed_at,
        created_at=session.created_at
    )


@router.post("/sessions/{session_id}/answer", response_model=InterviewTurnResponse)
def submit_answer(
    session_id: uuid.UUID,
    req: InterviewTurnSubmitRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Evaluates candidate response to the current question and advances session."""
    session = db.scalar(
        select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    if session.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Interview session is already completed.")

    questions = session.questions
    curr_idx = session.current_question_index
    if curr_idx >= len(questions):
        raise HTTPException(status_code=400, detail="All session questions have been answered.")

    question = questions[curr_idx]

    # Evaluate using AI with heuristic rubric fallback
    eval_result = evaluate_candidate_response(question, req.candidate_response, session, db)

    turn = InterviewTurn(
        id=uuid.uuid4(),
        session_id=session.id,
        question_id=question.id,
        candidate_response=req.candidate_response,
        response_time_seconds=req.response_time_seconds,
        audio_metadata=req.audio_metadata or {},
        score=eval_result["score"],
        technical_accuracy_score=eval_result.get("technical_accuracy_score"),
        clarity_score=eval_result.get("clarity_score"),
        depth_score=eval_result.get("depth_score"),
        star_completeness=eval_result.get("star_completeness", {}),
        what_was_done_well=eval_result.get("what_was_done_well", []),
        what_was_missing=eval_result.get("what_was_missing", []),
        improvement_advice=eval_result.get("improvement_advice", ""),
        stronger_answer_example=eval_result.get("stronger_answer_example", "")
    )
    db.add(turn)

    # Check for adaptive follow-up (if question was not already a follow-up)
    if not question.is_follow_up and curr_idx < len(questions) - 1:
        follow_up = generate_adaptive_follow_up(session, question, req.candidate_response, turn.score, db)
        if follow_up:
            db.add(follow_up)
            session.total_questions += 1

    # Advance question index
    session.current_question_index += 1

    # If all answered, automatically conclude
    if session.current_question_index >= len(session.questions):
        conclude_interview_session(session, db)
    else:
        db.commit()

    db.refresh(turn)
    return InterviewTurnResponse.model_validate(turn)


@router.post("/sessions/{session_id}/finish", response_model=InterviewReportResponse)
def finish_interview(
    session_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Concludes the interview and compiles the final comprehensive performance report."""
    session = db.scalar(
        select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    conclude_interview_session(session, db)
    db.refresh(session)

    ov_score = session.overall_score or 3.0
    ov_pct = round((ov_score / 5.0) * 100.0, 1)
    summary = session.evaluation_summary or {}

    return InterviewReportResponse(
        session_id=session.id,
        title=session.title,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        overall_score=ov_score,
        overall_percentage=ov_pct,
        readiness_tier=summary.get("readiness_tier", "Competitive"),
        technical_score=session.technical_score or ov_score,
        hr_score=session.hr_score or ov_score,
        behavioural_score=session.behavioural_score or ov_score,
        competency_scores=summary.get("competency_scores", {}),
        strongest_areas=summary.get("strongest_areas", []),
        weakest_areas=summary.get("weakest_areas", []),
        repeated_mistakes=summary.get("repeated_mistakes", []),
        improvement_priorities=summary.get("improvement_priorities", []),
        learning_recommendations=session.learning_recommendations or [],
        turns=[InterviewTurnResponse.model_validate(t) for t in session.turns],
        completed_at=session.completed_at
    )


@router.get("/sessions/{session_id}/report", response_model=InterviewReportResponse)
def get_interview_report(
    session_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves report for an interview session."""
    session = db.scalar(
        select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    ov_score = session.overall_score or 3.0
    ov_pct = round((ov_score / 5.0) * 100.0, 1)
    summary = session.evaluation_summary or {}

    return InterviewReportResponse(
        session_id=session.id,
        title=session.title,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        overall_score=ov_score,
        overall_percentage=ov_pct,
        readiness_tier=summary.get("readiness_tier", "Competitive"),
        technical_score=session.technical_score or ov_score,
        hr_score=session.hr_score or ov_score,
        behavioural_score=session.behavioural_score or ov_score,
        competency_scores=summary.get("competency_scores", {}),
        strongest_areas=summary.get("strongest_areas", []),
        weakest_areas=summary.get("weakest_areas", []),
        repeated_mistakes=summary.get("repeated_mistakes", []),
        improvement_priorities=summary.get("improvement_priorities", []),
        learning_recommendations=session.learning_recommendations or [],
        turns=[InterviewTurnResponse.model_validate(t) for t in session.turns],
        completed_at=session.completed_at
    )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_session(
    session_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Permanently deletes an interview session and all its associated Q&A turns."""
    session = db.scalar(
        select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    db.delete(session)
    db.commit()
    return None
