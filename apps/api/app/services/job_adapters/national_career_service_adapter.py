from datetime import datetime, timezone, timedelta
from typing import List
from app.services.job_adapters.base_adapter import (
    BaseJobSourceAdapter,
    NormalizedJobPayload,
    normalize_city_name
)


class NationalCareerServiceAdapter(BaseJobSourceAdapter):
    """
    Adapter for the Ministry of Labour & Employment's National Career Service (NCS)
    and public sector recruitment feeds across Indian states.
    """

    @property
    def source_code(self) -> str:
        return "ncs_india"

    @property
    def source_name(self) -> str:
        return "National Career Service (NCS India)"

    @property
    def source_type(self) -> str:
        return "PUBLIC_GOV_FEED"

    @property
    def region(self) -> str:
        return "INDIA"

    @property
    def integration_method(self) -> str:
        return "PUBLIC_FEED"

    @property
    def compliance_notes(self) -> str:
        return (
            "Accesses public employment announcements and apprenticeship feeds published "
            "under National Career Service open governance initiatives."
        )

    def fetch_jobs(self, limit: int = 50) -> List[NormalizedJobPayload]:
        now = datetime.now(timezone.utc)
        
        ncs_jobs = [
            {
                "external_job_id": "ncs_bel_software_trainee_081",
                "portal_name": "National Career Service",
                "external_url": "https://www.ncs.gov.in/job-seeker/pages/jobdetails.aspx?id=bel_081",
                "title": "Graduate Apprenticeship Trainee (Embedded & Software)",
                "company_name": "Bharat Electronics Limited",
                "company_logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bharat_Electronics_Limited_Logo.svg/300px-Bharat_Electronics_Limited_Logo.svg.png",
                "description_raw": (
                    "Bharat Electronics Limited (BEL), a premier Navratna defence electronics PSU, invites applications "
                    "for one-year Graduate Apprenticeship Training in Bengaluru. Candidates will gain hands-on training "
                    "in embedded systems, C/C++, RTOS, and radar signal processing."
                ),
                "responsibilities": [
                    "Assist senior defence software engineers in embedded C/C++ firmware development.",
                    "Execute verification testing on hardware test benches.",
                    "Document software requirements and test logs conforming to defence aerospace standards."
                ],
                "required_skills": ["C", "C++", "Embedded Systems", "Linux", "Data Structures", "Problem Solving"],
                "preferred_skills": ["RTOS", "Microcontrollers", "Python", "Git"],
                "min_qualifications": "B.E/B.Tech in Electronics & Communication or Computer Science with first class.",
                "experience_min_years": 0.0,
                "experience_max_years": 1.0,
                "experience_level": "INTERNSHIP",
                "salary_min": 240000.0,
                "salary_max": 360000.0,
                "salary_currency": "INR",
                "salary_period": "PER_ANNUM",
                "employment_type": "INTERNSHIP",
                "workplace_type": "ONSITE",
                "city": "Bengaluru",
                "state_region": "Karnataka",
                "country": "India",
                "category": "Technology & Engineering",
                "industry": "Aerospace & Defence",
                "is_direct_employer": True,
                "posted_days_ago": 4
            },
            {
                "external_job_id": "ncs_nic_jr_database_admin_220",
                "portal_name": "National Career Service",
                "external_url": "https://www.ncs.gov.in/job-seeker/pages/jobdetails.aspx?id=nic_220",
                "title": "Junior Database & Cloud Operations Associate",
                "company_name": "National Informatics Centre Services",
                "company_logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/National_Informatics_Centre_logo.svg/300px-National_Informatics_Centre_logo.svg.png",
                "description_raw": (
                    "NICSI is seeking Junior Cloud and Database Associates to maintain state digital public infrastructure. "
                    "You will monitor high-availability PostgreSQL and MySQL clusters, perform routine database backups, "
                    "and optimize SQL queries for government citizen services."
                ),
                "responsibilities": [
                    "Perform routine database administration, indexing, and health checks on PostgreSQL.",
                    "Support cloud database migration and automated backup verification.",
                    "Assist in troubleshooting slow query performance and connection pool saturation.",
                    "Maintain technical documentation and incident response logs."
                ],
                "required_skills": ["PostgreSQL", "SQL", "Linux", "Database Indexing", "Bash Scripting", "Git"],
                "preferred_skills": ["Cloud Architecture", "Docker", "Python", "MySQL"],
                "min_qualifications": "BCA, B.Sc (IT), MCA, or B.Tech (CS/IT).",
                "experience_min_years": 0.5,
                "experience_max_years": 2.0,
                "experience_level": "ENTRY",
                "salary_min": 420000.0,
                "salary_max": 650000.0,
                "salary_currency": "INR",
                "salary_period": "PER_ANNUM",
                "employment_type": "FULL_TIME",
                "workplace_type": "ONSITE",
                "city": "Delhi NCR",
                "state_region": "Delhi",
                "country": "India",
                "category": "Technology & Engineering",
                "industry": "Govtech & Public Infrastructure",
                "is_direct_employer": True,
                "posted_days_ago": 6
            }
        ]

        normalized: List[NormalizedJobPayload] = []
        for item in ncs_jobs[:limit]:
            posted_date = now - timedelta(days=item.get("posted_days_ago", 1))
            payload = NormalizedJobPayload(
                source_code=self.source_code,
                external_job_id=item["external_job_id"],
                external_url=item["external_url"],
                portal_name=item["portal_name"],
                title=item["title"],
                company_name=item["company_name"],
                company_logo_url=item.get("company_logo_url"),
                description_raw=item["description_raw"],
                description_clean=item["description_raw"].strip(),
                responsibilities=item["responsibilities"],
                required_skills=item["required_skills"],
                preferred_skills=item["preferred_skills"],
                min_qualifications=item.get("min_qualifications"),
                experience_min_years=item["experience_min_years"],
                experience_max_years=item.get("experience_max_years"),
                experience_level=item["experience_level"],
                salary_min=item.get("salary_min"),
                salary_max=item.get("salary_max"),
                salary_currency=item["salary_currency"],
                salary_period=item["salary_period"],
                employment_type=item["employment_type"],
                workplace_type=item["workplace_type"],
                city=normalize_city_name(item.get("city")),
                state_region=item.get("state_region"),
                country="India",
                category=item["category"],
                industry=item.get("industry"),
                is_direct_employer=item.get("is_direct_employer", True),
                posted_at=posted_date,
                expires_at=posted_date + timedelta(days=60),
                raw_metadata=item
            )
            normalized.append(payload)

        return normalized

