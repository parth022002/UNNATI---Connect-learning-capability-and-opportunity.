import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Response
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.db.session import get_db
from app.models.user import User
from app.models.resume import (
    Resume,
    ResumeVersion,
    ResumeATSReport,
    JobDescription,
    ResumeJDMatch,
)
from app.api.routes.users import get_db_user
from app.schemas.resume import (
    ResumeCreateRequest,
    ResumeUpdateRequest,
    ResumeVersionSaveRequest,
    ResumeVersionResponse,
    ResumeResponse,
    ResumeDetailResponse,
    ATSReportResponse,
    JobDescriptionCreateRequest,
    JobDescriptionResponse,
    ResumeJDMatchResponse,
    AIAssistRequest,
    AIAssistResponse,
    ResumeCompareMatrixResponse,
    MultipleJDCompareItem,
)
from app.services.resume_service import (
    extract_text_from_file,
    create_initial_resume,
    analyze_resume_ats,
    extract_job_description_intelligence,
    match_resume_to_job_description,
    enhance_text_with_ai,
    export_resume_to_pdf,
    export_resume_to_docx,
)

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])


# ==============================================================================
# RESUME MANAGEMENT
# ==============================================================================

@router.get("", response_model=List[ResumeResponse])
def get_user_resumes(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Lists all resumes created or uploaded by the candidate."""
    resumes = db.scalars(
        select(Resume).where(Resume.user_id == user.id).order_by(desc(Resume.updated_at))
    ).all()

    result = []
    for r in resumes:
        v_count = len(r.versions)
        latest_score = r.versions[0].latest_ats_score if r.versions else None
        result.append(ResumeResponse(
            id=r.id,
            user_id=r.user_id,
            title=r.title,
            target_role=r.target_role,
            is_primary=r.is_primary,
            template_id=r.template_id,
            latest_ats_score=latest_score,
            version_count=v_count,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return result


@router.post("", response_model=ResumeDetailResponse, status_code=status.HTTP_201_CREATED)
def create_resume(
    req: ResumeCreateRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Creates a new structured resume, optionally populated from user profile."""
    resume, version = create_initial_resume(
        db=db,
        user=user,
        title=req.title,
        target_role=req.target_role,
        template_id=req.template_id,
        import_from_profile=req.import_from_profile
    )

    return ResumeDetailResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        is_primary=resume.is_primary,
        template_id=resume.template_id,
        current_version=ResumeVersionResponse.model_validate(version),
        versions=[ResumeVersionResponse.model_validate(version)],
        latest_ats_score=version.latest_ats_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at
    )


@router.post("/upload-and-parse", response_model=ResumeDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    title: Optional[str] = Form("Uploaded Resume"),
    target_role: Optional[str] = Form("Software Engineer"),
    template_id: Optional[str] = Form("classic_professional"),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Uploads a PDF or DOCX resume, extracts text, and generates a structured resume."""
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds maximum limit of 10MB.")

    extracted_text = extract_text_from_file(contents, file.filename or "resume.pdf")
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from document.")

    # Create fresh resume and initial version
    resume, version = create_initial_resume(
        db=db,
        user=user,
        title=title or "Uploaded Resume",
        target_role=target_role or "Software Engineer",
        template_id=template_id or "classic_professional",
        import_from_profile=True
    )

    # Enhance summary and text using extracted text
    version.professional_summary = extracted_text[:400].strip() if len(extracted_text) > 40 else version.professional_summary
    db.commit()
    db.refresh(resume)
    db.refresh(version)

    return ResumeDetailResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        is_primary=resume.is_primary,
        template_id=resume.template_id,
        current_version=ResumeVersionResponse.model_validate(version),
        versions=[ResumeVersionResponse.model_validate(version)],
        latest_ats_score=version.latest_ats_score,
        created_at=resume.created_at,
        updated_at=resume.updated_at
    )


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_detail(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves full details of a resume, its current version and historical versions."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    versions = resume.versions
    current_ver = versions[0] if versions else None

    return ResumeDetailResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        is_primary=resume.is_primary,
        template_id=resume.template_id,
        current_version=ResumeVersionResponse.model_validate(current_ver) if current_ver else None,
        versions=[ResumeVersionResponse.model_validate(v) for v in versions],
        latest_ats_score=current_ver.latest_ats_score if current_ver else None,
        created_at=resume.created_at,
        updated_at=resume.updated_at
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: uuid.UUID,
    req: ResumeUpdateRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Updates high-level resume attributes (title, target role, template, primary status)."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if req.title is not None: resume.title = req.title
    if req.target_role is not None: resume.target_role = req.target_role
    if req.template_id is not None: resume.template_id = req.template_id
    if req.is_primary is not None:
        if req.is_primary:
            # Unset other primary resumes
            other_resumes = db.scalars(
                select(Resume).where(Resume.user_id == user.id, Resume.id != resume.id)
            ).all()
            for r in other_resumes:
                r.is_primary = False
        resume.is_primary = req.is_primary

    db.commit()
    db.refresh(resume)

    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        title=resume.title,
        target_role=resume.target_role,
        is_primary=resume.is_primary,
        template_id=resume.template_id,
        latest_ats_score=resume.versions[0].latest_ats_score if resume.versions else None,
        version_count=len(resume.versions),
        created_at=resume.created_at,
        updated_at=resume.updated_at
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Permanently deletes a resume and its associated versions and match reports."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    db.delete(resume)
    db.commit()
    return None


@router.post("/{resume_id}/duplicate", response_model=ResumeDetailResponse, status_code=status.HTTP_201_CREATED)
def duplicate_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Creates an identical duplicate of a resume with a new title."""
    source_resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not source_resume or not source_resume.versions:
        raise HTTPException(status_code=404, detail="Source resume not found.")

    src_ver = source_resume.versions[0]
    new_resume = Resume(
        id=uuid.uuid4(),
        user_id=user.id,
        title=f"{source_resume.title} (Copy)",
        target_role=source_resume.target_role,
        template_id=source_resume.template_id,
        is_primary=False
    )
    db.add(new_resume)
    db.flush()

    new_version = ResumeVersion(
        id=uuid.uuid4(),
        resume_id=new_resume.id,
        version_number=1,
        version_label="Version 1.0 (Cloned)",
        template_id=src_ver.template_id,
        personal_info=dict(src_ver.personal_info),
        headline=src_ver.headline,
        professional_summary=src_ver.professional_summary,
        work_experience=list(src_ver.work_experience),
        education=list(src_ver.education),
        technical_skills=list(src_ver.technical_skills),
        business_skills=list(src_ver.business_skills),
        projects=list(src_ver.projects),
        internships=list(src_ver.internships),
        certifications=list(src_ver.certifications),
        achievements=list(src_ver.achievements),
        publications=list(src_ver.publications),
        leadership=list(src_ver.leadership),
        languages=list(src_ver.languages),
        section_config=dict(src_ver.section_config),
        latest_ats_score=src_ver.latest_ats_score,
        is_published=False
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_resume)
    db.refresh(new_version)

    return ResumeDetailResponse(
        id=new_resume.id,
        user_id=new_resume.user_id,
        title=new_resume.title,
        target_role=new_resume.target_role,
        is_primary=new_resume.is_primary,
        template_id=new_resume.template_id,
        current_version=ResumeVersionResponse.model_validate(new_version),
        versions=[ResumeVersionResponse.model_validate(new_version)],
        latest_ats_score=new_version.latest_ats_score,
        created_at=new_resume.created_at,
        updated_at=new_resume.updated_at
    )


# ==============================================================================
# VERSIONING & SAVING
# ==============================================================================

@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
def save_resume_version(
    resume_id: uuid.UUID,
    req: ResumeVersionSaveRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Saves updated resume data as a new version or updates current version."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    next_ver_num = (resume.versions[0].version_number + 1) if resume.versions else 1

    new_version = ResumeVersion(
        id=uuid.uuid4(),
        resume_id=resume.id,
        version_number=next_ver_num,
        version_label=req.version_label or f"Version {next_ver_num}.0",
        template_id=req.template_id or resume.template_id,
        personal_info=req.personal_info.model_dump(),
        headline=req.headline,
        professional_summary=req.professional_summary,
        work_experience=[e.model_dump() for e in req.work_experience],
        education=[e.model_dump() for e in req.education],
        technical_skills=req.technical_skills,
        business_skills=req.business_skills,
        projects=[p.model_dump() for p in req.projects],
        internships=[i.model_dump() for i in req.internships],
        certifications=[c.model_dump() for c in req.certifications],
        achievements=req.achievements,
        publications=req.publications,
        leadership=req.leadership,
        languages=req.languages,
        section_config=req.section_config or {
            "order": ["summary", "skills", "experience", "projects", "education", "certifications", "achievements"],
            "hidden": []
        },
        latest_ats_score=None,
        is_published=True
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    # Immediately calculate fresh ATS score on new version
    ats_data = analyze_resume_ats(new_version, resume.target_role)
    new_version.latest_ats_score = ats_data["overall_score"]
    
    # Save ATS report
    report = ResumeATSReport(
        id=uuid.uuid4(),
        resume_id=resume.id,
        resume_version_id=new_version.id,
        overall_score=ats_data["overall_score"],
        readiness_level=ats_data["readiness_level"],
        dimension_scores=ats_data["dimension_scores"],
        formatting_warnings=ats_data["formatting_warnings"],
        missing_sections=ats_data["missing_sections"],
        weak_bullet_points=ats_data["weak_bullet_points"],
        grammar_spelling_issues=ats_data["grammar_spelling_issues"],
        recommended_keywords=ats_data["recommended_keywords"],
        actionable_recommendations=ats_data["actionable_recommendations"]
    )
    db.add(report)
    db.commit()
    db.refresh(new_version)

    return ResumeVersionResponse.model_validate(new_version)


# ==============================================================================
# ATS ANALYSIS & OPTIMIZATION
# ==============================================================================

@router.post("/{resume_id}/ats-check", response_model=ATSReportResponse)
def run_ats_analysis(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Executes a 16-dimension ATS compatibility check and generates diagnostic report."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume or not resume.versions:
        raise HTTPException(status_code=404, detail="Resume has no active versions.")

    version = resume.versions[0]
    ats_data = analyze_resume_ats(version, resume.target_role)

    # Update latest score
    version.latest_ats_score = ats_data["overall_score"]

    report = ResumeATSReport(
        id=uuid.uuid4(),
        resume_id=resume.id,
        resume_version_id=version.id,
        overall_score=ats_data["overall_score"],
        readiness_level=ats_data["readiness_level"],
        dimension_scores=ats_data["dimension_scores"],
        formatting_warnings=ats_data["formatting_warnings"],
        missing_sections=ats_data["missing_sections"],
        weak_bullet_points=ats_data["weak_bullet_points"],
        grammar_spelling_issues=ats_data["grammar_spelling_issues"],
        recommended_keywords=ats_data["recommended_keywords"],
        actionable_recommendations=ats_data["actionable_recommendations"]
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ATSReportResponse.model_validate(report)


@router.get("/{resume_id}/ats-reports", response_model=List[ATSReportResponse])
def get_ats_reports(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Returns historical ATS compatibility reports for this resume."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    reports = db.scalars(
        select(ResumeATSReport)
        .where(ResumeATSReport.resume_id == resume.id)
        .order_by(desc(ResumeATSReport.created_at))
    ).all()

    return [ATSReportResponse.model_validate(r) for r in reports]


@router.post("/ai-assist", response_model=AIAssistResponse)
def get_ai_writing_assistance(
    req: AIAssistRequest,
    user: User = Depends(get_db_user)
):
    """AI writing assistant: enhances bullet points (STAR method), summaries, and headlines."""
    result = enhance_text_with_ai(
        action_type=req.action_type,
        context_text=req.context_text,
        role_or_target=req.role_or_target
    )
    return AIAssistResponse(**result)


# ==============================================================================
# JOB DESCRIPTIONS
# ==============================================================================

@router.get("/job-descriptions", response_model=List[JobDescriptionResponse])
def get_job_descriptions(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Retrieves all saved job descriptions for the candidate."""
    jds = db.scalars(
        select(JobDescription)
        .where(JobDescription.user_id == user.id)
        .order_by(desc(JobDescription.created_at))
    ).all()
    return [JobDescriptionResponse.model_validate(j) for j in jds]


@router.post("/job-descriptions", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job_description(
    req: JobDescriptionCreateRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Ingests and extracts intelligence from a job description (manual paste or text)."""
    intel = extract_job_description_intelligence(req.raw_text, db)

    jd = JobDescription(
        id=uuid.uuid4(),
        user_id=user.id,
        title=req.title or intel.get("title") or "Target Position",
        company=req.company or intel.get("company"),
        location=req.location or intel.get("location"),
        employment_type=req.employment_type or intel.get("employment_type", "Full-time"),
        experience_requirement_years=req.experience_requirement_years or intel.get("experience_requirement_years"),
        source_url=req.source_url,
        raw_text=req.raw_text,
        extracted_intelligence=intel
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return JobDescriptionResponse.model_validate(jd)


@router.post("/job-descriptions/upload", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def upload_job_description(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Uploads a PDF, DOCX, or TXT job description file, extracts text and intelligence."""
    contents = await file.read()
    raw_text = extract_text_from_file(contents, file.filename or "job_description.pdf")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from Job Description.")

    intel = extract_job_description_intelligence(raw_text, db)
    jd_title = title or intel.get("title") or "Target Role"
    jd_company = company or intel.get("company")

    jd = JobDescription(
        id=uuid.uuid4(),
        user_id=user.id,
        title=jd_title,
        company=jd_company,
        location=intel.get("location"),
        employment_type=intel.get("employment_type", "Full-time"),
        experience_requirement_years=intel.get("experience_requirement_years"),
        raw_text=raw_text,
        extracted_intelligence=intel
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return JobDescriptionResponse.model_validate(jd)


@router.delete("/job-descriptions/{jd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_description(
    jd_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Deletes a saved job description."""
    jd = db.scalar(
        select(JobDescription).where(JobDescription.id == jd_id, JobDescription.user_id == user.id)
    )
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")
    db.delete(jd)
    db.commit()
    return None


# ==============================================================================
# RESUME & JD MATCHING ENGINE
# ==============================================================================

@router.post("/{resume_id}/match-jd/{jd_id}", response_model=ResumeJDMatchResponse)
def match_resume_with_jd(
    resume_id: uuid.UUID,
    jd_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Compares candidate resume version against JD intelligence, generating a transparent match report."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume or not resume.versions:
        raise HTTPException(status_code=404, detail="Resume has no active versions.")

    jd = db.scalar(
        select(JobDescription).where(JobDescription.id == jd_id, JobDescription.user_id == user.id)
    )
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")

    version = resume.versions[0]
    match_result = match_resume_to_job_description(version, jd, db)

    match_record = ResumeJDMatch(
        id=uuid.uuid4(),
        resume_id=resume.id,
        resume_version_id=version.id,
        job_description_id=jd.id,
        overall_match_score=match_result["overall_match_score"],
        skill_alignment_score=match_result["skill_alignment_score"],
        experience_alignment_score=match_result["experience_alignment_score"],
        education_alignment_score=match_result["education_alignment_score"],
        project_relevance_score=match_result["project_relevance_score"],
        keyword_coverage_score=match_result["keyword_coverage_score"],
        matched_skills=match_result["matched_skills"],
        partially_matched_skills=match_result["partially_matched_skills"],
        missing_skills=match_result["missing_skills"],
        mandatory_gaps=match_result["mandatory_gaps"],
        preferred_gaps=match_result["preferred_gaps"],
        improvement_suggestions=match_result["improvement_suggestions"],
        learning_recommendations=match_result["learning_recommendations"]
    )
    db.add(match_record)
    db.commit()
    db.refresh(match_record)

    return ResumeJDMatchResponse(
        id=match_record.id,
        resume_id=resume.id,
        resume_version_id=version.id,
        job_description_id=jd.id,
        job_title=jd.title,
        company=jd.company,
        overall_match_score=match_record.overall_match_score,
        skill_alignment_score=match_record.skill_alignment_score,
        experience_alignment_score=match_record.experience_alignment_score,
        education_alignment_score=match_record.education_alignment_score,
        project_relevance_score=match_record.project_relevance_score,
        keyword_coverage_score=match_record.keyword_coverage_score,
        matched_skills=match_record.matched_skills,
        partially_matched_skills=match_record.partially_matched_skills,
        missing_skills=match_record.missing_skills,
        mandatory_gaps=match_record.mandatory_gaps,
        preferred_gaps=match_record.preferred_gaps,
        improvement_suggestions=match_record.improvement_suggestions,
        learning_recommendations=match_record.learning_recommendations,
        created_at=match_record.created_at
    )


@router.post("/{resume_id}/compare-jds", response_model=ResumeCompareMatrixResponse)
def compare_resume_across_multiple_jds(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Compares one resume against all saved job descriptions in a comparison matrix."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume or not resume.versions:
        raise HTTPException(status_code=404, detail="Resume has no active versions.")

    jds = db.scalars(
        select(JobDescription).where(JobDescription.user_id == user.id)
    ).all()

    if not jds:
        return ResumeCompareMatrixResponse(
            resume_id=resume.id,
            resume_title=resume.title,
            target_role=resume.target_role,
            comparisons=[]
        )

    version = resume.versions[0]
    comparisons = []
    for jd in jds:
        match_result = match_resume_to_job_description(version, jd, db)
        strongest = "Technical & Core Skills" if match_result["skill_alignment_score"] >= match_result["experience_alignment_score"] else "Practical Experience"
        main_gap = f"Missing: {', '.join(match_result['mandatory_gaps'][:2])}" if match_result["mandatory_gaps"] else "Keyword Alignment"
        comparisons.append(MultipleJDCompareItem(
            job_id=jd.id,
            job_title=jd.title,
            company=jd.company,
            overall_match_score=match_result["overall_match_score"],
            strongest_area=strongest,
            main_gap=main_gap,
            mandatory_unmet_count=len(match_result["mandatory_gaps"])
        ))

    return ResumeCompareMatrixResponse(
        resume_id=resume.id,
        resume_title=resume.title,
        target_role=resume.target_role,
        comparisons=comparisons
    )


# ==============================================================================
# ATS-FRIENDLY EXPORTS (PDF & DOCX)
# ==============================================================================

@router.get("/{resume_id}/export/pdf")
def export_pdf(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Generates and downloads an ATS-compliant, machine-readable PDF resume."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume or not resume.versions:
        raise HTTPException(status_code=404, detail="Resume has no active versions.")

    version = resume.versions[0]
    pdf_bytes = export_resume_to_pdf(version)
    safe_title = "".join(c for c in resume.title if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    filename = f"{safe_title}_Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{resume_id}/export/docx")
def export_docx(
    resume_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Generates and downloads an ATS-compliant, machine-readable DOCX resume."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    if not resume or not resume.versions:
        raise HTTPException(status_code=404, detail="Resume has no active versions.")

    version = resume.versions[0]
    docx_bytes = export_resume_to_docx(version)
    safe_title = "".join(c for c in resume.title if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    filename = f"{safe_title}_Resume.docx"

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

