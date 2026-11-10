import hashlib
import io
import json
import logging
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import uuid

import pypdf
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.storage import upload_document_bytes
from app.models.document import CandidateDocument
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord
from app.models.skill import CanonicalSkill, SkillAlias, CandidateSkill
from app.services.user_service import calculate_completeness
from app.services.skill_service import slugify

logger = logging.getLogger(__name__)

RESUME_EXTRACTION_PROMPT = """
You are an expert AI Resume and Career Profile Parser for UNNATI, a career growth platform.
Extract all relevant structured career details from the candidate's resume text below.

Return a STRICT, VALID JSON object with the following schema:
{
  "full_name": string or null,
  "email": string or null,
  "phone": string or null,
  "headline": string or null,
  "summary": string or null,
  "target_role": string or null,
  "location": string or null,
  "education": [
    {
      "institution_name": string,
      "degree": string,
      "field_of_study": string or null,
      "start_year": integer or null,
      "end_year": integer or null
    }
  ],
  "experience": [
    {
      "company_name": string,
      "job_title": string,
      "employment_type": string or null,
      "start_date": string or null,
      "end_date": string or null,
      "is_current": boolean,
      "description": string or null
    }
  ],
  "skills": [
    {
      "name": string,
      "category": string (e.g. "language", "frontend", "backend", "database", "cloud", "ai", "core", "design"),
      "proficiency_hint": float between 0.1 and 1.0 (default 0.7),
      "source_context": string or null
    }
  ],
  "projects": [
    {
      "title": string,
      "description": string,
      "technologies": [string]
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string or null,
      "issue_date": string or null
    }
  ]
}

Only return valid JSON without markdown fences, explanation, or commentary.

Resume Text:
"""

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes using pypdf."""
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts).strip()

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def fallback_heuristic_extraction(raw_text: str, db: Session) -> Dict[str, Any]:
    """
    Fallback deterministic parser using regex and canonical skills database matching.
    Ensures document parsing succeeds even in offline or air-gapped environments.
    """
    # Email regex
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
    email = email_match.group(0) if email_match else None

    # Phone regex
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", raw_text)
    phone = phone_match.group(0) if phone_match else None

    # Skill matching against CanonicalSkill & SkillAlias
    lower_text = raw_text.lower()
    canonical_skills = db.scalars(select(CanonicalSkill)).all()
    extracted_skills = []
    matched_skill_ids = set()

    for skill in canonical_skills:
        skill_name_lower = skill.name.lower()
        if re.search(rf"\b{re.escape(skill_name_lower)}\b", lower_text):
            extracted_skills.append({
                "name": skill.name,
                "category": skill.category,
                "proficiency_hint": 0.6,
                "source_context": "Direct text match"
            })
            matched_skill_ids.add(skill.id)

    # Check aliases for remaining
    aliases = db.scalars(select(SkillAlias)).all()
    for alias in aliases:
        if alias.canonical_skill_id not in matched_skill_ids:
            if re.search(rf"\b{re.escape(alias.alias.lower())}\b", lower_text):
                extracted_skills.append({
                    "name": alias.canonical_skill.name,
                    "category": alias.canonical_skill.category,
                    "proficiency_hint": 0.6,
                    "source_context": f"Alias match: {alias.alias}"
                })
                matched_skill_ids.add(alias.canonical_skill_id)

    # Heuristic education extraction
    education = []
    degree_patterns = [
        r"(Bachelor of [A-Za-z ]+|B\.?Tech|B\.?E\.?|B\.?S\.?|BCA)",
        r"(Master of [A-Za-z ]+|M\.?Tech|M\.?E\.?|M\.?S\.?|MCA|MBA)",
        r"(Ph\.?D|Doctorate)"
    ]
    for pattern in degree_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            education.append({
                "institution_name": "Recognized Institution",
                "degree": match.group(0).strip(),
                "field_of_study": "Engineering / Computer Science",
                "start_year": None,
                "end_year": None
            })
            break

    return {
        "full_name": None,
        "email": email,
        "phone": phone,
        "headline": "Software / Technology Professional",
        "summary": raw_text[:300].strip() if len(raw_text) > 50 else None,
        "target_role": "Software Engineer",
        "location": None,
        "education": education,
        "experience": [],
        "skills": extracted_skills,
        "projects": [],
        "certifications": []
    }

def extract_resume_with_gemini(raw_text: str, db: Session) -> Dict[str, Any]:
    """Invokes Gemini 2.5 Flash to extract structured resume details with heuristic fallback."""
    if not settings.gemini_api_key or settings.gemini_api_key.startswith("AQ.") == False and len(settings.gemini_api_key) < 10:
        logger.info("Using deterministic heuristic parser (no Gemini key or offline mode)")
        return fallback_heuristic_extraction(raw_text, db)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        # Use Gemini 2.5 Flash for high-speed extraction
        prompt = RESUME_EXTRACTION_PROMPT + "\n" + raw_text[:12000] # Cap at ~12k characters
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        text_out = response.text.strip()
        # Clean potential markdown wrapping
        if text_out.startswith("```json"):
            text_out = text_out[7:]
        if text_out.startswith("```"):
            text_out = text_out[3:]
        if text_out.endswith("```"):
            text_out = text_out[:-3]
        payload = json.loads(text_out.strip())
        return payload
    except Exception as e:
        logger.warning(f"Gemini resume extraction failed: {e}. Falling back to heuristics.")
        return fallback_heuristic_extraction(raw_text, db)

def save_and_parse_document(
    db: Session,
    user: User,
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    document_type: str = "RESUME"
) -> CandidateDocument:
    """Saves uploaded document, extracts text, and processes structured payload."""
    checksum = compute_sha256(file_bytes)
    file_size = len(file_bytes)
    doc_id = uuid.uuid4()

    safe_filename = re.sub(r"[^\w\-.]", "_", filename)
    storage_key = f"{user.id}/{doc_id}_{safe_filename}"
    storage_path = upload_document_bytes(file_bytes, storage_key, mime_type)

    # Extract text
    raw_text = ""
    if "pdf" in mime_type.lower() or filename.lower().endswith(".pdf"):
        try:
            raw_text = extract_text_from_pdf(file_bytes)
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raw_text = ""
    else:
        try:
            raw_text = file_bytes.decode("utf-8", errors="replace")
        except Exception:
            raw_text = ""

    doc = CandidateDocument(
        id=doc_id,
        user_id=user.id,
        document_type=document_type,
        filename=filename,
        file_size_bytes=file_size,
        mime_type=mime_type,
        storage_path=storage_path,
        checksum_sha256=checksum,
        status="PROCESSING",
        raw_text=raw_text
    )
    db.add(doc)
    db.flush()

    # Parse with AI or heuristics
    try:
        parsed_data = extract_resume_with_gemini(raw_text, db)
        doc.parsed_payload = parsed_data
        doc.status = "PARSED"
    except Exception as e:
        doc.status = "FAILED"
        doc.error_message = str(e)

    db.commit()
    db.refresh(doc)
    return doc

def apply_parsed_document_to_candidate(
    db: Session,
    user: User,
    doc: CandidateDocument,
    apply_profile: bool = True,
    apply_education: bool = True,
    apply_experience: bool = True,
    apply_skills: bool = True
) -> Dict[str, Any]:
    """Applies parsed resume details into user profile, education, experience, and candidate skills."""
    if not doc.parsed_payload:
        return {"status": "no_payload"}

    payload = doc.parsed_payload
    profile = user.profile
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.flush()

    # 1. Profile fields
    if apply_profile:
        if payload.get("headline") and not profile.headline:
            profile.headline = payload["headline"][:255]
        if payload.get("summary") and not profile.bio:
            profile.bio = payload["summary"]
        if payload.get("target_role") and not profile.target_role:
            profile.target_role = payload["target_role"][:150]
        if payload.get("location") and not profile.location:
            profile.location = payload["location"][:100]

    # 2. Education records
    added_edu_count = 0
    if apply_education and "education" in payload:
        for edu_data in payload["education"]:
            inst_name = edu_data.get("institution_name")
            deg = edu_data.get("degree")
            if inst_name and deg:
                # Avoid duplicate insertion
                existing = db.scalar(
                    select(EducationRecord).where(
                        EducationRecord.user_id == user.id,
                        EducationRecord.institution_name == inst_name,
                        EducationRecord.degree == deg
                    )
                )
                if not existing:
                    new_edu = EducationRecord(
                        user_id=user.id,
                        institution_name=inst_name[:255],
                        degree=deg[:150],
                        field_of_study=edu_data.get("field_of_study", "")[:150] if edu_data.get("field_of_study") else None,
                        start_year=edu_data.get("start_year") or 2020,
                        end_year=edu_data.get("end_year") or 2024
                    )
                    db.add(new_edu)
                    added_edu_count += 1

    # 3. Experience records
    added_exp_count = 0
    if apply_experience and "experience" in payload:
        for exp_data in payload["experience"]:
            comp_name = exp_data.get("company_name")
            job_title = exp_data.get("job_title")
            if comp_name and job_title:
                existing = db.scalar(
                    select(ExperienceRecord).where(
                        ExperienceRecord.user_id == user.id,
                        ExperienceRecord.company_name == comp_name,
                        ExperienceRecord.job_title == job_title
                    )
                )
                if not existing:
                    new_exp = ExperienceRecord(
                        user_id=user.id,
                        company_name=comp_name[:255],
                        job_title=job_title[:150],
                        employment_type=exp_data.get("employment_type", "Full-time")[:50] if exp_data.get("employment_type") else "Full-time",
                        start_date=exp_data.get("start_date") or "2023-01-01",
                        end_date=exp_data.get("end_date"),
                        is_current=exp_data.get("is_current", False),
                        description=exp_data.get("description")
                    )
                    db.add(new_exp)
                    added_exp_count += 1

    # 4. Inferred Skills from Resume
    inferred_skills_count = 0
    if apply_skills and "skills" in payload:
        for sk_data in payload["skills"]:
            skill_name = sk_data.get("name")
            if not skill_name:
                continue

            skill_slug = slugify(skill_name)
            canonical = db.scalar(
                select(CanonicalSkill).where(CanonicalSkill.slug == skill_slug)
            )
            if not canonical:
                # Check alias
                alias_obj = db.scalar(
                    select(SkillAlias).where(SkillAlias.alias == skill_name.strip().lower())
                )
                if alias_obj:
                    canonical = alias_obj.canonical_skill
                else:
                    # Create new canonical skill on the fly
                    canonical = CanonicalSkill(
                        name=skill_name.strip(),
                        slug=skill_slug,
                        category=sk_data.get("category", "technical")[:50],
                        description=f"Inferred skill from candidate document"
                    )
                    db.add(canonical)
                    db.flush()

            # Create or upgrade candidate skill to INFERRED tier
            cs = db.scalar(
                select(CandidateSkill).where(
                    CandidateSkill.user_id == user.id,
                    CandidateSkill.canonical_skill_id == canonical.id
                )
            )
            prof_hint = float(sk_data.get("proficiency_hint") or 0.6)
            if not cs:
                cs = CandidateSkill(
                    user_id=user.id,
                    canonical_skill_id=canonical.id,
                    state="INFERRED",
                    proficiency=prof_hint,
                    confidence=0.7,
                    evidence_count=1
                )
                db.add(cs)
                inferred_skills_count += 1
            else:
                # If was CLAIMED, elevate state to INFERRED (evidence-backed)
                if cs.state == "CLAIMED":
                    cs.state = "INFERRED"
                cs.confidence = min(0.9, cs.confidence + 0.15)
                cs.evidence_count += 1
                cs.last_evidence_at = datetime.now(timezone.utc)
                inferred_skills_count += 1

    # Recalculate completeness
    db.flush()
    profile.profile_completeness_score = calculate_completeness(user)
    db.commit()

    return {
        "status": "applied",
        "added_education": added_edu_count,
        "added_experience": added_exp_count,
        "inferred_skills": inferred_skills_count,
        "new_completeness_score": profile.profile_completeness_score
    }
