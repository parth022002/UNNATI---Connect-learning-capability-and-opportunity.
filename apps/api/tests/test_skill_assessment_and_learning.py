# ==============================================================================
# UNNATI — Skill Assessment & Intelligent Learning Recommendation Tests
# Verifies:
# 1. Multi-platform learning resource seeding & search filters (Free vs Paid).
# 2. Personalized sequential learning pathway generation.
# 3. Assessment readiness gate (KNOW_TOPIC, NEED_TO_LEARN, WANT_DIAGNOSTIC).
# 4. User learning progress lifecycle (SAVED -> STARTED -> IN_PROGRESS -> COMPLETED).
# 5. User learning dashboard statistics.
# 6. Proctored examination evaluation with adaptive learning recommendations and skill evidence updates.
# ==============================================================================
import uuid
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, UserProfile
from app.models.skill import CanonicalSkill, CandidateSkill
from app.models.learning import LearningResource, UserLearningProgress, AssessmentReadinessLog
from app.models.examination import Examination, ExamQuestion, ExamAttempt, ExamProctoringEvent
from app.services.learning_service import (
    seed_learning_resources,
    search_learning_resources,
    get_personalized_learning_sequence,
    evaluate_assessment_readiness
)
from app.schemas.learning import LearningResourceFilterRequest, AssessmentReadinessRequest
from app.api.routes.users import get_db_user


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def test_candidate(db_session: Session):
    clerk_id = f"test_candidate_learn_{uuid.uuid4().hex[:8]}"
    email = f"{clerk_id}@example.com"
    user = User(
        clerk_id=clerk_id,
        email=email,
        first_name="Ananya",
        last_name="Sharma",
        role="student"
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(
        user_id=user.id,
        headline="Junior Data Analyst",
        target_role="Business Intelligence Engineer",
        completeness_score=85
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def client_candidate(test_candidate: User):
    def override_get_db_user():
        return test_candidate

    app.dependency_overrides[get_db_user] = override_get_db_user
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# ==============================================================================
# 1. Multi-Platform Learning Resource Catalog & Filtering
# ==============================================================================
def test_seed_and_search_learning_resources(db_session: Session, client_candidate: TestClient):
    # Ensure resources are seeded
    seed_count = seed_learning_resources(db_session)
    assert seed_count >= 0

    # 1. Test listing all resources
    resp = client_candidate.get("/api/v1/learning/resources?page=1&limit=20")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 10
    assert len(data["resources"]) > 0
    assert len(data["available_platforms"]) > 0

    # 2. Test filtering by FREE pricing
    free_resp = client_candidate.get("/api/v1/learning/resources?pricing_type=FREE")
    assert free_resp.status_code == 200
    free_data = free_resp.json()
    assert all(r["pricing_type"] == "FREE" for r in free_data["resources"])
    assert any(r["platform_name"] in ["FreeCodeCamp", "YouTube", "MDN Web Docs", "Microsoft Learn"] for r in free_data["resources"])

    # 3. Test filtering by PAID pricing
    paid_resp = client_candidate.get("/api/v1/learning/resources?pricing_type=PAID")
    assert paid_resp.status_code == 200
    paid_data = paid_resp.json()
    assert all(r["pricing_type"] in ["PAID", "SUBSCRIPTION"] for r in paid_data["resources"])
    assert any(r["platform_name"] in ["Coursera", "Udemy"] for r in paid_data["resources"])

    # 4. Test filtering by skill
    sql_resp = client_candidate.get("/api/v1/learning/resources?skill=SQL")
    assert sql_resp.status_code == 200
    sql_data = sql_resp.json()
    assert sql_data["total"] >= 2
    assert all("sql" in r["skill_name"].lower() or "sql" in r["topic"].lower() for r in sql_data["resources"])


# ==============================================================================
# 2. Personalized Sequential Learning Pathway Generation
# ==============================================================================
def test_personalized_learning_sequence(client_candidate: TestClient):
    resp = client_candidate.get("/api/v1/learning/recommendations?skill=SQL&target_role=Data+Analyst")
    assert resp.status_code == 200
    seq = resp.json()

    assert seq["skill_name"] == "SQL"
    assert seq["target_role"] == "Data Analyst"
    assert len(seq["stages"]) == 4  # 4 sequential stages
    assert seq["estimated_total_hours"] > 0
    assert seq["free_alternative_available"] is True

    stage_1 = seq["stages"][0]
    assert "Foundational" in stage_1["stage_name"]
    assert len(stage_1["concepts"]) > 0
    assert len(stage_1["recommended_free_resources"]) > 0


# ==============================================================================
# 3. Assessment Readiness Gate (3 Options)
# ==============================================================================
def test_readiness_gate_know_topic(client_candidate: TestClient, test_candidate: User):
    # Option A: KNOW_TOPIC (proceed to assessment)
    payload = {
        "topic_or_skill": "SQL",
        "target_difficulty": "Intermediate",
        "readiness_choice": "KNOW_TOPIC"
    }
    resp = client_candidate.post("/api/v1/learning/readiness", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["readiness_choice"] == "KNOW_TOPIC"
    assert data["can_proceed_to_assessment"] is True
    assert data["status"] == "READY_TO_TEST"
    assert "Please review the pre-exam instructions" in data["message"]


def test_readiness_gate_need_to_learn(client_candidate: TestClient, test_candidate: User):
    # Option B: NEED_TO_LEARN (redirect to learning resources)
    payload = {
        "topic_or_skill": "Python",
        "target_difficulty": "Beginner",
        "readiness_choice": "NEED_TO_LEARN"
    }
    resp = client_candidate.post("/api/v1/learning/readiness", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["readiness_choice"] == "NEED_TO_LEARN"
    assert data["can_proceed_to_assessment"] is False
    assert data["status"] == "RECOMMENDED_LEARNING"
    assert data["learning_recommendations"] is not None
    assert len(data["learning_recommendations"]["stages"]) == 4


def test_readiness_gate_want_diagnostic(client_candidate: TestClient, test_candidate: User):
    # Option C: WANT_DIAGNOSTIC (low-stakes unproctored check)
    payload = {
        "topic_or_skill": "Product Management",
        "target_difficulty": "Foundational",
        "readiness_choice": "WANT_DIAGNOSTIC"
    }
    resp = client_candidate.post("/api/v1/learning/readiness", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["readiness_choice"] == "WANT_DIAGNOSTIC"
    assert data["can_proceed_to_assessment"] is True
    assert data["status"] == "DIAGNOSTIC_AVAILABLE"
    assert "low-stakes diagnostic check" in data["message"]


# ==============================================================================
# 4. User Learning Progress & Dashboard
# ==============================================================================
def test_user_learning_progress_lifecycle(
    db_session: Session, client_candidate: TestClient, test_candidate: User
):
    # Pick a learning resource
    res = db_session.scalar(select(LearningResource).where(LearningResource.is_active == True))
    assert res is not None

    # 1. Bookmark / Save resource
    save_resp = client_candidate.post(
        f"/api/v1/learning/resources/{res.id}/progress",
        json={"status": "SAVED", "progress_percentage": 0.0}
    )
    assert save_resp.status_code == 200
    save_data = save_resp.json()
    assert save_data["status"] == "SAVED"
    assert save_data["resource"]["title"] == res.title

    # 2. Update to IN_PROGRESS
    update_resp = client_candidate.post(
        f"/api/v1/learning/resources/{res.id}/progress",
        json={
            "status": "IN_PROGRESS",
            "progress_percentage": 45.0,
            "notes": "Completed modules 1 through 3 on relational normalization."
        }
    )
    assert update_resp.status_code == 200
    up_data = update_resp.json()
    assert up_data["status"] == "IN_PROGRESS"
    assert up_data["progress_percentage"] == 45.0

    # 3. Mark as COMPLETED
    comp_resp = client_candidate.post(
        f"/api/v1/learning/resources/{res.id}/progress",
        json={
            "status": "COMPLETED",
            "progress_percentage": 100.0,
            "user_rating": 5
        }
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["status"] == "COMPLETED"
    assert comp_data["progress_percentage"] == 100.0

    # 4. Check user learning dashboard summary
    dash_resp = client_candidate.get("/api/v1/learning/my-learning")
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["total_completed"] >= 1
    assert len(dash_data["skills_in_learning"]) >= 1
    assert len(dash_data["recent_resources"]) >= 1


# ==============================================================================
# 5. Proctored Exam & Skill Evidence Verification
# ==============================================================================
def test_proctored_examination_skill_upgrade_and_adaptive_recommendations(
    db_session: Session, client_candidate: TestClient, test_candidate: User
):
    from app.services.examination_service import seed_default_examinations_if_empty
    seed_default_examinations_if_empty(db_session)

    # Find the Business Intelligence / SQL exam
    exam = db_session.scalar(
        select(Examination).where(
            Examination.is_published == True,
            Examination.track == "data"
        )
    )
    assert exam is not None

    # 1. Start attempt with proctoring consent
    start_resp = client_candidate.post(
        f"/api/v1/examinations/{exam.id}/start",
        json={
            "proctoring_consent": True,
            "device_info": {"browser": "Chrome", "os": "Windows"}
        }
    )
    assert start_resp.status_code == 200
    session_data = start_resp.json()
    attempt_id = session_data["attempt_id"]

    # 2. Save answer to Question 1
    questions = session_data["questions"]
    q1 = questions[0]
    ans_resp = client_candidate.post(
        f"/api/v1/examinations/attempts/{attempt_id}/answers",
        json={
            "question_id": q1["id"],
            "selected_options": ["A"]
        }
    )
    assert ans_resp.status_code == 200

    # 3. Record proctoring telemetry event
    evt_resp = client_candidate.post(
        f"/api/v1/examinations/attempts/{attempt_id}/proctoring-events",
        json={
            "event_type": "TAB_SWITCH",
            "severity": "WARNING",
            "metadata_payload": {"duration_ms": 1200}
        }
    )
    assert evt_resp.status_code == 200

    # 4. Submit examination
    sub_resp = client_candidate.post(
        f"/api/v1/examinations/attempts/{attempt_id}/submit",
        json={"feedback_notes": "Completed all analytical questions"}
    )
    assert sub_resp.status_code == 200
    result_data = sub_resp.json()

    assert "score_obtained" in result_data
    assert "percentage" in result_data
    assert "ai_learning_recommendations" in result_data
    assert result_data["ai_learning_recommendations"] is not None

    # Verify candidate skill state was promoted to ASSESSED
    db_session.expire_all()
    candidate_skills = db_session.scalars(
        select(CandidateSkill).where(CandidateSkill.user_id == test_candidate.id)
    ).all()
    assert len(candidate_skills) > 0
    assert any(cs.state == "ASSESSED" for cs in candidate_skills)
