"""
Seed canonical skills taxonomy and aliases into Neon PostgreSQL.
UNNATI - Your Growth Companion.
"""
import sys
import os

# Add parent directory to sys.path so app modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.skill import CanonicalSkill, SkillAlias
from app.services.skill_service import slugify

CORE_SKILLS = [
    # Programming Languages
    {"name": "Python", "category": "language", "description": "High-level programming language widely used in AI, data science, web development, and automation.", "aliases": ["python3", "py"]},
    {"name": "JavaScript", "category": "language", "description": "Core web programming language for interactive client-side and server-side applications.", "aliases": ["js", "ecmascript"]},
    {"name": "TypeScript", "category": "language", "description": "Strict syntactical superset of JavaScript adding static type definitions.", "aliases": ["ts"]},
    {"name": "Java", "category": "language", "description": "Object-oriented, class-based programming language for enterprise applications and Android.", "aliases": ["core java", "j2se"]},
    {"name": "C++", "category": "language", "description": "High-performance general-purpose programming language for systems, game engines, and performance-critical software.", "aliases": ["cpp", "c plus plus"]},
    {"name": "Go", "category": "language", "description": "Statically typed, compiled programming language designed at Google for concurrent network services.", "aliases": ["golang"]},
    {"name": "Rust", "category": "language", "description": "Systems programming language focused on safety, speed, and memory concurrency.", "aliases": ["rust-lang"]},
    {"name": "SQL", "category": "database", "description": "Structured Query Language used to manage and query relational databases.", "aliases": ["structured query language", "relational database"]},
    {"name": "HTML5 & CSS3", "category": "frontend", "description": "Standard markup and stylesheet languages for structuring and styling modern web applications.", "aliases": ["html", "css", "html5", "css3"]},

    # Frontend Frameworks & Libraries
    {"name": "React", "category": "frontend", "description": "Declarative, component-based JavaScript library for building user interfaces.", "aliases": ["reactjs", "react.js"]},
    {"name": "Next.js", "category": "frontend", "description": "React framework for full-stack web applications with server-side rendering and static site generation.", "aliases": ["nextjs", "next"]},
    {"name": "Tailwind CSS", "category": "frontend", "description": "Utility-first CSS framework for rapid modern UI development.", "aliases": ["tailwind", "tailwindcss"]},
    {"name": "Vue.js", "category": "frontend", "description": "Progressive JavaScript framework for building reactive user interfaces.", "aliases": ["vue", "vuejs"]},
    {"name": "Angular", "category": "frontend", "description": "Enterprise-grade TypeScript-based open-source web application framework.", "aliases": ["angularjs", "angular 2+"]},
    {"name": "Redux", "category": "frontend", "description": "Predictable state container for JavaScript apps.", "aliases": ["redux toolkit", "rtk"]},

    # Backend & APIs
    {"name": "FastAPI", "category": "backend", "description": "Modern, fast (high-performance) web framework for building APIs with Python based on standard type hints.", "aliases": ["fast-api"]},
    {"name": "Node.js", "category": "backend", "description": "Asynchronous event-driven JavaScript runtime built on Chrome's V8 engine.", "aliases": ["nodejs", "node"]},
    {"name": "Express.js", "category": "backend", "description": "Fast, unopinionated, minimalist web framework for Node.js.", "aliases": ["express", "expressjs"]},
    {"name": "Django", "category": "backend", "description": "High-level Python web framework encouraging rapid development and clean design.", "aliases": ["django rest framework", "drf"]},
    {"name": "Spring Boot", "category": "backend", "description": "Convention-over-configuration framework for building standalone production-grade Spring applications.", "aliases": ["spring", "springboot"]},
    {"name": "RESTful API Design", "category": "backend", "description": "Architectural principles for designing scalable HTTP network APIs.", "aliases": ["rest", "rest api", "restful api"]},
    {"name": "GraphQL", "category": "backend", "description": "Query language for APIs and runtime for fulfilling queries with existing data.", "aliases": ["gql"]},

    # Databases & Caching
    {"name": "PostgreSQL", "category": "database", "description": "Powerful open-source object-relational database system with advanced SQL and extensibility.", "aliases": ["postgres", "pgsql"]},
    {"name": "Redis", "category": "database", "description": "In-memory data structure store used as a database, cache, message broker, and streaming engine.", "aliases": ["redis-server", "redis cache"]},
    {"name": "MongoDB", "category": "database", "description": "Document-based distributed NoSQL database designed for modern web applications.", "aliases": ["mongo"]},
    {"name": "pgvector", "category": "database", "description": "Vector similarity search extension for PostgreSQL.", "aliases": ["postgres vector", "vector search"]},
    {"name": "MySQL", "category": "database", "description": "Open-source relational database management system.", "aliases": ["mysql server"]},

    # Cloud, DevOps & Infrastructure
    {"name": "Docker", "category": "devops", "description": "Platform for developing, shipping, and running applications in lightweight containers.", "aliases": ["containerization", "containers"]},
    {"name": "Kubernetes", "category": "devops", "description": "Open-source container orchestration system for automating deployment, scaling, and management.", "aliases": ["k8s"]},
    {"name": "Amazon Web Services (AWS)", "category": "cloud", "description": "Comprehensive cloud computing platform offering compute, storage, databases, and networking.", "aliases": ["aws", "amazon cloud"]},
    {"name": "Google Cloud Platform (GCP)", "category": "cloud", "description": "Suite of cloud computing services running on the same infrastructure Google uses internally.", "aliases": ["gcp", "google cloud"]},
    {"name": "Microsoft Azure", "category": "cloud", "description": "Cloud computing platform by Microsoft for building, testing, deploying, and managing applications.", "aliases": ["azure"]},
    {"name": "Git & Version Control", "category": "devops", "description": "Distributed version control system for tracking changes in source code during software development.", "aliases": ["git", "github", "gitlab"]},
    {"name": "CI/CD Pipelines", "category": "devops", "description": "Continuous Integration and Continuous Deployment automation practices for software delivery.", "aliases": ["cicd", "continuous integration", "github actions"]},
    {"name": "Linux", "category": "devops", "description": "Open-source Unix-like operating system kernel and server administration.", "aliases": ["linux administration", "bash", "shell scripting"]},

    # AI, Machine Learning & Data Science
    {"name": "Machine Learning", "category": "ai", "description": "Study of algorithms that improve automatically through experience and data.", "aliases": ["ml", "applied ml"]},
    {"name": "Deep Learning", "category": "ai", "description": "Subset of machine learning based on artificial neural networks with multiple layers.", "aliases": ["dl", "neural networks"]},
    {"name": "PyTorch", "category": "ai", "description": "Open-source machine learning library developed by Meta AI for tensor computation and deep learning.", "aliases": ["torch"]},
    {"name": "TensorFlow", "category": "ai", "description": "End-to-end open source platform for machine learning by Google.", "aliases": ["tf", "keras"]},
    {"name": "Natural Language Processing (NLP)", "category": "ai", "description": "Subfield of computer science and AI concerned with interactions between computers and human language.", "aliases": ["nlp", "text analytics"]},
    {"name": "Large Language Models (LLMs)", "category": "ai", "description": "Foundational AI models trained on vast text data capable of generation, reasoning, and comprehension.", "aliases": ["llm", "generative ai", "genai"]},
    {"name": "Retrieval-Augmented Generation (RAG)", "category": "ai", "description": "AI framework for augmenting LLM responses with external domain knowledge retrieval.", "aliases": ["rag", "semantic retrieval"]},
    {"name": "Scikit-Learn", "category": "ai", "description": "Python library for classical machine learning algorithms, preprocessing, and evaluation.", "aliases": ["sklearn"]},
    {"name": "Pandas", "category": "data", "description": "Python library providing fast, flexible, and expressive data structures for data analysis.", "aliases": ["pandas dataframe"]},
    {"name": "NumPy", "category": "data", "description": "Fundamental package for scientific computing with Python providing multi-dimensional array objects.", "aliases": ["numpy array"]},

    # Core Computer Science & Architecture
    {"name": "Data Structures & Algorithms", "category": "core", "description": "Foundational methods for organizing data and step-by-step problem-solving procedures.", "aliases": ["dsa", "algorithms", "data structures"]},
    {"name": "System Design & Architecture", "category": "core", "description": "Designing high-scale, fault-tolerant, distributed software systems.", "aliases": ["system design", "distributed systems", "software architecture"]},
    {"name": "Object-Oriented Programming (OOP)", "category": "core", "description": "Programming paradigm based on the concept of objects containing data and code.", "aliases": ["oop", "object oriented"]},
    {"name": "Cybersecurity Fundamentals", "category": "security", "description": "Protection of computer systems and networks from information disclosure and theft.", "aliases": ["security", "infosec", "appsec"]},

    # Product, Management & Strategy
    {"name": "Product Roadmapping", "category": "management", "description": "Formulating strategic feature prioritization, customer problem definition, and multi-quarter release timelines.", "aliases": ["product management", "roadmapping", "apm"]},
    {"name": "User Story Mapping & Agile", "category": "management", "description": "Deconstructing customer journeys into prioritized user stories, acceptance criteria, and sprint epics.", "aliases": ["user stories", "story mapping", "jira"]},
    {"name": "RICE & MoSCoW Prioritization", "category": "management", "description": "Quantitative frameworks for scoring Reach, Impact, Confidence, and Effort against product opportunities.", "aliases": ["rice framework", "feature prioritization", "moscow"]},
    {"name": "Market Sizing & TAM Analysis", "category": "management", "description": "Top-down and bottom-up estimation of Total Addressable Market, Serviceable Addressable Market, and competitive moats.", "aliases": ["tam", "market sizing", "market research"]},
    {"name": "Stakeholder Management", "category": "management", "description": "Cross-functional alignment across executive leadership, engineering, design, legal, and commercial teams.", "aliases": ["stakeholder alignment", "cross-functional leadership"]},
    {"name": "Customer Journey Mapping", "category": "management", "description": "Visualizing end-to-end touchpoints, user emotional curves, friction zones, and retention hooks.", "aliases": ["journey mapping", "customer experience", "cx"]},

    # Data Analysis & Business Intelligence
    {"name": "Power BI", "category": "data", "description": "Microsoft business analytics service for interactive visualizations and business intelligence reports.", "aliases": ["powerbi", "dax"]},
    {"name": "Tableau", "category": "data", "description": "Visual analytics platform transforming raw data into actionable dashboards and visual insights.", "aliases": ["tableau desktop", "tableau server"]},
    {"name": "Advanced SQL & CTEs", "category": "data", "description": "Complex relational queries utilizing Window Functions, Common Table Expressions, and performance tuning.", "aliases": ["advanced sql", "window functions", "ctes"]},
    {"name": "Data Storytelling & Dashboards", "category": "data", "description": "Synthesizing quantitative metrics into persuasive executive summaries, charts, and strategic narratives.", "aliases": ["data storytelling", "executive dashboards", "kpi reporting"]},
    {"name": "Statistical A/B Testing", "category": "data", "description": "Formulating null hypotheses, calculating statistical power, and evaluating p-values for product experiments.", "aliases": ["ab testing", "hypothesis testing", "experimentation"]},
    {"name": "ETL & Data Modeling (dbt)", "category": "data", "description": "Extract, Transform, Load workflows and analytics engineering using dbt Core and SQL transformations.", "aliases": ["dbt", "etl", "analytics engineering"]},

    # Finance, Strategy & Economics
    {"name": "Financial Modeling (Excel)", "category": "finance", "description": "Building dynamic spreadsheet forecasts, scenario analyses, and capital expenditure models.", "aliases": ["financial modeling", "excel modeling", "advanced excel"]},
    {"name": "Valuation & DCF Analysis", "category": "finance", "description": "Estimating intrinsic enterprise value through Discounted Cash Flow projections and WACC calculation.", "aliases": ["dcf", "valuation", "discounted cash flow"]},
    {"name": "Three-Statement Modeling", "category": "finance", "description": "Interlinking Income Statement, Balance Sheet, and Cash Flow Statement into cohesive forecasts.", "aliases": ["three statement model", "financial statements", "fpa"]},
    {"name": "Unit Economics & CAC/LTV", "category": "finance", "description": "Evaluating customer acquisition cost payback periods, lifetime value ratios, and gross margin sustainability.", "aliases": ["cac ltv", "unit economics", "saas metrics"]},
    {"name": "Budget Variance & FP&A", "category": "finance", "description": "Tracking budget vs actual performance, variance reconciliation, and operational forecasting.", "aliases": ["fp&a", "budget variance", "variance analysis"]},

    # Design & User Experience
    {"name": "UI/UX Design", "category": "design", "description": "User interface and user experience design principles for accessible, intuitive software.", "aliases": ["ux design", "ui design", "product design"]},
    {"name": "Figma Design Systems", "category": "design", "description": "Building reusable UI components, auto-layout variants, and tokenized design systems in Figma.", "aliases": ["figma", "design systems", "figma design"]},
    {"name": "User Research & Usability Testing", "category": "design", "description": "Planning user interviews, moderated usability tests, cognitive walkthroughs, and thematic synthesis.", "aliases": ["user research", "usability testing", "user testing"]},
    {"name": "Wireframing & Prototyping", "category": "design", "description": "Low-fidelity wireframing, high-fidelity clickable interactive prototypes, and usability validation.", "aliases": ["wireframing", "prototyping", "lo-fi wireframes"]},
    {"name": "Web Accessibility (WCAG 2.2 AA)", "category": "design", "description": "Ensuring color contrast compliance, screen reader tree accessibility, and keyboard navigability.", "aliases": ["wcag", "a11y", "accessibility"]},

    # Operations & Supply Chain
    {"name": "Process Optimization (Lean Six Sigma)", "category": "operations", "description": "Eliminating operational waste, streamlining cycle times, and applying DMAIC methodologies.", "aliases": ["lean six sigma", "process optimization", "kaizen"]},
    {"name": "Vendor SLA Management", "category": "operations", "description": "Contract negotiation, performance scorecards, vendor risk assessment, and escalation governance.", "aliases": ["vendor management", "sla management", "procurement"]},
    {"name": "Supply Chain & Logistics Planning", "category": "operations", "description": "Forecasting inventory demand, turnaround optimization, and distribution network design.", "aliases": ["supply chain", "logistics", "inventory planning"]},
    {"name": "Root Cause Analysis (5 Whys)", "category": "operations", "description": "Systematic failure breakdown utilizing 5 Whys, Fishbone (Ishikawa) diagrams, and corrective actions.", "aliases": ["root cause analysis", "5 whys", "rca"]},

    # Marketing & Growth
    {"name": "Digital Marketing & SEO", "category": "marketing", "description": "Search Engine Optimization, on-page content architecture, keyword intent, and search rankings.", "aliases": ["seo", "digital marketing", "search engine optimization"]},
    {"name": "Growth Loops & Funnel Optimization", "category": "marketing", "description": "Designing self-reinforcing viral loops, referral mechanisms, and conversion funnel optimization.", "aliases": ["growth hacking", "funnel optimization", "growth loops"]},
    {"name": "Content Strategy & Copywriting", "category": "marketing", "description": "Crafting value proposition messaging, editorial calendars, and high-conversion landing page copy.", "aliases": ["content strategy", "copywriting", "brand messaging"]},

    # Foundational & Interpersonal
    {"name": "Agile & Scrum", "category": "management", "description": "Iterative approach to software delivery and team collaboration frameworks.", "aliases": ["agile", "scrum", "kanban"]},
    {"name": "Technical Problem Solving", "category": "foundational", "description": "Analytical and systematic diagnosis, debugging, and solution generation.", "aliases": ["problem solving", "analytical thinking"]},
    {"name": "Effective Communication", "category": "foundational", "description": "Clear written, verbal, and presentation skills for technical and cross-functional collaboration.", "aliases": ["communication", "technical writing", "presentation skills"]}
]

def seed_skills():
    db: Session = SessionLocal()
    created_skills = 0
    created_aliases = 0
    updated_skills = 0

    try:
        for item in CORE_SKILLS:
            skill_name = item["name"]
            skill_slug = slugify(skill_name)
            category = item["category"]
            description = item["description"]
            aliases = item.get("aliases", [])

            # Check if canonical skill already exists
            canonical = db.scalar(
                select(CanonicalSkill).where(CanonicalSkill.slug == skill_slug)
            )

            if not canonical:
                canonical = CanonicalSkill(
                    name=skill_name,
                    slug=skill_slug,
                    category=category,
                    description=description
                )
                db.add(canonical)
                db.flush()
                created_skills += 1
            else:
                canonical.description = description
                canonical.category = category
                updated_skills += 1

            # Seed aliases
            for alias_text in aliases:
                alias_clean = alias_text.strip().lower()
                existing_alias = db.scalar(
                    select(SkillAlias).where(SkillAlias.alias == alias_clean)
                )
                if not existing_alias:
                    new_alias = SkillAlias(
                        canonical_skill_id=canonical.id,
                        alias=alias_clean
                    )
                    db.add(new_alias)
                    created_aliases += 1

        db.commit()
        print(f"Successfully seeded canonical skills:")
        print(f"  - Created skills: {created_skills}")
        print(f"  - Updated skills: {updated_skills}")
        print(f"  - Created aliases: {created_aliases}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding skills: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_skills()

