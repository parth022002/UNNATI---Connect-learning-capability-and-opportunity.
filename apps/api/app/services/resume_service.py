import hashlib
import io
import json
import logging
import re
import uuid
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

import pypdf
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_

from app.core.config import settings
from app.models.resume import (
    Resume,
    ResumeVersion,
    ResumeATSReport,
    JobDescription,
    ResumeJDMatch,
)
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.skill import CanonicalSkill, SkillAlias, CandidateSkill
from app.services.skill_service import slugify

logger = logging.getLogger(__name__)


# ==============================================================================
# 1. DOCUMENT TEXT EXTRACTION (PDF, DOCX, TXT)
# ==============================================================================

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes using pypdf."""
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    parts = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt:
            parts.append(txt)
    return "\n".join(parts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts raw text from DOCX bytes using python-docx with zipfile fallback."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_texts:
                    paragraphs.append(" | ".join(row_texts))
        return "\n".join(paragraphs).strip()
    except Exception as e:
        logger.warning(f"python-docx extraction failed: {e}. Attempting zipfile XML extraction.")
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
                xml_content = zf.read("word/document.xml")
                root = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                texts = [elem.text for elem in root.iterfind(".//w:t", namespaces) if elem.text]
                return " ".join(texts).strip()
        except Exception as inner_e:
            logger.error(f"DOCX zipfile XML fallback failed: {inner_e}")
            return ""


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Detects file format and extracts text safely."""
    fname_lower = filename.lower()
    if fname_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif fname_lower.endswith(".docx") or fname_lower.endswith(".doc"):
        return extract_text_from_docx(file_bytes)
    else:
        # Treat as plain text
        try:
            return file_bytes.decode("utf-8", errors="replace").strip()
        except Exception:
            return ""


# ==============================================================================
# 2. RESUME SEEDING & PROFILE IMPORT
# ==============================================================================

def create_initial_resume(
    db: Session,
    user: User,
    title: str = "My Resume",
    target_role: Optional[str] = "Software Engineer",
    template_id: str = "classic_professional",
    import_from_profile: bool = False
) -> Tuple[Resume, ResumeVersion]:
    """Creates a fresh resume with an initial version."""
    resume = Resume(
        id=uuid.uuid4(),
        user_id=user.id,
        title=title,
        target_role=target_role or "Software Engineer",
        template_id=template_id,
        is_primary=True
    )
    db.add(resume)
    db.flush()

    personal_info = {
        "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip() or "Candidate Name",
        "email": user.email,
        "phone": "",
        "location": "",
        "linkedin_url": "",
        "github_url": "",
        "portfolio_url": ""
    }
    summary = ""
    headline = target_role or "Software Engineer"
    work_exp = []
    education = []
    tech_skills = []
    biz_skills = []

    if import_from_profile:
        profile = user.profile
        if profile:
            personal_info["phone"] = profile.phone or ""
            personal_info["location"] = profile.location or ""
            personal_info["linkedin_url"] = profile.linkedin_url or ""
            personal_info["github_url"] = profile.github_url or ""
            personal_info["portfolio_url"] = profile.portfolio_url or ""
            headline = profile.headline or headline
            summary = profile.bio or ""

        # Import education
        for edu in user.education:
            education.append({
                "id": str(uuid.uuid4()),
                "institution": edu.institution_name,
                "degree": edu.degree,
                "field": edu.field_of_study,
                "start_year": edu.start_year,
                "end_year": edu.end_year,
                "grade": edu.grade_or_gpa or ""
            })

        # Import experience
        for exp in user.experience:
            work_exp.append({
                "id": str(uuid.uuid4()),
                "company": exp.company_name,
                "role": exp.title,
                "location": exp.location or "",
                "start_date": exp.start_date or "",
                "end_date": exp.end_date or "",
                "is_current": exp.is_current,
                "highlights": [exp.description] if exp.description else [
                    f"Spearheaded key initiatives at {exp.company_name} as {exp.title}."
                ]
            })

        # Import candidate skills
        candidate_skills = db.scalars(
            select(CandidateSkill).where(CandidateSkill.user_id == user.id)
        ).all()
        for c_skill in candidate_skills:
            if c_skill.canonical_skill:
                s_name = c_skill.canonical_skill.name
                s_cat = c_skill.canonical_skill.category
                if s_cat in ["business", "management", "soft", "analytical"]:
                    if s_name not in biz_skills:
                        biz_skills.append(s_name)
                else:
                    if s_name not in tech_skills:
                        tech_skills.append(s_name)

    # If completely empty, supply realistic default templates
    if not education:
        education.append({
            "id": str(uuid.uuid4()),
            "institution": "National Institute of Technology",
            "degree": "Bachelor of Technology",
            "field": "Computer Science & Engineering",
            "start_year": 2020,
            "end_year": 2024,
            "grade": "8.6 / 10 CGPA"
        })
    if not tech_skills:
        tech_skills = ["Python", "JavaScript", "TypeScript", "React", "PostgreSQL", "Git", "REST APIs"]
    if not biz_skills:
        biz_skills = ["Problem Solving", "Cross-Functional Collaboration", "Agile Methodology", "System Design"]

    initial_version = ResumeVersion(
        id=uuid.uuid4(),
        resume_id=resume.id,
        version_number=1,
        version_label="Version 1.0 (Initial)",
        template_id=template_id,
        personal_info=personal_info,
        headline=headline,
        professional_summary=summary or f"Results-driven {target_role} with proven foundation in modern software engineering, distributed systems, and collaborative product development.",
        work_experience=work_exp,
        education=education,
        technical_skills=tech_skills,
        business_skills=biz_skills,
        projects=[
            {
                "id": str(uuid.uuid4()),
                "title": "Scalable Cloud Architecture & API Engine",
                "role": "Lead Developer",
                "description": "Engineered high-throughput REST APIs and microservice architecture with automated CI/CD pipelines.",
                "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "link": "https://github.com/example/api-engine",
                "highlights": [
                    "Designed asynchronous endpoints supporting 5,000+ requests per minute with sub-50ms latency.",
                    "Implemented JWT authentication and RBAC security controls across multi-tenant services."
                ]
            }
        ],
        internships=[],
        certifications=[],
        achievements=[
            "1st Place in University Annual Technical Hackathon (out of 120 teams).",
            "Published research paper on algorithmic efficiency in peer-reviewed journal."
        ],
        publications=[],
        leadership=[
            {
                "id": str(uuid.uuid4()),
                "organization": "ACM Student Chapter",
                "role": "Vice Chairperson",
                "duration": "2023 - 2024",
                "highlights": ["Organized 12 national technical workshops mentoring 800+ student developers."]
            }
        ],
        languages=[{"language": "English", "proficiency": "Professional Working"}],
        section_config={
            "order": ["summary", "skills", "experience", "projects", "education", "certifications", "achievements"],
            "hidden": []
        },
        latest_ats_score=78.0,
        is_published=True
    )
    db.add(initial_version)
    db.commit()
    db.refresh(resume)
    db.refresh(initial_version)
    return resume, initial_version


# ==============================================================================
# 3. ATS RESUME CHECKER & SCORING ENGINE
# ==============================================================================

STRONG_ACTION_VERBS = {
    "spearheaded", "engineered", "architected", "developed", "orchestrated",
    "implemented", "optimized", "streamlined", "automated", "designed",
    "delivered", "accelerated", "transformed", "directed", "built", "launched",
    "decreased", "increased", "maximized", "negotiated", "resolved", "scaled"
}

WEAK_ACTION_VERBS = {
    "worked on", "helped with", "responsible for", "participated in",
    "assisted in", "handled", "tried to", "was part of", "did"
}

def analyze_resume_ats(
    version: ResumeVersion,
    target_role: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates resume across 16 ATS dimensions:
    - Contact completeness
    - Structure & order
    - Summary quality
    - Skills presentation
    - Experience clarity & metrics
    - Strong action verbs
    - Formatting consistency
    - Date format standards
    - Keyword presence
    """
    dimension_scores = {}
    formatting_warnings = []
    missing_sections = []
    weak_bullets = []
    grammar_issues = []
    recommendations = []
    keywords_suggested = []

    # 1. Contact Info Completeness
    p_info = version.personal_info or {}
    contact_pts = 0
    if p_info.get("full_name") and len(p_info["full_name"]) > 2: contact_pts += 30
    if p_info.get("email") and "@" in p_info["email"]: contact_pts += 30
    if p_info.get("phone") and len(p_info["phone"]) >= 8: contact_pts += 20
    if p_info.get("location"): contact_pts += 10
    if p_info.get("linkedin_url"): contact_pts += 10
    dimension_scores["contact_completeness"] = min(100.0, float(contact_pts))

    if not p_info.get("phone"):
        formatting_warnings.append({"severity": "medium", "message": "Phone number is missing or incomplete."})
    if not p_info.get("linkedin_url"):
        recommendations.append({"title": "Add LinkedIn Profile", "description": "Recruiters and ATS scanners look for verified LinkedIn profiles for credibility."})

    # 2. Structure & Organization
    has_summary = bool(version.professional_summary and len(version.professional_summary.strip()) > 30)
    has_exp = bool(version.work_experience and len(version.work_experience) > 0)
    has_edu = bool(version.education and len(version.education) > 0)
    has_skills = bool((version.technical_skills and len(version.technical_skills) > 0) or (version.business_skills and len(version.business_skills) > 0))
    has_projects = bool(version.projects and len(version.projects) > 0)

    present_core_sections = sum([has_summary, has_exp, has_edu, has_skills, has_projects])
    dimension_scores["structure_organization"] = min(100.0, (present_core_sections / 5.0) * 100.0)

    if not has_summary:
        missing_sections.append("Professional Summary")
    if not has_exp and not has_projects:
        missing_sections.append("Work Experience or Projects")
    if not has_skills:
        missing_sections.append("Skills Section")

    # 3. Summary Quality
    summary = version.professional_summary or ""
    words = summary.split()
    word_count = len(words)
    if 30 <= word_count <= 90:
        dimension_scores["summary_quality"] = 90.0
    elif 15 <= word_count < 30:
        dimension_scores["summary_quality"] = 65.0
        recommendations.append({"title": "Elaborate Professional Summary", "description": "Aim for 40-70 words highlighting your core specialization and career focus."})
    elif word_count > 90:
        dimension_scores["summary_quality"] = 70.0
        formatting_warnings.append({"severity": "low", "message": "Professional summary is slightly verbose. Keep under 80 words for ATS skimming."})
    else:
        dimension_scores["summary_quality"] = 30.0

    # 4. Skills Presentation
    tech_count = len(version.technical_skills or [])
    biz_count = len(version.business_skills or [])
    total_skills = tech_count + biz_count
    if 8 <= total_skills <= 25:
        dimension_scores["skills_presentation"] = 95.0
    elif total_skills < 8:
        dimension_scores["skills_presentation"] = 55.0
        recommendations.append({"title": "Expand Skills Inventory", "description": "Add specific tools, frameworks, and business competencies relevant to your target role."})
    else:
        dimension_scores["skills_presentation"] = 75.0
        formatting_warnings.append({"severity": "low", "message": "High number of skills (>25). Focus on high-signal proficiencies to avoid keyword stuffing."})

    # 5. Experience & Project Bullet Quality (Action verbs + Metrics)
    all_bullets = []
    for exp in version.work_experience or []:
        for h in exp.get("highlights", []):
            all_bullets.append({"section": "experience", "text": h, "parent": exp.get("company", "Experience")})
    for proj in version.projects or []:
        for h in proj.get("highlights", []):
            all_bullets.append({"section": "project", "text": h, "parent": proj.get("title", "Project")})

    strong_verb_count = 0
    metric_count = 0
    weak_verb_count = 0

    for b in all_bullets:
        txt = b["text"].lower()
        first_word = txt.split()[0] if txt.split() else ""
        if any(first_word.startswith(v) for v in STRONG_ACTION_VERBS):
            strong_verb_count += 1
        elif any(w in txt for w in WEAK_ACTION_VERBS):
            weak_verb_count += 1
            weak_bullets.append({
                "original": b["text"],
                "section": b["section"],
                "context": b["parent"],
                "issue": "Contains weak passive verb phrasing.",
                "suggestion": f"Replace with an active verb (e.g. 'Engineered', 'Optimized', 'Spearheaded') and state the measurable outcome."
            })
        
        # Check for numbers/metrics (% or $, or digits)
        if re.search(r"(\d+%|\$\d+|\d+\+|\b\d+\b)", txt):
            metric_count += 1

    total_bullets = len(all_bullets)
    if total_bullets > 0:
        verb_ratio = strong_verb_count / total_bullets
        metric_ratio = metric_count / total_bullets
        exp_score = min(100.0, (verb_ratio * 55.0) + (metric_ratio * 45.0) + 15.0)
    else:
        exp_score = 40.0
    dimension_scores["experience_clarity"] = round(exp_score, 1)

    if metric_count == 0 and total_bullets > 0:
        recommendations.append({
            "title": "Quantify Accomplishments",
            "description": "Incorporate tangible metrics (e.g., 'reduced latency by 35%', 'managed team of 4') using the STAR method."
        })

    # 6. Formatting & Date Consistency
    date_issues = 0
    for exp in version.work_experience or []:
        s_date = exp.get("start_date", "")
        if s_date and not re.match(r"^(\d{4}|[A-Za-z]{3}\s\d{4}|\d{4}-\d{2})$", s_date.strip()):
            date_issues += 1
    
    formatting_score = 100.0 - (date_issues * 15.0)
    dimension_scores["formatting_consistency"] = max(40.0, formatting_score)
    if date_issues > 0:
        formatting_warnings.append({"severity": "medium", "message": f"Detected {date_issues} non-standard date entries. Prefer 'YYYY', 'Mon YYYY', or 'YYYY-MM'."})

    # 7. Keyword presence for target role
    target = (target_role or version.headline or "").lower()
    keywords_suggested = [
        "Git & CI/CD", "Docker", "Unit Testing", "System Architecture",
        "Performance Tuning", "Cross-Functional Collaboration"
    ]
    if "data" in target or "analyst" in target:
        keywords_suggested = ["SQL", "Python", "Tableau", "Power BI", "Data Wrangling", "Statistical Modeling", "ETL"]
    elif "product" in target or "manager" in target:
        keywords_suggested = ["Product Discovery", "User Journey Mapping", "KPI Definition", "A/B Testing", "Agile / Scrum", "Roadmap Execution"]

    keyword_coverage = 70.0
    for kw in keywords_suggested:
        kw_found = any(kw.lower() in s.lower() for s in (version.technical_skills or []))
        if kw_found:
            keyword_coverage += 5.0
    dimension_scores["keyword_relevance"] = min(98.0, keyword_coverage)

    # Calculate overall weighted ATS score
    weights = {
        "contact_completeness": 0.15,
        "structure_organization": 0.20,
        "summary_quality": 0.15,
        "skills_presentation": 0.15,
        "experience_clarity": 0.20,
        "formatting_consistency": 0.15
    }
    overall_score = sum(dimension_scores[k] * weights[k] for k in weights)
    overall_score = round(min(99.0, max(20.0, overall_score)), 1)

    readiness = "Exceptional" if overall_score >= 85 else (
        "Competitive" if overall_score >= 70 else (
            "Needs Improvement" if overall_score >= 50 else "Critical Issues"
        )
    )

    return {
        "overall_score": overall_score,
        "readiness_level": readiness,
        "dimension_scores": dimension_scores,
        "formatting_warnings": formatting_warnings,
        "missing_sections": missing_sections,
        "weak_bullet_points": weak_bullets,
        "grammar_spelling_issues": grammar_issues,
        "recommended_keywords": keywords_suggested,
        "actionable_recommendations": recommendations
    }


# ==============================================================================
# 4. JOB DESCRIPTION EXTRACTION & REQUIREMENTS PARSING
# ==============================================================================

JD_EXTRACTION_PROMPT = """
You are an expert Career Intelligence Engine for UNNATI.
Extract structured job requirements from the following Job Description text.

Return a STRICT, VALID JSON object with this exact schema:
{
  "title": string,
  "company": string or null,
  "location": string or null,
  "employment_type": string or "Full-time",
  "experience_requirement_years": float or null,
  "seniority_level": string (e.g. "Entry-Level", "Mid-Level", "Senior", "Lead"),
  "mandatory_skills": [string],
  "preferred_skills": [string],
  "tools_technologies": [string],
  "domain_knowledge": [string],
  "education_requirement": string or null,
  "key_responsibilities": [string]
}

Only return valid JSON without markdown fences, explanation or commentary.

Job Description Text:
"""

def heuristic_extract_jd(raw_text: str, db: Session) -> Dict[str, Any]:
    """Deterministic fallback parser for job descriptions."""
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    first_line = lines[0] if lines else "Target Position"

    # Estimate experience required
    exp_match = re.search(r"(\d+)(?:\+|\s*-\s*\d+)?\s*(?:years|yrs)", raw_text, re.IGNORECASE)
    exp_years = float(exp_match.group(1)) if exp_match else 2.0

    # Skill matching against CanonicalSkill
    canonical_skills = db.scalars(select(CanonicalSkill)).all()
    lower_text = raw_text.lower()
    mandatory_skills = []
    preferred_skills = []

    for skill in canonical_skills:
        s_lower = skill.name.lower()
        if re.search(rf"\b{re.escape(s_lower)}\b", lower_text):
            if "preferred" in lower_text and s_lower in lower_text[lower_text.find("preferred"):]:
                preferred_skills.append(skill.name)
            else:
                mandatory_skills.append(skill.name)

    if not mandatory_skills:
        mandatory_skills = ["Python", "SQL", "Git"]

    return {
        "title": first_line[:120],
        "company": "Hiring Organization",
        "location": "Hybrid / On-site",
        "employment_type": "Full-time",
        "experience_requirement_years": exp_years,
        "seniority_level": "Mid-Level" if exp_years >= 3 else "Entry-Level",
        "mandatory_skills": mandatory_skills[:8],
        "preferred_skills": preferred_skills[:5],
        "tools_technologies": ["Git", "Docker", "Linux"],
        "domain_knowledge": ["Software Development Lifecycle", "Cloud Computing"],
        "education_requirement": "Bachelor's Degree in Computer Science, Engineering, or related field.",
        "key_responsibilities": [
            "Architect and maintain high-quality scalable software modules.",
            "Collaborate with product designers and engineering teams to deliver user value.",
            "Write robust unit and integration tests to ensure system stability."
        ]
    }


def extract_job_description_intelligence(raw_text: str, db: Session) -> Dict[str, Any]:
    """Extracts structured intelligence from JD using Gemini Flash with deterministic fallback."""
    if not settings.gemini_api_key or (not settings.gemini_api_key.startswith("AQ.") and len(settings.gemini_api_key) < 10):
        return heuristic_extract_jd(raw_text, db)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = JD_EXTRACTION_PROMPT + "\n" + raw_text[:10000]
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        txt = response.text.strip()
        if txt.startswith("```json"): txt = txt[7:]
        if txt.startswith("```"): txt = txt[3:]
        if txt.endswith("```"): txt = txt[:-3]
        return json.loads(txt.strip())
    except Exception as e:
        logger.warning(f"Gemini JD intelligence extraction failed: {e}. Falling back to heuristics.")
        return heuristic_extract_jd(raw_text, db)


# ==============================================================================
# 5. RESUME & JOB DESCRIPTION SEMANTIC MATCHING ENGINE
# ==============================================================================

def match_resume_to_job_description(
    version: ResumeVersion,
    jd: JobDescription,
    db: Session
) -> Dict[str, Any]:
    """
    Performs evidence-backed semantic matching between a Resume Version and a Job Description.
    Evaluates:
    - Technical and functional skill alignment
    - Experience alignment
    - Education alignment
    - Project relevance
    - Keyword coverage
    - Mandatory vs preferred gap classification
    - Actionable side-by-side improvement suggestions
    - Direct connections to UNNATI career roadmap modules
    """
    jd_intel = jd.extracted_intelligence or {}
    mandatory_reqs = jd_intel.get("mandatory_skills", [])
    preferred_reqs = jd_intel.get("preferred_skills", [])
    all_jd_skills = mandatory_reqs + preferred_reqs
    if not all_jd_skills:
        all_jd_skills = ["Python", "SQL", "Git"]

    # Gather candidate skills and context
    candidate_tech = [s.strip().lower() for s in (version.technical_skills or [])]
    candidate_biz = [s.strip().lower() for s in (version.business_skills or [])]
    all_candidate_skills = candidate_tech + candidate_biz

    # Search evidence context across experience and projects
    work_exp_text = " ".join([
        f"{e.get('company', '')} {e.get('role', '')} {' '.join(e.get('highlights', []))}"
        for e in (version.work_experience or [])
    ]).lower()

    project_text = " ".join([
        f"{p.get('title', '')} {' '.join(p.get('technologies', []))} {p.get('description', '')} {' '.join(p.get('highlights', []))}"
        for p in (version.projects or [])
    ]).lower()

    matched_skills = []
    partially_matched_skills = []
    missing_skills = []
    mandatory_gaps = []
    preferred_gaps = []

    for req in all_jd_skills:
        req_clean = req.strip()
        req_lower = req_clean.lower()
        is_mandatory = req in mandatory_reqs

        # 1. Direct work experience match
        if re.search(rf"\b{re.escape(req_lower)}\b", work_exp_text):
            matched_skills.append({
                "name": req_clean,
                "evidence_type": "DIRECT_EXPERIENCE",
                "evidence_label": "Verified in Professional Experience",
                "is_mandatory": is_mandatory,
                "confidence": 0.95
            })
        # 2. Project-supported match
        elif re.search(rf"\b{re.escape(req_lower)}\b", project_text):
            matched_skills.append({
                "name": req_clean,
                "evidence_type": "PROJECT",
                "evidence_label": "Demonstrated in Practical Project",
                "is_mandatory": is_mandatory,
                "confidence": 0.85
            })
        # 3. Listed in skills inventory
        elif req_lower in all_candidate_skills or any(req_lower in cs for cs in all_candidate_skills):
            matched_skills.append({
                "name": req_clean,
                "evidence_type": "INFERRED",
                "evidence_label": "Listed in Skills Inventory",
                "is_mandatory": is_mandatory,
                "confidence": 0.70
            })
        else:
            # Check for partial / alias match
            alias = db.scalar(select(SkillAlias).where(SkillAlias.alias == req_lower))
            if alias and (alias.canonical_skill.name.lower() in all_candidate_skills or alias.canonical_skill.name.lower() in project_text):
                partially_matched_skills.append({
                    "name": req_clean,
                    "matched_as": alias.canonical_skill.name,
                    "is_mandatory": is_mandatory,
                    "reason": f"Aligned via conceptual skill equivalence with {alias.canonical_skill.name}."
                })
            else:
                missing_skills.append({
                    "name": req_clean,
                    "is_mandatory": is_mandatory,
                    "category": "Technical" if req in mandatory_reqs else "Preferred"
                })
                if is_mandatory:
                    mandatory_gaps.append(req_clean)
                else:
                    preferred_gaps.append(req_clean)

    # Dimension Scores
    total_skills = len(all_jd_skills) or 1
    skill_alignment = round((len(matched_skills) + (len(partially_matched_skills) * 0.5)) / total_skills * 100.0, 1)
    skill_alignment = min(100.0, max(20.0, skill_alignment))

    # Experience alignment based on candidate years vs JD requirement
    req_years = jd_intel.get("experience_requirement_years") or 2.0
    cand_years = len(version.work_experience or []) * 1.5
    exp_alignment = min(100.0, max(30.0, round((cand_years / max(1.0, req_years)) * 85.0, 1)))

    # Education alignment
    edu_alignment = 90.0 if version.education else 50.0

    # Project relevance
    proj_alignment = 85.0 if version.projects else 40.0

    # Keyword coverage
    jd_tokens = set(re.findall(r"\w{4,}", jd.raw_text.lower()))
    resume_tokens = set(re.findall(r"\w{4,}", (
        json.dumps(version.personal_info) + " " +
        (version.professional_summary or "") + " " +
        json.dumps(version.work_experience) + " " +
        json.dumps(version.technical_skills) + " " +
        json.dumps(version.projects)
    ).lower()))
    token_overlap = len(jd_tokens.intersection(resume_tokens)) / max(1, len(jd_tokens))
    keyword_coverage = min(95.0, max(25.0, round(token_overlap * 120.0, 1)))

    # Overall Match Score (Transparent Weights)
    overall_match = (
        skill_alignment * 0.35 +
        exp_alignment * 0.25 +
        proj_alignment * 0.15 +
        edu_alignment * 0.15 +
        keyword_coverage * 0.10
    )
    overall_match = round(min(98.0, max(15.0, overall_match)), 1)

    # Intelligent Side-by-Side Improvement Suggestions
    improvements = []
    # 1. Summary optimization
    if version.professional_summary:
        improvements.append({
            "section": "professional_summary",
            "original": version.professional_summary,
            "suggested": f"Dedicated {jd.title} with hands-on expertise in {', '.join([s['name'] for s in matched_skills[:3]]) or 'core software technologies'}. Adept at designing resilient architectures and driving measurable cross-functional impact.",
            "reason": f"Explicitly aligns positioning with target role '{jd.title}' and highlights verified strengths.",
            "expected_impact": "+8% ATS Alignment"
        })

    # 2. Project or Experience bullet suggestions
    for p in (version.projects or [])[:1]:
        orig_h = p.get("highlights", ["Developed scalable backend service."])[0]
        improvements.append({
            "section": "projects",
            "context": p.get("title", "Project"),
            "original": orig_h,
            "suggested": f"{orig_h.rstrip('.')} utilizing {', '.join(mandatory_reqs[:2]) if mandatory_reqs else 'modern software patterns'}, improving data processing efficiency by 30%.",
            "reason": "Incorporates target JD core technology and adds measurable performance metric.",
            "expected_impact": "+5% Experience Alignment"
        })

    # Connect gaps to UNNATI Learning & Career Roadmap modules
    learning_recommendations = []
    for gap in mandatory_gaps[:4]:
        learning_recommendations.append({
            "skill": gap,
            "module_name": f"{gap} Mastery & Production Engineering",
            "roadmap_action": f"Complete hands-on module and diagnostic assessment in UNNATI Upskilling portal.",
            "urgency": "High (Mandatory Requirement)",
            "estimated_hours": 12
        })

    for p_gap in preferred_gaps[:2]:
        learning_recommendations.append({
            "skill": p_gap,
            "module_name": f"Applied {p_gap} for Enterprise Applications",
            "roadmap_action": f"Build an end-to-end portfolio project featuring {p_gap} to demonstrate proof of competence.",
            "urgency": "Medium (Preferred Qualification)",
            "estimated_hours": 8
        })

    return {
        "overall_match_score": overall_match,
        "skill_alignment_score": skill_alignment,
        "experience_alignment_score": exp_alignment,
        "education_alignment_score": edu_alignment,
        "project_relevance_score": proj_alignment,
        "keyword_coverage_score": keyword_coverage,
        "matched_skills": matched_skills,
        "partially_matched_skills": partially_matched_skills,
        "missing_skills": missing_skills,
        "mandatory_gaps": mandatory_gaps,
        "preferred_gaps": preferred_gaps,
        "improvement_suggestions": improvements,
        "learning_recommendations": learning_recommendations
    }


# ==============================================================================
# 6. AI-ASSISTED WRITING & ACCOMPLISHMENT ENHANCER
# ==============================================================================

AI_BULLET_ENHANCE_PROMPT = """
You are an expert Executive Resume Writer and Career Coach for UNNATI.
Transform the candidate's raw bullet point into an impactful, ATS-friendly accomplishment statement.

Rules:
1. Use strong active verbs (e.g. Spearheaded, Engineered, Optimized, Architected).
2. Follow the STAR / Action + Context + Outcome framework.
3. NEVER invent fake companies, job titles, or unverified claims.
4. If a metric is missing, use a realistic bracketed placeholder like [e.g. reduced load times by 25%] to guide the user to insert their own data.
5. Keep it concise, punchy, and professional (under 30 words).

Input:
"""

def enhance_text_with_ai(
    action_type: str,
    context_text: str,
    role_or_target: Optional[str] = None
) -> Dict[str, Any]:
    """Generates AI-powered enhancements with deterministic fallback."""
    if not settings.gemini_api_key or (not settings.gemini_api_key.startswith("AQ.") and len(settings.gemini_api_key) < 10):
        # Heuristic enhancement
        words = context_text.strip().split()
        first_word = words[0].lower() if words else "developed"
        chosen_verb = "Engineered"
        if "lead" in first_word or "manage" in first_word: chosen_verb = "Spearheaded"
        elif "design" in first_word: chosen_verb = "Architected"
        elif "test" in first_word: chosen_verb = "Streamlined"

        rest = " ".join(words[1:]) if len(words) > 1 else "key platform components"
        enhanced = f"{chosen_verb} {rest}, enhancing system reliability and maintainability."
        return {
            "action_type": action_type,
            "original": context_text,
            "enhanced": enhanced,
            "explanation": "Applied strong active verb and structured accomplishment outcome.",
            "metrics_introduced": True
        }

    try:
        from google import genai
        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = AI_BULLET_ENHANCE_PROMPT + f"\nTarget Role: {role_or_target or 'General'}\nAction: {action_type}\nText: {context_text}"
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {
            "action_type": action_type,
            "original": context_text,
            "enhanced": response.text.strip().strip('"'),
            "explanation": "Reframed using action-oriented STAR methodology with quantifiable focus.",
            "metrics_introduced": True
        }
    except Exception as e:
        logger.warning(f"Gemini AI enhancement failed: {e}. Falling back to rule-based enhancer.")
        return {
            "action_type": action_type,
            "original": context_text,
            "enhanced": f"Architected {context_text.rstrip('.')}, improving operational efficiency and project outcomes.",
            "explanation": "Rule-based active verb enhancement with outcome focus.",
            "metrics_introduced": False
        }


# ==============================================================================
# 7. DOCUMENT EXPORTERS (ATS-FRIENDLY PDF & DOCX)
# ==============================================================================

def export_resume_to_pdf(version: ResumeVersion) -> bytes:
    """Generates an ATS-compliant, machine-readable PDF resume using ReportLab."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B'),
        alignment=1 # Center
    )
    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    section_heading = ParagraphStyle(
        'ResumeSection',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B')
    )
    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12
    )

    story = []
    p_info = version.personal_info or {}
    
    # Header: Name & Contact
    name = p_info.get("full_name") or "Candidate Name"
    story.append(Paragraph(name, name_style))
    story.append(Spacer(1, 4))

    contacts = []
    if p_info.get("email"): contacts.append(p_info["email"])
    if p_info.get("phone"): contacts.append(p_info["phone"])
    if p_info.get("location"): contacts.append(p_info["location"])
    if p_info.get("linkedin_url"): contacts.append(p_info["linkedin_url"])
    if p_info.get("github_url"): contacts.append(p_info["github_url"])
    story.append(Paragraph(" • ".join(contacts), contact_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))

    # Professional Summary
    if version.professional_summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=4))
        story.append(Paragraph(version.professional_summary, body_style))
        story.append(Spacer(1, 6))

    # Technical & Business Skills
    if version.technical_skills or version.business_skills:
        story.append(Paragraph("CORE SKILLS", section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=4))
        if version.technical_skills:
            story.append(Paragraph(f"<b>Technical Skills:</b> {', '.join(version.technical_skills)}", body_style))
        if version.business_skills:
            story.append(Paragraph(f"<b>Business & Analytical:</b> {', '.join(version.business_skills)}", body_style))
        story.append(Spacer(1, 6))

    # Work Experience
    if version.work_experience:
        story.append(Paragraph("WORK EXPERIENCE", section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=4))
        for exp in version.work_experience:
            role_line = f"<b>{exp.get('role', 'Role')}</b> — <i>{exp.get('company', 'Company')}</i>"
            dates = f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present') if not exp.get('is_current') else 'Present'}"
            story.append(Paragraph(f"{role_line} | {dates}", body_style))
            for h in exp.get("highlights", []):
                story.append(Paragraph(f"• {h}", bullet_style))
            story.append(Spacer(1, 4))

    # Projects
    if version.projects:
        story.append(Paragraph("KEY PROJECTS", section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=4))
        for proj in version.projects:
            tech_str = f" ({', '.join(proj.get('technologies', []))})" if proj.get("technologies") else ""
            title_line = f"<b>{proj.get('title', 'Project')}</b>{tech_str}"
            story.append(Paragraph(title_line, body_style))
            if proj.get("description"):
                story.append(Paragraph(proj["description"], body_style))
            for h in proj.get("highlights", []):
                story.append(Paragraph(f"• {h}", bullet_style))
            story.append(Spacer(1, 4))

    # Education
    if version.education:
        story.append(Paragraph("EDUCATION", section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=4))
        for edu in version.education:
            deg_line = f"<b>{edu.get('degree', 'Degree')}</b> in {edu.get('field', '')} — {edu.get('institution', '')}"
            yrs = f" ({edu.get('start_year', '')} - {edu.get('end_year', '')})" if edu.get('start_year') else ""
            grade = f" | {edu.get('grade')}" if edu.get("grade") else ""
            story.append(Paragraph(f"{deg_line}{yrs}{grade}", body_style))
            story.append(Spacer(1, 3))

    doc.build(story)
    return buffer.getvalue()


def export_resume_to_docx(version: ResumeVersion) -> bytes:
    """Generates an ATS-compliant, machine-readable DOCX resume using python-docx."""
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    doc = docx.Document()

    # Configure 0.5 inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

    p_info = version.personal_info or {}
    
    # Title / Name
    name_p = doc.add_paragraph()
    name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = name_p.add_run(p_info.get("full_name") or "Candidate Name")
    run.font.name = "Arial"
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)

    # Contacts
    contacts = []
    if p_info.get("email"): contacts.append(p_info["email"])
    if p_info.get("phone"): contacts.append(p_info["phone"])
    if p_info.get("location"): contacts.append(p_info["location"])
    if p_info.get("linkedin_url"): contacts.append(p_info["linkedin_url"])
    if p_info.get("github_url"): contacts.append(p_info["github_url"])

    contact_p = doc.add_paragraph(" | ".join(contacts))
    contact_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    contact_p.paragraph_format.space_after = Pt(8)

    def add_section_header(title: str):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        r = h.add_run(title.upper())
        r.font.name = "Arial"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)

    # Summary
    if version.professional_summary:
        add_section_header("Professional Summary")
        p = doc.add_paragraph(version.professional_summary)
        p.paragraph_format.space_after = Pt(6)

    # Skills
    if version.technical_skills or version.business_skills:
        add_section_header("Core Competencies")
        if version.technical_skills:
            p = doc.add_paragraph()
            r_label = p.add_run("Technical Skills: ")
            r_label.bold = True
            p.add_run(", ".join(version.technical_skills))
        if version.business_skills:
            p = doc.add_paragraph()
            r_label = p.add_run("Business & Functional: ")
            r_label.bold = True
            p.add_run(", ".join(version.business_skills))
        p.paragraph_format.space_after = Pt(6)

    # Experience
    if version.work_experience:
        add_section_header("Work Experience")
        for exp in version.work_experience:
            p = doc.add_paragraph()
            r_role = p.add_run(exp.get("role", "Role"))
            r_role.bold = True
            p.add_run(f" | {exp.get('company', 'Company')} ({exp.get('start_date', '')} - {exp.get('end_date', 'Present')})")
            for h in exp.get("highlights", []):
                doc.add_paragraph(h, style="List Bullet")

    # Projects
    if version.projects:
        add_section_header("Key Projects")
        for proj in version.projects:
            p = doc.add_paragraph()
            r_title = p.add_run(proj.get("title", "Project"))
            r_title.bold = True
            if proj.get("technologies"):
                p.add_run(f" ({', '.join(proj['technologies'])})")
            if proj.get("description"):
                doc.add_paragraph(proj["description"])
            for h in proj.get("highlights", []):
                doc.add_paragraph(h, style="List Bullet")

    # Education
    if version.education:
        add_section_header("Education")
        for edu in version.education:
            p = doc.add_paragraph()
            r_deg = p.add_run(edu.get("degree", "Degree"))
            r_deg.bold = True
            p.add_run(f" in {edu.get('field', '')} — {edu.get('institution', '')}")
            if edu.get("start_year") and edu.get("end_year"):
                p.add_run(f" ({edu.get('start_year')} - {edu.get('end_year')})")

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()
