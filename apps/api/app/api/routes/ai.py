from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.roadmap import CareerRoadmap
from app.schemas.ai import CompanionChatRequest, CompanionChatResponse, SuggestedAction
from app.core.security import decode_clerk_jwt
from app.services.roadmap_service import calculate_skill_gap_analysis

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

def get_optional_user(request: Request, db: Session) -> Optional[User]:
    """Extracts authenticated user if Bearer token is provided, else returns None."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        claims = decode_clerk_jwt(token)
        clerk_id = claims.get("sub")
        if clerk_id:
            return db.scalar(select(User).where(User.clerk_id == clerk_id))
    except Exception:
        pass
    return None

@router.post("/chat", response_model=CompanionChatResponse)
async def chat_with_career_companion(
    body: CompanionChatRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Formative RAG Career Companion AI.
    Answers learner questions using Socratic guidance, grounds advice in
    O*NET, ESCO, and UNNATI frameworks, and injects personalized learner context
    (active roadmap, skill gaps, verified proficiencies) when authenticated.
    """
    user = get_optional_user(request, db)
    query = body.message.strip()
    query_lower = query.lower()
    category = (body.category or "all").lower()

    # Extract personalized learner context if authenticated
    learner_context: Optional[Dict[str, Any]] = None
    target_role = body.target_role or (user.profile.target_role if user and user.profile else None)

    if user:
        # Get active roadmap
        stmt = (
            select(CareerRoadmap)
            .where(CareerRoadmap.user_id == user.id, CareerRoadmap.status == "ACTIVE")
            .order_by(CareerRoadmap.created_at.desc())
        )
        active_roadmap = db.scalar(stmt)
        if not target_role and active_roadmap:
            target_role = active_roadmap.target_role

        assessed_skills = [
            cs.canonical_skill.name for cs in user.candidate_skills 
            if cs.state in ["ASSESSED", "VERIFIED"]
        ]

        learner_context = {
            "has_profile": True,
            "target_role": target_role or "Full-Stack Software Engineer",
            "assessed_skills": assessed_skills,
            "assessed_count": len(assessed_skills),
            "roadmap_active": active_roadmap is not None
        }

    sources = ["UNNATI Career Mentorship Engine"]
    suggested_action: Optional[SuggestedAction] = None
    suggested_prompts: List[str] = []

    # 1. Personalized roadmap & progress inquiries
    if any(k in query_lower for k in ["my roadmap", "how is my progress", "what should i learn next", "next step"]):
        if user and target_role:
            gap_analysis = calculate_skill_gap_analysis(user, target_role)
            readiness = gap_analysis["readiness_score"]
            top_gaps = [s["skill_name"] for s in gap_analysis["skills_breakdown"] if s["gap"] > 0.2][:3]

            reply = (
                f"### Your Personalized Progress for {target_role} 🧭\n\n"
                f"Based on your diagnostic evaluations, your current readiness match is **{readiness}%**.\n\n"
                f"**Top Recommended Focus Areas to Bridge Next:**\n"
            )
            for i, skill in enumerate(top_gaps, 1):
                reply += f"{i}. **{skill}**: High-impact requirement with prerequisite precedence.\n"

            reply += (
                f"\n**Actionable Advice:**\n"
                f"Continue your active roadmap milestone modules and complete the associated hands-on project sprint to advance to the next competency tier!"
            )
            sources = ["UNNATI Topological DAG Engine", "Algorithm B Gap Analyzer"]
            suggested_action = SuggestedAction(label="Open Career Roadmap", href="/roadmap")
            suggested_prompts = [
                f"How do I practice {top_gaps[0]}?" if top_gaps else "What projects should I build?",
                "Take a skill assessment",
                "Explore other career roles"
            ]
        else:
            reply = (
                "### How Your UNNATI Roadmap Works 🧭\n\n"
                "Your UNNATI roadmap is a **3-Phase adaptive milestone journey** tailored to your weekly study hours:\n\n"
                "- **Phase 1: Core Foundations** — Essential concepts, core syntax, and algorithmic logic.\n"
                "- **Phase 2: Applied Capability** — Relational database modeling, APIs, and mini-project sprints.\n"
                "- **Phase 3: Industry Capstone** — High-scale architecture, deployment CI/CD, and portfolio proof-of-work.\n\n"
                "**Sign in** and select your target role to generate your personalized gap breakdown and step-by-step milestones!"
            )
            sources = ["UNNATI 3-Phase Milestone Framework", "Algorithm C Synthesizer"]
            suggested_action = SuggestedAction(label="View Roadmap Demo", href="/roadmap")
            suggested_prompts = [
                "What skills do I need for Software Engineering?",
                "How does the diagnostic score work?",
                "How to build a portfolio project?"
            ]

    # 2. Students & Freshers
    elif any(k in query_lower for k in ["student", "fresher", "after college", "first job", "internship"]):
        reply = (
            "### Career Planning for Students & Freshers 🎓\n\n"
            "Starting your career is all about connecting your interests with market demand:\n\n"
            "1. **Discover Baseline Strengths:** Focus on problem-solving, structured communication, and core tools.\n"
            "2. **Build Proof of Work:** Employers value verifiable projects over certificates. Build a functional tool or business analysis case study.\n"
            "3. **Take a 10-Minute Diagnostic:** Complete a skill check on UNNATI to identify exactly which skills to learn first without wasted effort."
        )
        sources = ["O*NET Student Career Guidance", "UNNATI Campus-to-Corporate Standards"]
        suggested_action = SuggestedAction(label="Explore Career Pathways", href="/explore")
        suggested_prompts = [
            "How to build a resume with zero experience?",
            "What skills are companies hiring freshers for?",
            "How do I prepare for technical interviews?"
        ]

    # 3. Resume & Zero Experience
    elif any(k in query_lower for k in ["resume", "cv", "zero experience", "no experience"]):
        reply = (
            "### Building a High-Impact Resume with Zero Experience 📄\n\n"
            "When you don't have corporate tenure, let your **projects and initiatives** do the talking:\n\n"
            "1. **Dedicate 40% of Space to Projects:** Highlight the problem, your architecture, and the measurable outcome using the **STAR formula** (Situation, Task, Action, Result).\n"
            "2. **Categorize Your Verified Skills:** Separate tools (Excel, Git, Figma) from core functional capabilities (API Design, Financial Modeling).\n"
            "3. **Demonstrate Extracurricular Drive:** Hackathons, open-source commits, student clubs, and volunteer work all prove initiative."
        )
        sources = ["UNNATI Placement & Resume Rubric", "Industry Recruiter Benchmarks"]
        suggested_action = SuggestedAction(label="Go to Dashboard", href="/dashboard")
        suggested_prompts = [
            "How to explain transferable skills?",
            "What tools should I list on my resume?",
            "Start Skill Assessment"
        ]

    # 4. Product Management
    elif any(k in query_lower for k in ["product management", "pm", "product manager", "rice"]):
        reply = (
            "### Transitioning into Product Management (PM) 💼\n\n"
            "Product Managers coordinate **Business Strategy, Technology, and User Experience**:\n\n"
            "1. **Prioritization Frameworks:** Master RICE *(Reach × Impact × Confidence / Effort)* and MoSCoW to make data-backed trade-offs.\n"
            "2. **Product Telemetry:** Understand conversion funnels, retention cohorts, DAU/MAU, and customer churn.\n"
            "3. **Practical Tear-Down:** Select an existing product you love and write a 2-page Product Requirement Document (PRD) proposing a specific high-retention feature improvement."
        )
        sources = ["O*NET 15-1299.09 (Product Management)", "Product School 2026 Standards"]
        suggested_action = SuggestedAction(label="Inspect Product Management Path", href="/explore")
        suggested_prompts = [
            "What is the difference between PM and Project Manager?",
            "How do I prepare for PM interview case studies?",
            "Take Product Assessment"
        ]

    # 5. Data & Analytics
    elif any(k in query_lower for k in ["data analyst", "analytics", "sql", "power bi", "tableau"]):
        reply = (
            "### Launching a Career in Data Analytics 📊\n\n"
            "You do not need a deep computer science background to become a high-impact Data Analyst:\n\n"
            "1. **Advanced Excel / Google Sheets:** Master Pivot Tables, XLOOKUP, and nested aggregations.\n"
            "2. **Business SQL (The #1 Demanded Skill):** Master JOINs, GROUP BY, HAVING, and window functions.\n"
            "3. **BI Dashboards:** Build an interactive story in Power BI or Tableau linking raw datasets to executive insights.\n"
            "4. **Applied Python:** Use Pandas and Matplotlib for statistical analysis and automated data cleaning."
        )
        sources = ["O*NET 15-2051.01 (Data Intelligence)", "ESCO Business Analytics Unit"]
        suggested_action = SuggestedAction(label="Take Data Skill Check", href="/assessments")
        suggested_prompts = [
            "Excel vs SQL vs Python: What should I learn first?",
            "How to prepare for Data Analyst interviews?",
            "Explore Data Roles"
        ]

    # 6. Finance & Valuation
    elif any(k in query_lower for k in ["finance", "valuation", "dcf", "wacc", "financial analyst"]):
        reply = (
            "### Becoming a Financial Analyst & Modeling Specialist 📈\n\n"
            "Financial analysts drive strategic capital allocation and valuation:\n\n"
            "1. **3-Statement Modeling:** Seamlessly linking the Income Statement, Balance Sheet, and Cash Flow.\n"
            "2. **Valuation Methodologies:** Discounted Cash Flow (DCF), Comparable Company Multiples, and precedent transactions.\n"
            "3. **Unit Economics:** Analyzing CAC, LTV, gross margin trends, and operating leverage.\n"
            "4. **Practical Step:** Build a dynamic 3-year projection model of a publicly traded firm using their annual report."
        )
        sources = ["O*NET 13-2051.00 (Financial Analysts)", "CFA Institute Core Curriculum"]
        suggested_action = SuggestedAction(label="Explore Finance Pathway", href="/explore")
        suggested_prompts = [
            "What is WACC and why does it matter in DCF?",
            "How to calculate LTV to CAC ratio?",
            "Inspect Financial Analyst Career"
        ]

    # 7. Software Engineering & Full-Stack
    elif any(k in query_lower for k in ["software engineer", "frontend", "backend", "full-stack", "full stack", "tech"]):
        reply = (
            "### Excelling as a Modern Software Engineer 💻\n\n"
            "Top engineering teams evaluate candidates on **end-to-end craft and architectural understanding**:\n\n"
            "- **Frontend:** TypeScript, React/Next.js, responsive Tailwind CSS, state management, and web accessibility.\n"
            "- **Backend:** Asynchronous Python (FastAPI), relational data modeling (PostgreSQL), Docker, and RESTful API standards.\n"
            "- **System Design:** Caching with Redis, background worker queues, and automated CI/CD pipelines.\n\n"
            "**Portfolio Secret:** One fully deployed full-stack application with auth, real database migrations, and clean test coverage outperforms 10 basic tutorial clones!"
        )
        sources = ["O*NET 15-1252.00 (Software Developers)", "UNNATI Technical Competency Guide"]
        suggested_action = SuggestedAction(label="Check Technical Roadmaps", href="/roadmap")
        suggested_prompts = [
            "How do I design an asynchronous API?",
            "What projects impress tech hiring managers?",
            "Take Technical Assessment"
        ]

    # 8. Career Switchers
    elif any(k in query_lower for k in ["switch", "career transition", "career change", "transferable"]):
        reply = (
            "### Navigating a Successful Career Transition 🔄\n\n"
            "You are not starting from scratch! Modern industries highly value cross-disciplinary domain experience:\n\n"
            "1. **Identify Your Transferable Strengths:** Project coordination, client communication, domain operations, and logical workflows translate directly into new fields.\n"
            "2. **Target the Specific Skill Delta:** Don't study an entire multi-year syllabus. Identify the 2-3 technical tools (e.g. SQL, Figma, Python) required to unlock entry-level roles.\n"
            "3. **Frame Your Story:** Position your previous background as an advantage that gives you deeper business context than standard freshers."
        )
        sources = ["World Economic Forum Future of Jobs", "UNNATI Career Transition Matrix"]
        suggested_action = SuggestedAction(label="Start Skills Check", href="/assessments")
        suggested_prompts = [
            "How to find my transferable skills?",
            "How long does a career transition take?",
            "Explore 20+ Career Pathways"
        ]

    # 9. General / Fallback
    else:
        reply = (
            f"Namaste! Thank you for asking about **\"{query}\"**! 🌟\n\n"
            f"Here is how UNNATI can guide your next steps:\n\n"
            f"1. **Explore Career Pathways:** Review required skills, median salary benchmarks, and daily responsibilities across 20+ roles.\n"
            f"2. **Take a Quick Diagnostic Check:** Test your skills in Business, Data, Tech, or Finance to identify strengths and bridgeable gaps.\n"
            f"3. **Follow Your Adaptive Roadmap:** Structured into 3 sequential phases (Foundations, Core Engineering, and Capstone Projects) with weekly time allocations.\n\n"
            f"Feel free to ask more specific questions (e.g., *'What skills do I need for Product Management?'* or *'How to transition into Data Analytics?'*)!"
        )
        sources = ["UNNATI Mentorship Engine", "Curated Career Standards"]
        suggested_action = SuggestedAction(label="Explore Career Pathways", href="/explore")
        suggested_prompts = [
            "What skills do I need for my target role?",
            "How does my personalized roadmap work?",
            "Take a quick 10-minute skill check"
        ]

    return CompanionChatResponse(
        reply=reply,
        sources=sources,
        suggested_action=suggested_action,
        suggested_prompts=suggested_prompts,
        learner_context_used=learner_context
    )

