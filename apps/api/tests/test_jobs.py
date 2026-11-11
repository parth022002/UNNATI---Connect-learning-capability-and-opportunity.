import sys
import uuid
from pathlib import Path
import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.db.session import get_db
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.skill import CanonicalSkill, CandidateSkill
from app.models.job import (
    JobSource,
    CanonicalJob,
    ExternalJobReference,
    SavedJob,
    JobApplicationActivity,
    UserJobPreferences
)
from app.services.job_adapters.adapter_registry import job_source_registry
from app.services.job_search_service import parse_natural_language_query
from app.services.job_recommendation_service import evaluate_job_match
from app.api.routes.users import get_db_user

client = TestClient(app)

TEST_USER_ID = uuid.uuid4()
TEST_CLERK_ID = f"clerk_job_{TEST_USER_ID.hex[:8]}"


@pytest.fixture(scope="module")
def db_session():
    db: Session = next(get_db())
    yield db


@pytest.fixture(scope="module")
def job_test_user(db_session: Session) -> User:
    user = User(
        id=TEST_USER_ID,
        clerk_id=TEST_CLERK_ID,
        email=f"candidate_job_{TEST_USER_ID.hex[:6]}@example.com",
        first_name="Pooja",
        last_name="Sharma",
        role="student",
        is_active=True
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        headline="Full-Stack Engineer & Python Developer",
        target_role="Software Development Engineer I (Backend)",
        location="Bengaluru",
        completeness_score=85
    )
    db_session.add(profile)

    # Add verified and assessed skills
    skills_data = [
        ("Java", "VERIFIED", 85.0),
        ("Python", "VERIFIED", 90.0),
        ("PostgreSQL", "VERIFIED", 80.0),
        ("Kafka", "ASSESSED", 75.0),
        ("Redis", "ASSESSED", 70.0),
        ("Docker", "CLAIMED", 65.0)
    ]
    for name, state, prof in skills_data:
        c_skill = db_session.scalar(select(CanonicalSkill).where(CanonicalSkill.name == name))
        if not c_skill:
            c_skill = CanonicalSkill(
                id=uuid.uuid4(),
                name=name,
                slug=name.lower().replace(" ", "-"),
                category="technical"
            )
            db_session.add(c_skill)
            db_session.flush()

        cs = CandidateSkill(
            id=uuid.uuid4(),
            user_id=user.id,
            canonical_skill_id=c_skill.id,
            state=state,
            proficiency=prof,
            confidence=0.85,
            evidence_count=2
        )
        db_session.add(cs)

    # Add experience record
    exp = ExperienceRecord(
        id=uuid.uuid4(),
        user_id=user.id,
        company_name="Tech Solutions India",
        title="Software Intern",
        start_date="2024-01-01",
        end_date="2024-07-01",
        is_current=False,
        description="Developed backend microservices using Python and PostgreSQL."
    )
    db_session.add(exp)

    # Add education
    edu = EducationRecord(
        id=uuid.uuid4(),
        user_id=user.id,
        institution_name="Indian Institute of Technology",
        degree="B.Tech Computer Science",
        field_of_study="Computer Science",
        start_year=2020,
        end_year=2024
    )
    db_session.add(edu)

    db_session.commit()
    app.dependency_overrides[get_db_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_db_user, None)


def test_job_source_synchronization_and_deduplication(db_session: Session):
    """Verifies that job sources sync canonical records and deduplicate identical postings."""
    # 1. Sync all sources
    logs = job_source_registry.synchronize_all(db_session, limit_per_source=20)
    assert len(logs) >= 3

    # Check that CanonicalJob records were created
    jobs = db_session.scalars(select(CanonicalJob)).all()
    assert len(jobs) >= 8

    # Verify Swiggy SDE-1 exists
    swiggy_job = db_session.scalar(
        select(CanonicalJob).where(CanonicalJob.company_name == "Swiggy")
    )
    assert swiggy_job is not None
    assert "Java" in swiggy_job.required_skills
    assert "Kafka" in swiggy_job.required_skills
    assert swiggy_job.city == "Bengaluru"
    assert swiggy_job.salary_currency == "INR"

    # Verify external references exist
    refs = db_session.scalars(
        select(ExternalJobReference).where(ExternalJobReference.canonical_job_id == swiggy_job.id)
    ).all()
    assert len(refs) >= 1
    assert refs[0].portal_name in ["Naukri", "Instahyre", "Cutshort"]

    # 2. Run sync second time -> should detect duplicates and NOT create new canonical jobs
    initial_job_count = len(jobs)
    second_logs = job_source_registry.synchronize_all(db_session, limit_per_source=20)
    final_job_count = len(db_session.scalars(select(CanonicalJob)).all())
    assert final_job_count == initial_job_count
    assert sum(l.duplicates_detected for l in second_logs) >= 8


def test_natural_language_search_query_parsing():
    """Verifies natural language query parsing into structured filters."""
    # Query 1
    q1 = "Find entry-level data analyst jobs in Bengaluru with salary above 8 LPA"
    p1 = parse_natural_language_query(q1)
    assert p1.get("experience_levels") == ["ENTRY"]
    assert "Bengaluru" in p1.get("cities", [])
    assert p1.get("min_salary") == 800000.0

    # Query 2: Remote internship
    q2 = "Find remote software engineer internships"
    p2 = parse_natural_language_query(q2)
    assert p2.get("workplace_types") == ["REMOTE"]
    assert p2.get("employment_types") == ["INTERNSHIP"]


def test_job_search_and_faceted_filtering(db_session: Session, job_test_user: User):
    """Verifies multi-faceted job search endpoint."""
    res = client.post(
        "/api/v1/jobs/search",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"},
        json={
            "q": "Swiggy",
            "cities": ["Bengaluru"],
            "page": 1,
            "limit": 10
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(j["company_name"] == "Swiggy" for j in data["jobs"])
    assert "available_facets" in data


def test_personalized_job_match_evaluation(db_session: Session, job_test_user: User):
    """Verifies 10-dimension explainable match engine on Swiggy SDE-1 role."""
    swiggy_job = db_session.scalar(
        select(CanonicalJob).where(CanonicalJob.company_name == "Swiggy")
    )
    assert swiggy_job is not None

    match_result = evaluate_job_match(swiggy_job, job_test_user, db_session)
    assert match_result.overall_match_percentage >= 70.0
    assert match_result.skills_match_score > 0
    assert len(match_result.matched_skills) >= 3
    assert any(m.skill in ["Java", "Python", "Kafka", "PostgreSQL"] for m in match_result.matched_skills)
    assert len(match_result.recommendation_explanation) > 20


def test_job_detail_endpoint(db_session: Session, job_test_user: User):
    """Verifies job detail endpoint returns external provenance and match analysis."""
    job = db_session.scalar(select(CanonicalJob).limit(1))
    assert job is not None

    res = client.get(
        f"/api/v1/jobs/{job.id}",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == job.title
    assert data["match_analysis"] is not None
    assert "overall_match_percentage" in data["match_analysis"]
    assert len(data["external_references"]) >= 1


def test_safe_apply_redirect_gateway(db_session: Session, job_test_user: User):
    """Verifies external application redirect gateway, URL safety, and telemetry tracking."""
    job = db_session.scalar(select(CanonicalJob).limit(1))
    assert job is not None

    initial_clicks = job.apply_click_count

    res = client.post(
        f"/api/v1/jobs/{job.id}/apply",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["tracked_status"] == "LINK_OPENED"
    assert data["destination_url"] == job.primary_application_url
    assert data["is_trusted_domain"] == True

    db_session.refresh(job)
    assert job.apply_click_count == initial_clicks + 1

    # Verify JobApplicationActivity was logged
    activity = db_session.scalar(
        select(JobApplicationActivity).where(
            JobApplicationActivity.user_id == job_test_user.id,
            JobApplicationActivity.canonical_job_id == job.id
        )
    )
    assert activity is not None
    assert activity.status == "LINK_OPENED"


def test_saved_jobs_lifecycle(db_session: Session, job_test_user: User):
    """Verifies bookmarking, notes, listing, and deletion of saved jobs."""
    job = db_session.scalar(select(CanonicalJob).limit(1))
    assert job is not None

    # 1. Save job
    res = client.post(
        f"/api/v1/jobs/{job.id}/save",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"},
        json={"notes": "Great tech stack, aligns with Kafka goals."}
    )
    assert res.status_code == 200

    # 2. List saved jobs
    res_list = client.get(
        "/api/v1/jobs/user/saved",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res_list.status_code == 200
    saved_items = res_list.json()
    assert len(saved_items) >= 1
    assert any(s["canonical_job_id"] == str(job.id) for s in saved_items)

    # 3. Remove saved job
    res_del = client.delete(
        f"/api/v1/jobs/{job.id}/save",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res_del.status_code == 204


def test_application_tracking_pipeline(db_session: Session, job_test_user: User):
    """Verifies candidate manual application tracking transitions."""
    job = db_session.scalar(select(CanonicalJob).limit(1))
    assert job is not None

    # Transition to APPLIED
    res = client.put(
        f"/api/v1/jobs/{job.id}/application-status",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"},
        json={"status": "APPLIED", "candidate_notes": "Submitted direct on portal with custom resume."}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "APPLIED"
    assert data["applied_at"] is not None

    # List applications
    res_list = client.get(
        "/api/v1/jobs/user/applications",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res_list.status_code == 200
    apps = res_list.json()
    assert len(apps) >= 1
    assert any(a["status"] == "APPLIED" for a in apps)


def test_candidate_job_preferences(db_session: Session, job_test_user: User):
    """Verifies setting and retrieving candidate job preferences."""
    res_put = client.put(
        "/api/v1/jobs/user/preferences",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"},
        json={
            "target_roles": ["Backend Engineer", "Software Engineer"],
            "preferred_locations": ["Bengaluru", "Hyderabad"],
            "workplace_types": ["HYBRID", "REMOTE"],
            "min_salary": 1200000.0,
            "experience_level": "ENTRY"
        }
    )
    assert res_put.status_code == 200
    data = res_put.json()
    assert "Bengaluru" in data["preferred_locations"]
    assert data["min_salary"] == 1200000.0

    res_get = client.get(
        "/api/v1/jobs/user/preferences",
        headers={"Authorization": f"Bearer clerk_{job_test_user.id.hex}"}
    )
    assert res_get.status_code == 200
    get_data = res_get.json()
    assert get_data["min_salary"] == 1200000.0


def test_admin_source_monitoring(db_session: Session):
    """Verifies administrative view of source integrations and manual trigger."""
    res = client.get("/api/v1/jobs/admin/sources")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 3
    assert any(s["source_code"] == "indian_curated_feed" for s in sources)
    assert any(s["source_code"] == "ncs_india" for s in sources)
    assert any(s["source_code"] == "remoteok" for s in sources)
