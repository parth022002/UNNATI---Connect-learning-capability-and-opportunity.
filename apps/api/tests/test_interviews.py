import sys
import uuid
from pathlib import Path
import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.testclient import TestClient

# Ensure apps/api is in python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.db.session import get_db
from app.models.user import User, UserProfile
from app.models.resume import Resume, ResumeVersion, JobDescription
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewTurn,
)
from app.services.interview_service import (
    generate_initial_interview_questions,
    generate_adaptive_follow_up,
    evaluate_candidate_response,
    conclude_interview_session,
    get_interview_studio_dashboard,
)

client = TestClient(app)

TEST_USER_ID = uuid.uuid4()
TEST_CLERK_ID = f"clerk_interview_{TEST_USER_ID.hex[:8]}"


@pytest.fixture(scope="module")
def db_session():
    """Provides a database session for test execution."""
    db: Session = next(get_db())
    yield db


@pytest.fixture(scope="module")
def interview_test_user(db_session: Session) -> User:
    """Creates a mock test candidate for interview simulations."""
    user = User(
        id=TEST_USER_ID,
        clerk_id=TEST_CLERK_ID,
        email=f"candidate_interview_{TEST_USER_ID.hex[:6]}@example.com",
        first_name="Rohan",
        last_name="Verma",
        role="student",
        is_active=True
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        headline="Aspiring Associate Product Manager",
        target_role="Associate Product Manager",
        phone="+91-9876543210",
        location="Bengaluru, India",
        bio="Passionate about consumer tech, data-driven feature prioritization, and user journeys.",
        experience_years=1.0,
        completeness_score=80
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_create_interview_session_with_role_questions(db_session: Session, interview_test_user: User):
    """Verifies creating an interview session and generating tailored role-specific questions."""
    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="APM Mock Interview",
        target_role="Associate Product Manager",
        interview_type="COMBINED",
        difficulty="INTERMEDIATE",
        duration_minutes=30,
        mode="REALISTIC_MOCK",
        format="TEXT",
        status="IN_PROGRESS",
        total_questions=5
    )
    db_session.add(session)
    db_session.flush()

    questions = generate_initial_interview_questions(session, db_session)

    assert len(questions) >= 3
    assert session.total_questions == len(questions)
    
    # Verify product domain competencies
    question_texts = " ".join([q.question_text for q in questions]).lower()
    assert any(term in question_texts for term in ["product", "roadmap", "metric", "user", "prioritize"])
    assert any(q.target_dimension == "TECHNICAL" for q in questions)
    assert any(q.target_dimension in ["HR", "BEHAVIOURAL"] for q in questions)


def test_resume_and_jd_personalized_interview_questions(db_session: Session, interview_test_user: User):
    """Verifies that interview questions dynamically ground in candidate's resume project and JD requirements."""
    # 1. Create candidate resume
    resume = Resume(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="APM & Growth Resume",
        target_role="Associate Product Manager",
        is_primary=True
    )
    db_session.add(resume)
    db_session.flush()

    version = ResumeVersion(
        id=uuid.uuid4(),
        resume_id=resume.id,
        version_number=1,
        version_label="v1",
        personal_info={"full_name": "Rohan Verma", "email": "rohan@example.com"},
        projects=[
            {
                "title": "Campus Commute Optimization App",
                "technologies": ["Figma", "Mixpanel", "SQL"],
                "description": "Designed multi-modal routing feature for 4,000 university students.",
                "highlights": ["Conducted 25 user interviews and improved onboarding conversion by 35%."]
            }
        ]
    )
    db_session.add(version)

    # 2. Create target Job Description
    jd = JobDescription(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="Associate Product Manager",
        company="Swiggy",
        raw_text="Looking for an APM with A/B testing and SQL skills.",
        extracted_intelligence={
            "mandatory_skills": ["A/B Testing", "SQL", "User Journey Mapping"],
            "preferred_skills": ["Mixpanel"]
        }
    )
    db_session.add(jd)
    db_session.commit()

    # 3. Create interview session referencing resume & JD
    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        resume_id=resume.id,
        job_description_id=jd.id,
        title="Personalized APM Practice",
        target_role="Associate Product Manager",
        interview_type="COMBINED",
        difficulty="INTERMEDIATE",
        duration_minutes=30,
        mode="REALISTIC_MOCK",
        format="TEXT",
        status="IN_PROGRESS",
        total_questions=5
    )
    db_session.add(session)
    db_session.flush()

    questions = generate_initial_interview_questions(session, db_session, resume, jd)

    # Verify project grounded question exists
    project_q = next((q for q in questions if "Campus Commute Optimization App" in q.question_text), None)
    assert project_q is not None
    assert "Figma" in project_q.question_text or "Mixpanel" in project_q.question_text
    assert project_q.question_type == "PROJECT_DEEP_DIVE"

    # Verify JD grounded question exists
    jd_q = next((q for q in questions if "A/B Testing" in q.question_text), None)
    assert jd_q is not None
    assert jd_q.target_dimension == "TECHNICAL"


def test_submit_answer_and_0_to_5_rubric_evaluation(db_session: Session, interview_test_user: User):
    """Verifies candidate response evaluation against 0.0 to 5.0 rubric, STAR analysis, and constructive feedback."""
    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="Evaluation Test Session",
        target_role="Software Engineer",
        interview_type="TECHNICAL",
        difficulty="INTERMEDIATE",
        duration_minutes=30,
        mode="REALISTIC_MOCK",
        format="TEXT",
        status="IN_PROGRESS",
        total_questions=3
    )
    db_session.add(session)
    db_session.flush()

    question = InterviewQuestion(
        id=uuid.uuid4(),
        session_id=session.id,
        order_index=1,
        question_text="How do you handle database connection pooling and slow queries in high-concurrency microservices?",
        question_type="SCENARIO",
        competency_tag="Database Performance",
        target_dimension="TECHNICAL",
        evaluation_criteria={"ideal_points": ["Connection pool sizing", "Indexing & query optimization", "Read replicas"]}
    )
    db_session.add(question)
    db_session.commit()

    candidate_resp = (
        "In our microservice architecture, I configured HikariCP connection pooling based on core counts and database IOPS. "
        "When we experienced p99 latency spikes, I analyzed PostgreSQL pg_stat_statements to identify unindexed joins, added composite B-Tree indexes, "
        "and introduced Redis caching for read-heavy catalog items. This reduced our p99 database response time by 45% and prevented connection timeouts."
    )

    eval_result = evaluate_candidate_response(question, candidate_resp, session, db_session)

    assert "score" in eval_result
    assert 0.0 <= eval_result["score"] <= 5.0
    assert eval_result["score"] >= 3.5 # Strong answer with quantifiable metrics
    assert "star_completeness" in eval_result
    assert eval_result["star_completeness"]["action"] is True
    assert eval_result["star_completeness"]["result"] is True
    assert len(eval_result["what_was_done_well"]) > 0
    assert "improvement_advice" in eval_result
    assert "stronger_answer_example" in eval_result


def test_adaptive_follow_up_generation(db_session: Session, interview_test_user: User):
    """Verifies that vague or low-metric answers trigger an adaptive follow-up probing for concrete impact."""
    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="Adaptive Test Session",
        target_role="Software Engineer",
        interview_type="TECHNICAL",
        difficulty="INTERMEDIATE",
        duration_minutes=30,
        mode="REALISTIC_MOCK",
        format="TEXT",
        status="IN_PROGRESS",
        total_questions=3
    )
    db_session.add(session)
    db_session.flush()

    question = InterviewQuestion(
        id=uuid.uuid4(),
        session_id=session.id,
        order_index=1,
        question_text="Tell me about a time you optimized a website.",
        question_type="SCENARIO",
        competency_tag="Performance Optimization",
        target_dimension="TECHNICAL"
    )
    db_session.add(question)
    db_session.commit()

    vague_response = "I worked on making the frontend faster by changing some React components and cleaning up code."
    follow_up = generate_adaptive_follow_up(session, question, vague_response, turn_score=2.0, db=db_session)

    assert follow_up is not None
    assert follow_up.is_follow_up is True
    assert follow_up.parent_question_id == question.id
    assert "measurable" in follow_up.question_text.lower() or "metrics" in follow_up.question_text.lower() or "deep" in follow_up.question_text.lower()


def test_finish_session_and_report_generation(db_session: Session, interview_test_user: User):
    """Verifies concluding an interview session, computing aggregate metrics, and mapping gaps to UNNATI Career Roadmap modules."""
    session = InterviewSession(
        id=uuid.uuid4(),
        user_id=interview_test_user.id,
        title="Full Session Test",
        target_role="Software Engineer",
        interview_type="COMBINED",
        difficulty="INTERMEDIATE",
        duration_minutes=30,
        mode="REALISTIC_MOCK",
        format="TEXT",
        status="IN_PROGRESS",
        total_questions=2
    )
    db_session.add(session)
    db_session.flush()

    q1 = InterviewQuestion(
        id=uuid.uuid4(),
        session_id=session.id,
        order_index=1,
        question_text="Explain caching strategies.",
        question_type="CONCEPTUAL",
        competency_tag="Caching & Scalability",
        target_dimension="TECHNICAL"
    )
    q2 = InterviewQuestion(
        id=uuid.uuid4(),
        session_id=session.id,
        order_index=2,
        question_text="Tell me about a conflict in a team.",
        question_type="BEHAVIOURAL",
        competency_tag="Teamwork & Conflict",
        target_dimension="BEHAVIOURAL"
    )
    db_session.add_all([q1, q2])
    db_session.flush()

    t1 = InterviewTurn(
        id=uuid.uuid4(),
        session_id=session.id,
        question_id=q1.id,
        candidate_response="I used Redis cache-aside pattern reducing database hits by 60%.",
        score=4.2,
        star_completeness={"result": True},
        what_was_done_well=["Good metric"],
        what_was_missing=[],
        improvement_advice="Elaborate TTL expiration.",
        stronger_answer_example="..."
    )
    t2 = InterviewTurn(
        id=uuid.uuid4(),
        session_id=session.id,
        question_id=q2.id,
        candidate_response="We had a disagreement on API design and I called a meeting.",
        score=3.2,
        star_completeness={"result": False},
        what_was_done_well=["Proactive communication"],
        what_was_missing=["No measurable outcome"],
        improvement_advice="Include STAR result metric.",
        stronger_answer_example="..."
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    report_summary = conclude_interview_session(session, db_session)

    assert session.status == "COMPLETED"
    assert session.overall_score == 3.7
    assert session.technical_score == 4.2
    assert session.behavioural_score == 3.2
    assert "readiness_tier" in report_summary
    assert len(session.learning_recommendations) > 0
    assert any("Teamwork" in r["module_name"] or "Conflict" in r["module_name"] for r in session.learning_recommendations)


def test_interview_studio_dashboard_metrics(db_session: Session, interview_test_user: User):
    """Verifies aggregated dashboard metrics, readiness tier, and target role practice recommendation."""
    dash = get_interview_studio_dashboard(interview_test_user.id, db_session)

    assert "total_sessions_completed" in dash
    assert "overall_readiness_score" in dash
    assert "readiness_tier" in dash
    assert "recommended_interview" in dash
    assert "recent_sessions" in dash
    assert dash["overall_readiness_score"] >= 0.0
