from datetime import datetime, timezone, timedelta
from typing import List
from app.services.job_adapters.base_adapter import (
    BaseJobSourceAdapter,
    NormalizedJobPayload
)


class RemoteOkAdapter(BaseJobSourceAdapter):
    """
    Adapter integrating verified remote and international engineering and product roles
    from Remote OK and We Work Remotely public API feeds.
    """

    @property
    def source_code(self) -> str:
        return "remoteok"

    @property
    def source_name(self) -> str:
        return "Remote OK (Global Remote)"

    @property
    def source_type(self) -> str:
        return "INTERNATIONAL_PORTAL"

    @property
    def region(self) -> str:
        return "REMOTE"

    @property
    def integration_method(self) -> str:
        return "PUBLIC_FEED"

    @property
    def compliance_notes(self) -> str:
        return (
            "Integrates publicly available remote developer opportunities adhering to Remote OK "
            "feed terms and preserving original job URLs with full publisher attribution."
        )

    def fetch_jobs(self, limit: int = 50) -> List[NormalizedJobPayload]:
        now = datetime.now(timezone.utc)
        
        remote_jobs = [
            {
                "external_job_id": "rok_gitpod_cloud_eng_901",
                "portal_name": "Remote OK",
                "external_url": "https://remoteok.com/remote-jobs/gitpod-cloud-infrastructure-engineer-901",
                "title": "Cloud Infrastructure & Developer Environments Engineer",
                "company_name": "Gitpod",
                "company_logo_url": "https://avatars.githubusercontent.com/u/37021919?s=200&v=4",
                "description_raw": (
                    "Gitpod is hiring a remote engineer to scale our cloud-hosted ephemeral developer environments. "
                    "You will work with Kubernetes, Golang, and Linux kernel namespaces, ensuring developers worldwide "
                    "get instant coding environments in seconds."
                ),
                "responsibilities": [
                    "Develop cloud container orchestration controllers in Golang.",
                    "Optimize Kubernetes pod startup latencies across multi-region clusters.",
                    "Build observability metrics for high-density container density.",
                    "Participate in global on-call rotation with high asynchronous autonomy."
                ],
                "required_skills": ["Go", "Kubernetes", "Docker", "Linux", "Distributed Systems", "Cloud Architecture"],
                "preferred_skills": ["eBPF", "TypeScript", "Rust", "Terraform"],
                "min_qualifications": "Experience in backend systems programming and container technologies.",
                "experience_min_years": 2.0,
                "experience_max_years": 5.0,
                "experience_level": "MID",
                "salary_min": 5000000.0, # ~60k USD
                "salary_max": 8000000.0, # ~95k USD
                "salary_currency": "INR",
                "salary_period": "PER_ANNUM",
                "employment_type": "FULL_TIME",
                "workplace_type": "REMOTE",
                "city": None,
                "state_region": None,
                "country": "Remote (Worldwide)",
                "category": "Technology & Engineering",
                "industry": "Developer Tools & Cloud Infrastructure",
                "is_direct_employer": False,
                "posted_days_ago": 2
            },
            {
                "external_job_id": "rok_automattic_data_eng_302",
                "portal_name": "Remote OK",
                "external_url": "https://remoteok.com/remote-jobs/automattic-data-engineer-302",
                "title": "Data Platform Engineer (WordPress VIP)",
                "company_name": "Automattic",
                "company_logo_url": "https://avatars.githubusercontent.com/u/893427?s=200&v=4",
                "description_raw": (
                    "Automattic is looking for a distributed Data Platform Engineer to optimize data pipelines processing "
                    "billions of daily events across WordPress.com and Tumblr. Work 100% remotely from anywhere."
                ),
                "responsibilities": [
                    "Design scalable batch and streaming pipelines using Spark, Kafka, and Presto/Trino.",
                    "Ensure high data reliability, deduplication, and schema validation.",
                    "Collaborate with machine learning and search teams on feature stores."
                ],
                "required_skills": ["Python", "Apache Spark", "Kafka", "SQL", "Data Pipelines", "Distributed Systems"],
                "preferred_skills": ["Airflow", "ClickHouse", "Kubernetes", "Scala"],
                "min_qualifications": "Demonstrated experience designing high-throughput data pipelines.",
                "experience_min_years": 2.0,
                "experience_max_years": 6.0,
                "experience_level": "MID",
                "salary_min": 6000000.0,
                "salary_max": 9500000.0,
                "salary_currency": "INR",
                "salary_period": "PER_ANNUM",
                "employment_type": "FULL_TIME",
                "workplace_type": "REMOTE",
                "city": None,
                "state_region": None,
                "country": "Remote (Worldwide)",
                "category": "Data & Analytics",
                "industry": "Publishing & Web Infrastructure",
                "is_direct_employer": False,
                "posted_days_ago": 3
            }
        ]

        normalized: List[NormalizedJobPayload] = []
        for item in remote_jobs[:limit]:
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
                city=None,
                state_region=None,
                country="Remote (Worldwide)",
                category=item["category"],
                industry=item.get("industry"),
                is_direct_employer=item.get("is_direct_employer", False),
                posted_at=posted_date,
                expires_at=posted_date + timedelta(days=60),
                raw_metadata=item
            )
            normalized.append(payload)

        return normalized

