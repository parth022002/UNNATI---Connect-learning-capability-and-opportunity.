# UNNATI (उन्नति) — Required Inputs, Credentials, and Configuration Register

**Document Version:** 1.1.0  
**Status:** Baseline Provisioning Complete / Operational in Production (Vercel + Render + Neon + Clerk)  
**Author:** Principal Software Architect & Technical Lead  
**Classification:** Confidential — System Configuration & Security Architecture Guide  
**Applicable Services:** `apps/web` (Next.js 15), `apps/api` (FastAPI), Infrastructure (`infra/`)

---

## 1. Executive Status Dashboard

| Category | Component / Provider | Status | Live Details |
|:---|:---|:---:|:---|
| **Git & Codebase** | GitHub Repository | ✅ **COMPLETED** | `https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity..git` (`main`) |
| **Frontend Hosting** | Vercel (Next.js 15) | ✅ **COMPLETED** | Edge CDN, dynamic Clerk modal auth, responsive learner dashboard & roadmap |
| **Backend Hosting** | Render (FastAPI / Uvicorn) | ✅ **COMPLETED** | `https://unnati-connect-learning-capability-and.onrender.com` (Python 3.11.9, Unbuffered) |
| **Database** | Neon Serverless PostgreSQL | ✅ **COMPLETED** | AWS `ap-southeast-1`, 12 tables, `pgvector 0.8.6`, `pgcrypto`, 54 canonical skills seeded |
| **Authentication** | Clerk Auth & OIDC | ✅ **COMPLETED** | RS256 JWKS in-memory caching, JWT verification, `unnati-api` template |
| **Webhooks** | Clerk &rarr; Svix &rarr; Render | ✅ **COMPLETED** | `POST /api/v1/webhooks/clerk`, HMAC verification, Neon idempotency (`clerk_webhook_events`) |
| **Primary AI Engine** | Google Gemini (2.5 Flash) | ✅ **COMPLETED** | PDF resume parsing, schema extraction, Algorithm C topological roadmaps |
| **Fast Inference AI** | Groq (`llama-3.3-70b`) | ✅ **COMPLETED** | Sub-400ms conversational inference fallback |
| **Gateway Fallback AI** | OpenRouter | ✅ **COMPLETED** | Secondary upstream redundancy |
| **Distributed Caching** | Upstash Redis | ✅ **COMPLETED** | `capable-tetra-139975.upstash.io:6379`, TLS `rediss://`, rate limiting & caching verified |
| **Private Object Storage** | Cloudflare R2 / S3 | ✅ **COMPLETED** | `unnati-private-documents`, S3 API endpoint active, presigned URLs & storage verified |
| **Transactional Email** | Resend API | ✅ **COMPLETED** | `re_2V1Q...`, welcome emails, health probe at `/health/email` |
| **Custom Domain & DNS** | Cloudflare (`unnati.in`) | ⏳ **PENDING** | Apex `unnati.in` & `api.unnati.in` custom domain cutover |
| **Legal & DPDP Compliance** | Consent Modal & Policy | ⏳ **PENDING** | Bilingual consent wording & Grievance Redressal Officer (GRO) appointment |

---

## 2. Completed & Provisioned Infrastructure Registry

*(The following foundational services are fully provisioned, verified, and running in production. No further setup is required for these items.)*

### 2.1 Git & Codebase Setup
* **Repository:** `https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity..git`
* **Default Branch:** `main` (clean commit history, zero secret leaks).
* **Workspaces:** Monorepo managed via `pnpm-workspace.yaml` (`apps/web`, `apps/api`, `packages/shared`, `services/worker`).

### 2.2 Database (Neon Serverless PostgreSQL + pgvector)
* **Status:** Connected & verified live (`GET /health/db` &rarr; `200 OK`).
* **Region:** AWS `ap-southeast-1` (Singapore).
* **PostgreSQL Engine:** PostgreSQL 18.6 with `vector` and `pgcrypto` extensions active.
* **Schema Migrations:** 3 Alembic migrations applied (`ccdec84618ef`, `a1cf919bc246`, `b2df921c345a`).
* **Active Tables (12):** `users`, `user_profiles`, `education_records`, `experience_records`, `canonical_skills`, `skill_aliases`, `candidate_skills`, `candidate_documents`, `career_roadmaps`, `roadmap_milestones`, `clerk_webhook_events`, `alembic_version`.
* **Seeded Data:** 54 canonical industry skills, 107 alias mappings.
* **Connection Strings:** Configured in `.env` and Render with automatic `postgresql+psycopg://` URI normalization.

### 2.3 Authentication & Webhook Infrastructure (Clerk)
* **Application ID:** `app_3LsMbMp8UM6YHHAqFOIxG3teYpf`
* **Instance ID:** `ins_3LsMbSSnXliawSx3OuAGHptbxKi`
* **Frontend API:** `https://allowing-raptor-9178.clerk.accounts.dev`
* **JWKS Endpoint:** `https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json`
* **Token Verification:** RS256 signature verification with 3600s cache, 5s clock skew leeway, dynamic audience check (`unnati-api`).
* **Live Webhook Endpoint:** `https://unnati-connect-learning-capability-and.onrender.com/api/v1/webhooks/clerk`
* **Webhook Security & Idempotency:**
  * Cryptographic HMAC verification powered by `svix`.
  * Atomic transaction deduplication via `clerk_webhook_events` table in Neon.
  * Upsert handling for `user.created` and `user.updated` (out-of-order tolerance).
  * Soft-delete handling for `user.deleted` (`is_active = False`).
  * Audit recording for `session.ended`.
  * Verified live with Clerk test events (`200 OK`).

### 2.4 Multi-Provider AI Acceleration Stack
* **Primary Engine (Google Gemini):** API key provisioned, active in `apps/api` for structured PDF extraction and topological career roadmaps.
* **Fast Inference (Groq):** API key provisioned, active for low-latency conversational queries.
* **Fallback Gateway (OpenRouter):** API key provisioned for upstream failover.

### 2.5 Distributed Caching & Rate Limiting (Upstash Redis)
* **Cluster Host:** `capable-tetra-139975.upstash.io:6379`
* **Protocol & Security:** `rediss://` (TLS 1.3 encrypted cluster)
* **Status:** Verified live (`GET /health/redis` &rarr; `ping: True`, latency: ~290ms)
* **Features Configured:**
  * Sliding-window rate limiting (60 requests/min per IP, 120 requests/min per user)
  * Default key TTL: 3,600s (1 hour)
  * Taxonomy cache TTL: 86,400s (24 hours)
  * Resilient connection pooling with graceful in-memory fallback.

### 2.6 Private Object Storage (Cloudflare R2)
* **Bucket Name:** `unnati-private-documents`
* **Endpoint URL:** `https://fff51884b9fbf78df9303e2c5952d621.r2.cloudflarestorage.com`
* **Region:** `auto`
* **Status:** Verified live (`GET /health/storage` &rarr; `status: connected`, `object_count: 0`, latency: ~711ms)
* **Features Configured:**
  * Zero public access (`s3_public_access = False`)
  * Presigned upload & download URLs with 900s (15 min) TTL
  * Candidate resumes and transcripts stored under `uploads/{user_id}/{doc_id}_{filename}`
  * Resilient local filesystem fallback if S3 is ever unreachable.

### 2.7 Transactional Email Delivery (Resend)
* **Status:** Verified (`GET /health/email` &rarr; `status: connected`, provider: Resend)
* **Sender Address (`EMAIL_FROM`):** `UNNATI <onboarding@resend.dev>`
* **Features Configured:**
  * Automated welcome email dispatched upon Clerk `user.created` webhook event.
  * Milestone & roadmap ready notification templates (`send_roadmap_ready_email`).
  * Non-blocking defensive sending with fallback mock logger.

---

## 3. Pending Requirements & Action Items (What Needs Your Input)

The following items are the remaining inputs required before general public rollout:

### 3.1 Custom Domain & DNS Cutover (`unnati.in`)
* **Why it's needed:** Replaces Vercel default domain and Render `onrender.com` domain with your official branded apex domain.
* **Target DNS Mapping (via Cloudflare DNS):**
  * Apex `unnati.in` &rarr; CNAME to Vercel (`cname.vercel-dns.com`)
  * Subdomain `api.unnati.in` &rarr; CNAME to Render (`unnati-connect-learning-capability-and.onrender.com`)
* **When ready:** Switch Clerk from Development instance to Production instance and update the webhook URL to `https://api.unnati.in/api/v1/webhooks/clerk`.

### 3.5 Legal, Privacy & DPDP Compliance Sign-Off
* **Why it's needed:** Compliance with the Digital Personal Data Protection Act (DPDP Act, India 2025/2026) and EU AI Act (Non-Annex III formative self-development guidance).
* **Decisions Required:**
  1. Confirm Bilingual (English/Hindi) Notice-and-Consent wording for registration.
  2. Nominate Grievance Redressal Officer (GRO) contact email (e.g., `grievance@unnati.in`).
  3. Confirm 2-year rolling candidate profile retention with 72-hour crypto-shredding on account deletion.

---

## 4. Final Decision & Provisioning Tracker

| ID | Required Input / Service | Required For | Priority | Responsible Owner | Status | Target Phase |
|:---|:---|:---|:---:|:---|:---:|:---:|
| **DEC-01** | Approve MVP Learner Scope (Phase 0–4) | Product Architecture | **P0** | Project Owner | `[x] Approved (Learner MVP)` | Phase 0 |
| **DEC-02** | Google Gemini 2.5 Flash API Key | Ingestion & Roadmap Engine | **P0** | Project Owner | `[x] Provisioned & Verified` | Phase 0 |
| **DEC-03** | Neon Serverless PostgreSQL + pgvector | Relational & Vector Storage | **P0** | DevOps Engineer | `[x] Provisioned & 12 Tables Live` | Phase 0 |
| **DEC-04** | Clerk Auth & Webhooks (Svix) | User Identity & Sync | **P0** | Tech Lead | `[x] Provisioned & Verified (200 OK)` | Phase 0 |
| **DEC-05** | Groq API Key (Low-Latency LLM) | Fast Agent Inference | **P1** | Project Owner | `[x] Provisioned & Verified` | Phase 0 |
| **DEC-06** | OpenRouter API Key (Gateway Failover) | Upstream LLM Fallback | **P2** | Project Owner | `[x] Provisioned & Verified` | Phase 0 |
| **DEC-07** | Upstash Redis TLS Cluster | Distributed Rate Limiting & Cache | **P0** | DevOps / Owner | `[x] Provisioned & Verified (Upstash TLS)` | Phase 0 |
| **DEC-08** | Cloudflare R2 Private Bucket | Candidate Document Storage | **P0** | DevOps / Owner | `[x] Provisioned & Verified (Cloudflare R2)` | Phase 0 |
| **DEC-09** | Resend Transactional Email Key | Automated Email Delivery | **P1** | Project Owner | `[x] Provisioned & Verified (Resend API)` | Phase 1 |
| **DEC-10** | Custom Apex Domain Setup (`unnati.in`) | Production Domain Cutover | **P1** | Project Owner | `[ ] Pending DNS Registration` | Phase 1 |
| **DEC-11** | DPDP Privacy Policy & GRO Nomination | India Regulatory Compliance | **P0** | Legal / Owner | `[ ] Pending Sign-Off` | Phase 1 |

---

## 5. Active Environment Variable Reference

The following table summarizes all environment variables currently in effect across local, Vercel, and Render deployments:

| Variable Name | Service | Active in Production? | Current Value / Source | Secret? |
|:---|:---|:---:|:---|:---:|
| `NEXT_PUBLIC_APP_NAME` | Web | Yes | `"UNNATI"` | No |
| `NEXT_PUBLIC_API_URL` | Web | Yes | `https://unnati-connect-learning-capability-and.onrender.com` | No |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Web | Yes | `pk_test_YWxsb3dpbmct...` | No |
| `CLERK_SECRET_KEY` | Web & API | Yes | Configured in Vercel & Render | **YES** |
| `DATABASE_URL` | API | Yes | Pooled Neon PostgreSQL connection string | **YES** |
| `DATABASE_DIRECT_URL` | API | Yes | Direct Neon PostgreSQL connection string | **YES** |
| `CLERK_ISSUER` | API | Yes | `https://allowing-raptor-9178.clerk.accounts.dev` | No |
| `CLERK_JWKS_URL` | API | Yes | `https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json` | No |
| `CLERK_AUDIENCE` | API | Yes | `unnati-api` | No |
| `CLERK_WEBHOOK_SECRET` | API | Yes | `whsec_...` (Svix signature verification) | **YES** |
| `GEMINI_API_KEY` | API | Yes | Configured in Render | **YES** |
| `GROQ_API_KEY` | API | Yes | Configured in Render | **YES** |
| `OPENROUTER_API_KEY` | API | Yes | Configured in local `.env` | **YES** |
| `PYTHONUNBUFFERED` | API | Yes | `"1"` (Render container runtime) | No |
| `CORS_ORIGINS` | API | Yes | `http://localhost:3000` (+ `https://*.vercel.app` auto-regex) | No |
| `REDIS_URL` | API | Yes | Configured in Render & `.env` (`rediss://...upstash.io:6379`) | **YES** |
| `REDIS_ENABLED` | API | Yes | `"true"` | No |
| `RATE_LIMIT_ENABLED` | API | Yes | `"true"` | No |
| `STORAGE_BACKEND` | API | Yes | `"s3"` (Cloudflare R2 private bucket) | No |
| `S3_ENDPOINT_URL` | API | Yes | `https://fff51884b9fbf78df9303e2c5952d621.r2.cloudflarestorage.com` | No |
| `S3_BUCKET` | API | Yes | `unnati-private-documents` | No |
| `S3_ACCESS_KEY_ID` | API | Yes | Configured in Render & `.env` | **YES** |
| `S3_SECRET_ACCESS_KEY` | API | Yes | Configured in Render & `.env` | **YES** |
| `RESEND_API_KEY` | API | Yes | Configured in Render & `.env` (`re_2V1Q...`) | **YES** |
| `EMAIL_FROM` | API | Yes | `UNNATI <onboarding@resend.dev>` | No |
