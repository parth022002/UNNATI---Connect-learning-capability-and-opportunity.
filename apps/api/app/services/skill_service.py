from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
import re
from app.models.skill import CanonicalSkill, SkillAlias, CandidateSkill
from app.models.user import User

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text)

def get_or_create_canonical_skill(db: Session, name: str, category: str = "technical") -> CanonicalSkill:
    """Finds canonical skill by alias or name, or creates a new entry."""
    clean_name = name.strip()
    slug = slugify(clean_name)

    # 1. Search canonical skills by slug
    skill = db.scalar(select(CanonicalSkill).where(CanonicalSkill.slug == slug))
    if skill:
        return skill

    # 2. Search aliases
    alias_match = db.scalar(select(SkillAlias).where(SkillAlias.alias == clean_name.lower()))
    if alias_match:
        return alias_match.canonical_skill

    # 3. Create canonical skill
    skill = CanonicalSkill(
        name=clean_name,
        slug=slug,
        category=category or "technical",
    )
    db.add(skill)
    db.flush()

    # Create alias for lowercased name
    alias = SkillAlias(
        canonical_skill_id=skill.id,
        alias=clean_name.lower()
    )
    db.add(alias)
    db.commit()
    db.refresh(skill)
    return skill

def claim_candidate_skill(
    db: Session,
    user: User,
    skill_name: str,
    category: str = "technical",
    proficiency: float = 0.5
) -> CandidateSkill:
    """Associates a claimed skill with a candidate user."""
    canonical_skill = get_or_create_canonical_skill(db, skill_name, category)

    # Check if candidate already has this skill
    cs = db.scalar(
        select(CandidateSkill).where(
            CandidateSkill.user_id == user.id,
            CandidateSkill.canonical_skill_id == canonical_skill.id
        )
    )

    if cs:
        cs.proficiency = proficiency
    else:
        cs = CandidateSkill(
            user_id=user.id,
            canonical_skill_id=canonical_skill.id,
            state="CLAIMED",
            proficiency=proficiency,
            confidence=0.5,
            evidence_count=1,
        )
        db.add(cs)

    db.commit()
    db.refresh(cs)
    return cs

