# ADR 0003: Lightweight Asynchronous Task Execution via FastAPI BackgroundTasks

## Status
Accepted

## Context
Initial prototypes contained Celery and RabbitMQ dependencies for asynchronous document processing and email dispatching. However, project guidelines strictly prohibit unneeded external infrastructure overhead for an early-stage production candidate system.

## Decision
We decommissioned Celery in favor of:
1. **Native FastAPI `BackgroundTasks`:** Used for non-blocking operations such as welcome email dispatching via Resend and audit logging.
2. **Upstash Redis Stream Worker Profile:** For heavier CPU tasks (such as batch OCR), an independent worker service can consume from an Upstash Redis queue without requiring a local Celery cluster.

## Consequences
- Dramatically reduced memory footprint (< 120MB per API container).
- Zero RabbitMQ or Celery broker maintenance overhead.
