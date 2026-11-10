import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.document import CandidateDocument
from app.api.routes.users import get_db_user
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentDetailResponse,
    DocumentApplyRequest
)
from app.services.document_service import (
    save_and_parse_document,
    apply_parsed_document_to_candidate
)

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = "RESUME",
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a resume or transcript document (PDF or text).
    Extracts text and parses structured career entities (AI-assisted or heuristic).
    """
    # Max file size check: 10MB
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum limit of 10MB."
        )

    doc = save_and_parse_document(
        db=db,
        user=user,
        file_bytes=contents,
        filename=file.filename or "resume.pdf",
        mime_type=file.content_type or "application/pdf",
        document_type=document_type
    )

    return doc

@router.get("/me", response_model=List[DocumentUploadResponse])
def get_my_documents(
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Returns all documents uploaded by the current candidate."""
    stmt = select(CandidateDocument).where(CandidateDocument.user_id == user.id).order_by(CandidateDocument.created_at.desc())
    docs = db.scalars(stmt).all()
    return docs

@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document_details(
    doc_id: uuid.UUID,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """Returns details and parsed JSON payload for a specific candidate document."""
    doc = db.scalar(
        select(CandidateDocument).where(
            CandidateDocument.id == doc_id,
            CandidateDocument.user_id == user.id
        )
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    return doc

@router.post("/{doc_id}/apply")
def apply_document(
    doc_id: uuid.UUID,
    apply_req: DocumentApplyRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Applies the verified extracted data from a document into candidate profile,
    education records, experience records, and inferred skills.
    """
    doc = db.scalar(
        select(CandidateDocument).where(
            CandidateDocument.id == doc_id,
            CandidateDocument.user_id == user.id
        )
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    result = apply_parsed_document_to_candidate(
        db=db,
        user=user,
        doc=doc,
        apply_profile=apply_req.apply_profile,
        apply_education=apply_req.apply_education,
        apply_experience=apply_req.apply_experience,
        apply_skills=apply_req.apply_skills
    )
    return result

