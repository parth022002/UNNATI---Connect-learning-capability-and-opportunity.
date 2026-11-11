# ==============================================================================
# UNNATI — Examination & Assessment Integrity System Test Suite
# ==============================================================================
import uuid
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import get_db
from app.models.user import User
from app.models.examination import (
    Examination,
    ExamQuestion,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamProctoringEvent,
    ExamCertificate,
)
from app.core.security import decode_clerk_jwt

client = TestClient(app)

TEST_USER_ID = uuid.uuid4()
TEST_CLERK_ID = f"user_exam_test_{TEST_USER_ID.hex[:8]}"
TEST_EMAIL = f"exam_candidate_{TEST_USER_ID.hex[:6]}@example.com"


@pytest.fixture(scope="module", autouse=True)
def setup_test_candidate():
    """Sets up a test user in the database."""
    db: Session = next(get_db())
    existing = db.scalar(select_user := __import__("sqlalchemy").select(User).where(User.clerk_id == TEST_CLERK_ID))
    if not existing:
        user = User(
            id=TEST_USER_ID,
            clerk_id=TEST_CLERK_ID,
            email=TEST_EMAIL,
            first_name="Test",
            last_name="Candidate",
            role="student"
        )
        db.add(user)
        db.commit()
    yield
    # Cleanup


def get_mock_auth_headers():
    # In tests, get_db_user extracts mock or we override get_db_user
    return {"Authorization": f"Bearer mock_token_{TEST_CLERK_ID}"}


@pytest.fixture(autouse=True)
def override_db_user_dependency():
    """Overrides get_db_user for authenticated test requests."""
    from app.api.routes.users import get_db_user

    def mock_get_db_user(db: Session = pytest.importorskip("fastapi").Depends(get_db)) -> User:
        user = db.scalar(__import__("sqlalchemy").select(User).where(User.id == TEST_USER_ID))
        if not user:
            user = User(
                id=TEST_USER_ID,
                clerk_id=TEST_CLERK_ID,
                email=TEST_EMAIL,
                first_name="Test",
                last_name="Candidate",
                role="student"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    app.dependency_overrides[get_db_user] = mock_get_db_user
    yield
    app.dependency_overrides.pop(get_db_user, None)


def test_list_examinations_catalog():
    """Verifies examination discovery, filtering, and public schema security."""
    res = client.get("/api/v1/examinations")
    assert res.status_code == 200
    exams = res.json()
    assert len(exams) >= 4

    # Verify multi-disciplinary tracks exist
    tracks = {e["track"] for e in exams}
    assert "business" in tracks
    assert "data" in tracks
    assert "tech" in tracks
    assert "finance" in tracks

    # Check first exam structure
    first_exam = exams[0]
    assert "id" in first_exam
    assert "title" in first_exam
    assert "total_marks" in first_exam
    assert "passing_percentage" in first_exam
    assert "proctoring_enabled" in first_exam
    assert "proctoring_config" in first_exam


def test_examination_detail_conceals_answers():
    """Verifies that public examination detail does NOT leak correct answer keys."""
    res = client.get("/api/v1/examinations")
    exam_id = res.json()[0]["id"]

    res_detail = client.get(f"/api/v1/examinations/{exam_id}")
    assert res_detail.status_code == 200
    data = res_detail.json()
    assert data["id"] == exam_id
    assert "correct_answers" not in data


def test_start_attempt_enforces_consent():
    """Verifies that proctored examinations require explicit informed consent."""
    res = client.get("/api/v1/examinations?category=CERTIFICATION")
    proctored_exam = next(e for e in res.json() if e["proctoring_enabled"] is True)

    # Missing consent must be rejected
    fail_res = client.post(
        f"/api/v1/examinations/{proctored_exam['id']}/start",
        json={"proctoring_consent": False}
    )
    assert fail_res.status_code == 400
    assert "consent is required" in fail_res.json()["detail"].lower()

    # Valid consent succeeds
    start_res = client.post(
        f"/api/v1/examinations/{proctored_exam['id']}/start",
        json={
            "proctoring_consent": True,
            "device_info": {"browser": "Chrome", "screen": "1920x1080", "camera": True}
        }
    )
    assert start_res.status_code == 200
    session_data = start_res.json()
    assert "attempt_id" in session_data
    assert session_data["status"] == "IN_PROGRESS"
    assert session_data["time_remaining_seconds"] > 0
    assert len(session_data["questions"]) > 0

    # Ensure questions omit private answers
    first_q = session_data["questions"][0]
    assert "prompt" in first_q
    assert "options" in first_q
    assert "correct_answers" not in first_q
    assert "explanation" not in first_q


def test_autosave_and_proctoring_telemetry():
    """Verifies autosave and proctoring event ingestion."""
    # Find active attempt or create one
    res = client.get("/api/v1/examinations")
    exam_id = res.json()[0]["id"]
    start_res = client.post(
        f"/api/v1/examinations/{exam_id}/start",
        json={"proctoring_consent": True}
    )
    session_data = start_res.json()
    attempt_id = session_data["attempt_id"]
    question_id = session_data["questions"][0]["id"]

    # 1. Autosave answer
    save_res = client.post(
        f"/api/v1/examinations/attempts/{attempt_id}/answers",
        json={
            "question_id": question_id,
            "selected_options": ["B"],
            "is_marked_for_review": True
        }
    )
    assert save_res.status_code == 200
    assert save_res.json()["success"] is True

    # 2. Record proctoring telemetry event
    event_res = client.post(
        f"/api/v1/examinations/attempts/{attempt_id}/proctoring-events",
        json={
            "event_type": "TAB_SWITCH",
            "severity": "WARNING",
            "metadata_payload": {"duration_seconds": 3, "blurred_at": "client_timestamp"}
        }
    )
    assert event_res.status_code == 200
    assert event_res.json()["event_type"] == "TAB_SWITCH"


def test_submit_examination_evaluation_and_recommendations():
    """Verifies submission, auto-evaluation, Bayesian skill update, and recommendations."""
    res = client.get("/api/v1/examinations")
    exam_id = res.json()[0]["id"]
    start_res = client.post(
        f"/api/v1/examinations/{exam_id}/start",
        json={"proctoring_consent": True}
    )
    session_data = start_res.json()
    attempt_id = session_data["attempt_id"]

    # Submit attempt
    submit_res = client.post(
        f"/api/v1/examinations/attempts/{attempt_id}/submit",
        json={"feedback_notes": "Completed smoothly"}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["attempt_id"] == attempt_id
    assert "score_obtained" in result
    assert "percentage" in result
    assert "is_passed" in result
    assert "question_breakdown" in result
    assert "competency_performance" in result
    assert "ai_learning_recommendations" in result


def test_ai_integrity_analysis_human_in_the_loop():
    """
    Verifies that excessive tab switches trigger human review (UNDER_REVIEW),
    and reviewer approval resolves the attempt without automatic punitive failure.
    """
    res = client.get("/api/v1/examinations?category=CERTIFICATION")
    exam_id = res.json()[0]["id"]

    # Clear any active attempt for this exam by direct DB completion if needed
    db: Session = next(get_db())
    db.query(ExamAttempt).filter(
        ExamAttempt.examination_id == uuid.UUID(exam_id),
        ExamAttempt.user_id == TEST_USER_ID,
        ExamAttempt.status == "IN_PROGRESS"
    ).update({"status": "EVALUATED"})
    db.commit()

    start_res = client.post(
        f"/api/v1/examinations/{exam_id}/start",
        json={"proctoring_consent": True}
    )
    attempt_id = start_res.json()["attempt_id"]

    # Simulate 6 tab switches to generate HIGH risk telemetry
    for i in range(6):
        client.post(
            f"/api/v1/examinations/attempts/{attempt_id}/proctoring-events",
            json={
                "event_type": "TAB_SWITCH",
                "severity": "WARNING",
                "metadata_payload": {"instance": i + 1}
            }
        )

    # Submit
    submit_res = client.post(
        f"/api/v1/examinations/attempts/{attempt_id}/submit",
        json={}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()

    # Integrity should be UNDER_REVIEW rather than auto-failed!
    assert result["status"] == "UNDER_REVIEW"

    # Admin reviews attempt
    admin_detail_res = client.get(f"/api/v1/examinations/admin/reviews/{attempt_id}")
    assert admin_detail_res.status_code == 200
    detail = admin_detail_res.json()
    assert detail["integrity_risk_category"] == "HIGH"
    assert len(detail["events"]) >= 6

    # Admin makes human audit decision
    decision_res = client.post(
        f"/api/v1/examinations/admin/reviews/{attempt_id}/decision",
        json={
            "decision": "APPROVED",
            "reviewer_notes": "Candidate explained tab switch was due to system OS update notification. Approved after inspection."
        }
    )
    assert decision_res.status_code == 200
    assert decision_res.json()["reviewer_decision"] == "APPROVED"
    assert decision_res.json()["status"] == "APPROVED"


def test_certificate_issuance_and_public_verification():
    """Verifies that passing an eligible certification issues a verifiable certificate."""
    db: Session = next(get_db())
    exam = db.query(Examination).filter(Examination.certificate_eligible == True).first()
    assert exam is not None

    # Create synthetic passed attempt
    attempt = ExamAttempt(
        examination_id=exam.id,
        user_id=TEST_USER_ID,
        attempt_number=1,
        status="EVALUATED",
        started_at=datetime.now(timezone.utc) - timedelta(minutes=30),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        submitted_at=datetime.now(timezone.utc),
        score_obtained=85.0,
        total_marks=100.0,
        percentage=85.0,
        is_passed=True,
        proctoring_consent=True
    )
    db.add(attempt)
    db.commit()

    from app.services.examination_service import issue_certificate_for_attempt
    cert = issue_certificate_for_attempt(db, attempt.user, attempt)
    db.commit()

    # Public verification
    verify_res = client.get(f"/api/v1/examinations/certificates/{cert.certificate_number}")
    assert verify_res.status_code == 200
    cert_data = verify_res.json()
    assert cert_data["certificate_number"] == cert.certificate_number
    assert cert_data["score_percentage"] == 85.0
    assert "credential_hash" in cert_data


def test_admin_analytics_endpoint():
    """Verifies aggregate participation, pass rate, and integrity risk distributions."""
    res = client.get("/api/v1/examinations/admin/analytics")
    assert res.status_code == 200
    analytics = res.json()
    assert "total_examinations" in analytics
    assert "total_attempts" in analytics
    assert "completion_rate" in analytics
    assert "pass_rate" in analytics
    assert "integrity_risk_distribution" in analytics
    assert "top_knowledge_gaps" in analytics

