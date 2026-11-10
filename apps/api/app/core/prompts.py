# ==============================================================================
# UNNATI — Centralized Versioned Prompt Management & Token Budget Registry
# ==============================================================================
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class PromptTemplate(BaseModel):
    prompt_id: str
    version: str
    description: str
    max_input_tokens: int = Field(default=4096)
    max_output_tokens: int = Field(default=2048)
    temperature: float = Field(default=0.2)
    system_instruction: str
    user_template: str

# Central Prompt Registry (Tracked & Versioned in Git)
PROMPT_REGISTRY: Dict[str, PromptTemplate] = {
    # 1. Resume & Transcript Information Extraction (Algorithm A Ingestion)
    "resume_extraction_v2": PromptTemplate(
        prompt_id="resume_extraction",
        version="2.1.0",
        description="Extracts structured education, experience, and skill evidence from resume text.",
        max_input_tokens=6000,
        max_output_tokens=3000,
        temperature=0.1,
        system_instruction=(
            "You are UNNATI's Career Talent Intelligence Parser. "
            "Your objective is to extract accurate candidate backgrounds without hallucination. "
            "Output strictly valid JSON conforming to the requested schema."
        ),
        user_template=(
            "Extract candidate profile information from the following document text:\n\n"
            "--- BEGIN DOCUMENT ---\n"
            "{document_text}\n"
            "--- END DOCUMENT ---\n\n"
            "Return JSON matching:\n"
            '{{"first_name": "...", "last_name": "...", "target_role": "...", '
            '"education": [{{"institution_name": "...", "degree": "...", "field_of_study": "...", "end_year": 2024}}], '
            '"experience": [{{"company_name": "...", "title": "...", "description": "..."}}], '
            '"extracted_skills": ["Python", "SQL", ...]}}'
        )
    ),

    # 2. Evidence-Weighted Skill Gap Analysis (Algorithm B)
    "skill_gap_analysis_v1": PromptTemplate(
        prompt_id="skill_gap_analysis",
        version="1.0.0",
        description="Evaluates candidate competency delta against target role benchmarks.",
        max_input_tokens=4000,
        max_output_tokens=2048,
        temperature=0.2,
        system_instruction=(
            "You are UNNATI's Competency Diagnostic Engine. "
            "Evaluate skill readiness scores (0.0 to 1.0) and identify missing prerequisites."
        ),
        user_template=(
            "Target Role: {target_role}\n"
            "Candidate Verified Skills: {candidate_skills}\n"
            "Benchmark Required Skills: {benchmark_skills}\n\n"
            "Compute prioritized skill gaps and prerequisite ordering."
        )
    ),

    # 3. Topological Roadmap Synthesis (Algorithm C)
    "roadmap_synthesis_v1": PromptTemplate(
        prompt_id="roadmap_synthesis",
        version="1.2.0",
        description="Generates a 3-phase prerequisite-aware learning journey.",
        max_input_tokens=5000,
        max_output_tokens=3500,
        temperature=0.2,
        system_instruction=(
            "You are UNNATI's Topological Learning Path Optimizer. "
            "Synthesize sequential learning milestones minimizing total completion time."
        ),
        user_template=(
            "Role: {target_role}\n"
            "Weekly Time Budget: {weekly_hours} hours\n"
            "Identified Gaps: {gap_list}\n\n"
            "Synthesize Foundations, Core Engineering, and Advanced Capstone milestones."
        )
    ),

    # 4. Formative Socratic Career Companion (Phase 4 Ready)
    "career_companion_v1": PromptTemplate(
        prompt_id="career_companion",
        version="1.0.0",
        description="Socratic formative guidance with groundings and inline citations.",
        max_input_tokens=3000,
        max_output_tokens=1500,
        temperature=0.4,
        system_instruction=(
            "You are UNNATI's AI Growth Companion. "
            "Guide ambitious learners with constructive formative feedback, encouragement, and actionable steps."
        ),
        user_template="Candidate Query: {query}\nLearner Context: {context}"
    )
}

def get_prompt_template(prompt_key: str) -> Optional[PromptTemplate]:
    """Retrieves a versioned prompt template from the registry."""
    return PROMPT_REGISTRY.get(prompt_key)

def format_prompt(prompt_key: str, **kwargs) -> str:
    """Formats a prompt with input validation."""
    template = get_prompt_template(prompt_key)
    if not template:
        raise KeyError(f"Prompt template '{prompt_key}' not found in registry.")
    return template.user_template.format(**kwargs)

