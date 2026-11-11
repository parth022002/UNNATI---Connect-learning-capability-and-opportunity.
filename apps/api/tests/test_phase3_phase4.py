import pytest
import uuid
from starlette.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import get_db
from app.models.user import User, UserProfile
from app.models.skill import CandidateSkill
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.services.roadmap_service import synthesize_career_roadmap
from app.api.routes.users import get_db_user

# Mock user dependency for testing authenticated endpoints
mock_user_id = uuid.uuid4()
mock_test_user = User(
    id=mock_user_id,
    clerk_id="user_test_phase3_phase4",
    email="learner.test@unnati.local",
    role="student"
)
mock_test_user.profile = UserProfile(
    id=uuid.uuid4(),
    user_id=mock_user_id,
    target_role="Full-Stack Software Engineer",
    headline="Aspiring Full-Stack Software Engineer"
)
mock_test_user.candidate_skills = []

def override_get_db_user():
    return mock_test_user

@pytest.fixture(scope="module")
def client():
    db_gen = get_db()
    db: Session = next(db_gen)
    existing = db.scalar(select(User).where(User.clerk_id == mock_test_user.clerk_id))
    if not existing:
        db.add(mock_test_user)
        db.commit()
        db.refresh(mock_test_user)
    else:
        mock_test_user.id = existing.id

    app.dependency_overrides[get_db_user] = lambda: mock_test_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# ==============================================================================
# PHASE 4: Assessments & Evidence Capture Tests
# ==============================================================================

def test_assessment_questions_endpoint(client):
    """Verifies questions retrieval and confirms private answer keys are NOT exposed."""
    response = client.get("/api/v1/assessments/questions")
    assert response.status_code == 200
    questions = response.json()
    assert len(questions) >= 4

    for q in questions:
        assert "id" in q
        assert "track" in q
        assert "skill" in q
        assert "difficulty" in q
        assert "prompt" in q
        assert "options" in q
        assert len(q["options"]) >= 2
        # Crucial security guarantee: answer key and explanation must NOT be leaked
        assert "correct_option_id" not in q
        assert "correctOptionId" not in q
        assert "explanation" not in q

def test_assessment_questions_filtering(client):
    """Verifies track filtering for assessments."""
    response = client.get("/api/v1/assessments/questions?track=business")
    assert response.status_code == 200
    questions = response.json()
    assert len(questions) > 0
    for q in questions:
        assert q["track"] == "business"

def test_assessment_submit_and_bayesian_advancement(client):
    """
    Submits an answer, verifies grading, explanation, and Bayesian promotion
    of the candidate skill to ASSESSED state.
    """
    # Question 1: correct answer is B
    payload = {
        "question_id": 1,
        "selected_option_id": "B",
        "time_taken_seconds": 45
    }
    response = client.post("/api/v1/assessments/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_correct"] is True
    assert data["correct_option_id"] == "B"
    assert data["score"] == 1.0
    assert len(data["explanation"]) > 20
    assert len(data["practical_takeaway"]) > 10
    assert data["skill_update"] is not None
    assert data["skill_update"]["state"] == "ASSESSED"
    assert data["skill_update"]["proficiency"] >= 0.8

def test_interview_prep_questions(client):
    """Verifies role-specific interview prep scenarios and rubrics."""
    response = client.get("/api/v1/assessments/interview-prep?role=Software")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    item = items[0]
    assert "Full-Stack Software Engineer" in item["role"]
    assert len(item["evaluation_rubric"]) >= 3
    assert len(item["sample_approach"]) > 20
    assert len(item["tips"]) >= 2

# ==============================================================================
# PHASE 4: AI Career Companion Tests
# ==============================================================================

def test_ai_companion_chat_grounded_response(client):
    """Verifies grounded Socratic responses and deep-link actions."""
    payload = {
        "message": "What skills do I need for Product Management?",
        "category": "business"
    }
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Product Manager" in data["reply"] or "Product Management" in data["reply"]
    assert "RICE" in data["reply"]
    assert len(data["sources"]) > 0
    assert any("O*NET" in s or "Product" in s or "UNNATI" in s for s in data["sources"])
    assert data["suggested_action"] is not None
    assert data["suggested_action"]["href"] in ["/explore", "/roadmap", "/assessments"]
    assert len(data["suggested_prompts"]) >= 2

def test_ai_companion_chat_roadmap_guidance(client):
    """Verifies personalized roadmap guidance when asking about next steps."""
    payload = {
        "message": "How is my progress and what should I learn next in my roadmap?",
        "category": "tech"
    }
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 50
    assert data["suggested_action"] is not None
    assert data["suggested_action"]["href"] == "/roadmap"

# ==============================================================================
# PHASE 3: Roadmap Progress Tracking Tests
# ==============================================================================

def test_roadmap_progress_toggle_and_milestone_advancement():
    """
    Tests module completion toggles and automatic milestone progression.
    Uses direct session to verify DB transactions.
    """
    db_gen = get_db()
    db: Session = next(db_gen)
    try:
        # Create test user in DB
        unique_id = uuid.uuid4().hex[:8]
        test_user = User(
            clerk_id=f"user_test_progress_{unique_id}",
            email=f"progress_{unique_id}@unnati.local",
            role="student"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        # Synthesize roadmap
        roadmap = synthesize_career_roadmap(
            db=db,
            user=test_user,
            target_role="Full-Stack Software Engineer",
            weekly_hours=10
        )
        assert len(roadmap.milestones) == 3
        m1 = roadmap.milestones[0]
        m2 = roadmap.milestones[1]

        assert m1.status == "IN_PROGRESS"
        assert m2.status == "LOCKED"
        assert len(m1.learning_modules) >= 3

        # Override user for client call
        app.dependency_overrides[get_db_user] = lambda: test_user
        with TestClient(app) as local_client:
            # 1. Toggle first module in milestone 1
            res1 = local_client.post(
                f"/api/v1/roadmaps/{roadmap.id}/milestones/{m1.id}/modules/0/toggle",
                json={"completed": True}
            )
            assert res1.status_code == 200
            data1 = res1.json()
            assert data1["completed_modules_count"] == 1
            assert data1["milestone_completion_percentage"] > 0.0

            # 2. Complete all modules in milestone 1 to trigger auto-unlock of milestone 2
            total_m1_mods = len(m1.learning_modules)
            for idx in range(1, total_m1_mods):
                local_client.post(
                    f"/api/v1/roadmaps/{roadmap.id}/milestones/{m1.id}/modules/{idx}/toggle",
                    json={"completed": True}
                )

            # Re-fetch milestone 2 to confirm it unlocked
            db.refresh(m1)
            db.refresh(m2)
            assert m1.status == "COMPLETED"
            assert m2.status == "IN_PROGRESS"

            # 3. Test explicit status update endpoint
            patch_res = local_client.patch(
                f"/api/v1/roadmaps/{roadmap.id}/milestones/{m2.id}",
                json={"status": "COMPLETED"}
            )
            assert patch_res.status_code == 200
            assert patch_res.json()["status"] == "COMPLETED"

    finally:
        app.dependency_overrides.clear()
