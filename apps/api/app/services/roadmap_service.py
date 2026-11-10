from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.skill import CandidateSkill, CanonicalSkill
from app.models.roadmap import CareerRoadmap, RoadmapMilestone

ROLE_TAXONOMIES: Dict[str, List[Dict[str, Any]]] = {
    "Full-Stack Software Engineer": [
        {"name": "Python", "weight": 1.0, "target_proficiency": 0.8, "prereq": []},
        {"name": "JavaScript", "weight": 1.0, "target_proficiency": 0.8, "prereq": []},
        {"name": "TypeScript", "weight": 0.9, "target_proficiency": 0.75, "prereq": ["JavaScript"]},
        {"name": "HTML5 & CSS3", "weight": 0.8, "target_proficiency": 0.8, "prereq": []},
        {"name": "React", "weight": 1.0, "target_proficiency": 0.8, "prereq": ["JavaScript", "HTML5 & CSS3"]},
        {"name": "Next.js", "weight": 0.85, "target_proficiency": 0.75, "prereq": ["React", "TypeScript"]},
        {"name": "FastAPI", "weight": 0.9, "target_proficiency": 0.75, "prereq": ["Python"]},
        {"name": "PostgreSQL", "weight": 1.0, "target_proficiency": 0.8, "prereq": ["SQL"]},
        {"name": "SQL", "weight": 0.85, "target_proficiency": 0.8, "prereq": []},
        {"name": "RESTful API Design", "weight": 0.9, "target_proficiency": 0.8, "prereq": []},
        {"name": "Docker", "weight": 0.85, "target_proficiency": 0.7, "prereq": ["Linux"]},
        {"name": "Linux", "weight": 0.75, "target_proficiency": 0.7, "prereq": []},
        {"name": "Git & Version Control", "weight": 0.9, "target_proficiency": 0.85, "prereq": []},
        {"name": "Data Structures & Algorithms", "weight": 0.85, "target_proficiency": 0.7, "prereq": ["Python"]},
        {"name": "System Design & Architecture", "weight": 0.85, "target_proficiency": 0.65, "prereq": ["PostgreSQL", "FastAPI", "Docker"]},
    ],
    "AI / Machine Learning Engineer": [
        {"name": "Python", "weight": 1.0, "target_proficiency": 0.9, "prereq": []},
        {"name": "Data Structures & Algorithms", "weight": 0.85, "target_proficiency": 0.75, "prereq": ["Python"]},
        {"name": "NumPy", "weight": 0.85, "target_proficiency": 0.85, "prereq": ["Python"]},
        {"name": "Pandas", "weight": 0.85, "target_proficiency": 0.85, "prereq": ["Python"]},
        {"name": "Scikit-Learn", "weight": 0.9, "target_proficiency": 0.8, "prereq": ["Pandas", "NumPy"]},
        {"name": "Machine Learning", "weight": 1.0, "target_proficiency": 0.85, "prereq": ["Scikit-Learn"]},
        {"name": "Deep Learning", "weight": 0.95, "target_proficiency": 0.8, "prereq": ["Machine Learning"]},
        {"name": "PyTorch", "weight": 0.95, "target_proficiency": 0.8, "prereq": ["Deep Learning"]},
        {"name": "Large Language Models (LLMs)", "weight": 0.95, "target_proficiency": 0.8, "prereq": ["Deep Learning"]},
        {"name": "Retrieval-Augmented Generation (RAG)", "weight": 0.9, "target_proficiency": 0.8, "prereq": ["Large Language Models (LLMs)"]},
        {"name": "pgvector", "weight": 0.8, "target_proficiency": 0.7, "prereq": ["PostgreSQL"]},
        {"name": "PostgreSQL", "weight": 0.8, "target_proficiency": 0.7, "prereq": []},
        {"name": "FastAPI", "weight": 0.85, "target_proficiency": 0.75, "prereq": ["Python"]},
        {"name": "Docker", "weight": 0.8, "target_proficiency": 0.7, "prereq": []},
    ],
    "Frontend Engineer (React/Next.js)": [
        {"name": "HTML5 & CSS3", "weight": 1.0, "target_proficiency": 0.9, "prereq": []},
        {"name": "JavaScript", "weight": 1.0, "target_proficiency": 0.9, "prereq": []},
        {"name": "TypeScript", "weight": 0.95, "target_proficiency": 0.85, "prereq": ["JavaScript"]},
        {"name": "React", "weight": 1.0, "target_proficiency": 0.9, "prereq": ["JavaScript"]},
        {"name": "Next.js", "weight": 0.9, "target_proficiency": 0.85, "prereq": ["React", "TypeScript"]},
        {"name": "Tailwind CSS", "weight": 0.85, "target_proficiency": 0.85, "prereq": ["HTML5 & CSS3"]},
        {"name": "Redux", "weight": 0.75, "target_proficiency": 0.7, "prereq": ["React"]},
        {"name": "RESTful API Design", "weight": 0.85, "target_proficiency": 0.8, "prereq": []},
        {"name": "UI/UX Design", "weight": 0.8, "target_proficiency": 0.75, "prereq": []},
        {"name": "Git & Version Control", "weight": 0.9, "target_proficiency": 0.85, "prereq": []},
    ],
    "Backend Systems Engineer (Python/Go)": [
        {"name": "Python", "weight": 1.0, "target_proficiency": 0.85, "prereq": []},
        {"name": "Go", "weight": 0.85, "target_proficiency": 0.75, "prereq": []},
        {"name": "FastAPI", "weight": 0.95, "target_proficiency": 0.85, "prereq": ["Python"]},
        {"name": "PostgreSQL", "weight": 1.0, "target_proficiency": 0.85, "prereq": ["SQL"]},
        {"name": "SQL", "weight": 0.9, "target_proficiency": 0.85, "prereq": []},
        {"name": "Redis", "weight": 0.85, "target_proficiency": 0.75, "prereq": []},
        {"name": "System Design & Architecture", "weight": 1.0, "target_proficiency": 0.8, "prereq": ["PostgreSQL", "FastAPI"]},
        {"name": "Data Structures & Algorithms", "weight": 0.9, "target_proficiency": 0.8, "prereq": ["Python"]},
        {"name": "Docker", "weight": 0.9, "target_proficiency": 0.8, "prereq": ["Linux"]},
        {"name": "Kubernetes", "weight": 0.8, "target_proficiency": 0.7, "prereq": ["Docker"]},
        {"name": "CI/CD Pipelines", "weight": 0.85, "target_proficiency": 0.75, "prereq": ["Docker"]},
        {"name": "Linux", "weight": 0.8, "target_proficiency": 0.75, "prereq": []},
    ]
}

# Fallback default taxonomy for unlisted roles
DEFAULT_ROLE_TAXONOMY = ROLE_TAXONOMIES["Full-Stack Software Engineer"]

def calculate_skill_gap_analysis(
    user: User,
    target_role: str
) -> Dict[str, Any]:
    """
    Algorithm B: Evidence-Weighted Skill Gap Scoring.
    Evaluates candidate capability against benchmark role taxonomy.
    """
    taxonomy = ROLE_TAXONOMIES.get(target_role, DEFAULT_ROLE_TAXONOMY)
    
    # Map candidate skills by canonical skill name lowercase
    candidate_skills_map: Dict[str, CandidateSkill] = {}
    for cs in user.candidate_skills:
        candidate_skills_map[cs.canonical_skill.name.lower()] = cs

    total_weighted_target = 0.0
    total_weighted_gap = 0.0
    skill_breakdown = []

    for req in taxonomy:
        skill_name = req["name"]
        weight = req["weight"]
        target_prof = req["target_proficiency"]
        prereqs = req["prereq"]

        cs = candidate_skills_map.get(skill_name.lower())
        current_prof = cs.proficiency if cs else 0.0
        confidence = cs.confidence if cs else 0.4
        state = cs.state if cs else "UNMAPPED"

        gap = max(0.0, target_prof - current_prof)
        # Confidence penalty factor: (2.0 - confidence). Lower confidence inflates the perceived gap.
        weighted_gap = weight * gap * (2.0 - confidence)

        total_weighted_target += weight * target_prof
        total_weighted_gap += weight * gap

        skill_breakdown.append({
            "skill_name": skill_name,
            "target_proficiency": target_prof,
            "current_proficiency": current_prof,
            "gap": round(gap, 2),
            "state": state,
            "confidence": round(confidence, 2),
            "weight": weight,
            "prerequisites": prereqs,
            "is_met": gap <= 0.1
        })

    readiness = 0.0
    if total_weighted_target > 0:
        readiness = max(0.0, min(100.0, (1.0 - (total_weighted_gap / total_weighted_target)) * 100.0))

    return {
        "target_role": target_role,
        "readiness_score": round(readiness, 1),
        "total_skills_required": len(taxonomy),
        "skills_met_count": sum(1 for s in skill_breakdown if s["is_met"]),
        "skills_breakdown": skill_breakdown
    }

def synthesize_career_roadmap(
    db: Session,
    user: User,
    target_role: str,
    weekly_hours: int = 10
) -> CareerRoadmap:
    """
    Algorithm C: Topological Sorting Roadmap Synthesizer.
    Generates an ordered 3-phase career roadmap based on gap analysis.
    """
    gap_analysis = calculate_skill_gap_analysis(user, target_role)
    readiness = gap_analysis["readiness_score"]
    skills_breakdown = gap_analysis["skills_breakdown"]

    # Filter skills with notable gap
    gap_skills = [s for s in skills_breakdown if s["gap"] > 0.15]
    if not gap_skills:
        # If user has met all gaps, include advanced mastery
        gap_skills = skills_breakdown

    # Phase 1: Core Languages & Prerequisites
    phase_1_skills = [
        s["skill_name"] for s in gap_skills 
        if not s["prerequisites"] or any(p in ["Python", "JavaScript", "HTML5 & CSS3", "Linux", "SQL"] for p in [s["skill_name"]])
    ][:4]
    if not phase_1_skills:
        phase_1_skills = [gap_skills[0]["skill_name"]] if gap_skills else ["Python"]

    # Phase 2: Frameworks, APIs & Databases
    phase_2_candidates = [
        s["skill_name"] for s in gap_skills 
        if s["skill_name"] not in phase_1_skills and (
            any(p in phase_1_skills for p in s["prerequisites"]) or 
            s["skill_name"] in ["React", "FastAPI", "PostgreSQL", "Docker", "Machine Learning", "RESTful API Design"]
        )
    ][:4]
    if not phase_2_candidates:
        phase_2_candidates = ["FastAPI", "PostgreSQL"]

    # Phase 3: Advanced Architecture, Projects & Portfolio
    phase_3_candidates = [
        s["skill_name"] for s in gap_skills 
        if s["skill_name"] not in phase_1_skills and s["skill_name"] not in phase_2_candidates
    ]
    if not phase_3_candidates:
        phase_3_candidates = ["System Design & Architecture", "CI/CD Pipelines", "Docker"]

    total_weeks = 12 if weekly_hours >= 10 else 16

    roadmap = CareerRoadmap(
        id=uuid.uuid4(),
        user_id=user.id,
        target_role=target_role,
        title=f"{target_role} Growth Roadmap",
        description=f"Personalized competency-building journey from {readiness}% readiness to production job-grade capability.",
        overall_readiness_score=readiness,
        total_estimated_weeks=total_weeks,
        weekly_hours=weekly_hours,
        status="ACTIVE",
        summary_metadata={
            "initial_readiness": readiness,
            "weekly_hours": weekly_hours,
            "gap_analysis": gap_analysis
        }
    )
    db.add(roadmap)
    db.flush()

    # Milestone 1
    m1 = RoadmapMilestone(
        roadmap_id=roadmap.id,
        phase_number=1,
        title="Phase 1: Foundations & Core Architecture",
        description="Master fundamental language mechanics, data structures, and foundational workflows.",
        order_index=1,
        status="IN_PROGRESS",
        estimated_weeks=4,
        target_skills=phase_1_skills,
        learning_modules=[
            {"title": "Core Syntax & Idiomatic Code Patterns", "duration_hours": 8, "type": "interactive"},
            {"title": "Data Structures & Algorithmic Complexity", "duration_hours": 12, "type": "problem_solving"},
            {"title": "Modern Tooling & Git Workflows", "duration_hours": 4, "type": "practical"}
        ],
        project_deliverable={
            "title": f"{phase_1_skills[0]} High-Throughput CLI Utility",
            "description": "Design and build an automated CLI tool with logging, error handling, and test coverage.",
            "rubric": ["Unit tests >= 80%", "Clean modular architecture", "Clear README documentation"]
        }
    )
    db.add(m1)

    # Milestone 2
    m2 = RoadmapMilestone(
        roadmap_id=roadmap.id,
        phase_number=2,
        title="Phase 2: Full-Stack Services & Persistence",
        description="Build scalable backend endpoints, database relational schemas, and interactive user interfaces.",
        order_index=2,
        status="LOCKED",
        estimated_weeks=4,
        target_skills=phase_2_candidates,
        learning_modules=[
            {"title": "Relational Modeling & Query Optimization", "duration_hours": 10, "type": "database"},
            {"title": "Asynchronous RESTful APIs with Auth", "duration_hours": 12, "type": "backend"},
            {"title": "Containerization & Local Dev Environments", "duration_hours": 6, "type": "devops"}
        ],
        project_deliverable={
            "title": "Full-Stack Service with Authentication & Database",
            "description": "Construct an end-to-end service with JWT verification, database migrations, and reactive UI.",
            "rubric": ["Secure RBAC auth", "Alembic migrations verified", "FastAPI / Next.js integration"]
        }
    )
    db.add(m2)

    # Milestone 3
    m3 = RoadmapMilestone(
        roadmap_id=roadmap.id,
        phase_number=3,
        title="Phase 3: Production Hardening, System Design & Portfolio",
        description="Synthesize high-scale distributed architecture, caching, CI/CD pipelines, and demonstrable proof-of-work.",
        order_index=3,
        status="LOCKED",
        estimated_weeks=4,
        target_skills=phase_3_candidates,
        learning_modules=[
            {"title": "Distributed Caching & In-Memory Queues", "duration_hours": 8, "type": "architecture"},
            {"title": "System Design: Scalability & Fault Tolerance", "duration_hours": 10, "type": "system_design"},
            {"title": "CI/CD Deployment & Monitoring", "duration_hours": 6, "type": "production"}
        ],
        project_deliverable={
            "title": "Production-Grade Distributed Showcase App",
            "description": "Deploy a multi-tier application with automated testing, CI/CD pipeline, and public live demo.",
            "rubric": ["GitHub Actions CI passing", "Cloud deployed with health probes", "Live showcase URL"]
        }
    )
    db.add(m3)

    db.commit()
    db.refresh(roadmap)
    return roadmap

