# ==============================================================================
# UNNATI — Learning Resource Discovery & Skill Intelligence Service
# Curated multi-platform educational courses, personalized learning pathways,
# assessment readiness gate evaluation, and user learning progress tracking.
# ==============================================================================
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_, String

from app.models.learning import (
    LearningResource,
    UserLearningProgress,
    AssessmentReadinessLog
)
from app.models.user import User
from app.models.skill import CanonicalSkill, CandidateSkill
from app.models.examination import Examination
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.schemas.learning import (
    LearningResourceItem,
    LearningResourceFilterRequest,
    LearningResourceListResponse,
    PersonalizedLearningSequence,
    SequenceStagePlan,
    AssessmentReadinessRequest,
    AssessmentReadinessResponse,
    UserLearningProgressItem,
    UpdateLearningProgressRequest,
    LearningDashboardSummary
)

logger = logging.getLogger(__name__)


# ==============================================================================
# VERIFIED MULTI-PLATFORM LEARNING CATALOG SEEDER
# Covers Free (FreeCodeCamp, MDN, YouTube, Microsoft Learn, Kaggle, W3Schools)
# and Paid (Coursera, Udemy, upGrad, edX, LinkedIn Learning).
# ==============================================================================
INITIAL_LEARNING_RESOURCES: List[Dict[str, Any]] = [
    # --------------------------------------------------------------------------
    # SQL & Relational Databases
    # --------------------------------------------------------------------------
    {
        "title": "Relational Database & SQL Certification",
        "platform_name": "FreeCodeCamp",
        "description": "Interactive terminal-based PostgreSQL and Bash course covering database creation, relational normalization, complex multi-table joins, subqueries, and database scripting.",
        "instructor_or_provider": "FreeCodeCamp Open Curriculum",
        "topic": "SQL & Relational Querying",
        "skill_name": "SQL",
        "skill_category": "technology",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 30.0,
        "rating": 4.9,
        "reviews_count": 48200,
        "has_certificate": True,
        "resource_type": "INTERACTIVE",
        "url": "https://www.freecodecamp.org/learn/relational-database/",
        "source_url": "https://www.freecodecamp.org",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["PostgreSQL Basics", "Table Schemas", "PRIMARY & FOREIGN KEY", "SELECT & WHERE", "JOIN & Aggregate Queries"],
        "why_recommended": "100% free interactive browser terminal with hands-on command execution and verifiable certification."
    },
    {
        "title": "SQL Tutorial: Full Database Course for Beginners",
        "platform_name": "YouTube",
        "description": "Comprehensive video lecture by Mike Dane explaining relational schemas, table joins, subqueries, group by aggregation, and schema migrations.",
        "instructor_or_provider": "freeCodeCamp.org / Mike Dane",
        "topic": "SQL & Relational Querying",
        "skill_name": "SQL",
        "skill_category": "technology",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 4.5,
        "rating": 4.8,
        "reviews_count": 89000,
        "has_certificate": False,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.youtube.com/watch?v=HXV3zeRR3h4",
        "source_url": "https://youtube.com",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["CRUD Operations", "Data Types", "Basic Queries", "Aggregate Functions", "Nested Queries"],
        "why_recommended": "High-clarity video walkthrough with diagrammatic explanations of relational algebra."
    },
    {
        "title": "The Complete SQL Bootcamp: Go from Zero to Hero",
        "platform_name": "Udemy",
        "description": "Top-rated PostgreSQL bootcamp covering intermediate and advanced query analysis, Common Table Expressions (CTEs), Window Functions, and index optimization.",
        "instructor_or_provider": "Jose Portilla (Pierian Data)",
        "topic": "SQL & Relational Querying",
        "skill_name": "SQL",
        "skill_category": "technology",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 549.0,
        "price_currency": "INR",
        "duration_hours": 9.0,
        "rating": 4.7,
        "reviews_count": 182000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
        "source_url": "https://udemy.com",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["Window Functions", "Common Table Expressions (CTEs)", "Indexes & EXPLAIN ANALYZE", "Complex Multi-Table Joins"],
        "why_recommended": "Thorough practical problem sets matching real-world engineering and analytics interview questions."
    },
    {
        "title": "SQL for Data Science Specialization",
        "platform_name": "Coursera",
        "description": "University of California, Davis curriculum covering SQL for distributed big data, query profiling, data wrangling, and predictive data analysis.",
        "instructor_or_provider": "UC Davis / Sadie St. Lawrence",
        "topic": "SQL & Relational Querying",
        "skill_name": "SQL",
        "skill_category": "data",
        "difficulty": "Advanced",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 3200.0,
        "price_currency": "INR",
        "duration_hours": 40.0,
        "rating": 4.6,
        "reviews_count": 31000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.coursera.org/specializations/learn-sql-basics-data-science",
        "source_url": "https://coursera.org",
        "sequence_stage": "ADVANCED_TECHNIQUES",
        "key_concepts_covered": ["Spark SQL", "A/B Testing Query Pipelines", "Query Optimization", "Data Governance"],
        "why_recommended": "Rigorous academic credential with capstone project evaluating real datasets."
    },

    # --------------------------------------------------------------------------
    # Python & Software Engineering
    # --------------------------------------------------------------------------
    {
        "title": "Scientific Computing with Python",
        "platform_name": "FreeCodeCamp",
        "description": "Hands-on algorithmic training covering Python fundamentals, data structures, OOP principles, network programming, and computational projects.",
        "instructor_or_provider": "Dr. Charles Severance (Univ. of Michigan / FCC)",
        "topic": "Python Programming",
        "skill_name": "Python",
        "skill_category": "technology",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 35.0,
        "rating": 4.9,
        "reviews_count": 67000,
        "has_certificate": True,
        "resource_type": "INTERACTIVE",
        "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        "source_url": "https://freecodecamp.org",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["Variables & Expressions", "Functions & Loops", "Lists, Dictionaries & Tuples", "Regular Expressions", "Object-Oriented Python"],
        "why_recommended": "Interactive exercises accompanied by accredited certification upon capstone submission."
    },
    {
        "title": "CS50's Introduction to Programming with Python",
        "platform_name": "YouTube",
        "description": "Harvard University's formal curriculum taught by Professor David J. Malan, focusing on software engineering principles, exceptions, unit tests, and libraries.",
        "instructor_or_provider": "Harvard University / David J. Malan",
        "topic": "Python Programming",
        "skill_name": "Python",
        "skill_category": "technology",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 16.0,
        "rating": 4.9,
        "reviews_count": 120000,
        "has_certificate": False,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.youtube.com/watch?v=nLRL_NcnK-4",
        "source_url": "https://cs50.harvard.edu/python",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["Functions & Variables", "Conditionals & Loops", "Exceptions & Pytest", "File I/O", "Regular Expressions", "OOP"],
        "why_recommended": "World-class university instruction covering clean code standards and automated testing."
    },
    {
        "title": "100 Days of Code: The Complete Python Pro Bootcamp",
        "platform_name": "Udemy",
        "description": "Industry-standard project-based bootcamp building 100 practical applications including web scraping, FastAPI, Flask backends, and data visualization.",
        "instructor_or_provider": "Dr. Angela Yu (London App Brewery)",
        "topic": "Python Programming",
        "skill_name": "Python",
        "skill_category": "technology",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 549.0,
        "price_currency": "INR",
        "duration_hours": 58.0,
        "rating": 4.8,
        "reviews_count": 290000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.udemy.com/course/100-days-of-code/",
        "source_url": "https://udemy.com",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["Web Scraping with BeautifulSoup", "REST APIs & Requests", "FastAPI / Flask", "Data Science Foundations", "Automation"],
        "why_recommended": "Unrivalled hands-on portfolio builders simulating real software engineering responsibilities."
    },

    # --------------------------------------------------------------------------
    # Frontend: React, Next.js & Modern Web
    # --------------------------------------------------------------------------
    {
        "title": "React Official Documentation & Interactive Guide",
        "platform_name": "MDN Web Docs",
        "description": "Deep-dive documentation and tutorials from Mozilla Developer Network covering component lifecycles, hooks, modern state management, and accessibility.",
        "instructor_or_provider": "MDN & React Open Source Core Team",
        "topic": "Frontend Development",
        "skill_name": "React.js",
        "skill_category": "technology",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 12.0,
        "rating": 4.9,
        "reviews_count": 75000,
        "has_certificate": False,
        "resource_type": "DOCUMENTATION",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_frameworks/React_resources",
        "source_url": "https://developer.mozilla.org",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["JSX & Props", "useState & useEffect", "Component Hierarchy", "Event Handlers", "Accessibility (a11y)"],
        "why_recommended": "Authoritative, zero-fluff reference documentation with live interactive code playgrounds."
    },
    {
        "title": "React - The Complete Guide (incl. Next.js, Redux)",
        "platform_name": "Udemy",
        "description": "Comprehensive modern React course covering Server Components, App Router Next.js 14/15, Tailwind CSS, TanStack Query, and TypeScript.",
        "instructor_or_provider": "Maximilian Schwarzmüller (Academind)",
        "topic": "Frontend Development",
        "skill_name": "React.js",
        "skill_category": "technology",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 549.0,
        "price_currency": "INR",
        "duration_hours": 68.0,
        "rating": 4.7,
        "reviews_count": 210000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        "source_url": "https://udemy.com",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["Custom Hooks", "Context API & Zustand", "Next.js App Router", "Server Actions", "TypeScript with React"],
        "why_recommended": "Constantly updated with the latest React 19 and Next.js production patterns."
    },

    # --------------------------------------------------------------------------
    # Data & Analytics: Excel, Power BI & Machine Learning
    # --------------------------------------------------------------------------
    {
        "title": "Microsoft Power BI Data Analyst (PL-300) Learning Path",
        "platform_name": "Microsoft Learn",
        "description": "Official Microsoft curriculum preparing data analysts to ingest, clean, model, transform, and visualize complex datasets with DAX and Power BI Service.",
        "instructor_or_provider": "Microsoft Worldwide Learning",
        "topic": "Business Intelligence & Analytics",
        "skill_name": "Power BI",
        "skill_category": "data",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 24.0,
        "rating": 4.8,
        "reviews_count": 42000,
        "has_certificate": True,
        "resource_type": "INTERACTIVE",
        "url": "https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/",
        "source_url": "https://learn.microsoft.com",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["Power Query M Transformations", "Star Schema Modeling", "DAX Formulas & Measures", "Interactive Dashboards", "Row-Level Security"],
        "why_recommended": "Direct official vendor material matching the official PL-300 Microsoft Certified credential."
    },
    {
        "title": "Google Data Analytics Professional Certificate",
        "platform_name": "Coursera",
        "description": "Rigorous eight-course professional certificate developed by Google covering data cleansing, spreadsheet modeling, SQL, Tableau visualization, and R programming.",
        "instructor_or_provider": "Google Career Certificates",
        "topic": "Data Analytics",
        "skill_name": "Data Analytics",
        "skill_category": "data",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 2900.0,
        "price_currency": "INR",
        "duration_hours": 180.0,
        "rating": 4.8,
        "reviews_count": 140000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
        "source_url": "https://coursera.org",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["Spreadsheet Analytics", "SQL Data Extraction", "Tableau Visual Storytelling", "R Programming Foundations", "Data Ethics"],
        "why_recommended": "Industry-standard entry credential recognized by over 150 top hiring employers worldwide."
    },
    {
        "title": "Pandas & Python Data Wrangling",
        "platform_name": "Kaggle",
        "description": "Practical micro-course focusing on data manipulation, grouping, aggregations, renaming, and handling missing data in real-world Kaggle datasets.",
        "instructor_or_provider": "Kaggle Learn Team",
        "topic": "Python Data Wrangling",
        "skill_name": "Python",
        "skill_category": "data",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 6.0,
        "rating": 4.9,
        "reviews_count": 92000,
        "has_certificate": True,
        "resource_type": "INTERACTIVE",
        "url": "https://www.kaggle.com/learn/pandas",
        "source_url": "https://kaggle.com",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["DataFrames & Series", "Indexing, Selecting & Assigning", "Summary Functions & Maps", "Grouping & Sorting", "Data Types & Missing Values"],
        "why_recommended": "Quick interactive Jupyter environment with instant automated grading on real datasets."
    },

    # --------------------------------------------------------------------------
    # Business & Product Management
    # --------------------------------------------------------------------------
    {
        "title": "Product Management Foundations & PRD Architecture",
        "platform_name": "YouTube",
        "description": "Executive masterclass on problem definition, user interview synthesis, PRD drafting, North Star metric mapping, and product prioritization frameworks.",
        "instructor_or_provider": "Product School / Stanford Guest Series",
        "topic": "Product Management",
        "skill_name": "Product Management",
        "skill_category": "business",
        "difficulty": "Beginner",
        "language": "English",
        "pricing_type": "FREE",
        "price_amount": 0.0,
        "price_currency": "INR",
        "duration_hours": 5.0,
        "rating": 4.8,
        "reviews_count": 34000,
        "has_certificate": False,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.youtube.com/watch?v=F2Yt_l3jLpI",
        "source_url": "https://youtube.com",
        "sequence_stage": "FOUNDATIONAL",
        "key_concepts_covered": ["Customer Problem Discovery", "PRD Structure", "RICE Prioritization", "User Persona Synthesis", "Metrics & OKRs"],
        "why_recommended": "Real case studies presented by Directors of Product at Uber, Google, and Airbnb."
    },
    {
        "title": "Digital Product Management: Modern Fundamentals",
        "platform_name": "Coursera",
        "description": "University of Virginia Darden School of Business curriculum on managing digital products through exploration, hypothesis generation, and user feedback.",
        "instructor_or_provider": "Univ. of Virginia / Alex Cowan",
        "topic": "Product Management",
        "skill_name": "Product Management",
        "skill_category": "business",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 3200.0,
        "price_currency": "INR",
        "duration_hours": 15.0,
        "rating": 4.7,
        "reviews_count": 24000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.coursera.org/learn/uva-darden-digital-product-management",
        "source_url": "https://coursera.org",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["Design Thinking", "Hypothesis-Driven Development", "Agile Roadmap Alignment", "Product Analytics Funnels"],
        "why_recommended": "Top-tier business school methodology taught by seasoned product leaders."
    },
    {
        "title": "Become a Product Manager | Learn the Skills & Get the Job",
        "platform_name": "Udemy",
        "description": "One of the most popular PM bootcamps worldwide, covering metric trees, customer interviews, wireframing, sprint planning, and interview prep.",
        "instructor_or_provider": "Cole Mercer (Ex-SoundCloud PM) & Evan Kimbrell",
        "topic": "Product Management",
        "skill_name": "Product Management",
        "skill_category": "business",
        "difficulty": "Intermediate",
        "language": "English",
        "pricing_type": "PAID",
        "price_amount": 549.0,
        "price_currency": "INR",
        "duration_hours": 13.0,
        "rating": 4.6,
        "reviews_count": 160000,
        "has_certificate": True,
        "resource_type": "VIDEO_COURSE",
        "url": "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-the-job/",
        "source_url": "https://udemy.com",
        "sequence_stage": "CORE_CONCEPTS",
        "key_concepts_covered": ["Customer Development", "Wireframing & Spec Writing", "Scrum / Kanban Delivery", "Go-To-Market Launch", "Interview Frameworks"],
        "why_recommended": "Extremely actionable with downloadable PRD templates and interview question walkthroughs."
    }
]


# ==============================================================================
# SEEDING & CATALOG INITIALIZATION
# ==============================================================================
def seed_learning_resources(db: Session) -> int:
    """Seeds authentic, verified free and paid educational resources into database."""
    count_created = 0
    for res_data in INITIAL_LEARNING_RESOURCES:
        existing = db.scalar(
            select(LearningResource).where(
                LearningResource.title == res_data["title"],
                LearningResource.platform_name == res_data["platform_name"]
            )
        )
        if not existing:
            resource = LearningResource(
                title=res_data["title"],
                platform_name=res_data["platform_name"],
                description=res_data["description"],
                instructor_or_provider=res_data["instructor_or_provider"],
                topic=res_data["topic"],
                skill_name=res_data["skill_name"],
                skill_category=res_data["skill_category"],
                difficulty=res_data["difficulty"],
                language=res_data["language"],
                pricing_type=res_data["pricing_type"],
                price_amount=res_data["price_amount"],
                price_currency=res_data["price_currency"],
                duration_hours=res_data["duration_hours"],
                rating=res_data["rating"],
                reviews_count=res_data["reviews_count"],
                has_certificate=res_data["has_certificate"],
                resource_type=res_data["resource_type"],
                url=res_data["url"],
                source_url=res_data.get("source_url"),
                sequence_stage=res_data.get("sequence_stage", "FOUNDATIONAL"),
                key_concepts_covered=res_data.get("key_concepts_covered", []),
                why_recommended=res_data.get("why_recommended"),
                is_active=True
            )
            db.add(resource)
            count_created += 1

    if count_created > 0:
        db.commit()
        logger.info(f"Seeded {count_created} verified learning resources into database.")
    return count_created


# ==============================================================================
# SEARCH & MULTI-FACETED RESOURCE FILTERING
# ==============================================================================
def search_learning_resources(
    db: Session,
    filter_req: LearningResourceFilterRequest,
    user: Optional[User] = None
) -> LearningResourceListResponse:
    """Executes multi-faceted queries across free and paid learning opportunities."""
    query = select(LearningResource).where(LearningResource.is_active == True)

    # 1. Skill or Topic filter
    if filter_req.skill:
        clean_skill = filter_req.skill.strip()
        query = query.where(
            or_(
                LearningResource.skill_name.ilike(f"%{clean_skill}%"),
                LearningResource.topic.ilike(f"%{clean_skill}%")
            )
        )
    if filter_req.topic:
        query = query.where(LearningResource.topic.ilike(f"%{filter_req.topic.strip()}%"))
    if filter_req.category:
        query = query.where(LearningResource.skill_category.ilike(f"%{filter_req.category.strip()}%"))

    # 2. Pricing Type filter (Free vs Paid)
    if filter_req.pricing_type:
        ptype = filter_req.pricing_type.upper().strip()
        if ptype == "FREE":
            query = query.where(LearningResource.pricing_type == "FREE")
        elif ptype == "PAID":
            query = query.where(LearningResource.pricing_type.in_(["PAID", "SUBSCRIPTION"]))

    # 3. Platforms
    if filter_req.platforms and len(filter_req.platforms) > 0:
        query = query.where(LearningResource.platform_name.in_(filter_req.platforms))

    # 4. Difficulties
    if filter_req.difficulties and len(filter_req.difficulties) > 0:
        query = query.where(LearningResource.difficulty.in_(filter_req.difficulties))

    # 5. Resource types
    if filter_req.resource_types and len(filter_req.resource_types) > 0:
        query = query.where(LearningResource.resource_type.in_(filter_req.resource_types))

    # 6. Certificate only
    if filter_req.has_certificate_only:
        query = query.where(LearningResource.has_certificate == True)

    # 7. Max duration
    if filter_req.max_duration_hours:
        query = query.where(
            or_(
                LearningResource.duration_hours == None,
                LearningResource.duration_hours <= filter_req.max_duration_hours
            )
        )

    # 8. Keyword search
    if filter_req.search_query:
        term = f"%{filter_req.search_query.strip()}%"
        query = query.where(
            or_(
                LearningResource.title.ilike(term),
                LearningResource.description.ilike(term),
                LearningResource.instructor_or_provider.ilike(term),
                LearningResource.topic.ilike(term)
            )
        )

    # Total Count
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    # Sorting
    if filter_req.sort_by == "rating_desc":
        query = query.order_by(LearningResource.rating.desc().nullslast())
    elif filter_req.sort_by == "duration_asc":
        query = query.order_by(LearningResource.duration_hours.asc().nullslast())
    elif filter_req.sort_by == "price_asc":
        query = query.order_by(LearningResource.price_amount.asc().nullslast())
    else:
        # Default: relevance with free resources prioritized first, then rating
        query = query.order_by(
            LearningResource.pricing_type.asc(),
            LearningResource.rating.desc().nullslast()
        )

    # Pagination
    offset = (filter_req.page - 1) * filter_req.limit
    query = query.offset(offset).limit(filter_req.limit)

    results = db.scalars(query).all()

    # User Progress Map if authenticated
    user_progress_map: Dict[uuid.UUID, UserLearningProgress] = {}
    if user:
        progress_entries = db.scalars(
            select(UserLearningProgress).where(UserLearningProgress.user_id == user.id)
        ).all()
        for p in progress_entries:
            user_progress_map[p.resource_id] = p

    # Build DTOs
    resource_items: List[LearningResourceItem] = []
    for r in results:
        dto = LearningResourceItem.model_validate(r)
        if r.id in user_progress_map:
            p_record = user_progress_map[r.id]
            dto.user_status = p_record.status
            dto.user_progress_percentage = p_record.progress_percentage
        resource_items.append(dto)

    # Available Facets Calculation
    platforms_raw = db.execute(
        select(LearningResource.platform_name, func.count(LearningResource.id))
        .where(LearningResource.is_active == True)
        .group_by(LearningResource.platform_name)
    ).all()
    available_platforms = [{"name": p[0], "count": p[1]} for p in platforms_raw]

    pricing_raw = db.execute(
        select(LearningResource.pricing_type, func.count(LearningResource.id))
        .where(LearningResource.is_active == True)
        .group_by(LearningResource.pricing_type)
    ).all()
    available_pricing = [{"type": pr[0], "count": pr[1]} for pr in pricing_raw]

    diff_raw = db.execute(
        select(LearningResource.difficulty, func.count(LearningResource.id))
        .where(LearningResource.is_active == True)
        .group_by(LearningResource.difficulty)
    ).all()
    available_diff = [{"difficulty": d[0], "count": d[1]} for d in diff_raw]

    total_pages = (total + filter_req.limit - 1) // filter_req.limit if total > 0 else 1

    return LearningResourceListResponse(
        resources=resource_items,
        total=total,
        page=filter_req.page,
        limit=filter_req.limit,
        total_pages=total_pages,
        available_platforms=available_platforms,
        available_pricing_types=available_pricing,
        available_difficulties=available_diff
    )


# ==============================================================================
# PERSONALIZED LEARNING SEQUENCE GENERATION
# ==============================================================================
def get_personalized_learning_sequence(
    db: Session,
    skill_name: str,
    target_role: Optional[str] = None,
    user: Optional[User] = None
) -> PersonalizedLearningSequence:
    """
    Constructs a structured 4-stage sequential learning path for a skill
    (Foundational -> Core Concepts -> Advanced Techniques -> Capstone Practice),
    pairing both Free and Paid alternatives at each step.
    """
    clean_skill = skill_name.strip()
    
    # Check Candidate's current proficiency in skill if authenticated
    current_prof = "Not Started / Foundational"
    if user:
        candidate_skill = db.scalar(
            select(CandidateSkill)
            .join(CanonicalSkill, CandidateSkill.canonical_skill_id == CanonicalSkill.id)
            .where(
                CandidateSkill.user_id == user.id,
                or_(
                    CanonicalSkill.name.ilike(f"%{clean_skill}%"),
                    CanonicalSkill.slug.ilike(f"%{clean_skill}%")
                )
            )
        )
        if candidate_skill:
            if candidate_skill.proficiency >= 0.8:
                current_prof = f"Proficient ({int(candidate_skill.proficiency * 100)}% - State: {candidate_skill.state})"
            elif candidate_skill.proficiency >= 0.5:
                current_prof = f"Intermediate ({int(candidate_skill.proficiency * 100)}% - State: {candidate_skill.state})"
            else:
                current_prof = f"Novice ({int(candidate_skill.proficiency * 100)}% - State: {candidate_skill.state})"

    # Fetch available resources for this skill or related topic
    resources = db.scalars(
        select(LearningResource).where(
            LearningResource.is_active == True,
            or_(
                LearningResource.skill_name.ilike(f"%{clean_skill}%"),
                LearningResource.topic.ilike(f"%{clean_skill}%")
            )
        ).order_by(LearningResource.rating.desc().nullslast())
    ).all()

    # Fallback to general technology resources if skill has no direct matches
    if len(resources) == 0:
        resources = db.scalars(
            select(LearningResource).where(LearningResource.is_active == True).limit(8)
        ).all()

    # Partition resources by sequence stage or difficulty
    stage_definitions = [
        {
            "stage_name": "Stage 1: Foundational Syntax & Fundamentals",
            "description": f"Master core syntax, foundational rules, and essential mechanics of {clean_skill}.",
            "sequence_tag": "FOUNDATIONAL",
            "fallback_diff": "Beginner",
            "estimated_hours": 12.0,
            "concepts": ["Core Syntax", "Data Types & Structures", "Environment Setup", "Basic Operations"]
        },
        {
            "stage_name": "Stage 2: Core Concepts & Practical Implementation",
            "description": f"Build practical fluency with intermediate patterns, idiomatic usage, and standard libraries.",
            "sequence_tag": "CORE_CONCEPTS",
            "fallback_diff": "Intermediate",
            "estimated_hours": 18.0,
            "concepts": ["Modular Code & Patterns", "Error Handling & Debugging", "Library Ecosystem", "Testing"]
        },
        {
            "stage_name": "Stage 3: Advanced Optimization & Architecture",
            "description": f"Learn high-performance patterns, query optimization, security, and edge-case resilience.",
            "sequence_tag": "ADVANCED_TECHNIQUES",
            "fallback_diff": "Advanced",
            "estimated_hours": 20.0,
            "concepts": ["Performance Optimization", "Scalability Considerations", "Security Safeguards", "System Integration"]
        },
        {
            "stage_name": "Stage 4: Portfolio Capstone & Assessment Readiness",
            "description": f"Demonstrate end-to-end competency through an authentic capstone challenge before formal proctored testing.",
            "sequence_tag": "CAPSTONE",
            "fallback_diff": "Advanced",
            "estimated_hours": 10.0,
            "concepts": ["End-to-End Problem Solving", "Code Quality & Documentation", "Assessment Benchmark Readiness"]
        }
    ]

    stages: List[SequenceStagePlan] = []
    total_hours = 0.0

    for s_def in stage_definitions:
        matching_res = [
            r for r in resources
            if r.sequence_stage == s_def["sequence_tag"] or r.difficulty == s_def["fallback_diff"]
        ]
        
        # Free resources
        free_res = [LearningResourceItem.model_validate(r) for r in matching_res if r.pricing_type == "FREE"][:2]
        # Paid resources
        paid_res = [LearningResourceItem.model_validate(r) for r in matching_res if r.pricing_type in ["PAID", "SUBSCRIPTION"]][:2]

        # If a stage has no specific resources, pull from general pool
        if len(free_res) == 0 and len(paid_res) == 0:
            free_res = [LearningResourceItem.model_validate(r) for r in resources if r.pricing_type == "FREE"][:1]
            paid_res = [LearningResourceItem.model_validate(r) for r in resources if r.pricing_type != "FREE"][:1]

        stages.append(
            SequenceStagePlan(
                stage_name=s_def["stage_name"],
                description=s_def["description"],
                concepts=s_def["concepts"],
                recommended_free_resources=free_res,
                recommended_paid_resources=paid_res,
                estimated_hours=s_def["estimated_hours"]
            )
        )
        total_hours += s_def["estimated_hours"]

    # Check for active roadmap link
    roadmap_bridge = None
    if user:
        milestone = db.scalar(
            select(RoadmapMilestone)
            .join(CareerRoadmap, RoadmapMilestone.roadmap_id == CareerRoadmap.id)
            .where(
                CareerRoadmap.user_id == user.id,
                CareerRoadmap.status == "ACTIVE",
                RoadmapMilestone.target_skills.cast(String).ilike(f"%{clean_skill}%")
            )
        )
        if milestone:
            roadmap_bridge = f"Active Roadmap: Phase {milestone.phase_number} — {milestone.title}"

    explanation = (
        f"This sequential learning path guides you from {current_prof} to assessed mastery in {clean_skill}. "
        f"Each stage pairs validated free community resources (FreeCodeCamp, MDN, official YouTube) "
        f"with comprehensive accredited options (Coursera, Udemy) so you can learn according to your budget and schedule."
    )

    return PersonalizedLearningSequence(
        skill_name=clean_skill,
        target_role=target_role,
        current_proficiency_estimate=current_prof,
        target_proficiency="Assessment-Ready Professional",
        overall_explanation=explanation,
        stages=stages,
        estimated_total_hours=total_hours,
        free_alternative_available=True,
        roadmap_bridge_milestone=roadmap_bridge
    )


# ==============================================================================
# ASSESSMENT READINESS GATE EVALUATOR
# ==============================================================================
def evaluate_assessment_readiness(
    db: Session,
    user: User,
    req: AssessmentReadinessRequest
) -> AssessmentReadinessResponse:
    """
    Evaluates learner readiness selection before formal assessment:
    - KNOW_TOPIC: Presents rules, proctoring requirements, allows proceeding.
    - NEED_TO_LEARN: Redirects to personalised learning sequence with free/paid options.
    - WANT_DIAGNOSTIC: Directs to low-stakes 5-min diagnostic quiz without proctoring.
    """
    clean_topic = req.topic_or_skill.strip()
    
    # 1. Log readiness choice into audit table
    log_entry = AssessmentReadinessLog(
        user_id=user.id,
        topic_or_skill=clean_topic,
        target_difficulty=req.target_difficulty or "Intermediate",
        readiness_choice=req.readiness_choice,
        examination_id=req.examination_id,
        notes=req.notes,
        metadata_payload={"client_timestamp": datetime.now(timezone.utc).isoformat()}
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # 2. Process choice
    if req.readiness_choice == "KNOW_TOPIC":
        # Candidate asserts they know the subject and want to take the test
        exam_details = None
        target_exam_id = req.examination_id

        if target_exam_id:
            exam = db.scalar(select(Examination).where(Examination.id == target_exam_id))
            if exam:
                exam_details = {
                    "id": str(exam.id),
                    "title": exam.title,
                    "description": exam.description,
                    "duration_minutes": exam.duration_minutes,
                    "total_marks": exam.total_marks,
                    "passing_percentage": exam.passing_percentage,
                    "proctoring_enabled": exam.proctoring_enabled,
                    "proctoring_config": exam.proctoring_config,
                    "certificate_eligible": exam.certificate_eligible
                }
        else:
            # Find relevant published examination
            exam = db.scalar(
                select(Examination).where(
                    Examination.is_published == True,
                    or_(
                        Examination.title.ilike(f"%{clean_topic}%"),
                        Examination.course_name.ilike(f"%{clean_topic}%")
                    )
                )
            )
            if exam:
                target_exam_id = exam.id
                exam_details = {
                    "id": str(exam.id),
                    "title": exam.title,
                    "duration_minutes": exam.duration_minutes,
                    "proctoring_enabled": exam.proctoring_enabled
                }

        return AssessmentReadinessResponse(
            readiness_choice="KNOW_TOPIC",
            status="READY_TO_TEST",
            message=f"You have confirmed readiness for {clean_topic}. Please review the pre-exam instructions and proctoring consent to proceed.",
            topic_or_skill=clean_topic,
            target_difficulty=req.target_difficulty or "Intermediate",
            can_proceed_to_assessment=True,
            examination_id=target_exam_id,
            examination_details=exam_details,
            saved_log_id=log_entry.id
        )

    elif req.readiness_choice == "NEED_TO_LEARN":
        # Candidate wants to study first: return personalized learning pathway
        learning_plan = get_personalized_learning_sequence(
            db=db,
            skill_name=clean_topic,
            user=user
        )
        return AssessmentReadinessResponse(
            readiness_choice="NEED_TO_LEARN",
            status="RECOMMENDED_LEARNING",
            message=f"Smart choice! Here is a tailored learning pathway for {clean_topic} featuring both free tutorials and accredited courses.",
            topic_or_skill=clean_topic,
            target_difficulty=req.target_difficulty or "Intermediate",
            can_proceed_to_assessment=False,
            examination_id=req.examination_id,
            learning_recommendations=learning_plan,
            saved_log_id=log_entry.id
        )

    elif req.readiness_choice == "WANT_DIAGNOSTIC":
        # Candidate wants a low-stakes benchmark without formal proctoring
        # Locate diagnostic assessment or return diagnostic guidance
        diagnostic_exam = db.scalar(
            select(Examination).where(
                Examination.is_published == True,
                Examination.category.in_(["PRACTICE_QUIZ", "MODULE_ASSESSMENT"]),
                or_(
                    Examination.title.ilike(f"%{clean_topic}%"),
                    Examination.track.ilike(f"%{clean_topic}%")
                )
            )
        )
        diag_id = diagnostic_exam.id if diagnostic_exam else None

        return AssessmentReadinessResponse(
            readiness_choice="WANT_DIAGNOSTIC",
            status="DIAGNOSTIC_AVAILABLE",
            message=f"Starting a low-stakes diagnostic check for {clean_topic}. This 5-question test is unproctored and measures your baseline level to pinpoint specific weak spots.",
            topic_or_skill=clean_topic,
            target_difficulty="Diagnostic",
            can_proceed_to_assessment=True,
            diagnostic_exam_id=diag_id,
            examination_id=diag_id,
            saved_log_id=log_entry.id
        )

    else:
        return AssessmentReadinessResponse(
            readiness_choice=req.readiness_choice,
            status="INVALID_CHOICE",
            message="Unknown readiness choice. Valid options: KNOW_TOPIC, NEED_TO_LEARN, WANT_DIAGNOSTIC.",
            topic_or_skill=clean_topic,
            target_difficulty=req.target_difficulty or "Intermediate",
            can_proceed_to_assessment=False,
            saved_log_id=log_entry.id
        )


# ==============================================================================
# USER LEARNING PROGRESS & TRACKING
# ==============================================================================
def update_user_learning_progress(
    db: Session,
    user: User,
    resource_id: uuid.UUID,
    req: UpdateLearningProgressRequest
) -> UserLearningProgressItem:
    """Updates user progress state on an external or integrated course."""
    progress = db.scalar(
        select(UserLearningProgress).where(
            UserLearningProgress.user_id == user.id,
            UserLearningProgress.resource_id == resource_id
        )
    )

    now = datetime.now(timezone.utc)

    if not progress:
        progress = UserLearningProgress(
            user_id=user.id,
            resource_id=resource_id,
            status=req.status,
            progress_percentage=req.progress_percentage or 0.0,
            notes=req.notes,
            certificate_url=req.certificate_url,
            user_rating=req.user_rating,
            started_at=now if req.status in ["STARTED", "IN_PROGRESS", "COMPLETED"] else None,
            completed_at=now if req.status == "COMPLETED" else None,
            last_accessed_at=now
        )
        db.add(progress)
    else:
        progress.status = req.status
        if req.progress_percentage is not None:
            progress.progress_percentage = req.progress_percentage
        if req.notes is not None:
            progress.notes = req.notes
        if req.certificate_url is not None:
            progress.certificate_url = req.certificate_url
        if req.user_rating is not None:
            progress.user_rating = req.user_rating
        if req.status in ["STARTED", "IN_PROGRESS"] and not progress.started_at:
            progress.started_at = now
        if req.status == "COMPLETED" and not progress.completed_at:
            progress.completed_at = now
            progress.progress_percentage = 100.0
        progress.last_accessed_at = now

    db.commit()
    db.refresh(progress)

    # Reload with resource eager loaded
    res_record = db.scalar(select(LearningResource).where(LearningResource.id == resource_id))
    dto = UserLearningProgressItem.model_validate(progress)
    dto.resource = LearningResourceItem.model_validate(res_record)
    return dto


def get_user_learning_dashboard(db: Session, user: User) -> LearningDashboardSummary:
    """Retrieves candidate's learning dashboard summary and active courses."""
    progress_records = db.scalars(
        select(UserLearningProgress)
        .where(UserLearningProgress.user_id == user.id)
        .order_by(UserLearningProgress.last_accessed_at.desc())
    ).all()

    total_saved = sum(1 for p in progress_records if p.status == "SAVED")
    total_in_prog = sum(1 for p in progress_records if p.status in ["STARTED", "IN_PROGRESS"])
    total_comp = sum(1 for p in progress_records if p.status == "COMPLETED")

    skills_set = set()
    total_hours = 0.0
    recent_items: List[UserLearningProgressItem] = []

    for p in progress_records[:10]:
        res = db.scalar(select(LearningResource).where(LearningResource.id == p.resource_id))
        if res:
            skills_set.add(res.skill_name)
            if p.status == "COMPLETED" and res.duration_hours:
                total_hours += res.duration_hours
            elif p.status in ["STARTED", "IN_PROGRESS"] and res.duration_hours:
                total_hours += (res.duration_hours * (p.progress_percentage / 100.0))

            item_dto = UserLearningProgressItem.model_validate(p)
            item_dto.resource = LearningResourceItem.model_validate(res)
            recent_items.append(item_dto)

    # Next actions recommendations
    next_actions = []
    if total_in_prog > 0:
        next_actions.append({
            "action": "RESUME_COURSE",
            "title": "Resume Your In-Progress Courses",
            "description": f"You have {total_in_prog} courses currently in progress. Complete modules to qualify for assessments."
        })
    if total_comp > 0:
        next_actions.append({
            "action": "TAKE_ASSESSMENT",
            "title": "Test Your Acquired Knowledge",
            "description": "You completed courses! Take a proctored skill assessment to earn verified credentials for your resume."
        })
    else:
        next_actions.append({
            "action": "DISCOVER_RESOURCES",
            "title": "Explore Top Free & Paid Courses",
            "description": "Discover beginner-friendly tutorials in SQL, Python, React, and Product Management."
        })

    return LearningDashboardSummary(
        total_saved=total_saved,
        total_in_progress=total_in_prog,
        total_completed=total_comp,
        estimated_hours_invested=round(total_hours, 1),
        skills_in_learning=list(skills_set),
        recent_resources=recent_items,
        recommended_next_actions=next_actions
    )
