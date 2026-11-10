import pytest
import hashlib
import json
from app.services.roadmap_service import (
    ROLE_TAXONOMIES,
    calculate_skill_gap_analysis
)
from app.models.user import User, UserProfile
from app.services.audit_service import calculate_sha256, GENESIS_HASH

def test_algorithm_b_skill_gap_calculation():
    """Validates Algorithm B evidence-weighted skill gap scoring."""
    target_role = "Full-Stack Software Engineer"
    # Create test user with no pre-existing skills
    user = User(
        clerk_id="user_test_alg_b",
        email="learner@test.local",
        role="student"
    )
    user.candidate_skills = []

    res = calculate_skill_gap_analysis(user, target_role)
    assert res["target_role"] == target_role
    assert 0.0 <= res["readiness_score"] <= 100.0
    assert res["total_skills_required"] > 0
    assert len(res["skills_breakdown"]) > 0

def test_topological_taxonomy_dag_cycle_freedom():
    """Guarantees all role taxonomies in Algorithm C are acyclic directed graphs (no circular prerequisites)."""
    for role_name, skills in ROLE_TAXONOMIES.items():
        prereq_map = {s["name"]: s["prereq"] for s in skills}
        visited = set()
        recursion_stack = set()

        def has_cycle(node):
            visited.add(node)
            recursion_stack.add(node)
            for prereq in prereq_map.get(node, []):
                if prereq in prereq_map:
                    if prereq not in visited:
                        if has_cycle(prereq):
                            return True
                    elif prereq in recursion_stack:
                        return True
            recursion_stack.remove(node)
            return False

        for skill in prereq_map:
            if skill not in visited:
                assert not has_cycle(skill), f"Circular prerequisite detected in role '{role_name}' at skill: {skill}"

def test_cryptographic_audit_hash_chain():
    """Validates SHA-256 Merkle hash chaining for tamper-evident audit logging."""
    prev_hash = GENESIS_HASH
    payload = {"action": "TEST_EVENT", "user": "learner_123"}
    serialized = json.dumps(payload, sort_keys=True)
    payload_hash = calculate_sha256(serialized)

    current_hash = calculate_sha256(f"{prev_hash}:{payload_hash}:TEST_EVENT")

    assert len(current_hash) == 64
    assert current_hash != prev_hash
    # Modifying payload must alter hash
    tampered_payload = json.dumps({"action": "TEST_EVENT", "user": "tampered_user"}, sort_keys=True)
    tampered_hash = calculate_sha256(f"{prev_hash}:{calculate_sha256(tampered_payload)}:TEST_EVENT")
    assert current_hash != tampered_hash
