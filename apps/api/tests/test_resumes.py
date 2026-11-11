import io
import sys
import uuid
from pathlib import Path
import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.testclient import TestClient
import docx

# Ensure apps/api is in python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.db.session import get_db
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.skill import CanonicalSkill, CandidateSkill
from app.models.resume import (
    Resume,
    ResumeVersion,
    ResumeATSReport,
    JobDescription,
    ResumeJDMatch,
)
from app.services.resume_service import (
    create_initial_resume,
    analyze_resume_ats,
    extract_text_from_docx,
    extract_job_description_intelligence,
    match_resume_to_job_description,
    enhance_text_with_ai,
    export_resume_to_pdf,
    export_resume_to_docx,
)

client = TestClient(app)

TEST_USER_ID = uuid.uuid4()
TEST_CLERK_ID = f"clerk_resume_{TEST_USER_ID.hex[:8]}"


@pytest.fixture(scope="module")
def db_session():
    """Provides a database session for test execution."""
    db: Session = next(get_db())
    yield db


@pytest.fixture(scope="module")
def resume_test_user(db_session: Session) -> User:
    """Creates a mock test candidate with profile and skills."""
    user = User(
        id=TEST_USER_ID,
        clerk_id=TEST_CLERK_ID,
        email=f"candidate_{TEST_USER_ID.hex[:6]}@example.com",
        first_name="Arjun",
        last_name="Sharma",
        role="student",
        is_active=True
    )
    db_session.add(user)
    db_session.flush()

    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        headline="Full Stack & AI Engineer",
        target_role="Full Stack Engineer",
        phone="+91-9876543210",
        location="Bengaluru, India",
        linkedin_url="https://linkedin.com/in/arjunsharma",
        github_url="https://github.com/arjunsharma",
        bio="Passionate engineer building distributed systems and high-scale cloud platforms.",
        experience_years=2.5,
        completeness_score=85
    )
    db_session.add(profile)

    # Education
    edu = EducationRecord(
        id=uuid.uuid4(),
        user_id=user.id,
        institution_name="Indian Institute of Technology",
        degree="B.Tech",
        field_of_study="Computer Science",
        start_year=2020,
        end_year=2024,
        grade_or_gpa="8.9 CGPA"
    )
    db_session.add(edu)

    # Experience
    exp = ExperienceRecord(
        id=uuid.uuid4(),
        user_id=user.id,
        company_name="TechCorp Solutions",
        title="Software Engineer Intern",
        location="Bengaluru",
        start_date="2023-01-01",
        end_date="2023-07-31",
        is_current=False,
        description="Developed asynchronous microservices and optimized PostgreSQL database queries."
    )
    db_session.add(exp)

    # Canonical Skills
    for s_name, s_cat in [("Python", "backend"), ("React", "frontend"), ("PostgreSQL", "database"), ("Problem Solving", "analytical")]:
        c_skill = db_session.scalar(select(CanonicalSkill).where(CanonicalSkill.name == s_name))
        if not c_skill:
            c_skill = CanonicalSkill(
                id=uuid.uuid4(),
                name=s_name,
                slug=s_name.lower().replace(" ", "-"),
                category=s_cat
            )
            db_session.add(c_skill)
            db_session.flush()

        cand_s = CandidateSkill(
            id=uuid.uuid4(),
            user_id=user.id,
            canonical_skill_id=c_skill.id,
            state="VERIFIED",
            proficiency=0.8
        )
        db_session.add(cand_s)

    db_session.commit()
    db_session.refresh(user)
    return user


def test_create_resume_and_initial_version(db_session: Session, resume_test_user: User):
    """Verifies creating a structured resume with an initial version imported from user profile."""
    resume, version = create_initial_resume(
        db=db_session,
        user=resume_test_user,
        title="Software Engineering Resume",
        target_role="Full Stack Engineer",
        template_id="classic_professional",
        import_from_profile=True
    )

    assert resume.id is not None
    assert resume.user_id == resume_test_user.id
    assert resume.title == "Software Engineering Resume"
    assert resume.target_role == "Full Stack Engineer"
    assert resume.is_primary is True

    assert version.resume_id == resume.id
    assert version.version_number == 1
    assert version.personal_info["full_name"] == "Arjun Sharma"
    assert version.personal_info["email"] == resume_test_user.email
    assert version.personal_info["linkedin_url"] == "https://linkedin.com/in/arjunsharma"
    assert len(version.education) >= 1
    assert len(version.work_experience) >= 1
    assert "Python" in version.technical_skills
    assert version.latest_ats_score is not None


def test_ats_analysis_scoring_dimensions(db_session: Session, resume_test_user: User):
    """Verifies the 16-dimension ATS compatibility checker and actionable findings."""
    resume, version = create_initial_resume(
        db=db_session,
        user=resume_test_user,
        title="ATS Test Resume",
        target_role="Software Engineer"
    )

    ats_result = analyze_resume_ats(version, target_role="Software Engineer")

    assert "overall_score" in ats_result
    assert 40.0 <= ats_result["overall_score"] <= 100.0
    assert ats_result["readiness_level"] in ["Exceptional", "Competitive", "Needs Improvement", "Critical Issues"]

    scores = ats_result["dimension_scores"]
    assert "contact_completeness" in scores
    assert "structure_organization" in scores
    assert "summary_quality" in scores
    assert "skills_presentation" in scores
    assert "experience_clarity" in scores
    assert "formatting_consistency" in scores

    # Recommendations and warnings
    assert isinstance(ats_result["actionable_recommendations"], list)
    assert isinstance(ats_result["formatting_warnings"], list)


def test_docx_text_extraction():
    """Verifies extracting clean, machine-readable text from DOCX files."""
    doc = docx.Document()
    doc.add_heading("Arjun Sharma — Software Engineer", level=0)
    doc.add_paragraph("Experienced in building scalable microservices with Python and FastAPI.")
    doc.add_paragraph("Spearheaded database query optimization reducing p99 latency by 40%.")

    buf = io.BytesIO()
    doc.save(buf)
    file_bytes = buf.getvalue()

    extracted = extract_text_from_docx(file_bytes)
    assert "Arjun Sharma" in extracted
    assert "FastAPI" in extracted
    assert "latency by 40%" in extracted


def test_job_description_intelligence_extraction(db_session: Session):
    """Verifies extracting structured requirements (mandatory vs preferred) from raw JD text."""
    jd_raw = """
    Senior Python Backend Engineer — Razorpay
    Location: Bengaluru / Remote
    Experience: 3-5 years of experience in backend development.

    Responsibilities:
    - Design and architect distributed payment ingestion systems.
    - Build fault-tolerant microservices handling 10,000 requests per second.

    Requirements:
    - Strong proficiency in Python, PostgreSQL, and Git.
    - Deep knowledge of REST APIs and Docker.
    - Preferred: Experience with Kubernetes and Redis caching.
    - Bachelor's degree in Computer Science or related technical discipline.
    """

    intel = extract_job_description_intelligence(jd_raw, db_session)

    assert "title" in intel
    assert "Python" in str(intel)
    assert "mandatory_skills" in intel
    assert isinstance(intel["mandatory_skills"], list)
    assert len(intel["mandatory_skills"]) > 0


def test_semantic_resume_jd_matching(db_session: Session, resume_test_user: User):
    """Verifies matching resume version against a JD with transparent evidence and roadmap recommendations."""
    resume, version = create_initial_resume(
        db=db_session,
        user=resume_test_user,
        title="Full Stack Resume",
        import_from_profile=True
    )

    jd = JobDescription(
        id=uuid.uuid4(),
        user_id=resume_test_user.id,
        title="Full Stack Software Engineer",
        company="Razorpay",
        raw_text="Looking for a Full Stack Engineer with Python, React, PostgreSQL, Docker, and Redis.",
        extracted_intelligence={
            "mandatory_skills": ["Python", "React", "PostgreSQL"],
            "preferred_skills": ["Docker", "Redis"],
            "experience_requirement_years": 2.0
        }
    )
    db_session.add(jd)
    db_session.commit()

    match_report = match_resume_to_job_description(version, jd, db_session)

    assert "overall_match_score" in match_report
    assert 20.0 <= match_report["overall_match_score"] <= 100.0

    # Dimensions
    assert match_report["skill_alignment_score"] > 50.0
    assert match_report["education_alignment_score"] >= 80.0

    # Matched skills with evidence classification
    matched_names = [s["name"] for s in match_report["matched_skills"]]
    assert "Python" in matched_names or "React" in matched_names
    for m in match_report["matched_skills"]:
        assert m["evidence_type"] in ["DIRECT_EXPERIENCE", "PROJECT", "INFERRED"]

    # Improvements & Learning Recommendations
    assert len(match_report["improvement_suggestions"]) > 0
    assert len(match_report["learning_recommendations"]) > 0
    assert any("Mastery" in r["module_name"] or "Applied" in r["module_name"] for r in match_report["learning_recommendations"])


def test_ai_writing_assist_enhancer():
    """Verifies AI/heuristic writing enhancement of weak bullet points into STAR accomplishment statements."""
    raw_bullet = "worked on building react user interfaces and fixed bugs."
    result = enhance_text_with_ai(
        action_type="enhance_bullet",
        context_text=raw_bullet,
        role_or_target="Frontend Developer"
    )

    assert result["action_type"] == "enhance_bullet"
    assert result["original"] == raw_bullet
    assert len(result["enhanced"]) > len(raw_bullet)
    assert any(verb in result["enhanced"] for verb in ["Engineered", "Architected", "Spearheaded", "Optimized", "Developed"])


def test_export_resume_to_pdf_and_docx(db_session: Session, resume_test_user: User):
    """Verifies generating binary ATS-compliant exports in PDF (ReportLab) and DOCX (python-docx)."""
    resume, version = create_initial_resume(
        db=db_session,
        user=resume_test_user,
        title="Exportable Resume",
        import_from_profile=True
    )

    # 1. PDF Export
    pdf_bytes = export_resume_to_pdf(version)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")

    # 2. DOCX Export
    docx_bytes = export_resume_to_docx(version)
    assert len(docx_bytes) > 1000
    # DOCX files are standard PK zip archives
    assert docx_bytes.startswith(b"PK")
