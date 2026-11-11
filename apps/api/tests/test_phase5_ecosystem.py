import pytest
import uuid
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_institution_summary():
    """Verify Phase 5.1 Institution Summary endpoint."""
    response = client.get("/api/v1/institution/summary")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "code" in data
    assert "cohorts" in data
    assert len(data["cohorts"]) >= 2
    first_cohort = data["cohorts"][0]
    assert "id" in first_cohort
    assert "name" in first_cohort
    assert "department" in first_cohort
    assert first_cohort["total_students"] > 0

def test_institution_cohorts():
    """Verify Phase 5.1 Cohorts listing endpoint."""
    response = client.get("/api/v1/institution/cohorts")
    assert response.status_code == 200
    cohorts = response.json()
    assert isinstance(cohorts, list)
    assert len(cohorts) >= 2
    assert any("Computer Science" in c["department"] for c in cohorts)

def test_cohort_deep_analytics():
    """Verify Phase 5.1 Cohort Analytics and Curriculum Gap Detection."""
    # First get cohorts to retrieve valid ID
    cohorts_res = client.get("/api/v1/institution/cohorts")
    assert cohorts_res.status_code == 200
    cohort_id = cohorts_res.json()[0]["id"]

    response = client.get(f"/api/v1/institution/cohorts/{cohort_id}/analytics")
    assert response.status_code == 200
    analytics = response.json()
    assert analytics["cohort_id"] == cohort_id
    assert "distribution" in analytics
    assert len(analytics["distribution"]) == 3 # Job-Ready, Developing, Foundations
    assert "top_curriculum_gaps" in analytics
    assert len(analytics["top_curriculum_gaps"]) >= 2
    first_gap = analytics["top_curriculum_gaps"][0]
    assert "skill_name" in first_gap
    assert "importance" in first_gap
    assert "recommended_action" in first_gap
    assert first_gap["gap_percentage"] > 0

def test_talent_candidate_search_post():
    """Verify Phase 5.2 Employer Talent Search via POST filter."""
    payload = {
        "target_role": "Software Engineer",
        "required_skills": ["Python", "FastAPI"],
        "min_readiness_score": 60.0,
        "limit": 10
    }
    response = client.post("/api/v1/talent/candidates/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "total_matches" in data
    assert "candidates" in data
    assert len(data["candidates"]) >= 1
    cand = data["candidates"][0]
    assert "anonymized_identifier" in cand
    assert cand["anonymized_identifier"].startswith("Candidate #UN-")
    assert "readiness_score" in cand
    assert "verified_skills" in cand
    assert cand["dpdp_consent_verified"] is True
    assert cand["match_percentage"] >= 40.0

def test_talent_candidate_search_get():
    """Verify Phase 5.2 Employer Talent Search via GET query parameters."""
    response = client.get("/api/v1/talent/candidates/search?skills=SQL,Power BI&min_readiness=50")
    assert response.status_code == 200
    data = response.json()
    assert "candidates" in data
    assert isinstance(data["candidates"], list)

def test_opportunities_lifecycle():
    """Verify Phase 5.2 Opportunity creation and listing."""
    # 1. List existing
    r_list = client.get("/api/v1/talent/opportunities")
    assert r_list.status_code == 200
    initial_opps = r_list.json()
    assert isinstance(initial_opps, list)
    assert len(initial_opps) >= 1

    # 2. Create new opportunity
    new_opp_payload = {
        "title": "Cloud Backend Engineer Intern",
        "role_category": "Software Engineering",
        "location": "Bengaluru (Hybrid)",
        "employment_type": "Internship",
        "min_readiness_score": 70.0,
        "required_skills": ["Python", "Docker", "PostgreSQL"],
        "description": "Work on scalable distributed ingestion microservices.",
        "salary_range": "₹45,000 / month stipend"
    }
    r_create = client.post("/api/v1/talent/opportunities", json=new_opp_payload)
    assert r_create.status_code == 201
    created_opp = r_create.json()
    assert created_opp["title"] == new_opp_payload["title"]
    assert created_opp["min_readiness_score"] == 70.0
    assert "company_name" in created_opp
    assert created_opp["is_verified_company"] is True

def test_market_intelligence():
    """Verify Phase 5.3 Real-time Labor Market Intelligence endpoint."""
    response = client.get("/api/v1/analytics/market-intelligence?sector=technology")
    assert response.status_code == 200
    intel = response.json()
    assert intel["sector"] == "Technology & Software"
    assert "surging_skills" in intel
    assert len(intel["surging_skills"]) >= 3
    first_skill = intel["surging_skills"][0]
    assert "skill_name" in first_skill
    assert "industry_demand_index" in first_skill
    assert "market_gap" in first_skill
    assert "trend_direction" in first_skill
    assert "curriculum_blind_spots" in intel
    assert "quarterly_insight" in intel
