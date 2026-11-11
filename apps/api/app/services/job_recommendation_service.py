import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.skill import CandidateSkill
from app.models.resume import Resume, ResumeVersion
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.models.job import CanonicalJob, UserJobPreferences
from app.schemas.job import JobMatchDetail, JobMatchSkillItem, JobMissingSkillItem


def evaluate_job_match(job: CanonicalJob, user: User, db: Session) -> JobMatchDetail:
    """
    Evaluates a CanonicalJob against candidate profile, resume, skills, roadmap,
    and preferences across 10 explainable dimensions.
    """
    profile: Optional[UserProfile] = user.profile
    prefs: Optional[UserJobPreferences] = db.scalar(
        select(UserJobPreferences).where(UserJobPreferences.user_id == user.id)
    )

    # 1. Fetch Candidate Skills
    candidate_skills = db.scalars(
        select(CandidateSkill).where(CandidateSkill.user_id == user.id)
    ).all()
    skill_map = {}
    for s in candidate_skills:
        s_name = s.canonical_skill.name if s.canonical_skill else None
        if s_name:
            skill_map[s_name.lower()] = s

    # Also extract skills from latest primary resume if available
    resume_skills_set = set()
    primary_resume = db.scalar(
        select(Resume).where(Resume.user_id == user.id, Resume.is_primary == True)
    )
    if not primary_resume:
        primary_resume = db.scalar(
            select(Resume).where(Resume.user_id == user.id).order_by(Resume.updated_at.desc())
        )
    if primary_resume and primary_resume.current_version:
        v = primary_resume.current_version
        for s in (v.technical_skills or []) + (v.business_skills or []):
            resume_skills_set.add(s.lower())

    # 2. Fetch Active Roadmap Skills
    roadmap = db.scalar(
        select(CareerRoadmap).where(CareerRoadmap.user_id == user.id).order_by(CareerRoadmap.created_at.desc())
    )
    roadmap_skills_in_progress = set()
    roadmap_milestones = []
    if roadmap:
        roadmap_milestones = db.scalars(
            select(RoadmapMilestone).where(RoadmapMilestone.roadmap_id == roadmap.id)
        ).all()
        for m in roadmap_milestones:
            for s in (m.target_skills or []):
                roadmap_skills_in_progress.add(s.lower())

    # =========================================================================
    # DIMENSION 1: SKILLS MATCH (25%)
    # =========================================================================
    req_skills = job.required_skills or []
    matched_skills: List[JobMatchSkillItem] = []
    missing_skills: List[JobMissingSkillItem] = []

    skills_score_sum = 0.0
    total_req_count = max(len(req_skills), 1)

    for skill in req_skills:
        s_lower = skill.lower()
        if s_lower in skill_map:
            cs = skill_map[s_lower]
            state_multiplier = {
                "VERIFIED": 1.0,
                "ASSESSED": 0.9,
                "CLAIMED": 0.7,
                "INFERRED": 0.5
            }.get(cs.state, 0.7)
            skills_score_sum += state_multiplier
            matched_skills.append(
                JobMatchSkillItem(
                    skill=skill,
                    evidence_state=cs.state,
                    confidence=cs.confidence or 0.8
                )
            )
        elif s_lower in resume_skills_set:
            skills_score_sum += 0.8
            matched_skills.append(
                JobMatchSkillItem(
                    skill=skill,
                    evidence_state="CLAIMED",
                    confidence=0.75
                )
            )
        else:
            in_roadmap = s_lower in roadmap_skills_in_progress
            suggested_module = None
            if in_roadmap:
                suggested_module = f"Mastery Module: {skill} Foundations & Practical Labs"
            missing_skills.append(
                JobMissingSkillItem(
                    skill=skill,
                    is_mandatory=True,
                    in_candidate_roadmap=in_roadmap,
                    suggested_module=suggested_module
                )
            )

    skills_match_score = min(round((skills_score_sum / total_req_count) * 100.0, 1), 100.0)

    # =========================================================================
    # DIMENSION 2: ROLE RELEVANCE (20%)
    # =========================================================================
    target_roles = []
    if profile and profile.target_role:
        target_roles.append(profile.target_role.lower())
    if prefs and prefs.target_roles:
        target_roles.extend([r.lower() for r in prefs.target_roles])

    job_title_lower = job.title.lower()
    role_relevance_score = 50.0 # baseline
    if target_roles:
        best_overlap = 0.0
        for tr in target_roles:
            tr_tokens = set(re.findall(r"\w+", tr))
            title_tokens = set(re.findall(r"\w+", job_title_lower))
            if tr_tokens:
                overlap = len(tr_tokens.intersection(title_tokens)) / len(tr_tokens)
                if overlap > best_overlap:
                    best_overlap = overlap
        role_relevance_score = round(min(best_overlap * 100.0 + 30.0, 100.0), 1)
    else:
        role_relevance_score = 65.0

    # =========================================================================
    # DIMENSION 3: EXPERIENCE COMPATIBILITY (15%)
    # =========================================================================
    candidate_exp_years = 0.0
    exp_records = getattr(user, "experience", None) or getattr(user, "experience_records", []) or []
    for exp in exp_records:
        if exp.start_date:
            # simple estimation
            candidate_exp_years += 1.0 # default baseline per record

    exp_min = job.experience_min_years or 0.0
    exp_max = job.experience_max_years or (exp_min + 3.0)

    potential_concerns: List[str] = []
    if candidate_exp_years >= exp_min and candidate_exp_years <= exp_max + 1.0:
        experience_score = 95.0
    elif candidate_exp_years < exp_min:
        gap = exp_min - candidate_exp_years
        experience_score = max(round(85.0 - (gap * 15.0), 1), 40.0)
        potential_concerns.append(
            f"Role requests {exp_min:.0f}+ years experience; candidate profile indicates ~{candidate_exp_years:.1f} years."
        )
    else:
        experience_score = 80.0 # overqualified buffer

    # =========================================================================
    # DIMENSION 4: EDUCATION & QUALIFICATIONS (10%)
    # =========================================================================
    education_score = 85.0
    edu_records = getattr(user, "education", None) or getattr(user, "education_records", []) or []
    degrees = [e.degree.lower() for e in edu_records if hasattr(e, "degree") and e.degree]
    if job.min_qualifications:
        min_q_lower = job.min_qualifications.lower()
        if any(d in min_q_lower for d in degrees) or any("b.tech" in d or "degree" in d for d in degrees):
            education_score = 95.0
        elif not degrees:
            education_score = 70.0
            potential_concerns.append("Add verified degree records to strengthen qualification rating.")

    # =========================================================================
    # DIMENSION 5: CAREER GOAL & ROADMAP ALIGNMENT (10%)
    # =========================================================================
    career_alignment_score = 70.0
    if roadmap:
        if any(s.skill.lower() in roadmap_skills_in_progress for s in missing_skills):
            career_alignment_score = 95.0 # High synergy: user is learning missing skills!
        else:
            career_alignment_score = 85.0

    # =========================================================================
    # DIMENSIONS 6-9: INDUSTRY (8%), LOCATION (5%), SALARY (5%), EMPLOYMENT (2%)
    # =========================================================================
    industry_score = 80.0
    if prefs and prefs.preferred_industries:
        if job.industry and any(i.lower() in job.industry.lower() for i in prefs.preferred_industries):
            industry_score = 95.0

    location_score = 80.0
    if job.workplace_type == "REMOTE":
        location_score = 95.0
    elif prefs and prefs.preferred_locations:
        if job.city and any(l.lower() in job.city.lower() for l in prefs.preferred_locations):
            location_score = 95.0
        elif profile and profile.location and job.city and profile.location.lower() in job.city.lower():
            location_score = 95.0
        else:
            location_score = 65.0

    salary_score = 85.0
    if prefs and prefs.min_salary and job.salary_min:
        if job.salary_min >= prefs.min_salary:
            salary_score = 95.0
        else:
            salary_score = 70.0

    employment_score = 90.0

    # =========================================================================
    # WEIGHTED OVERALL MATCH PERCENTAGE
    # =========================================================================
    overall_match = round(
        (skills_match_score * 0.25) +
        (role_relevance_score * 0.20) +
        (experience_score * 0.15) +
        (education_score * 0.10) +
        (career_alignment_score * 0.10) +
        (industry_score * 0.08) +
        (location_score * 0.05) +
        (salary_score * 0.05) +
        (employment_score * 0.02),
        1
    )
    overall_match = max(min(overall_match, 98.0), 35.0)

    # Narrative explanation
    matched_names = [m.skill for m in matched_skills[:3]]
    matched_str = ", ".join(matched_names) if matched_names else "general background"
    explanation = (
        f"This opportunity strongly aligns with your target role as a {job.title} at {job.company_name}. "
        f"Your demonstrated capabilities in {matched_str} closely match the mandatory technical criteria. "
    )
    if missing_skills:
        missing_names = [m.skill for m in missing_skills[:2]]
        explanation += f"Developing proficiency in {', '.join(missing_names)} will further elevate your competitive edge."

    # Learning recommendations
    learning_recs = []
    for ms in missing_skills[:3]:
        learning_recs.append({
            "skill": ms.skill,
            "module_title": f"Complete {ms.skill} Professional Upskilling Track",
            "urgency": "High" if ms.is_mandatory else "Medium",
            "roadmap_link": "/roadmap"
        })

    return JobMatchDetail(
        overall_match_percentage=overall_match,
        skills_match_score=skills_match_score,
        role_relevance_score=role_relevance_score,
        experience_compatibility_score=experience_score,
        education_compatibility_score=education_score,
        career_alignment_score=career_alignment_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        recommendation_explanation=explanation,
        potential_concerns=potential_concerns,
        learning_recommendations=learning_recs
    )
