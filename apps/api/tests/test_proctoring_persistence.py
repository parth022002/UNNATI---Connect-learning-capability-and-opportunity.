# ==============================================================================
# UNNATI — AI Proctoring Database Persistence & Audit Integrity Test Suite
# Verifies:
# 1. Proctoring telemetry ingestion with client_event_id idempotency.
# 2. Cryptographic evidence registration (SHA-256 checksum, metadata, retention expiry).
# 3. Human proctor review recording and attempt state transitions.
# 4. Immutable audit trail generation across all proctoring operations.
# 5. Full proctoring session summary retrieval with RBAC / ownership authorization.
# ==============================================================================
import uuid
import hashlib
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.examination import (
    Examination,
    ExamQuestion,
    ExamAttempt,
    ExamProctoringEvent,
    ProctoringEvidence,
    ProctoringReview,
    ProctoringAuditLog,
)
from app.api.routes.users import get_db_user

client = TestClient(app)

OWNER_USER_ID = uuid.uuid4()
OWNER_CLERK_ID = f"clerk_owner_{OWNER_USER_ID.hex[:8]}"
OWNER_EMAIL = f"owner_{OWNER_USER_ID.hex[:6]}@example.com"

UNAUTHORIZED_USER_ID = uuid.uuid4()
UNAUTHORIZED_CLERK_ID = f"clerk_unauth_{UNAUTHORIZED_USER_ID.hex[:8]}"
UNAUTHORIZED_EMAIL = f"unauth_{UNAUTHORIZED_USER_ID.hex[:6]}@example.com"

EXAM_ID = uuid.uuid4()
ATTEMPT_ID = uuid.uuid4()


@pytest.fixture(scope="module", autouse=True)
def setup_proctoring_test_data():
    """Seeds candidate users, an exam, and an attempt in the database."""
    db: Session = SessionLocal()
    try:
        # Create candidate user
        owner_user = db.scalar(select(User).where(User.id == OWNER_USER_ID))
        if not owner_user:
            owner_user = User(
                id=OWNER_USER_ID,
                clerk_id=OWNER_CLERK_ID,
                email=OWNER_EMAIL,
                first_name="Candidate",
                last_name="Proctored",
                role="student"
            )
            db.add(owner_user)

        # Create unauthorized user
        unauth_user = db.scalar(select(User).where(User.id == UNAUTHORIZED_USER_ID))
        if not unauth_user:
            unauth_user = User(
                id=UNAUTHORIZED_USER_ID,
                clerk_id=UNAUTHORIZED_CLERK_ID,
                email=UNAUTHORIZED_EMAIL,
                first_name="Unauthorized",
                last_name="Observer",
                role="student"
            )
            db.add(unauth_user)

        # Create examination
        exam = db.scalar(select(Examination).where(Examination.id == EXAM_ID))
        if not exam:
            exam = Examination(
                id=EXAM_ID,
                title="Proctoring Persistence Certification",
                description="End-to-End Database Validation Exam",
                duration_minutes=60,
                passing_percentage=70.0,
                proctoring_enabled=True,
                proctoring_config={
                    "require_webcam": True,
                    "require_microphone": False,
                    "require_fullscreen": True,
                    "block_tab_switch": True,
                    "block_copy_paste": True,
                },
                is_published=True
            )
            db.add(exam)

        # Create active attempt with consent
        now = datetime.now(timezone.utc)
        attempt = db.scalar(select(ExamAttempt).where(ExamAttempt.id == ATTEMPT_ID))
        if not attempt:
            attempt = ExamAttempt(
                id=ATTEMPT_ID,
                examination_id=EXAM_ID,
                user_id=OWNER_USER_ID,
                attempt_number=1,
                status="IN_PROGRESS",
                started_at=now,
                expires_at=now + timedelta(hours=1),
                proctoring_consent=True,
                consent_timestamp=now,
                device_info={"browser": "Chrome", "os": "Windows"},
                integrity_risk_category="NORMAL"
            )
            db.add(attempt)

        db.commit()
        yield
    finally:
        db.close()


def test_proctoring_event_ingestion_and_idempotency():
    """Verifies event creation and that repeating client_event_id prevents duplication."""
    app.dependency_overrides[get_db_user] = lambda: User(
        id=OWNER_USER_ID, clerk_id=OWNER_CLERK_ID, email=OWNER_EMAIL, role="student"
    )

    client_event_id = f"evt_{uuid.uuid4().hex[:12]}"
    payload = {
        "client_event_id": client_event_id,
        "event_type": "TAB_SWITCH",
        "severity": "WARNING",
        "duration_seconds": 3.5,
        "confidence_score": 0.98,
        "detection_source": "CLIENT_SENSOR",
        "description": "User switched focus away from exam tab",
        "metadata_payload": {"blur_duration_ms": 3500, "page_url": "/examinations/take"}
    }

    # 1. First ingestion
    res1 = client.post(
        f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-events",
        json=payload
    )
    assert res1.status_code == 200, res1.text
    data1 = res1.json()
    assert data1["event_type"] == "TAB_SWITCH"
    assert data1["severity"] == "WARNING"
    assert data1["client_event_id"] == client_event_id
    event_id = data1["id"]

    # 2. Duplicate ingestion with identical client_event_id should return existing record (Idempotent)
    res2 = client.post(
        f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-events",
        json=payload
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["id"] == event_id, "Idempotency failed: new ID created for identical client_event_id"

    # Verify database persistence
    db = SessionLocal()
    try:
        events = db.scalars(
            select(ExamProctoringEvent).where(
                ExamProctoringEvent.attempt_id == ATTEMPT_ID,
                ExamProctoringEvent.client_event_id == client_event_id
            )
        ).all()
        assert len(events) == 1, "Database contains duplicate records for unique client_event_id"
    finally:
        db.close()


def test_proctoring_evidence_registration_with_hash():
    """Verifies evidence metadata registration, SHA-256 integrity hash, and audit log."""
    app.dependency_overrides[get_db_user] = lambda: User(
        id=OWNER_USER_ID, clerk_id=OWNER_CLERK_ID, email=OWNER_EMAIL, role="student"
    )

    sample_evidence_data = b"synthetic_telemetry_snapshot_frame_data_for_proctoring_test"
    sha256_hash = hashlib.sha256(sample_evidence_data).hexdigest()

    evidence_payload = {
        "storage_provider": "S3_COMPATIBLE",
        "storage_key": f"proctoring/{ATTEMPT_ID}/evidence_001.bin",
        "evidence_type": "TELEMETRY_SNAPSHOT",
        "mime_type": "application/octet-stream",
        "file_size_bytes": len(sample_evidence_data),
        "checksum_sha256": sha256_hash,
        "access_classification": "CONFIDENTIAL",
        "metadata_payload": {"reason": "MULTIPLE_FACES_DETECTED", "bbox_count": 2}
    }

    res = client.post(
        f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-evidence",
        json=evidence_payload
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["checksum_sha256"] == sha256_hash
    assert data["storage_key"] == evidence_payload["storage_key"]
    assert data["evidence_type"] == "TELEMETRY_SNAPSHOT"

    # Verify audit log created
    db = SessionLocal()
    try:
        audit_log = db.scalar(
            select(ProctoringAuditLog).where(
                ProctoringAuditLog.attempt_id == ATTEMPT_ID,
                ProctoringAuditLog.action_type == "EVIDENCE_REGISTERED"
            )
        )
        assert audit_log is not None, "Audit log was not created for evidence registration"
        assert audit_log.target_type == "PROCTORING_EVIDENCE"
    finally:
        db.close()


def test_proctoring_human_review_and_status_update():
    """Verifies recording human reviewer decision, updating attempt review status and audit log."""
    # Proctors / Admins have elevated roles
    REVIEWER_ID = uuid.uuid4()
    app.dependency_overrides[get_db_user] = lambda: User(
        id=REVIEWER_ID, clerk_id="clerk_proctor_admin", email="proctor@unnati.edu", role="admin"
    )

    review_payload = {
        "review_status": "FLAGGED",
        "review_decision": "DISQUALIFIED",
        "reviewer_notes": "Continuous dual-screen activity confirmed during proctored session.",
        "metadata_payload": {"infraction_severity": "CRITICAL", "action_taken": "FLAGGED_FOR_HEARING"}
    }

    res = client.post(
        f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-reviews",
        json=review_payload
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["review_status"] == "FLAGGED"
    assert data["review_decision"] == "DISQUALIFIED"
    assert data["reviewer_id"] == str(REVIEWER_ID)

    # Verify attempt status updated in database
    db = SessionLocal()
    try:
        attempt = db.scalar(select(ExamAttempt).where(ExamAttempt.id == ATTEMPT_ID))
        assert attempt.reviewer_decision == "DISQUALIFIED"
        assert attempt.reviewer_notes == "Continuous dual-screen activity confirmed during proctored session."

        audit_entry = db.scalar(
            select(ProctoringAuditLog).where(
                ProctoringAuditLog.attempt_id == ATTEMPT_ID,
                ProctoringAuditLog.action_type == "REVIEW_RECORDED"
            )
        )
        assert audit_entry is not None
        assert audit_entry.actor_id == str(REVIEWER_ID)
    finally:
        db.close()


def test_proctoring_summary_access_control():
    """Verifies that attempt owner or admin can retrieve summary, but unauthorized user is blocked."""
    # 1. Attempt owner retrieves summary -> 200 OK
    app.dependency_overrides[get_db_user] = lambda: User(
        id=OWNER_USER_ID, clerk_id=OWNER_CLERK_ID, email=OWNER_EMAIL, role="student"
    )

    res_owner = client.get(f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-summary")
    assert res_owner.status_code == 200, res_owner.text
    summary = res_owner.json()
    assert summary["attempt_id"] == str(ATTEMPT_ID)
    assert summary["proctoring_consent"] is True
    assert len(summary["events"]) >= 1
    assert len(summary["evidence"]) >= 1
    assert len(summary["reviews"]) >= 1
    assert len(summary["audit_trail"]) >= 1

    # 2. Unauthorized candidate attempts retrieval -> 403 Forbidden
    app.dependency_overrides[get_db_user] = lambda: User(
        id=UNAUTHORIZED_USER_ID, clerk_id=UNAUTHORIZED_CLERK_ID, email=UNAUTHORIZED_EMAIL, role="student"
    )

    res_unauth = client.get(f"/api/v1/examinations/attempts/{ATTEMPT_ID}/proctoring-summary")
    assert res_unauth.status_code == 403, f"Expected 403 Forbidden for unauthorized user, got {res_unauth.status_code}"
