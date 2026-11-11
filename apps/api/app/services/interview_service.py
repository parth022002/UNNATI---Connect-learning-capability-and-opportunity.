import io
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func

from app.core.config import settings
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewTurn,
)
from app.models.user import User, UserProfile
from app.models.resume import Resume, ResumeVersion, JobDescription
from app.models.skill import CanonicalSkill, CandidateSkill

logger = logging.getLogger(__name__)


# ==============================================================================
# 1. QUESTION GENERATION ENGINE (ROLE, RESUME & JD GROUNDED)
# ==============================================================================

ROLE_DOMAIN_QUESTION_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "software": [
        {
            "question_text": "Could you walk me through the architecture of a distributed or high-throughput system you've built, and explain how you handled database bottlenecks or concurrency?",
            "question_type": "PROJECT_DEEP_DIVE",
            "competency_tag": "System Design & Architecture",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Explains service boundaries", "Database indexing or caching strategies", "Trade-off analysis"]}
        },
        {
            "question_text": "Suppose a critical production API endpoint suddenly experiences a 5x surge in latency and connection pool exhaustion. How would you systematically diagnose and mitigate the root cause?",
            "question_type": "SCENARIO",
            "competency_tag": "Production Debugging & Reliability",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Metrics inspection (p99 latency, DB connections)", "Rate limiting / circuit breaking", "Post-mortem prevention"]}
        },
        {
            "question_text": "Tell me about a time when you strongly disagreed with a senior engineer or product manager on a technical architecture decision. How did you advocate for your point of view and resolve the conflict?",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Technical Leadership & Conflict",
            "target_dimension": "BEHAVIOURAL",
            "evaluation_criteria": {"ideal_points": ["STAR framework", "Focus on data and user outcomes", "Constructive alignment"]}
        },
        {
            "question_text": "How do you approach database schema migrations in zero-downtime environments, particularly when adding columns to tables with tens of millions of rows?",
            "question_type": "CONCEPTUAL",
            "competency_tag": "Database Engineering",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Multi-step migrations (expand and contract)", "Asynchronous backfills", "Backward compatibility"]}
        },
        {
            "question_text": "Why do you want to transition into this specific role at this point in your career, and what is one technical area where you are actively upskilling?",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Self-Awareness & Growth",
            "target_dimension": "HR",
            "evaluation_criteria": {"ideal_points": ["Clear motivation", "Honest growth area", "Specific learning plan"]}
        }
    ],
    "product": [
        {
            "question_text": "How would you design and prioritize the roadmap for a brand-new feature targeting mobile power users, and what quantitative metrics would indicate success?",
            "question_type": "SCENARIO",
            "competency_tag": "Product Sense & Prioritization",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Framework like RICE or MoSCoW", "North Star Metric vs Counter Metrics", "User journey mapping"]}
        },
        {
            "question_text": "Imagine your onboarding activation rate drops by 20% week-over-week following a redesign. Walk me through your step-by-step investigation to uncover what went wrong.",
            "question_type": "SCENARIO",
            "competency_tag": "Analytical Reasoning & Diagnostics",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Funnel breakdown by cohort and device", "A/B test statistical significance", "Qualitative user interviews"]}
        },
        {
            "question_text": "Describe a situation where engineering pushback prevented you from delivering a committed product milestone. How did you negotiate scope without sacrificing value?",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Stakeholder Management",
            "target_dimension": "BEHAVIOURAL",
            "evaluation_criteria": {"ideal_points": ["STAR method", "Empathy with engineering constraints", "Value-driven scope negotiation"]}
        },
        {
            "question_text": "Tell me about a product you admire deeply. What makes its user experience exceptional, and what is one strategic risk or weakness it faces in the next two years?",
            "question_type": "CONCEPTUAL",
            "competency_tag": "Product Vision & Strategy",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Customer empathy", "Competitive moats", "Strategic foresight"]}
        },
        {
            "question_text": "Tell me about yourself, your career path so far, and why product management is the ideal career trajectory for you.",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Career Narrative & Fit",
            "target_dimension": "HR",
            "evaluation_criteria": {"ideal_points": ["Structured personal elevator pitch", "Passion for user outcomes", "Authentic storytelling"]}
        }
    ],
    "data": [
        {
            "question_text": "How would you design a scalable SQL query and dimensional data model to calculate 7-day rolling active user retention across multiple regional markets?",
            "question_type": "TECHNICAL_PROBLEM",
            "competency_tag": "SQL & Data Modeling",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Window functions (LEAD/LAG or rolling SUM)", "Partitioning and indexing", "Handling sparse activity"]}
        },
        {
            "question_text": "A business stakeholder asks you to build a dashboard, but their underlying business question is ambiguous. How do you translate vague business requests into actionable KPIs?",
            "question_type": "SCENARIO",
            "competency_tag": "Business Acumen & Communication",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Clarifying root business decision", "Leading vs lagging metrics", "Actionable dashboard design"]}
        },
        {
            "question_text": "Describe a time when you detected an anomaly or data quality flaw in an executive report right before a board meeting. How did you handle the situation?",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Integrity & Pressure Management",
            "target_dimension": "BEHAVIOURAL",
            "evaluation_criteria": {"ideal_points": ["STAR framework", "Proactive transparency", "Root cause remediation"]}
        },
        {
            "question_text": "Can you explain the difference between Type 1, Type 2, and Type 3 Slowly Changing Dimensions (SCD) in a data warehouse, and when you would choose Type 2?",
            "question_type": "CONCEPTUAL",
            "competency_tag": "Data Warehousing Fundamentals",
            "target_dimension": "TECHNICAL",
            "evaluation_criteria": {"ideal_points": ["Historical tracking with effective dates", "Surrogate keys", "Storage trade-offs"]}
        },
        {
            "question_text": "What motivates you in data analytics, and how do you ensure non-technical executives understand your insights without getting overwhelmed by numbers?",
            "question_type": "BEHAVIOURAL",
            "competency_tag": "Data Storytelling & HR",
            "target_dimension": "HR",
            "evaluation_criteria": {"ideal_points": ["Communication clarity", "Executive summary focus", "Storytelling with visual aids"]}
        }
    ]
}


def generate_initial_interview_questions(
    session: InterviewSession,
    db: Session,
    resume: Optional[Resume] = None,
    jd: Optional[JobDescription] = None
) -> List[InterviewQuestion]:
    """
    Synthesizes tailored interview questions by blending:
    - Target role domain knowledge
    - Candidate resume projects, tech stack, and internships
    - Uploaded JD mandatory skills and responsibilities
    - HR & behavioural competency standards
    """
    role_lower = (session.target_role or "software").lower()
    domain_key = "software"
    if any(k in role_lower for k in ["product", "apm", "pm", "owner"]):
        domain_key = "product"
    elif any(k in role_lower for k in ["data", "analyst", "analytics", "bi", "scientist"]):
        domain_key = "data"

    bank = ROLE_DOMAIN_QUESTION_BANKS.get(domain_key, ROLE_DOMAIN_QUESTION_BANKS["software"])
    questions = []

    # 1. Check for Resume Personalization (Project Deep-Dive)
    resume_project = None
    if resume and resume.versions:
        ver = resume.versions[0]
        if ver.projects:
            resume_project = ver.projects[0]

    # 2. Check for JD Personalization (Target Requirement)
    jd_req = None
    if jd and jd.extracted_intelligence:
        mand = jd.extracted_intelligence.get("mandatory_skills", [])
        if mand:
            jd_req = mand[0]

    order = 1
    # First question: Grounded Personal or Project Question
    if resume_project and (session.interview_type in ["COMBINED", "TECHNICAL", "RESUME_DEEP_DIVE", "FULL_SIMULATION"]):
        p_title = resume_project.get("title", "Core Engineering Project")
        p_tech = ", ".join(resume_project.get("technologies", [])) or "modern frameworks"
        q_text = f"In your resume, you highlighted your project '{p_title}' utilizing {p_tech}. Could you explain your specific architectural role, the biggest technical hurdle you faced, and how you verified the final outcome?"
        questions.append(InterviewQuestion(
            id=uuid.uuid4(),
            session_id=session.id,
            order_index=order,
            question_text=q_text,
            question_type="PROJECT_DEEP_DIVE",
            competency_tag=f"Applied Project Experience ({p_title})",
            target_dimension="TECHNICAL",
            evaluation_criteria={
                "ideal_points": [
                    "Individual contribution clarity",
                    "Architectural choices and trade-offs",
                    "Measurable results and metrics"
                ]
            },
            is_follow_up=False,
            context_source=f"Resume Project: {p_title}"
        ))
        order += 1

    # Second question: JD Mandatory Requirement scenario if available
    if jd_req and (session.interview_type in ["COMBINED", "TECHNICAL", "JD_SPECIFIC", "FULL_SIMULATION"]) and order <= session.total_questions:
        q_text = f"The job description specifically calls for hands-on proficiency in {jd_req}. Could you walk me through a production scenario where you utilized {jd_req} to solve a complex engineering or business problem?"
        questions.append(InterviewQuestion(
            id=uuid.uuid4(),
            session_id=session.id,
            order_index=order,
            question_text=q_text,
            question_type="SCENARIO",
            competency_tag=f"Target Competency: {jd_req}",
            target_dimension="TECHNICAL",
            evaluation_criteria={"ideal_points": [f"Deep practical command of {jd_req}", "Production considerations", "Error handling"]},
            is_follow_up=False,
            context_source=f"JD Requirement: {jd_req}"
        ))
        order += 1

    # Fill remaining from curated domain bank
    for item in bank:
        if order > session.total_questions:
            break
        # Filter based on interview_type
        if session.interview_type == "HR" and item["target_dimension"] == "TECHNICAL":
            continue
        if session.interview_type == "TECHNICAL" and item["target_dimension"] == "HR":
            continue

        questions.append(InterviewQuestion(
            id=uuid.uuid4(),
            session_id=session.id,
            order_index=order,
            question_text=item["question_text"],
            question_type=item["question_type"],
            competency_tag=item["competency_tag"],
            target_dimension=item["target_dimension"],
            evaluation_criteria=item["evaluation_criteria"],
            is_follow_up=False,
            context_source=f"Role Benchmark: {session.target_role}"
        ))
        order += 1

    # Ensure total questions match configuration
    session.total_questions = len(questions)
    for q in questions:
        db.add(q)
    db.commit()
    return questions


# ==============================================================================
# 2. ADAPTIVE FOLLOW-UP GENERATOR
# ==============================================================================

def generate_adaptive_follow_up(
    session: InterviewSession,
    current_question: InterviewQuestion,
    candidate_response: str,
    turn_score: float,
    db: Session
) -> Optional[InterviewQuestion]:
    """
    Generates an adaptive follow-up question when:
    - Candidate answer was vague (probes for metrics / STAR results)
    - Candidate answer was strong (probes deeper edge case / trade-offs)
    """
    words = candidate_response.strip().split()
    word_count = len(words)

    # If answer was too brief or scored low on metrics
    has_metrics = bool(re.search(r"(\d+%|\$\d+|\d+\+|\b\d+\b)", candidate_response))

    follow_up_text = None
    if word_count < 25 or turn_score < 2.5:
        follow_up_text = f"You touched upon {current_question.competency_tag}, but could you delve deeper into the exact steps you took and explain the measurable result or outcome of your approach?"
    elif not has_metrics and current_question.target_dimension in ["TECHNICAL", "BEHAVIOURAL"]:
        follow_up_text = "That's a helpful overview. Could you share what tangible metrics or key performance indicators you tracked to validate that this was successful?"
    elif turn_score >= 4.0:
        follow_up_text = "Excellent analysis. What would be the biggest risk or failure mode with that approach if the system scaled 10x, and how would you prepare for it?"

    if follow_up_text:
        next_order = current_question.order_index + 1
        follow_up = InterviewQuestion(
            id=uuid.uuid4(),
            session_id=session.id,
            order_index=next_order,
            question_text=follow_up_text,
            question_type="FOLLOW_UP",
            competency_tag=f"{current_question.competency_tag} (Deep Dive)",
            target_dimension=current_question.target_dimension,
            evaluation_criteria={"ideal_points": ["Concrete metrics", "Trade-offs", "STAR completeness"]},
            is_follow_up=True,
            parent_question_id=current_question.id,
            context_source="Adaptive Follow-up"
        )
        return follow_up

    return None


# ==============================================================================
# 3. RUBRIC-BASED EVALUATION ENGINE (0-5 STANDARDIZED SCALE)
# ==============================================================================

AI_EVALUATION_PROMPT = """
You are an expert Senior Hiring Manager and Interview Assessor at UNNATI.
Evaluate the candidate's interview response against the provided question and criteria.

Rules:
1. Score strictly on a 0.0 to 5.0 scale:
   - 0.0: No answer or irrelevant
   - 1.0: Very weak understanding
   - 2.0: Partial understanding with major gaps
   - 3.0: Acceptable answer with minor gaps
   - 4.0: Strong and well-supported answer
   - 5.0: Exceptional, accurate, and clearly articulated
2. Never award a 5.0 simply because the response is verbose. Look for structural clarity, technical accuracy, and tangible metrics.
3. For behavioural questions, evaluate STAR completeness (Situation, Task, Action, Result).
4. Provide constructive, encouraging feedback with a tangible stronger answer example.

Return a STRICT, VALID JSON object with this exact schema:
{
  "score": float between 0.0 and 5.0,
  "technical_accuracy_score": float between 0.0 and 5.0,
  "clarity_score": float between 0.0 and 5.0,
  "depth_score": float between 0.0 and 5.0,
  "star_completeness": {
    "situation": boolean,
    "task": boolean,
    "action": boolean,
    "result": boolean,
    "reflection": boolean
  },
  "what_was_done_well": [string],
  "what_was_missing": [string],
  "improvement_advice": string,
  "stronger_answer_example": string
}

Only return valid JSON without markdown fences or commentary.
"""

def heuristic_evaluate_answer(
    question: InterviewQuestion,
    response_text: str
) -> Dict[str, Any]:
    """Deterministic fallback evaluator adhering strictly to the 0-5 rubric."""
    words = response_text.strip().split()
    word_count = len(words)
    lower = response_text.lower()

    if word_count < 10:
        return {
            "score": 1.5,
            "technical_accuracy_score": 1.5,
            "clarity_score": 2.0,
            "depth_score": 1.0,
            "star_completeness": {"situation": True, "task": False, "action": False, "result": False, "reflection": False},
            "what_was_done_well": ["Attempted response to the question."],
            "what_was_missing": ["Significant lack of depth, missing context, and no tangible outcomes."],
            "improvement_advice": "Structure your response more thoroughly using the STAR framework (Situation, Task, Action, Result) and aim for 60-150 words.",
            "stronger_answer_example": f"In my previous work dealing with {question.competency_tag}, I identified the root issue by analyzing metrics, implemented a structured solution, and improved operational throughput by 25%."
        }

    # Evaluate metric density & STAR signals
    has_metrics = bool(re.search(r"(\d+%|\$\d+|\d+\+|\b\d+\b)", response_text))
    has_action = any(v in lower for v in ["i designed", "i built", "i spearheaded", "i analyzed", "i implemented", "i resolved"])
    has_result = any(r in lower for r in ["resulted in", "improved", "reduced", "delivered", "outcome was", "achieved"])

    score = 3.0
    if word_count >= 50: score += 0.5
    if has_metrics: score += 0.5
    if has_action and has_result: score += 0.5

    score = min(5.0, max(1.0, round(score, 1)))

    what_well = ["Addressed core topic clearly", "Demonstrated relevant domain terminology"]
    if has_metrics:
        what_well.append("Included quantifiable outcome metrics")

    what_missing = []
    if not has_metrics:
        what_missing.append("Missing quantifiable impact or performance metrics.")
    if not has_result:
        what_missing.append("Could emphasize the final outcome and learnings more explicitly.")

    return {
        "score": score,
        "technical_accuracy_score": score,
        "clarity_score": 4.0 if word_count >= 40 else 3.0,
        "depth_score": score,
        "star_completeness": {
            "situation": True,
            "task": True,
            "action": has_action,
            "result": has_result,
            "reflection": True
        },
        "what_was_done_well": what_well,
        "what_was_missing": what_missing or ["Minor trade-off depth could be elaborated."],
        "improvement_advice": "Emphasize your individual contribution and quantify the business or technical outcome using metrics.",
        "stronger_answer_example": f"When addressing {question.competency_tag}, I first isolated constraints, orchestrated an automated solution utilizing best practices, and achieved a 30% reduction in turnaround time."
    }


def evaluate_candidate_response(
    question: InterviewQuestion,
    response_text: str,
    session: InterviewSession,
    db: Session
) -> Dict[str, Any]:
    """Evaluates candidate response using Gemini Flash with deterministic fallback."""
    if not settings.gemini_api_key or (not settings.gemini_api_key.startswith("AQ.") and len(settings.gemini_api_key) < 10):
        return heuristic_evaluate_answer(question, response_text)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = (
            f"{AI_EVALUATION_PROMPT}\n"
            f"Target Role: {session.target_role}\n"
            f"Question: {question.question_text}\n"
            f"Target Dimension: {question.target_dimension}\n"
            f"Competency Tag: {question.competency_tag}\n"
            f"Candidate Response: {response_text}"
        )
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
        logger.warning(f"Gemini interview evaluation failed: {e}. Falling back to heuristic rubric.")
        return heuristic_evaluate_answer(question, response_text)


# ==============================================================================
# 4. SESSION CONCLUSION & REPORT SYNTHESIS
# ==============================================================================

def conclude_interview_session(
    session: InterviewSession,
    db: Session
) -> Dict[str, Any]:
    """
    Aggregates completed turns, computes overall scores (0.0 to 5.0),
    identifies strongest competencies and growth priorities, and maps
    gaps to UNNATI Career Roadmap modules.
    """
    turns = session.turns
    if not turns:
        session.status = "COMPLETED"
        session.overall_score = 3.0
        session.completed_at = datetime.now(timezone.utc)
        db.commit()
        return {}

    total_score = sum(t.score for t in turns)
    overall_avg = round(total_score / len(turns), 2)
    session.overall_score = overall_avg

    # Dimension scores
    tech_turns = [t for t in turns if t.question.target_dimension == "TECHNICAL"]
    hr_turns = [t for t in turns if t.question.target_dimension in ["HR", "BEHAVIOURAL"]]

    session.technical_score = round(sum(t.score for t in tech_turns) / len(tech_turns), 2) if tech_turns else overall_avg
    session.hr_score = round(sum(t.score for t in hr_turns) / len(hr_turns), 2) if hr_turns else overall_avg
    session.behavioural_score = session.hr_score

    # Competency score map
    comp_scores: Dict[str, List[float]] = {}
    for t in turns:
        c_tag = t.question.competency_tag
        if c_tag not in comp_scores:
            comp_scores[c_tag] = []
        comp_scores[c_tag].append(t.score)

    comp_averages = {k: round(sum(v) / len(v), 2) for k, v in comp_scores.items()}
    sorted_comps = sorted(comp_averages.items(), key=lambda x: x[1], reverse=True)

    strongest = [c[0] for c in sorted_comps if c[1] >= 3.8][:3]
    if not strongest and sorted_comps:
        strongest = [sorted_comps[0][0]]

    weakest = [c[0] for c in sorted_comps if c[1] < 3.5][:3]
    if not weakest and len(sorted_comps) > 1:
        weakest = [sorted_comps[-1][0]]

    readiness_tier = (
        "Exceptional" if overall_avg >= 4.5 else (
            "Competitive" if overall_avg >= 3.8 else (
                "Needs Practice" if overall_avg >= 2.8 else "Developing"
            )
        )
    )

    repeated_mistakes = []
    # Check if results were omitted in multiple turns
    unmeasured_turns = [t for t in turns if not t.star_completeness.get("result", True)]
    if len(unmeasured_turns) >= 2:
        repeated_mistakes.append("Consistently omitted measurable result metrics in STAR stories.")

    # Learning recommendations mapped to UNNATI Roadmap
    learning_recommendations = []
    for weak_tag in weakest:
        clean_tag = weak_tag.split("(")[0].strip()
        learning_recommendations.append({
            "skill": clean_tag,
            "module_name": f"{clean_tag} Masterclass & Scenario Drills",
            "roadmap_action": f"Review core frameworks and complete mock exercises on UNNATI Upskilling portal.",
            "urgency": "High",
            "estimated_hours": 8
        })

    session.evaluation_summary = {
        "readiness_tier": readiness_tier,
        "strongest_areas": strongest,
        "weakest_areas": weakest,
        "repeated_mistakes": repeated_mistakes,
        "competency_scores": comp_averages,
        "improvement_priorities": [
            f"Focus on {weakest[0]} conceptual depth" if weakest else "Deepen system trade-off articulation",
            "Incorporate quantifiable business impact metrics into STAR answers"
        ]
    }
    session.learning_recommendations = learning_recommendations
    session.status = "COMPLETED"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)

    return session.evaluation_summary


# ==============================================================================
# 5. STUDIO DASHBOARD & PROGRESS TRACKING
# ==============================================================================

def get_interview_studio_dashboard(user_id: uuid.UUID, db: Session) -> Dict[str, Any]:
    """Computes aggregated interview practice KPIs, progress trends, and recommended practice."""
    sessions = db.scalars(
        select(InterviewSession)
        .where(InterviewSession.user_id == user_id)
        .order_by(desc(InterviewSession.created_at))
    ).all()

    completed_sessions = [s for s in sessions if s.status == "COMPLETED" and s.overall_score is not None]
    total_completed = len(completed_sessions)

    total_questions = sum(len(s.turns) for s in sessions)
    avg_score = round(sum(s.overall_score for s in completed_sessions) / total_completed, 2) if total_completed else 3.8
    avg_tech = round(sum(s.technical_score for s in completed_sessions if s.technical_score) / max(1, total_completed), 2) if total_completed else 3.9
    avg_hr = round(sum(s.hr_score for s in completed_sessions if s.hr_score) / max(1, total_completed), 2) if total_completed else 3.7

    readiness_tier = (
        "Exceptional" if avg_score >= 4.5 else (
            "Competitive" if avg_score >= 3.8 else (
                "Needs Practice" if avg_score >= 2.8 else "Developing"
            )
        )
    )

    # Strongest competency from all turns
    all_turns = db.scalars(
        select(InterviewTurn).join(InterviewSession).where(InterviewSession.user_id == user_id)
    ).all()
    comp_map: Dict[str, List[float]] = {}
    for t in all_turns:
        c = t.question.competency_tag
        if c not in comp_map: comp_map[c] = []
        comp_map[c].append(t.score)

    strongest = "System Design & Architecture"
    weakest = "Metric Definition & STAR Results"
    if comp_map:
        sorted_c = sorted(comp_map.items(), key=lambda x: sum(x[1])/len(x[1]), reverse=True)
        strongest = sorted_c[0][0]
        if len(sorted_c) > 1:
            weakest = sorted_c[-1][0]

    return {
        "total_sessions_completed": total_completed,
        "total_questions_answered": total_questions,
        "overall_readiness_score": avg_score,
        "readiness_tier": readiness_tier,
        "average_technical_score": avg_tech,
        "average_hr_score": avg_hr,
        "strongest_competency": strongest,
        "primary_growth_area": weakest,
        "recommended_interview": {
            "title": "Software Engineer Technical & System Design Mock",
            "target_role": "Software Engineer",
            "type": "COMBINED",
            "difficulty": "INTERMEDIATE",
            "duration_minutes": 30,
            "reason": f"Targeted practice to strengthen {weakest} and validate STAR metrics."
        },
        "recent_sessions": sessions[:6]
    }

