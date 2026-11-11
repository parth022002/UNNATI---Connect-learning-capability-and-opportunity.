import uuid
import urllib.parse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.db.session import get_db
from app.models.user import User
from app.models.job import (
    JobSource,
    CanonicalJob,
    ExternalJobReference,
    SavedJob,
    JobApplicationActivity,
    UserJobPreferences
)
from app.api.routes.users import get_db_user
from app.schemas.job import (
    JobSourceResponse,
    CanonicalJobListItem,
    CanonicalJobDetailResponse,
    ExternalJobReferenceItem,
    JobSearchFilterRequest,
    JobSearchResponse,
    JobDiscoveryDashboardData,
    UserJobPreferencesRequest,
    UserJobPreferencesResponse,
    SaveJobRequest,
    SavedJobItem,
    JobApplicationActivityRequest,
    JobApplicationActivityResponse,
    JobRedirectValidationResponse
)
from app.services.job_adapters.adapter_registry import job_source_registry
from app.services.job_search_service import search_canonical_jobs, get_job_discovery_dashboard
from app.services.job_recommendation_service import evaluate_job_match

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


# ==============================================================================
# 1. DISCOVERY DASHBOARD & FEED
# ==============================================================================

@router.get("/dashboard", response_model=JobDiscoveryDashboardData)
def get_dashboard(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves personalized job discovery categories:
    - Best Matches (top explainable match scores)
    - Recently Posted Opportunities
    - Opportunities Requiring Skills in Candidate's Roadmap
    - Entry-Level & Fresh Graduate Opportunities
    - Global & Remote Opportunities
    """
    # Ensure source feeds are synced in DB if empty
    job_source_registry.ensure_sources_in_db(db)
    active_count = db.scalar(select(CanonicalJob.id).limit(1))
    if not active_count:
        job_source_registry.synchronize_all(db, limit_per_source=20)

    return get_job_discovery_dashboard(db, user)


# ==============================================================================
# 2. MULTI-FACETED & NATURAL LANGUAGE JOB SEARCH
# ==============================================================================

@router.post("/search", response_model=JobSearchResponse)
def search_jobs(
    filter_req: JobSearchFilterRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Multi-faceted faceted search supporting:
    - Natural language queries (e.g. 'Find entry-level data analyst jobs in Bengaluru')
    - Structured filters (cities, workplace types, salary, experience, categories)
    - Dynamic personalized match scoring for authenticated candidates.
    """
    return search_canonical_jobs(db, filter_req, current_user=user)


# ==============================================================================
# 3. JOB DETAIL & PERSONALIZED MATCH EXPLANATION
# ==============================================================================

@router.get("/{job_id}", response_model=CanonicalJobDetailResponse)
def get_job_detail(
    job_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves full job details, all external portal sources, and 10-dimension match analysis."""
    job = db.scalar(select(CanonicalJob).where(CanonicalJob.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found.")

    # Increment view count
    job.view_count += 1
    db.commit()

    # Determine primary source name
    primary_ref = next((r for r in job.external_references if r.is_primary_source), None)
    source_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if job.is_direct_employer else "Portal")

    # Evaluate 10-dimension explainable match
    match_detail = evaluate_job_match(job, user, db)

    # Check if saved or application status
    saved_record = db.scalar(
        select(SavedJob).where(SavedJob.user_id == user.id, SavedJob.canonical_job_id == job.id)
    )
    app_record = db.scalar(
        select(JobApplicationActivity).where(
            JobApplicationActivity.user_id == user.id,
            JobApplicationActivity.canonical_job_id == job.id
        )
    )

    external_refs = [
        ExternalJobReferenceItem(
            id=r.id,
            source_id=r.source_id,
            portal_name=r.portal_name,
            external_job_id=r.external_job_id,
            external_url=r.external_url,
            portal_job_title=r.portal_job_title,
            portal_posted_at=r.portal_posted_at,
            is_primary_source=r.is_primary_source
        )
        for r in job.external_references
    ]

    return CanonicalJobDetailResponse(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        company_logo_url=job.company_logo_url,
        city=job.city,
        state_region=job.state_region,
        country=job.country,
        workplace_type=job.workplace_type,
        employment_type=job.employment_type,
        experience_min_years=job.experience_min_years,
        experience_max_years=job.experience_max_years,
        experience_level=job.experience_level,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        salary_period=job.salary_period,
        category=job.category,
        industry=job.industry,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        posted_at=job.posted_at,
        last_verified_at=job.last_verified_at,
        status=job.status,
        primary_application_url=job.primary_application_url,
        is_direct_employer=job.is_direct_employer,
        primary_source_name=source_name,
        external_sources_count=max(len(job.external_references), 1),
        match_score=match_detail.overall_match_percentage,
        description_raw=job.description_raw,
        description_clean=job.description_clean,
        responsibilities=job.responsibilities or [],
        min_qualifications=job.min_qualifications,
        external_references=external_refs,
        match_analysis=match_detail,
        is_saved=saved_record is not None,
        application_status=app_record.status if app_record else None
    )


# ==============================================================================
# 4. EXTERNAL APPLICATION REDIRECT & TELEMETRY
# ==============================================================================

@router.post("/{job_id}/apply", response_model=JobRedirectValidationResponse)
def track_apply_redirect(
    job_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Safe application redirect gateway:
    - Validates target destination URL (safe HTTP/HTTPS, no internal IP / SSRF vulnerability)
    - Records an 'Application Link Opened' event (without falsely claiming the application was submitted)
    - Returns verified external domain and tracking telemetry.
    """
    job = db.scalar(select(CanonicalJob).where(CanonicalJob.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found.")

    target_url = job.primary_application_url
    parsed = urllib.parse.urlparse(target_url)

    if parsed.scheme not in ["http", "https"] or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid application destination URL.")

    # Prevent open redirect / SSRF to loopback or private ranges
    host_lower = parsed.netloc.split(":")[0].lower()
    if (
        host_lower in ["localhost", "127.0.0.1", "0.0.0.0", "::1"]
        or host_lower.startswith("10.")
        or host_lower.startswith("192.168.")
        or host_lower.startswith("172.")
    ):
        raise HTTPException(status_code=400, detail="Redirect to private host addresses is forbidden.")

    # Record or update Application Activity
    app_activity = db.scalar(
        select(JobApplicationActivity).where(
            JobApplicationActivity.user_id == user.id,
            JobApplicationActivity.canonical_job_id == job.id
        )
    )

    primary_ref = next((r for r in job.external_references if r.is_primary_source), None)
    portal_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if job.is_direct_employer else "Career Portal")

    if not app_activity:
        app_activity = JobApplicationActivity(
            id=uuid.uuid4(),
            user_id=user.id,
            canonical_job_id=job.id,
            source_name=portal_name,
            redirect_url=target_url,
            status="LINK_OPENED",
            last_status_change_at=datetime.now(timezone.utc)
        )
        db.add(app_activity)
    else:
        if app_activity.status in ["INTERESTED", "SAVED", "READY_TO_APPLY"]:
            app_activity.status = "LINK_OPENED"
            app_activity.last_status_change_at = datetime.now(timezone.utc)

    job.apply_click_count += 1
    db.commit()

    return JobRedirectValidationResponse(
        job_id=job.id,
        destination_url=target_url,
        destination_domain=parsed.netloc,
        portal_name=portal_name,
        is_trusted_domain=True,
        tracked_status="LINK_OPENED",
        message=f"Proceeding to authorized job listing on {parsed.netloc}."
    )


# ==============================================================================
# 5. SAVED JOBS (BOOKMARKS)
# ==============================================================================

@router.post("/{job_id}/save", response_model=Dict[str, Any])
def save_job(
    job_id: uuid.UUID,
    body: SaveJobRequest = SaveJobRequest(),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Saves / bookmarks a job for future reference."""
    job = db.scalar(select(CanonicalJob).where(CanonicalJob.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found.")

    existing = db.scalar(
        select(SavedJob).where(SavedJob.user_id == user.id, SavedJob.canonical_job_id == job.id)
    )
    if existing:
        existing.notes = body.notes
        existing.reminder_at = body.reminder_at
        db.commit()
        return {"status": "updated", "saved_id": str(existing.id)}

    saved = SavedJob(
        id=uuid.uuid4(),
        user_id=user.id,
        canonical_job_id=job.id,
        notes=body.notes,
        reminder_at=body.reminder_at
    )
    db.add(saved)
    db.commit()
    return {"status": "saved", "saved_id": str(saved.id)}


@router.delete("/{job_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved_job(
    job_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Removes a job from saved collection."""
    saved = db.scalar(
        select(SavedJob).where(SavedJob.user_id == user.id, SavedJob.canonical_job_id == job_id)
    )
    if saved:
        db.delete(saved)
        db.commit()


@router.get("/user/saved", response_model=List[SavedJobItem])
def list_saved_jobs(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves all bookmarked jobs for the authenticated candidate."""
    saved_records = db.scalars(
        select(SavedJob).where(SavedJob.user_id == user.id).order_by(desc(SavedJob.created_at))
    ).all()

    items = []
    for s in saved_records:
        j = s.job
        primary_ref = next((r for r in j.external_references if r.is_primary_source), None)
        source_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if j.is_direct_employer else "Portal")

        job_item = CanonicalJobListItem(
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
            match_score=None
        )

        items.append(
            SavedJobItem(
                id=s.id,
                user_id=s.user_id,
                canonical_job_id=s.canonical_job_id,
                notes=s.notes,
                reminder_at=s.reminder_at,
                created_at=s.created_at,
                job=job_item
            )
        )

    return items


# ==============================================================================
# 6. APPLICATION TRACKER
# ==============================================================================

@router.get("/user/applications", response_model=List[JobApplicationActivityResponse])
def list_applications(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves candidate's manual application tracking pipeline."""
    apps = db.scalars(
        select(JobApplicationActivity)
        .where(JobApplicationActivity.user_id == user.id)
        .order_by(desc(JobApplicationActivity.last_status_change_at))
    ).all()

    items = []
    for a in apps:
        j = a.job
        primary_ref = next((r for r in j.external_references if r.is_primary_source), None)
        source_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if j.is_direct_employer else "Portal")

        job_item = CanonicalJobListItem(
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
            match_score=None
        )

        items.append(
            JobApplicationActivityResponse(
                id=a.id,
                user_id=a.user_id,
                canonical_job_id=a.canonical_job_id,
                source_name=a.source_name,
                redirect_url=a.redirect_url,
                status=a.status,
                applied_at=a.applied_at,
                last_status_change_at=a.last_status_change_at,
                candidate_notes=a.candidate_notes,
                follow_up_date=a.follow_up_date,
                job=job_item
            )
        )

    return items


@router.put("/{job_id}/application-status", response_model=JobApplicationActivityResponse)
def update_application_status(
    job_id: uuid.UUID,
    req: JobApplicationActivityRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Updates the candidate's manual application progress:
    e.g. INTERESTED, SAVED, READY_TO_APPLY, LINK_OPENED, APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN.
    """
    job = db.scalar(select(CanonicalJob).where(CanonicalJob.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found.")

    activity = db.scalar(
        select(JobApplicationActivity).where(
            JobApplicationActivity.user_id == user.id,
            JobApplicationActivity.canonical_job_id == job.id
        )
    )

    primary_ref = next((r for r in job.external_references if r.is_primary_source), None)
    portal_name = primary_ref.portal_name if primary_ref else ("Direct Employer" if job.is_direct_employer else "Portal")

    now = datetime.now(timezone.utc)
    if not activity:
        activity = JobApplicationActivity(
            id=uuid.uuid4(),
            user_id=user.id,
            canonical_job_id=job.id,
            source_name=portal_name,
            redirect_url=job.primary_application_url,
            status=req.status,
            applied_at=now if req.status == "APPLIED" else None,
            last_status_change_at=now,
            candidate_notes=req.candidate_notes,
            follow_up_date=req.follow_up_date
        )
        db.add(activity)
    else:
        activity.status = req.status
        activity.last_status_change_at = now
        if req.status == "APPLIED" and not activity.applied_at:
            activity.applied_at = now
        if req.candidate_notes is not None:
            activity.candidate_notes = req.candidate_notes
        if req.follow_up_date is not None:
            activity.follow_up_date = req.follow_up_date

    db.commit()
    db.refresh(activity)

    job_item = CanonicalJobListItem(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        company_logo_url=job.company_logo_url,
        city=job.city,
        state_region=job.state_region,
        country=job.country,
        workplace_type=job.workplace_type,
        employment_type=job.employment_type,
        experience_min_years=job.experience_min_years,
        experience_max_years=job.experience_max_years,
        experience_level=job.experience_level,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        salary_period=job.salary_period,
        category=job.category,
        industry=job.industry,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        posted_at=job.posted_at,
        last_verified_at=job.last_verified_at,
        status=job.status,
        primary_application_url=job.primary_application_url,
        is_direct_employer=job.is_direct_employer,
        primary_source_name=portal_name,
        external_sources_count=max(len(job.external_references), 1),
        match_score=None
    )

    return JobApplicationActivityResponse(
        id=activity.id,
        user_id=activity.user_id,
        canonical_job_id=activity.canonical_job_id,
        source_name=activity.source_name,
        redirect_url=activity.redirect_url,
        status=activity.status,
        applied_at=activity.applied_at,
        last_status_change_at=activity.last_status_change_at,
        candidate_notes=activity.candidate_notes,
        follow_up_date=activity.follow_up_date,
        job=job_item
    )


# ==============================================================================
# 7. CANDIDATE JOB PREFERENCES
# ==============================================================================

@router.get("/user/preferences", response_model=Optional[UserJobPreferencesResponse])
def get_preferences(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves candidate's explicit job-seeking preferences."""
    prefs = db.scalar(select(UserJobPreferences).where(UserJobPreferences.user_id == user.id))
    if not prefs:
        return None
    return UserJobPreferencesResponse.model_validate(prefs)


@router.put("/user/preferences", response_model=UserJobPreferencesResponse)
def update_preferences(
    req: UserJobPreferencesRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Updates candidate's target roles, locations, workplace types, and salary criteria."""
    prefs = db.scalar(select(UserJobPreferences).where(UserJobPreferences.user_id == user.id))
    if not prefs:
        prefs = UserJobPreferences(
            id=uuid.uuid4(),
            user_id=user.id,
            target_roles=req.target_roles or [],
            preferred_locations=req.preferred_locations or [],
            workplace_types=req.workplace_types or ["HYBRID", "REMOTE"],
            preferred_industries=req.preferred_industries or [],
            min_salary=req.min_salary,
            salary_currency=req.salary_currency or "INR",
            employment_types=req.employment_types or ["FULL_TIME"],
            experience_level=req.experience_level or "ENTRY",
            open_to_relocation=req.open_to_relocation if req.open_to_relocation is not None else True,
            notify_new_matches=req.notify_new_matches if req.notify_new_matches is not None else True
        )
        db.add(prefs)
    else:
        if req.target_roles is not None:
            prefs.target_roles = req.target_roles
        if req.preferred_locations is not None:
            prefs.preferred_locations = req.preferred_locations
        if req.workplace_types is not None:
            prefs.workplace_types = req.workplace_types
        if req.preferred_industries is not None:
            prefs.preferred_industries = req.preferred_industries
        if req.min_salary is not None:
            prefs.min_salary = req.min_salary
        if req.salary_currency is not None:
            prefs.salary_currency = req.salary_currency
        if req.employment_types is not None:
            prefs.employment_types = req.employment_types
        if req.experience_level is not None:
            prefs.experience_level = req.experience_level
        if req.open_to_relocation is not None:
            prefs.open_to_relocation = req.open_to_relocation
        if req.notify_new_matches is not None:
            prefs.notify_new_matches = req.notify_new_matches

    db.commit()
    db.refresh(prefs)
    return UserJobPreferencesResponse.model_validate(prefs)


# ==============================================================================
# 8. ADMINISTRATOR SOURCE MONITORING & MANUAL SYNC
# ==============================================================================

@router.get("/admin/sources", response_model=List[JobSourceResponse])
def list_job_sources(db: Session = Depends(get_db)):
    """Administrator view: Inspect all configured job source integrations, sync health, and error logs."""
    job_source_registry.ensure_sources_in_db(db)
    sources = db.scalars(select(JobSource).order_by(JobSource.name)).all()
    return [JobSourceResponse.model_validate(s) for s in sources]


@router.post("/admin/sync", response_model=Dict[str, Any])
def trigger_source_sync(
    source_code: Optional[str] = Query(None, description="Sync specific source or all if omitted"),
    db: Session = Depends(get_db)
):
    """Administrator action: Triggers ingestion across configured job feeds."""
    if source_code:
        log = job_source_registry.synchronize_source(db, source_code, limit=50)
        return {
            "status": "completed",
            "source": source_code,
            "jobs_discovered": log.jobs_discovered,
            "jobs_created": log.jobs_created,
            "jobs_updated": log.jobs_updated,
            "duplicates_detected": log.duplicates_detected
        }
    else:
        logs = job_source_registry.synchronize_all(db, limit_per_source=50)
        return {
            "status": "completed",
            "total_sources_synced": len(logs),
            "total_created": sum(l.jobs_created for l in logs),
            "total_duplicates": sum(l.duplicates_detected for l in logs)
        }

