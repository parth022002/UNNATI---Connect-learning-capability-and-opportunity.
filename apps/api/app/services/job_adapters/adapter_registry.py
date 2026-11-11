import uuid
from typing import Dict, List, Type
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.job import JobSource, CanonicalJob, ExternalJobReference, JobSyncLog
from app.services.job_adapters.base_adapter import BaseJobSourceAdapter, NormalizedJobPayload
from app.services.job_adapters.curated_indian_feed import IndianJobPortalsAdapter
from app.services.job_adapters.national_career_service_adapter import NationalCareerServiceAdapter
from app.services.job_adapters.remoteok_adapter import RemoteOkAdapter


class JobSourceRegistry:
    """Central registry and synchronizer for job source connectors."""

    def __init__(self):
        self._adapters: Dict[str, BaseJobSourceAdapter] = {}
        # Register default adapters
        self.register(IndianJobPortalsAdapter())
        self.register(NationalCareerServiceAdapter())
        self.register(RemoteOkAdapter())

    def register(self, adapter: BaseJobSourceAdapter):
        self._adapters[adapter.source_code] = adapter

    def get_adapter(self, source_code: str) -> BaseJobSourceAdapter:
        return self._adapters.get(source_code)

    def list_adapters(self) -> List[BaseJobSourceAdapter]:
        return list(self._adapters.values())

    def ensure_sources_in_db(self, db: Session) -> Dict[str, JobSource]:
        """Ensures every registered adapter has a corresponding JobSource record."""
        source_map = {}
        for code, adapter in self._adapters.items():
            source = db.scalar(select(JobSource).where(JobSource.source_code == code))
            if not source:
                source = JobSource(
                    id=uuid.uuid4(),
                    name=adapter.source_name,
                    source_code=adapter.source_code,
                    source_type=adapter.source_type,
                    region=adapter.region,
                    integration_method=adapter.integration_method,
                    is_active=True,
                    compliance_notes=adapter.compliance_notes,
                    last_sync_status="IDLE",
                    total_jobs_ingested=0
                )
                db.add(source)
                db.flush()
            source_map[code] = source
        db.commit()
        return source_map

    def synchronize_source(self, db: Session, source_code: str, limit: int = 50) -> JobSyncLog:
        """Executes synchronization for a specific job source."""
        adapter = self.get_adapter(source_code)
        if not adapter:
            raise ValueError(f"Unknown source adapter: {source_code}")

        sources = self.ensure_sources_in_db(db)
        source_record = sources.get(source_code)

        sync_log = JobSyncLog(
            id=uuid.uuid4(),
            source_id=source_record.id,
            started_at=datetime.now(timezone.utc),
            status="IN_PROGRESS"
        )
        db.add(sync_log)
        db.flush()

        try:
            payloads = adapter.fetch_jobs(limit=limit)
            sync_log.jobs_discovered = len(payloads)

            created_count = 0
            updated_count = 0
            duplicates_count = 0

            for payload in payloads:
                # 1. Check for duplicate canonical hash
                existing_canonical = db.scalar(
                    select(CanonicalJob).where(CanonicalJob.canonical_hash == payload.canonical_hash)
                )

                if existing_canonical:
                    duplicates_count += 1
                    existing_canonical.last_verified_at = datetime.now(timezone.utc)
                    # Check if external reference for this specific portal already exists
                    existing_ref = db.scalar(
                        select(ExternalJobReference).where(
                            ExternalJobReference.canonical_job_id == existing_canonical.id,
                            ExternalJobReference.external_job_id == payload.external_job_id
                        )
                    )
                    if not existing_ref:
                        new_ref = ExternalJobReference(
                            id=uuid.uuid4(),
                            canonical_job_id=existing_canonical.id,
                            source_id=source_record.id,
                            external_job_id=payload.external_job_id,
                            external_url=payload.external_url,
                            portal_name=payload.portal_name,
                            portal_job_title=payload.title,
                            portal_posted_at=payload.posted_at,
                            raw_metadata=payload.raw_metadata,
                            is_primary_source=False
                        )
                        db.add(new_ref)
                    # Merge any new required skills
                    current_skills = set(existing_canonical.required_skills or [])
                    new_skills = current_skills.union(set(payload.required_skills or []))
                    existing_canonical.required_skills = list(new_skills)
                    updated_count += 1
                else:
                    # Create new CanonicalJob
                    canonical = CanonicalJob(
                        id=uuid.uuid4(),
                        canonical_hash=payload.canonical_hash,
                        title=payload.title,
                        normalized_title=payload.title.lower(),
                        company_name=payload.company_name,
                        normalized_company=payload.company_name.lower(),
                        company_logo_url=payload.company_logo_url,
                        description_raw=payload.description_raw,
                        description_clean=payload.description_clean,
                        responsibilities=payload.responsibilities,
                        required_skills=payload.required_skills,
                        preferred_skills=payload.preferred_skills,
                        min_qualifications=payload.min_qualifications,
                        experience_min_years=payload.experience_min_years,
                        experience_max_years=payload.experience_max_years,
                        experience_level=payload.experience_level,
                        salary_min=payload.salary_min,
                        salary_max=payload.salary_max,
                        salary_currency=payload.salary_currency,
                        salary_period=payload.salary_period,
                        employment_type=payload.employment_type,
                        workplace_type=payload.workplace_type,
                        city=payload.city,
                        state_region=payload.state_region,
                        country=payload.country,
                        category=payload.category,
                        industry=payload.industry,
                        primary_application_url=payload.external_url,
                        is_direct_employer=payload.is_direct_employer,
                        status="ACTIVE",
                        posted_at=payload.posted_at,
                        last_verified_at=datetime.now(timezone.utc),
                        expires_at=payload.expires_at
                    )
                    db.add(canonical)
                    db.flush()

                    # Add Primary External Reference
                    ref = ExternalJobReference(
                        id=uuid.uuid4(),
                        canonical_job_id=canonical.id,
                        source_id=source_record.id,
                        external_job_id=payload.external_job_id,
                        external_url=payload.external_url,
                        portal_name=payload.portal_name,
                        portal_job_title=payload.title,
                        portal_posted_at=payload.posted_at,
                        raw_metadata=payload.raw_metadata,
                        is_primary_source=True
                    )
                    db.add(ref)
                    created_count += 1

            sync_log.jobs_created = created_count
            sync_log.jobs_updated = updated_count
            sync_log.duplicates_detected = duplicates_count
            sync_log.completed_at = datetime.now(timezone.utc)
            sync_log.status = "SUCCESS"

            source_record.last_sync_at = sync_log.completed_at
            source_record.last_sync_status = "SUCCESS"
            source_record.total_jobs_ingested += created_count
            db.commit()

        except Exception as e:
            db.rollback()
            sync_log.status = "FAILED"
            sync_log.error_details = str(e)
            sync_log.completed_at = datetime.now(timezone.utc)
            source_record.last_sync_status = "FAILED"
            source_record.last_error_message = str(e)
            db.commit()
            raise e

        return sync_log

    def synchronize_all(self, db: Session, limit_per_source: int = 50) -> List[JobSyncLog]:
        logs = []
        for code in self._adapters.keys():
            log = self.synchronize_source(db, code, limit=limit_per_source)
            logs.append(log)
        return logs


# Singleton registry instance
job_source_registry = JobSourceRegistry()

