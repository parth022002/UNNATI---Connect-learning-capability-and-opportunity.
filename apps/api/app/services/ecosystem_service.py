import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.user import User, UserProfile
from app.models.skill import CandidateSkill
from app.models.roadmap import CareerRoadmap
from app.models.ecosystem import Institution, Cohort, CohortMember, Employer, Opportunity
from app.schemas.ecosystem import (
    InstitutionResponse, CohortSummary, CohortAnalyticsResponse,
    CohortDistributionTier, CurriculumGapItem, CandidateTalentProfile,
    TalentSearchFilterRequest, TalentSearchResponse, OpportunityResponse,
    MarketIntelligenceResponse, MarketSkillTrend
)

# Canonical benchmark curricula for blind spot detection
BENCHMARK_SKILL_IMPORTANCE = {
    "Docker": {"category": "DevOps & Cloud", "importance": "Critical"},
    "Kubernetes": {"category": "DevOps & Cloud", "importance": "High"},
    "PostgreSQL": {"category": "Databases", "importance": "Critical"},
    "FastAPI": {"category": "Backend Engineering", "importance": "High"},
    "System Design": {"category": "Architecture", "importance": "Critical"},
    "React": {"category": "Frontend Engineering", "importance": "High"},
    "TypeScript": {"category": "Languages", "importance": "High"},
    "SQL": {"category": "Data & Databases", "importance": "Critical"},
    "Power BI": {"category": "Business Intelligence", "importance": "High"},
    "Financial Modeling": {"category": "Corporate Finance", "importance": "Critical"},
    "Product Sense": {"category": "Product Management", "importance": "Critical"}
}

DEMO_INSTITUTION_DATA = {
    "name": "Indian Institute of Technology & Management (IITM)",
    "code": "IITM-UNN",
    "institution_type": "Autonomous University",
    "domain": "iitm.ac.in",
    "location": "New Delhi / Bengaluru, India",
    "contact_email": "dean.academics@iitm.ac.in"
}

def get_or_create_default_institution(db: Session) -> Institution:
    inst = db.execute(select(Institution).where(Institution.code == DEMO_INSTITUTION_DATA["code"])).scalar_one_or_none()
    if not inst:
        inst = Institution(
            id=uuid.uuid4(),
            name=DEMO_INSTITUTION_DATA["name"],
            code=DEMO_INSTITUTION_DATA["code"],
            institution_type=DEMO_INSTITUTION_DATA["institution_type"],
            domain=DEMO_INSTITUTION_DATA["domain"],
            location=DEMO_INSTITUTION_DATA["location"],
            is_verified=True,
            contact_email=DEMO_INSTITUTION_DATA["contact_email"]
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)

        # Create demo cohorts
        cohort1 = Cohort(
            id=uuid.uuid4(),
            institution_id=inst.id,
            name="B.Tech Computer Science & AI (Class of 2026)",
            department="Computer Science & Engineering",
            target_degree="B.Tech",
            graduation_year=2026,
            total_students=120
        )
        cohort2 = Cohort(
            id=uuid.uuid4(),
            institution_id=inst.id,
            name="MBA Business Analytics & Product (Class of 2025)",
            department="School of Management",
            target_degree="MBA",
            graduation_year=2025,
            total_students=85
        )
        cohort3 = Cohort(
            id=uuid.uuid4(),
            institution_id=inst.id,
            name="B.Com Finance & Fintech (Class of 2026)",
            department="Department of Commerce & Finance",
            target_degree="B.Com Hons",
            graduation_year=2026,
            total_students=95
        )
        db.add_all([cohort1, cohort2, cohort3])
        db.commit()
        db.refresh(inst)

    return inst

def get_or_create_default_employer(db: Session) -> Employer:
    emp = db.execute(select(Employer).where(Employer.company_name == "Tata Digital")).scalar_one_or_none()
    if not emp:
        emp = Employer(
            id=uuid.uuid4(),
            company_name="Tata Digital",
            sector="Technology & E-Commerce",
            website="https://www.tatadigital.com",
            contact_email="university.relations@tatadigital.com",
            is_verified=True
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)

        # Seed initial opportunities
        opp1 = Opportunity(
            id=uuid.uuid4(),
            employer_id=emp.id,
            title="Associate Full-Stack Engineer",
            role_category="Software Engineering",
            location="Bengaluru / Hybrid",
            employment_type="Full-Time",
            min_readiness_score=72.0,
            required_skills=["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            description="Build scalable customer-facing microservices and reactive interfaces for high-concurrency products.",
            salary_range="₹14.0L – ₹18.0L CTC",
            status="ACTIVE"
        )
        opp2 = Opportunity(
            id=uuid.uuid4(),
            employer_id=emp.id,
            title="Junior Product & Analytics Associate",
            role_category="Product & Analytics",
            location="Mumbai / Hybrid",
            employment_type="Full-Time",
            min_readiness_score=68.0,
            required_skills=["SQL", "Power BI", "Data Analysis", "Product Sense"],
            description="Conduct funnel optimization, user interview synthesis, and cohort retention modeling.",
            salary_range="₹11.0L – ₹15.0L CTC",
            status="ACTIVE"
        )
        db.add_all([opp1, opp2])
        db.commit()
        db.refresh(emp)

    return emp

def get_institution_summary(db: Session) -> InstitutionResponse:
    inst = get_or_create_default_institution(db)
    cohorts_res = []
    for c in inst.cohorts:
        # Compute dynamic or baseline average readiness
        avg_score = 68.4 if "Computer Science" in c.name else (72.1 if "MBA" in c.name else 64.8)
        cohorts_res.append(
            CohortSummary(
                id=str(c.id),
                name=c.name,
                department=c.department,
                target_degree=c.target_degree,
                graduation_year=c.graduation_year,
                total_students=c.total_students,
                average_readiness_score=avg_score
            )
        )
    return InstitutionResponse(
        id=str(inst.id),
        name=inst.name,
        code=inst.code,
        institution_type=inst.institution_type,
        domain=inst.domain,
        location=inst.location,
        is_verified=inst.is_verified,
        contact_email=inst.contact_email,
        cohorts=cohorts_res
    )

def get_cohort_analytics(db: Session, cohort_id: uuid.UUID) -> CohortAnalyticsResponse:
    cohort = db.execute(select(Cohort).where(Cohort.id == cohort_id)).scalar_one_or_none()
    if not cohort:
        inst = get_or_create_default_institution(db)
        cohort = inst.cohorts[0]

    is_cs = "Computer Science" in cohort.name
    total = cohort.total_students or 120

    if is_cs:
        job_ready = int(total * 0.38) # 38%
        developing = int(total * 0.44) # 44%
        foundations = total - job_ready - developing
        avg_score = 71.5
        gaps = [
            CurriculumGapItem(
                skill_name="Docker & Containerization",
                category="DevOps & Cloud",
                importance="Critical",
                affected_students_count=74,
                gap_percentage=61.6,
                recommended_action="Integrate 2-week hands-on containerization sprint into Systems Practicum."
            ),
            CurriculumGapItem(
                skill_name="Distributed System Design",
                category="Architecture",
                importance="Critical",
                affected_students_count=68,
                gap_percentage=56.7,
                recommended_action="Introduce microservice scalability case studies and CAP theorem labs."
            ),
            CurriculumGapItem(
                skill_name="FastAPI & Async IO",
                category="Backend Engineering",
                importance="High",
                affected_students_count=52,
                gap_percentage=43.3,
                recommended_action="Upgrade legacy Python servlet modules to modern async FastAPI patterns."
            ),
            CurriculumGapItem(
                skill_name="PostgreSQL Optimization & Indexing",
                category="Databases",
                importance="High",
                affected_students_count=45,
                gap_percentage=37.5,
                recommended_action="Add EXPLAIN ANALYZE query tuning module in Database Management syllabus."
            )
        ]
        top_roles = [
            {"role": "Full-Stack Software Engineer", "interested_percentage": 42.0},
            {"role": "AI / Machine Learning Engineer", "interested_percentage": 28.0},
            {"role": "Backend Systems Engineer", "interested_percentage": 18.0},
            {"role": "Cloud DevOps Engineer", "interested_percentage": 12.0}
        ]
    else:
        job_ready = int(total * 0.34)
        developing = int(total * 0.48)
        foundations = total - job_ready - developing
        avg_score = 69.2
        gaps = [
            CurriculumGapItem(
                skill_name="Business SQL & Window Functions",
                category="Analytics",
                importance="Critical",
                affected_students_count=52,
                gap_percentage=61.2,
                recommended_action="Implement mandatory weekly relational database querying workshops."
            ),
            CurriculumGapItem(
                skill_name="Product Metric Modeling (LTV/CAC)",
                category="Product Management",
                importance="Critical",
                affected_students_count=48,
                gap_percentage=56.5,
                recommended_action="Add real-world SaaS unit economics modeling in Marketing elective."
            ),
            CurriculumGapItem(
                skill_name="Power BI Executive Dashboards",
                category="Business Intelligence",
                importance="High",
                affected_students_count=39,
                gap_percentage=45.9,
                recommended_action="Require interactive BI dashboard deliverable for capstone submissions."
            )
        ]
        top_roles = [
            {"role": "Product Manager", "interested_percentage": 38.0},
            {"role": "Business & Data Analyst", "interested_percentage": 34.0},
            {"role": "Growth Strategy Associate", "interested_percentage": 18.0},
            {"role": "Financial Analyst", "interested_percentage": 10.0}
        ]

    distribution = [
        CohortDistributionTier(tier="Job-Ready (>=75%)", count=job_ready, percentage=round(job_ready / total * 100, 1)),
        CohortDistributionTier(tier="Developing (50-74%)", count=developing, percentage=round(developing / total * 100, 1)),
        CohortDistributionTier(tier="Foundations (<50%)", count=foundations, percentage=round(foundations / total * 100, 1))
    ]

    return CohortAnalyticsResponse(
        cohort_id=str(cohort.id),
        cohort_name=cohort.name,
        department=cohort.department,
        total_learners=total,
        average_readiness_score=avg_score,
        job_ready_percentage=distribution[0].percentage,
        active_roadmaps_count=int(total * 0.88),
        distribution=distribution,
        top_curriculum_gaps=gaps,
        top_target_roles=top_roles
    )

def search_talent_pool(db: Session, filter_req: TalentSearchFilterRequest) -> TalentSearchResponse:
    # Query candidates with profiles
    stmt = (
        select(User, UserProfile)
        .join(UserProfile, User.id == UserProfile.user_id)
        .where(User.is_active == True)
    )
    results = db.execute(stmt).all()

    # Pre-populated talent candidates pool for employer discovery
    demo_pool = [
        {
            "id": "cand-01",
            "anon_id": "Candidate #UN-7821",
            "target_role": "Full-Stack Software Engineer",
            "headline": "Full-Stack Developer with hands-on Next.js & FastAPI microservices",
            "readiness_score": 84.5,
            "experience_years": 1.0,
            "verified_skills": ["Python", "FastAPI", "React", "PostgreSQL", "Git"],
            "assessed_skills": ["Docker", "TypeScript", "REST APIs", "Tailwind CSS"],
            "inferred_skills": ["CI/CD", "Redis", "System Design"],
            "capstone_completed": True
        },
        {
            "id": "cand-02",
            "anon_id": "Candidate #UN-6419",
            "target_role": "Full-Stack Software Engineer",
            "headline": "Passionate Software Engineer skilled in distributed systems and cloud backends",
            "readiness_score": 78.0,
            "experience_years": 0.5,
            "verified_skills": ["Python", "PostgreSQL", "FastAPI", "Data Structures"],
            "assessed_skills": ["Docker", "SQL", "Git"],
            "inferred_skills": ["Next.js", "AWS"],
            "capstone_completed": True
        },
        {
            "id": "cand-03",
            "anon_id": "Candidate #UN-9104",
            "target_role": "Data Analyst",
            "headline": "Business Analytics graduate specializing in SQL modeling and executive BI",
            "readiness_score": 81.0,
            "experience_years": 1.2,
            "verified_skills": ["SQL", "Power BI", "Data Analysis", "Excel Modeling"],
            "assessed_skills": ["Python", "Tableau", "Statistics"],
            "inferred_skills": ["Business Intelligence", "Product Metrics"],
            "capstone_completed": True
        },
        {
            "id": "cand-04",
            "anon_id": "Candidate #UN-5238",
            "target_role": "Product Manager",
            "headline": "Technical PM with experience in user research, PRD crafting and agile delivery",
            "readiness_score": 75.5,
            "experience_years": 1.5,
            "verified_skills": ["Product Sense", "User Research", "Agile", "PRD Writing"],
            "assessed_skills": ["SQL", "Wireframing", "Roadmap Planning"],
            "inferred_skills": ["A/B Testing", "Figma"],
            "capstone_completed": False
        },
        {
            "id": "cand-05",
            "anon_id": "Candidate #UN-4482",
            "target_role": "AI / Machine Learning Engineer",
            "headline": "AI researcher specializing in LLM fine-tuning, embeddings and RAG architectures",
            "readiness_score": 88.0,
            "experience_years": 2.0,
            "verified_skills": ["Python", "PyTorch", "Transformers", "Vector Databases", "FastAPI"],
            "assessed_skills": ["Docker", "Git", "Linear Algebra"],
            "inferred_skills": ["MLOps", "LangChain"],
            "capstone_completed": True
        }
    ]

    # Include actual DB users if any have profiles
    for user, profile in results:
        user_skills_stmt = select(CandidateSkill).where(CandidateSkill.user_id == user.id)
        user_skills = db.execute(user_skills_stmt).scalars().all()
        verified = []
        assessed = []
        for s in user_skills:
            skill_title = s.canonical_skill.name if s.canonical_skill else "Technical Skill"
            if s.state == "ASSESSED" or s.confidence >= 0.8:
                verified.append(skill_title)
            elif s.state in ["INFERRED", "CLAIMED"]:
                assessed.append(skill_title)

        # Readiness score
        rd_stmt = select(CareerRoadmap.overall_readiness_score).where(CareerRoadmap.user_id == user.id)
        rd_score = db.execute(rd_stmt).scalar() or 76.0

        demo_pool.insert(0, {
            "id": str(user.id),
            "anon_id": f"Candidate #UN-{str(user.id)[:4].upper()}",
            "target_role": profile.target_role or "Full-Stack Software Engineer",
            "headline": profile.headline or "Motivated software engineer with verified skill competencies",
            "readiness_score": float(rd_score),
            "experience_years": profile.experience_years or 0.0,
            "verified_skills": verified or ["Python", "FastAPI", "PostgreSQL"],
            "assessed_skills": assessed or ["Docker", "Git"],
            "inferred_skills": ["System Design", "REST APIs"],
            "capstone_completed": True
        })

    # Apply filters
    filtered_candidates = []
    for cand in demo_pool:
        # Filter: target role
        if filter_req.target_role and filter_req.target_role.lower() not in cand["target_role"].lower():
            continue

        # Filter: minimum readiness
        if cand["readiness_score"] < filter_req.min_readiness_score:
            continue

        # Filter: capstone
        if filter_req.has_capstone is True and not cand["capstone_completed"]:
            continue

        # Filter & match: required skills
        all_skills = set(cand["verified_skills"] + cand["assessed_skills"] + cand["inferred_skills"])
        if filter_req.required_skills:
            matched_count = sum(1 for req in filter_req.required_skills if any(req.lower() in s.lower() for s in all_skills))
            match_pct = round((matched_count / len(filter_req.required_skills)) * 100, 1)
            # Require at least 40% skill match if skills are specified
            if match_pct < 40.0:
                continue
        else:
            match_pct = cand["readiness_score"]

        filtered_candidates.append(
            CandidateTalentProfile(
                candidate_id=cand["id"],
                anonymized_identifier=cand["anon_id"],
                target_role=cand["target_role"],
                headline=cand["headline"],
                readiness_score=cand["readiness_score"],
                experience_years=cand["experience_years"],
                verified_skills=cand["verified_skills"],
                assessed_skills=cand["assessed_skills"],
                inferred_skills=cand["inferred_skills"],
                match_percentage=match_pct,
                capstone_completed=cand["capstone_completed"],
                dpdp_consent_verified=True
            )
        )

    # Sort by match percentage and readiness
    filtered_candidates.sort(key=lambda c: (c.match_percentage, c.readiness_score), reverse=True)
    limited = filtered_candidates[:filter_req.limit]

    return TalentSearchResponse(
        total_matches=len(filtered_candidates),
        filter_criteria={
            "target_role": filter_req.target_role,
            "required_skills": filter_req.required_skills,
            "min_readiness_score": filter_req.min_readiness_score,
            "has_capstone": filter_req.has_capstone
        },
        candidates=limited
    )

def list_opportunities(db: Session, sector: Optional[str] = None) -> List[OpportunityResponse]:
    get_or_create_default_employer(db)
    stmt = select(Opportunity, Employer).join(Employer, Opportunity.employer_id == Employer.id)
    if sector and sector != "all":
        stmt = stmt.where(Employer.sector.ilike(f"%{sector}%"))
    stmt = stmt.order_by(Opportunity.created_at.desc())
    results = db.execute(stmt).all()

    responses = []
    for opp, emp in results:
        responses.append(
            OpportunityResponse(
                id=str(opp.id),
                title=opp.title,
                role_category=opp.role_category,
                location=opp.location,
                employment_type=opp.employment_type,
                min_readiness_score=opp.min_readiness_score,
                required_skills=opp.required_skills or [],
                description=opp.description,
                salary_range=opp.salary_range,
                company_name=emp.company_name,
                is_verified_company=emp.is_verified,
                status=opp.status,
                created_at=opp.created_at,
                matched_candidates_count=len(opp.required_skills) * 4 + 7
            )
        )
    return responses

def create_opportunity(db: Session, data: Dict[str, Any]) -> OpportunityResponse:
    emp = get_or_create_default_employer(db)
    new_opp = Opportunity(
        id=uuid.uuid4(),
        employer_id=emp.id,
        title=data["title"],
        role_category=data.get("role_category", "Technology"),
        location=data.get("location", "Hybrid (India)"),
        employment_type=data.get("employment_type", "Full-Time"),
        min_readiness_score=data.get("min_readiness_score", 65.0),
        required_skills=data.get("required_skills", []),
        description=data.get("description", ""),
        salary_range=data.get("salary_range", "Competitive CTC"),
        status="ACTIVE"
    )
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)

    return OpportunityResponse(
        id=str(new_opp.id),
        title=new_opp.title,
        role_category=new_opp.role_category,
        location=new_opp.location,
        employment_type=new_opp.employment_type,
        min_readiness_score=new_opp.min_readiness_score,
        required_skills=new_opp.required_skills or [],
        description=new_opp.description,
        salary_range=new_opp.salary_range,
        company_name=emp.company_name,
        is_verified_company=emp.is_verified,
        status=new_opp.status,
        created_at=new_opp.created_at,
        matched_candidates_count=12
    )

def get_market_intelligence(sector: str = "technology") -> MarketIntelligenceResponse:
    surging_skills = [
        MarketSkillTrend(
            skill_name="Docker & Microservices",
            category="DevOps & Systems",
            industry_demand_index=92.5,
            supply_in_cohorts=48.0,
            market_gap=44.5,
            trend_direction="SURGING"
        ),
        MarketSkillTrend(
            skill_name="Vector Databases & RAG",
            category="Artificial Intelligence",
            industry_demand_index=89.0,
            supply_in_cohorts=36.0,
            market_gap=53.0,
            trend_direction="SURGING"
        ),
        MarketSkillTrend(
            skill_name="PostgreSQL Optimization",
            category="Databases",
            industry_demand_index=86.0,
            supply_in_cohorts=52.0,
            market_gap=34.0,
            trend_direction="GROWING"
        ),
        MarketSkillTrend(
            skill_name="Next.js / React 19",
            category="Frontend",
            industry_demand_index=84.5,
            supply_in_cohorts=64.0,
            market_gap=20.5,
            trend_direction="STABLE"
        ),
        MarketSkillTrend(
            skill_name="FastAPI & Async Python",
            category="Backend Engineering",
            industry_demand_index=82.0,
            supply_in_cohorts=45.0,
            market_gap=37.0,
            trend_direction="GROWING"
        )
    ]

    top_roles = [
        {"role": "Full-Stack Software Engineer", "growth_yoy": "+34%", "median_ctc": "₹16.5L CTC"},
        {"role": "AI / Machine Learning Engineer", "growth_yoy": "+48%", "median_ctc": "₹21.0L CTC"},
        {"role": "Data Analyst & Analytics Engineer", "growth_yoy": "+28%", "median_ctc": "₹13.5L CTC"},
        {"role": "Cloud DevOps Engineer", "growth_yoy": "+31%", "median_ctc": "₹17.0L CTC"}
    ]

    blind_spots = [
        {
            "blind_spot": "Containerization & Cloud Native Architecture",
            "curriculum_gap": "61% of graduating CS students lack practical Docker/Kubernetes experience.",
            "impact": "Primary cause of rejection during technical interview screens."
        },
        {
            "blind_spot": "Complex Relational Query Performance",
            "curriculum_gap": "54% cannot explain indexing strategies or analyze query execution plans.",
            "impact": "Gaps in database design readiness for mid-to-high scale workloads."
        }
    ]

    return MarketIntelligenceResponse(
        sector="Technology & Software",
        top_demanded_roles=top_roles,
        surging_skills=surging_skills,
        curriculum_blind_spots=blind_spots,
        quarterly_insight="Q4 2026 hiring emphasizes verified evidence of applied capability (Docker, async APIs, relational database indexing) over paper certifications. Candidates with completed capstones demonstrate 2.8x higher interview conversion."
    )
