import re
import uuid
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_, and_, desc, asc

from app.models.user import User
from app.models.job import (
    CanonicalJob,
    ExternalJobReference,
    JobSource,
    SavedJob,
    JobApplicationActivity,
    UserJobSearchHistory
)
from app.schemas.job import (
    JobSearchFilterRequest,
    JobSearchResponse,
    CanonicalJobListItem,
    JobDiscoveryDashboardData
)
from app.services.job_recommendation_service import evaluate_job_match


def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """
    Parses natural language search queries into structured filters.
    e.g. 'Find entry-level data analyst jobs in Bengaluru with salary above 8 LPA'
    """
    if not query:
        return {}

    parsed: Dict[str, Any] = {}
    q_lower = query.lower()

    # 1. Experience Level extraction
    if any(k in q_lower for k in ["entry-level", "entry level", "fresher", "graduate", "junior", "0 years", "trainee"]):
        parsed["experience_levels"] = ["ENTRY"]
    elif any(k in q_lower for k in ["internship", "intern", "apprentice"]):
        parsed["employment_types"] = ["INTERNSHIP"]
    elif any(k in q_lower for k in ["senior", "lead", "staff", "principal"]):
        parsed["experience_levels"] = ["SENIOR", "LEAD"]

    # 2. Workplace Type extraction
    if any(k in q_lower for k in ["remote", "work from home", "wfh"]):
        parsed["workplace_types"] = ["REMOTE"]
    elif any(k in q_lower for k in ["hybrid"]):
        parsed["workplace_types"] = ["HYBRID"]
    elif any(k in q_lower for k in ["onsite", "in-office", "in office"]):
        parsed["workplace_types"] = ["ONSITE"]

    # 3. Location extraction
    cities_map = {
        "bengaluru": "Bengaluru",
        "bangalore": "Bengaluru",
        "mumbai": "Mumbai",
        "pune": "Pune",
        "hyderabad": "Hyderabad",
        "delhi": "Delhi NCR",
        "gurgaon": "Delhi NCR",
        "noida": "Delhi NCR",
        "chennai": "Chennai",
        "kolkata": "Kolkata",
        "ahmedabad": "Ahmedabad"
    }
    for key, city_name in cities_map.items():
        if key in q_lower:
            parsed.setdefault("cities", []).append(city_name)

    # 4. Role extraction
    roles = [
        "Software Engineer",
        "Frontend Engineer",
        "Backend Engineer",
        "Full-Stack Developer",
        "Data Analyst",
        "Business Analyst",
        "Product Manager",
        "Associate Product Manager",
        "DevOps Engineer",
        "Financial Analyst"
    ]
    for r in roles:
        if r.lower() in q_lower:
            parsed["role_keyword"] = r
            break

    # 5. Salary extraction (e.g. "8 LPA", "12 LPA", "500000")
    lpa_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lakhs)", q_lower)
    if lpa_match:
        val = float(lpa_match.group(1))
        parsed["min_salary"] = val * 100000.0

    return parsed


def search_canonical_jobs(
    db: Session,
    filter_req: JobSearchFilterRequest,
    current_user: Optional[User] = None
) -> JobSearchResponse:
    """Executes multi-faceted faceted search with natural language parsing and personalized scoring."""
    query = select(CanonicalJob).where(CanonicalJob.status == "ACTIVE")

    # Natural Language Parsing
    parsed_nl = None
    if filter_req.q and not filter_req.roles and not filter_req.cities:
        parsed_nl = parse_natural_language_query(filter_req.q)
        if "experience_levels" in parsed_nl and not filter_req.experience_levels:
            filter_req.experience_levels = parsed_nl["experience_levels"]
        if "workplace_types" in parsed_nl and not filter_req.workplace_types:
            filter_req.workplace_types = parsed_nl["workplace_types"]
        if "cities" in parsed_nl and not filter_req.cities:
            filter_req.cities = parsed_nl["cities"]
        if "min_salary" in parsed_nl and not filter_req.min_salary:
            filter_req.min_salary = parsed_nl["min_salary"]

    # 1. Text keyword search
    if filter_req.q:
        q_term = f"%{filter_req.q.strip()}%"
        query = query.where(
            or_(
                CanonicalJob.title.ilike(q_term),
                CanonicalJob.company_name.ilike(q_term),
                CanonicalJob.description_clean.ilike(q_term),
                CanonicalJob.city.ilike(q_term)
            )
        )

    # 2. City filter
    if filter_req.cities:
        query = query.where(CanonicalJob.city.in_(filter_req.cities))

    # 3. Workplace Type filter
    if filter_req.workplace_types:
        query = query.where(CanonicalJob.workplace_type.in_(filter_req.workplace_types))

    # 4. Experience Level filter
    if filter_req.experience_levels:
        query = query.where(CanonicalJob.experience_level.in_(filter_req.experience_levels))

    # 5. Employment Type filter
    if filter_req.employment_types:
        query = query.where(CanonicalJob.employment_type.in_(filter_req.employment_types))

    # 6. Minimum Salary filter
    if filter_req.min_salary:
        query = query.where(
            or_(
                CanonicalJob.salary_max >= filter_req.min_salary,
                CanonicalJob.salary_min >= filter_req.min_salary
            )
        )

    # 7. Category filter
    if filter_req.category:
        query = query.where(CanonicalJob.category == filter_req.category)

    # 8. Direct employer only
    if filter_req.is_direct_employer_only:
        query = query.where(CanonicalJob.is_direct_employer == True)

    # 9. Freshness filter (days)
    if filter_req.posted_within_days:
        since_date = datetime.now(timezone.utc) - timedelta(days=filter_req.posted_within_days)
        query = query.where(CanonicalJob.posted_at >= since_date)

    # Execute count
    total = len(db.scalars(query).all())

    # Sorting
    if filter_req.sort_by == "date":
        query = query.order_by(desc(CanonicalJob.posted_at))
    elif filter_req.sort_by == "salary_high":
        query = query.order_by(desc(CanonicalJob.salary_max))
    else:
        query = query.order_by(desc(CanonicalJob.posted_at))

    # Pagination
    offset = (filter_req.page - 1) * filter_req.limit
    jobs_db = db.scalars(query.offset(offset).limit(filter_req.limit)).all()

    # Build List Items & Personalized Match Scoring
    items: List[CanonicalJobListItem] = []
    for j in jobs_db:
        # Determine primary source name
        primary_ref = next((r for r in j.external_references if r.is_primary_source), None)
        source_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if j.is_direct_employer else "Career Portal")

        # Evaluate match score if user is logged in
        match_score = None
        if current_user:
            match_res = evaluate_job_match(j, current_user, db)
            match_score = match_res.overall_match_percentage

        item = CanonicalJobListItem(
            id=j.id,
            title=j.title,
            company_name=j.company_name,
            company_logo_url=j.company_logo_url,
            city=j.city,
            state_region=j.state_region,
            country=j.country,
            workplace_type=j.workplace_type,
            employment_type=j.employment_type,
            experience_min_years=j.experience_min_years,
            experience_max_years=j.experience_max_years,
            experience_level=j.experience_level,
            salary_min=j.salary_min,
            salary_max=j.salary_max,
            salary_currency=j.salary_currency,
            salary_period=j.salary_period,
            category=j.category,
            industry=j.industry,
            required_skills=j.required_skills or [],
            preferred_skills=j.preferred_skills or [],
            posted_at=j.posted_at,
            last_verified_at=j.last_verified_at,
            status=j.status,
            primary_application_url=j.primary_application_url,
            is_direct_employer=j.is_direct_employer,
            primary_source_name=source_name,
            external_sources_count=max(len(j.external_references), 1),
            match_score=match_score
        )
        items.append(item)

    # Sort by match_score if requested
    if filter_req.sort_by == "match_score" and current_user:
        items.sort(key=lambda x: (x.match_score or 0.0), reverse=True)

    # Log search history if query provided and user is authenticated
    if filter_req.q and current_user:
        history = UserJobSearchHistory(
            id=uuid.uuid4(),
            user_id=current_user.id,
            raw_query=filter_req.q[:500],
            parsed_filters=filter_req.model_dump(exclude_none=True),
            result_count=total
        )
        db.add(history)
        db.commit()

    total_pages = max((total + filter_req.limit - 1) // filter_req.limit, 1)

    # Available Facets for UI Filters
    facets = {
        "cities": ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Delhi NCR"],
        "workplace_types": ["REMOTE", "HYBRID", "ONSITE"],
        "experience_levels": ["ENTRY", "MID", "SENIOR", "INTERNSHIP"],
        "categories": [
            "Technology & Engineering",
            "Data & Analytics",
            "Product Management",
            "Finance & Operations",
            "Business & Strategy"
        ],
        "sources": ["Naukri", "Instahyre", "Cutshort", "Freshersworld", "National Career Service", "Remote OK"]
    }

    return JobSearchResponse(
        jobs=items,
        total=total,
        page=filter_req.page,
        limit=filter_req.limit,
        total_pages=total_pages,
        applied_filters=filter_req.model_dump(exclude_none=True),
        parsed_natural_language=parsed_nl,
        available_facets=facets
    )


def get_job_discovery_dashboard(db: Session, current_user: User) -> JobDiscoveryDashboardData:
    """Computes personalized job discovery hub categories and counts."""
    all_jobs = db.scalars(
        select(CanonicalJob).where(CanonicalJob.status == "ACTIVE").order_by(desc(CanonicalJob.posted_at)).limit(40)
    ).all()

    total_active = db.scalar(
        select(func.count(CanonicalJob.id)).where(CanonicalJob.status == "ACTIVE")
    ) or 0

    saved_count = db.scalar(
        select(func.count(SavedJob.id)).where(SavedJob.user_id == current_user.id)
    ) or 0

    apps_count = db.scalar(
        select(func.count(JobApplicationActivity.id)).where(JobApplicationActivity.user_id == current_user.id)
    ) or 0

    # Score jobs
    scored_items: List[CanonicalJobListItem] = []
    for j in all_jobs:
        match_res = evaluate_job_match(j, current_user, db)
        primary_ref = next((r for r in j.external_references if r.is_primary_source), None)
        source_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if j.is_direct_employer else "Portal")

        item = CanonicalJobListItem(
            id=j.id,
            title=j.title,
            company_name=j.company_name,
            company_logo_url=j.company_logo_url,
            city=j.city,
            state_region=j.state_region,
            country=j.country,
            workplace_type=j.workplace_type,
            employment_type=j.employment_type,
            experience_min_years=j.experience_min_years,
            experience_max_years=j.experience_max_years,
            experience_level=j.experience_level,
            salary_min=j.salary_min,
            salary_max=j.salary_max,
            salary_currency=j.salary_currency,
            salary_period=j.salary_period,
            category=j.category,
            industry=j.industry,
            required_skills=j.required_skills or [],
            preferred_skills=j.preferred_skills or [],
            posted_at=j.posted_at,
            last_verified_at=j.last_verified_at,
            status=j.status,
            primary_application_url=j.primary_application_url,
            is_direct_employer=j.is_direct_employer,
            primary_source_name=source_name,
            external_sources_count=max(len(j.external_references), 1),
            match_score=match_res.overall_match_percentage
        )
        scored_items.append(item)

    # Bucketing
    best_matches = sorted(scored_items, key=lambda x: (x.match_score or 0.0), reverse=True)[:6]
    recent_opps = sorted(scored_items, key=lambda x: x.posted_at, reverse=True)[:6]
    entry_level = [x for x in scored_items if x.experience_level in ["ENTRY", "INTERNSHIP"]][:6]
    remote_opps = [x for x in scored_items if x.workplace_type == "REMOTE"][:6]

    # Skills being learned
    skills_in_learning = [x for x in scored_items if (x.match_score or 0) >= 70.0 and x not in best_matches][:6]
    if not skills_in_learning:
        skills_in_learning = scored_items[:4]

    target_role = current_user.profile.target_role if current_user.profile else "Software & Product Roles"

    return JobDiscoveryDashboardData(
        total_active_jobs=total_active,
        best_matches=best_matches,
        recent_opportunities=recent_opps,
        skills_in_learning_opportunities=skills_in_learning,
        entry_level_opportunities=entry_level,
        remote_opportunities=remote_opps,
        saved_jobs_count=saved_count,
        applications_active_count=apps_count,
        user_target_role=target_role
    )

