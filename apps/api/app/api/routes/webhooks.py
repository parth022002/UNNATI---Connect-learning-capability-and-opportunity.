import logging
import json
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from svix.webhooks import Webhook, WebhookVerificationError

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserProfile, ClerkWebhookEvent
from app.services.user_service import calculate_completeness

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def handle_clerk_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook receiver for Clerk lifecycle events (user.created, user.updated, user.deleted).
    Cryptographically verifies the Svix signature when CLERK_WEBHOOK_SECRET is set.
    """
    headers = request.headers
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")

    body_bytes = await request.body()
    webhook_secret = settings.resolved_webhook_secret

    evt: Dict[str, Any] = {}

    if webhook_secret:
        if not svix_id or not svix_timestamp or not svix_signature:
            logger.error("Clerk webhook missing required Svix signature headers.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required Svix signature headers."
            )

        try:
            wh = Webhook(webhook_secret)
            wh.verify(
                body_bytes,
                {
                    "svix-id": svix_id,
                    "svix-timestamp": svix_timestamp,
                    "svix-signature": svix_signature,
                }
            )
            evt = json.loads(body_bytes.decode("utf-8"))
        except WebhookVerificationError as e:
            logger.error(f"Clerk webhook signature verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook signature verification failed."
            )
        except Exception as e:
            logger.error(f"Failed to parse webhook JSON payload: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload."
            )
    else:
        # Development fallback with warning if secret is not set yet
        logger.warning(
            "CLERK_WEBHOOK_SECRET is not configured. Processing payload without Svix verification (DEV ONLY)."
        )
        try:
            evt = json.loads(body_bytes.decode("utf-8"))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload."
            )

    if not isinstance(evt, dict):
        evt = {}

    event_type = evt.get("type", "unknown")
    data = evt.get("data", {})
    event_id = svix_id or evt.get("id") or (data.get("id") if event_type.startswith("session.") else None)
    logger.info(f"Received Clerk Webhook event: {event_type} (ID: {event_id})")

    # Idempotency Check: prevent duplicate event processing
    if event_id:
        existing_event = db.scalar(
            select(ClerkWebhookEvent).where(ClerkWebhookEvent.event_id == event_id)
        )
        if existing_event:
            logger.info(f"Webhook event already processed: {event_id}. Skipping.")
            return {"status": "already_processed", "event_id": event_id, "event_type": event_type}

    try:
        # 1. User Created (Upsert)
        if event_type == "user.created":
            clerk_id = data.get("id")
            email_addresses = data.get("email_addresses", [])
            primary_email = email_addresses[0].get("email_address") if email_addresses else None
            first_name = data.get("first_name") or ""
            last_name = data.get("last_name") or ""
            full_name = f"{first_name} {last_name}".strip() or None

            if clerk_id and primary_email:
                existing_user = db.scalar(select(User).where(User.clerk_id == clerk_id))
                if not existing_user:
                    new_user = User(
                        clerk_id=clerk_id,
                        email=primary_email,
                        full_name=full_name,
                        role="student",
                        is_active=True
                    )
                    db.add(new_user)
                    db.flush()

                    profile = UserProfile(
                        user_id=new_user.id,
                        profile_completeness_score=20
                    )
                    db.add(profile)
                    logger.info(f"Created new candidate user in DB from webhook: {clerk_id} ({primary_email})")
                else:
                    existing_user.email = primary_email
                    if full_name:
                        existing_user.full_name = full_name
                    existing_user.is_active = True
                    logger.info(f"Upserted existing candidate user in DB from webhook: {clerk_id}")

        # 2. User Updated (Upsert)
        elif event_type == "user.updated":
            clerk_id = data.get("id")
            email_addresses = data.get("email_addresses", [])
            primary_email = email_addresses[0].get("email_address") if email_addresses else None
            first_name = data.get("first_name") or ""
            last_name = data.get("last_name") or ""
            full_name = f"{first_name} {last_name}".strip() or None

            if clerk_id:
                user = db.scalar(select(User).where(User.clerk_id == clerk_id))
                if user:
                    if primary_email:
                        user.email = primary_email
                    if full_name:
                        user.full_name = full_name
                    logger.info(f"Updated candidate user in DB from webhook: {clerk_id}")
                elif primary_email:
                    # Out-of-order delivery: user.updated arrived before user.created
                    new_user = User(
                        clerk_id=clerk_id,
                        email=primary_email,
                        full_name=full_name,
                        role="student",
                        is_active=True
                    )
                    db.add(new_user)
                    db.flush()
                    profile = UserProfile(user_id=new_user.id, profile_completeness_score=20)
                    db.add(profile)
                    logger.info(f"Created candidate user from out-of-order user.updated webhook: {clerk_id}")

        # 3. User Deleted (Soft delete)
        elif event_type == "user.deleted":
            clerk_id = data.get("id")
            if clerk_id:
                user = db.scalar(select(User).where(User.clerk_id == clerk_id))
                if user:
                    user.is_active = False
                    logger.info(f"Deactivated candidate user in DB from webhook: {clerk_id}")

        # 4. Session Ended (Audit & Status Update)
        elif event_type == "session.ended":
            session_id = data.get("id")
            user_id = data.get("user_id")
            logger.info(f"Recorded session.ended event for user {user_id} (session: {session_id})")

        # Record event in clerk_webhook_events table in the same transaction
        if event_id:
            webhook_event = ClerkWebhookEvent(
                event_id=event_id,
                event_type=event_type
            )
            db.add(webhook_event)

        # Commit event record and entity changes atomically
        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Error executing webhook transaction for {event_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook event."
        )

    return {"status": "success", "event_type": event_type, "event_id": event_id}

