# ==============================================================================
# UNNATI — Cryptographic Audit Chain Verification Service (SEC-003)
# ==============================================================================
import hashlib
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.audit import AuditEvent

logger = logging.getLogger(__name__)

GENESIS_HASH = "0" * 64

def calculate_sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()

def record_audit_event(
    db: Session,
    event_type: str,
    payload: Dict[str, Any],
    user_id: Optional[uuid.UUID] = None,
    actor_ip: Optional[str] = None
) -> AuditEvent:
    """
    Appends an immutable audit event chained to the previous event's hash.
    Guarantees tamper-evident audit trail under DPDP and security frameworks.
    """
    # 1. Fetch the latest event to obtain its hash
    latest_event = db.scalar(
        select(AuditEvent).order_by(desc(AuditEvent.created_at), desc(AuditEvent.id)).limit(1)
    )
    previous_hash = latest_event.current_hash if latest_event else GENESIS_HASH

    # 2. Compute payload SHA-256
    serialized_payload = json.dumps(payload, sort_keys=True, default=str)
    payload_hash = calculate_sha256(serialized_payload)

    # 3. Compute chained current hash: SHA-256(previous_hash + payload_hash + event_type)
    chain_material = f"{previous_hash}:{payload_hash}:{event_type}"
    current_hash = calculate_sha256(chain_material)

    event = AuditEvent(
        event_type=event_type,
        user_id=user_id,
        actor_ip=actor_ip,
        payload=payload,
        payload_hash=payload_hash,
        previous_hash=previous_hash,
        current_hash=current_hash
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    logger.info(f"Recorded tamper-evident audit event: {event_type} (Hash: {current_hash[:12]}...)")
    return event

def log_action(
    db: Session,
    action: str,
    user_id: Optional[uuid.UUID] = None,
    resource_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> AuditEvent:
    """Convenience wrapper for recording audited actions with resource metadata."""
    payload: Dict[str, Any] = {"resource_id": resource_id}
    if metadata:
        payload.update(metadata)
    return record_audit_event(db=db, event_type=action, payload=payload, user_id=user_id)

def verify_audit_chain(db: Session) -> Dict[str, Any]:
    """
    Performs full verification across the cryptographic audit hash chain.
    Returns status: verified if untouched, or details of any tampered records.
    """
    events = db.scalars(
        select(AuditEvent).order_by(AuditEvent.created_at.asc(), AuditEvent.id.asc())
    ).all()

    if not events:
        return {"status": "verified", "total_events": 0, "message": "Audit chain empty (Genesis state)."}

    expected_prev = GENESIS_HASH
    for idx, event in enumerate(events):
        # 1. Check previous hash linkage
        if event.previous_hash != expected_prev:
            logger.error(f"Audit chain broken at index {idx}! Event ID: {event.id}")
            return {
                "status": "compromised",
                "broken_at_index": idx,
                "event_id": str(event.id),
                "expected_previous_hash": expected_prev,
                "found_previous_hash": event.previous_hash
            }

        # 2. Check current hash integrity
        serialized_payload = json.dumps(event.payload, sort_keys=True, default=str)
        payload_hash = calculate_sha256(serialized_payload)
        expected_current = calculate_sha256(f"{expected_prev}:{payload_hash}:{event.event_type}")

        if event.current_hash != expected_current:
            logger.error(f"Audit event payload altered at index {idx}! Event ID: {event.id}")
            return {
                "status": "compromised",
                "altered_event_id": str(event.id),
                "expected_current_hash": expected_current,
                "found_current_hash": event.current_hash
            }

        expected_prev = event.current_hash

    return {
        "status": "verified",
        "total_events": len(events),
        "latest_hash": expected_prev,
        "message": "Cryptographic audit chain intact. Zero tampering detected."
    }

