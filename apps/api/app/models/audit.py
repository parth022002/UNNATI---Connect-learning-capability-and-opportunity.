# ==============================================================================
# UNNATI — Immutable Cryptographic Audit Log Table (DB-009)
# Merkle-style SHA-256 prev-hash linkage for tamper-evident security auditability.
# ==============================================================================
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDPrimaryKeyMixin

class AuditEvent(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "audit_events"

    # Event category (e.g. AUTH_SIGNIN, DOCUMENT_UPLOADED, SKILL_VERIFIED, DPDP_ERASURE)
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    actor_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    # Cryptographic Hash Chaining (SHA-256)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    payload_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    previous_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    current_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    signature: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    __table_args__ = (
        Index("ix_audit_events_created_at_id", "created_at", "id"),
    )

