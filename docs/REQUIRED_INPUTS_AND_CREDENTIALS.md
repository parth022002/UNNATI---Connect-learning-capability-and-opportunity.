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
| **Distributed Caching** | Upstash Redis | ⏳ **PENDING** | Rate limiting (60 req/min), taxonomy caching. *(Currently running with in-memory fallback)* |
| **Private Object Storage** | Cloudflare R2 / S3 | ⏳ **PENDING** | Private document bucket for candidate PDFs. *(Currently running with local storage fallback)* |
| **Transactional Email** | Resend API | ⏳ **PENDING** | Welcome emails, milestone celebration notifications (`mail.unnati.in`) |
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

---

## 3. Pending Requirements & Action Items (What Needs Your Input)

The following items are the remaining inputs required before general public rollout:

### 3.1 Shared Caching & Rate Limiting (Upstash Redis)
* **Why it's needed:** Prevents API abuse (enforces 60 req/min per IP, 120 req/min per user) and caches heavy LLM taxonomy results with 24-hour TTL.
* **Action Required:**
  1. Go to [Upstash Console](https://console.upstash.com/).
  2. Click **Create Database** &rarr; Name: `unnati-cache-prod`.
  3. Select region `ap-southeast-1` or `ap-south-1`.
  4. Enable **TLS**.
  5. Copy the standard Redis connection string (`rediss://default:...@...upstash.io:6379`).
  6. Add to Render & `.env`: `REDIS_URL=rediss://default:...`

### 3.2 Private Object Storage (Cloudflare R2 / AWS S3)
* **Why it's needed:** Production storage for candidate resumes, transcripts, and certificates with zero public read access and 15-minute presigned upload URLs.
* **Action Required:**
  1. In [Cloudflare Dashboard](https://dash.cloudflare.com/) &rarr; **R2 Object Storage**.
  2. Click **Create bucket** &rarr; Name: `unnati-private-documents` (Region: `APAC`).
  3. Under **Manage R2 API Tokens**, create a token with `Object Read & Write` permissions.
  4. Copy `Access Key ID`, `Secret Access Key`, and the Account S3 Endpoint URL.
  5. Add to Render & `.env`:
     ```bash
     STORAGE_BACKEND=s3
     S3_ENDPOINT_URL=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
     S3_REGION=auto
     S3_BUCKET=unnati-private-documents
     S3_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
     S3_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
     ```

### 3.3 Transactional Email Sending (Resend)
* **Why it's needed:** Automated welcome emails, assessment score summaries, and milestone achievements.
* **Action Required:**
  1. Go to [Resend Dashboard](https://resend.com/).
  2. Add sending domain (e.g. `mail.unnati.in` or `unnati.in`).
  3. Generate an API Key (`re_...`).
  4. Add to Render & `.env`:
     ```bash
     RESEND_API_KEY=re_...
     EMAIL_FROM="UNNATI <notifications@unnati.in>"
     ```

### 3.4 Production Domain & DNS Cutover (`unnati.in`)
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
| **DEC-07** | Upstash Redis TLS Cluster | Distributed Rate Limiting & Cache | **P0** | DevOps / Owner | `[ ] Pending Provisioning` | Phase 1 |
| **DEC-08** | Cloudflare R2 Private Bucket | Candidate Document Storage | **P0** | DevOps / Owner | `[ ] Pending Provisioning` | Phase 1 |
| **DEC-09** | Resend Transactional Email Key | Automated Email Delivery | **P1** | Project Owner | `[ ] Pending Provisioning` | Phase 1 |
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
| `REDIS_URL` | API | *Pending* | Default: in-memory / local fallback | **YES** |
| `S3_BUCKET` / `S3_KEY` | API | *Pending* | Default: local storage (`storage/uploads`) | **YES** |
| `RESEND_API_KEY` | API | *Pending* | Default: console logger | **YES** |
