import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

class CandidateDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "candidate_documents"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Types: RESUME, TRANSCRIPT, CERTIFICATE, PORTFOLIO
    document_type: Mapped[str] = mapped_column(String(50), default="RESUME", nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    # Statuses: PENDING_UPLOAD, UPLOADED, PROCESSING, PARSED, FAILED
    status: Mapped[str] = mapped_column(String(30), default="PENDING_UPLOAD", nullable=False)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parsed_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="documents")

