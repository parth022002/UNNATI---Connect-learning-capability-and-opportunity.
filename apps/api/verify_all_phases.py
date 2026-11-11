"""
UNNATI — End-to-End Master Verification Script for Phases 0 through 4
Verifies all functional pillars, algorithms, security headers, endpoints, and data contracts.
"""
import sys
import uuid
from starlette.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import get_db
from app.models.user import User, UserProfile
from app.models.skill import CandidateSkill, CanonicalSkill
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.services.roadmap_service import ROLE_TAXONOMIES, calculate_skill_gap_analysis
from app.services.audit_service import calculate_sha256, verify_audit_chain, GENESIS_HASH
from app.api.routes.users import get_db_user

def run_master_verification():
    print("=" * 80)
    print("UNNATI (उन्नति) — COMPREHENSIVE PHASES 0 TO 4 VERIFICATION SUITE")
    print("=" * 80)

    db_gen = get_db()
    db: Session = next(db_gen)

    # --------------------------------------------------------------------------
    # PHASE 0: FOUNDATION & SECURITY HEALTH
    # --------------------------------------------------------------------------
    print("\n[PHASE 0] Verifying Foundation, Health Probes & OWASP Headers...")
    with TestClient(app) as client:
        # 1. Root & Health
        r_root = client.get("/")
        assert r_root.status_code == 200, f"Root failed: {r_root.status_code}"
        assert r_root.json()["name"] == "UNNATI (उन्नति) API"
        print("  ✓ Root endpoint (/) operational: 200 OK")

        r_health = client.get("/health")
        assert r_health.status_code == 200, f"Health failed: {r_health.status_code}"
        assert r_health.json()["status"] == "healthy"
        print("  ✓ Health probe (/health) operational: 200 OK")

        r_email = client.get("/health/email")
        assert r_email.status_code == 200, f"Email health failed: {r_email.status_code}"
        print("  ✓ Email health probe (/health/email) operational: 200 OK")

        # 2. OWASP Headers
        headers = r_root.headers
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")
        print("  ✓ OWASP Security Headers verified (nosniff, DENY, XSS, HSTS)")

        # 3. Cryptographic Audit Chain
        audit_status = verify_audit_chain(db)
        assert audit_status["status"] == "verified"
        print(f"  ✓ Tamper-evident Merkle audit chain verified: {audit_status['total_events']} events chained to Genesis")

    # --------------------------------------------------------------------------
    # PHASE 1: LEARNER PROFILE & DOCUMENTS
    # --------------------------------------------------------------------------
    print("\n[PHASE 1] Verifying Learner Profile, Identity & Document Ingestion...")
    unique_suffix = uuid.uuid4().hex[:8]
    test_user = User(
        id=uuid.uuid4(),
        clerk_id=f"user_verify_{unique_suffix}",
        email=f"verify_{unique_suffix}@unnati.local",
        first_name="Parth",
        last_name="Ahuja",
        role="student"
    )
    db.add(test_user)
    db.flush()

    test_profile = UserProfile(
        id=uuid.uuid4(),
        user_id=test_user.id,
        target_role="Full-Stack Software Engineer",
        headline="Aspiring Full-Stack Software Engineer",
        bio="Passionate engineer learning distributed systems.",
        location="India"
    )
    db.add(test_profile)
    db.commit()
    db.refresh(test_user)
    print(f"  ✓ Candidate user & profile created: {test_user.email} (Target: {test_profile.target_role})")

    # --------------------------------------------------------------------------
    # PHASE 2: SKILLS TAXONOMY & DAG ACYCLICITY
    # --------------------------------------------------------------------------
    print("\n[PHASE 2] Verifying Canonical Skills, Aliases & Topological DAGs...")
    with TestClient(app) as client:
        r_skills = client.get("/api/v1/skills/canonical?q=python")
        assert r_skills.status_code == 200
        skills = r_skills.json()
        print(f"  ✓ Canonical skills endpoint (/api/v1/skills/canonical) returned {len(skills)} matches")

    # Verify DAG cycle freedom across all taxonomies
    for role_name, req_skills in ROLE_TAXONOMIES.items():
        prereq_map = {s["name"]: s["prereq"] for s in req_skills}
        visited, rec_stack = set(), set()
        def has_cycle(node):
            visited.add(node)
            rec_stack.add(node)
            for prereq in prereq_map.get(node, []):
                if prereq in prereq_map:
                    if prereq not in visited:
                        if has_cycle(prereq): return True
                    elif prereq in rec_stack: return True
            rec_stack.remove(node)
            return False
        for s in prereq_map:
            if s not in visited:
                assert not has_cycle(s), f"Cycle in {role_name} at {s}"
    print(f"  ✓ All {len(ROLE_TAXONOMIES)} role taxonomies mathematically validated as cycle-free DAGs")

    # --------------------------------------------------------------------------
    # PHASE 3: GAP ANALYSIS & ROADMAP PROGRESS TRACKING
    # --------------------------------------------------------------------------
    print("\n[PHASE 3] Verifying Algorithm B (Gap Analysis), Algorithm C (Roadmap) & Progress Tracking...")
    gap_result = calculate_skill_gap_analysis(test_user, "Full-Stack Software Engineer")
    assert "readiness_score" in gap_result
    assert gap_result["total_skills_required"] > 0
    print(f"  ✓ Algorithm B Gap Analysis computed: Readiness {gap_result['readiness_score']}% across {gap_result['total_skills_required']} skills")

    app.dependency_overrides[get_db_user] = lambda: test_user
    with TestClient(app) as client:
        # Generate roadmap
        r_gen = client.post("/api/v1/roadmaps/generate", json={"target_role": "Full-Stack Software Engineer", "weekly_hours": 10})
        assert r_gen.status_code == 201, f"Roadmap generation failed: {r_gen.status_code}"
        roadmap_data = r_gen.json()
        roadmap_id = roadmap_data["id"]
        milestones = roadmap_data["milestones"]
        assert len(milestones) == 3
        print(f"  ✓ Algorithm C Topologically Sorted Roadmap generated: ID {roadmap_id[:8]}... with {len(milestones)} milestones")

        m1_id = milestones[0]["id"]
        m2_id = milestones[1]["id"]
        assert milestones[0]["status"] == "IN_PROGRESS"
        assert milestones[1]["status"] == "LOCKED"

        # Toggle first module
        r_tog = client.post(f"/api/v1/roadmaps/{roadmap_id}/milestones/{m1_id}/modules/0/toggle", json={"completed": True})
        assert r_tog.status_code == 200
        prog1 = r_tog.json()
        assert prog1["completed_modules_count"] == 1
        print(f"  ✓ Module progress toggled: {prog1['completed_modules_count']}/{prog1['total_modules_count']} ({prog1['milestone_completion_percentage']}%)")

        # Complete all modules in milestone 1 to verify auto-unlock of milestone 2
        for idx in range(1, prog1["total_modules_count"]):
            client.post(f"/api/v1/roadmaps/{roadmap_id}/milestones/{m1_id}/modules/{idx}/toggle", json={"completed": True})

        r_get = client.get(f"/api/v1/roadmaps/{roadmap_id}")
        assert r_get.status_code == 200
        updated_roadmap = r_get.json()
        assert updated_roadmap["milestones"][0]["status"] == "COMPLETED"
        assert updated_roadmap["milestones"][1]["status"] == "IN_PROGRESS"
        print("  ✓ Milestone auto-unlock verified: Phase 1 -> COMPLETED, Phase 2 auto-unlocked to IN_PROGRESS")

    # --------------------------------------------------------------------------
    # PHASE 4: ASSESSMENTS, BAYESIAN SKILLS & AI CAREER ASSISTANT
    # --------------------------------------------------------------------------
    print("\n[PHASE 4] Verifying Assessments, Bayesian Calibration & AI Companion...")
    with TestClient(app) as client:
        # 1. Questions retrieval (keys must be hidden)
        r_q = client.get("/api/v1/assessments/questions?track=business")
        assert r_q.status_code == 200
        questions = r_q.json()
        assert len(questions) > 0
        assert "correct_option_id" not in questions[0]
        print(f"  ✓ Assessment question bank retrieved: {len(questions)} questions (Security verified: Answer keys omitted)")

        # 2. Submission & Bayesian skill promotion
        r_sub = client.post("/api/v1/assessments/submit", json={"question_id": 1, "selected_option_id": "B"})
        assert r_sub.status_code == 200
        sub_data = r_sub.json()
        assert sub_data["is_correct"] is True
        assert sub_data["skill_update"]["state"] == "ASSESSED"
        assert sub_data["skill_update"]["confidence"] >= 0.8
        print(f"  ✓ Assessment answer verified: Correct -> Skill '{sub_data['skill_update']['skill_name']}' promoted to ASSESSED state ({sub_data['skill_update']['confidence'] * 100}% Confidence)")

        # 3. Interview Prep Scenarios
        r_prep = client.get("/api/v1/assessments/interview-prep?role=Software")
        assert r_prep.status_code == 200
        prep_items = r_prep.json()
        assert len(prep_items) >= 1
        print(f"  ✓ Interview Prep Bank retrieved: {len(prep_items)} role-specific scenarios with rubrics & model approaches")

        # 4. Formative Socratic AI Companion
        r_ai = client.post("/api/v1/ai/chat", json={"message": "What skills do I need for Product Management?", "category": "business"})
        assert r_ai.status_code == 200
        ai_data = r_ai.json()
        assert len(ai_data["reply"]) > 50
        assert len(ai_data["sources"]) > 0
        assert ai_data["suggested_action"]["href"] in ["/explore", "/roadmap", "/assessments"]
        print(f"  ✓ AI Career Companion (/api/v1/ai/chat) operational: Grounded answer generated with {len(ai_data['sources'])} citations and action '{ai_data['suggested_action']['label']}'")

    print("\n" + "=" * 80)
    print("ALL PHASES (PHASE 0, 1, 2, 3, 4) VERIFIED AND WORKING PROPERLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_master_verification()
