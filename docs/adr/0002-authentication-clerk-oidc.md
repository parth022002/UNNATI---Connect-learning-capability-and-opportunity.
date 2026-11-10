# ADR 0002: Identity & Authentication via Clerk OIDC

## Status
Accepted

## Context
UNNATI requires a secure, frictionless authentication experience supporting social logins (Google, GitHub), email magic links, session management, and multi-tenant organization switching without managing raw passwords or authentication tables directly in application code.

## Decision
We selected **Clerk** as our centralized Identity Provider (IdP):
1. **Frontend Integration:** Next.js `@clerk/nextjs` App Router integration provides pre-built, WCAG-compliant sign-in and sign-up modals.
2. **Stateless JWT Verification:** Backend FastAPI API verifies Clerk RS256 JWT tokens using an in-memory cached JWKS public key client (`PyJWKClient`) with 1-hour caching and 5-second clock skew leeway.
3. **Event-Driven Database Synchronization:** Lifecycle events (`user.created`, `user.updated`, `user.deleted`) are delivered to `/api/v1/webhooks/clerk` with cryptographic Svix HMAC signature verification and atomic database deduplication.

## Consequences
- Zero password storage liability under Indian DPDP and global privacy frameworks.
- Webhook endpoint requires publicly accessible URL and signature verification.

