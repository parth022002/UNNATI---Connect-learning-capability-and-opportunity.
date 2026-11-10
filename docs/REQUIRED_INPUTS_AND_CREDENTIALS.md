# UNNATI (उन्नति) — Required Inputs, Credentials, and Configuration Register

**Document Version:** 1.0.0  
**Status:** Active Draft / Pending Owner Provisioning  
**Author:** Principal Software Architect & Technical Lead  
**Classification:** Confidential — System Configuration & Security Architecture Guide  
**Applicable Services:** `apps/web` (Next.js), `apps/api` (FastAPI), Infrastructure (`infra/`)

---

## 1. Project Owner Inputs & Approvals

The following foundational business and product decisions require explicit sign-off from the Project Owner before production readiness:

| Decision ID | Decision Area | Scope & Options | Recommendation | Impact if Delayed | Owner Sign-Off |
|:---|:---|:---|:---|:---|:---|
| **POI-01** | **MVP Feature Scope** | Option A: Learner-only (Discovery → Assessment → Roadmap → Projects).<br>Option B: Learner + Institution portal.<br>Option C: Learner + Employer talent marketplace. | **Option A (Learner-Only)** for initial launch. Institutional & Employer portals gated for Phase 5. | Critical. Determines API endpoints, RLS complexity, and compliance risk. | `[ ] Pending` |
| **POI-02** | **First Wedge Role / Domain** | Pilot target profession: (e.g., Software Engineering, Data Science, Product Management, or Business Development). | **Full-Stack Web Development & Data Science** (richest open taxonomies and benchmark datasets). | High. Affects benchmark questions, course catalog scraping, and rubric tuning. | `[ ] Pending` |
| **POI-03** | **Target Launch Cohort** | Pilot group size and demographics: (e.g., 200 undergraduate engineering students vs. open public beta). | **Controlled cohort of 100–250 students (Pilot Tier P-0)** before general public registration. | High. Calibrates rate limits, database sizing, and shadow-mode AI verification. | `[ ] Pending` |
| **POI-04** | **Assessment Grading Policy** | Option A: Formative only (feedback + gap analysis without official qualification claims).<br>Option B: Evaluative/Summative with verified badges. | **Option A (Formative Guidance)** to avoid EU AI Act Annex III high-risk employment classification. | Critical. Determines legal/regulatory posture under EU AI Act and DPDP 2025. | `[ ] Pending` |
| **POI-05** | **Data Retention & Erasure Schedule** | Candidate profile retention: 1 year / 2 years / 3 years post-inactivity. Erasure turnaround SLA: 72 hours vs 7 days. | **2-year rolling retention with automated 72-hour crypto-shredding / erasure workflow upon request.** | Critical. DPDP Act (India) compliance requirement. | `[ ] Pending` |

---

## 2. Development Environment & Infrastructure Setup

### 2.1 Repository & Branch Protection
* **GitHub Repository:** Managed Git repository under team organization.
* **Branch Strategy:**
  * `main`: Production deployment branch (locked; requires signed commits, linear history, 2 approving reviews, passing CI suite).
  * `staging`: Pre-production release branch (mirrors production data schema, deployed to staging environment).
  * `feature/*` or `fix/*`: Ephemeral developer branches merged via Pull Requests.

### 2.2 Local Developer Prerequisites
Every engineer contributing to UNNATI requires the following local tooling installed:
* **Node.js:** `v20.x LTS` or `v22.x LTS`
* **Package Manager:** `pnpm` (`v9.15.0` or higher; configured via `pnpm-workspace.yaml`)
* **Python Runtime:** `Python 3.12.x` (managed via `pyenv` or `uv`)
* **Container Engine:** `Docker Desktop` or `Rancher Desktop` (for local PostgreSQL, Redis, and MinIO)
* **API Testing Tooling:** `curl`, `httpie`, or `Bruno` / Postman

---

## 3. Database Credentials (Neon PostgreSQL + pgvector)

UNNATI leverages **Neon Serverless PostgreSQL** with the `pgvector` extension for relational data, JSON document storage, audit chains, and vector embeddings.

### 3.1 Connection String Architecture
PostgreSQL requires two distinct connection strings:
1. **Pooled Connection String (`DATABASE_URL`):**
   * Uses PgBouncer serverless connection pooling on port `6543`.
   * Configured with `pool_mode=transaction`.
   * Used by the FastAPI runtime (`apps/api`) for high-concurrency, short-lived web requests.
2. **Direct Connection String (`DATABASE_DIRECT_URL`):**
   * Connects directly to the primary compute instance on port `5432`.
   * **Mandatory** for Alembic database migrations, DDL schema alterations, table locks, and long-running maintenance jobs.

### 3.2 Neon Configuration Specifications
* **PostgreSQL Version:** `16.x`
* **Extensions Required:** `uuid-ossp`, `pgcrypto`, `vector` (pgvector 0.7+)
* **Branching Model:**
  * `main` (Production): Protected, automated point-in-time recovery (PITR) enabled (30-day retention).
  * `staging` (Staging): Child branch of `main` updated prior to sprint releases.
  * `dev-*` (Developer): Ephemeral copy-on-write branches created on demand for testing risky schema migrations.
* **Connection String Format:**
  ```bash
  # Pooled (FastAPI Runtime)
  DATABASE_URL="postgresql+psycopg://<USER>:<PASSWORD>@<ENDPOINT_ID>-pooler.<REGION>.aws.neon.tech/<DB_NAME>?sslmode=require"

  # Direct (Alembic Migrations)
  DATABASE_DIRECT_URL="postgresql+psycopg://<USER>:<PASSWORD>@<ENDPOINT_ID>.<REGION>.aws.neon.tech/<DB_NAME>?sslmode=require"
  ```

---

## 4. LLM & AI Provider Credentials

The platform architecture features an **AI Provider Abstraction Layer** allowing seamless runtime switching between frontier model providers.

### 4.1 Supported Provider Matrix

| Provider | Recommended Model | Primary Purpose in UNNATI | Required Tier | Recommended Monthly Cap |
|:---|:---|:---|:---|:---|
| **Google Gemini (Primary)** | `gemini-2.0-flash`<br>`gemini-2.0-pro-exp` | RAG, resume parsing, syllabus extraction, gap analysis, career companion. | Pay-as-you-go (Tier 1) | \$50 – \$150 / month |
| **Groq (Fast Inference)** | `llama-3.3-70b-versatile` | Real-time conversational chatbot (`/career-companion/stream`), sub-500ms latency. | Developer Tier | \$25 – \$50 / month |
| **OpenAI (Secondary/Eval)** | `gpt-4o-mini`<br>`gpt-4o` | Evaluation benchmarking, fallback for structured JSON extraction. | Tier 2+ Organization | \$50 – \$100 / month |
| **OpenRouter (Gateway)** | Various | Fallback routing during upstream provider degradation. | Standard prepaid | \$20 / month credit |

### 4.2 Health & Verification Commands (Safe Testing)

#### Google Gemini API Verification:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}"
```
*Expected Status:* `HTTP 200 OK` returning available model list including `gemini-2.0-flash`.

#### Groq API Verification:
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "ping"}]}'
```
*Expected Status:* `HTTP 200 OK` with JSON response in < 400ms.

#### OpenAI API Verification:
```bash
curl "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"
```
*Expected Status:* `HTTP 200 OK`.

---

## 5. Authentication & Identity Provider (Clerk / OIDC)

UNNATI delegates user registration, session management, multi-factor authentication, and social identity to **Clerk**.

### 5.1 Provisioned Instance & Key Endpoints
* **Application Name:** `UNNATI - Your Growth Companion`
* **Application ID:** `app_3LsMbMp8UM6YHHAqFOIxG3teYpf`
* **Development Instance ID:** `ins_3LsMbSSnXliawSx3OuAGHptbxKi`
* **Frontend API URL:** `https://allowing-raptor-9178.clerk.accounts.dev`
* **Backend API URL:** `https://api.clerk.com`
* **JWKS Endpoint URL:** `https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json`
* **Local RSA Public Key:** Configured in `apps/api/keys/clerk_public_key.pem` for zero-latency offline token verification without runtime network egress.

### 5.2 Required Configuration Settings in Clerk Dashboard
1. **User Sign-Up Attributes:**
   * Email address (Mandatory, verified via 6-digit OTP code).
   * First Name & Last Name (Mandatory).
   * Password (Minimum 12 characters, requiring upper, lower, digit, symbol).
2. **Social OAuth Providers to Enable:**
   * **Google OAuth 2.0:** Enabled (Standard candidate login).
   * **LinkedIn OAuth 2.0:** Enabled (Professional experience import).
   * **GitHub OAuth 2.0:** Enabled (Technical student/developer portfolio sync).
3. **Session & Security Settings:**
   * Session Token Lifetime: `60 minutes`.
   * Refresh Token Lifetime: `30 days` with sliding expiration.
   * Bot detection & Turnstile challenge: Enabled on registration endpoints.
4. **JWT Templates & Backend Integration:**
   * Create a JWT Template named `unnati-api`.
   * Include custom claims: `user_id`, `email`, `role`, `org_id`.
   * **JWKS Endpoint:** `https://<YOUR_CLERK_FRONTEND_API>/.well-known/jwks.json`
   * FastAPI verifies JWTs locally using RS256 caching without making outbound network calls per request.
5. **Webhooks:**
   * Endpoint: `https://api.unnati.in/api/v1/webhooks/clerk`
   * Subscribed Events: `user.created`, `user.updated`, `user.deleted`, `session.ended`.
   * Webhook Signing Secret: `whsec_...` configured in backend environment.

---

## 6. Shared Caching & Rate Limiting (Redis / Upstash)

Shared state, distributed rate limiting, and temporary cache entries are handled by **Redis** (Upstash Serverless Redis for managed cloud, or local Redis container).

### 6.1 Redis Specifications
* **Engine:** Redis `7.2+`
* **TLS:** Mandatory in staging and production (`rediss://...`).
* **Memory Sizing:** Minimum 256MB for development; 1GB+ for production.
* **Eviction Policy:** `volatile-lru` (ensures rate-limiting keys with TTLs are dropped under pressure, preventing cluster OOM).
* **Key Namespaces:**
  * `unnati:ratelimit:{ip_or_user}:{window}`
  * `unnati:session:token_hash:{jti}`
  * `unnati:cache:skill_taxonomy:{hash}`
  * `unnati:cache:job_benchmark:{hash}`

---

## 7. Private Object Storage (Cloudflare R2 / AWS S3)

User documents (resumes, academic transcripts, certificates, portfolio artifacts) contain sensitive personally identifiable information (PII) and must **never** be stored in public buckets.

### 7.1 Cloudflare R2 / S3 Architecture
* **Access Model:** Zero public read access (`BlockPublicAcls=true`, `BlockPublicPolicy=true`).
* **Upload Flow:**
  1. Frontend requests presigned upload URL from `POST /api/v1/documents/presign-upload`.
  2. Backend validates candidate tenant, filename extension, content type, and file size (< 10MB).
  3. Backend generates short-lived presigned PUT URL (expiry = 15 minutes).
  4. Client uploads file directly to object storage via HTTPS PUT.
  5. Backend webhook or ingestion worker verifies checksum and triggers OCR parsing.
* **Download Flow:** Short-lived presigned GET URLs with `expiry = 10 minutes`.
* **CORS Configuration for Bucket:**
  ```json
  [
    {
      "AllowedOrigins": ["https://unnati.in", "https://*.unnati.in", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```
* **Retention Policy:**
  * Ephemeral OCR scratch directory: Expire after 7 days.
  * Primary candidate documents: Retained until user initiates account deletion.

---

## 8. Email & Transactional Notifications (Resend)

Transactional communications (welcome emails, verification codes, assessment score summaries, security alerts) are sent via **Resend**.

### 8.1 Required DNS Records for Sending Domain (`mail.unnati.in`)

| Record Type | Host / Name | Value / Target | Purpose |
|:---|:---|:---|:---|
| **TXT** | `mail.unnati.in` | `v=spf1 include:amazonses.com ~all` | SPF Authentication |
| **CNAME** | `resend._domainkey.mail.unnati.in` | `dkim.resend.com` | DKIM Cryptographic Signature |
| **TXT** | `_dmarc.mail.unnati.in` | `v=DMARC1; p=reject; rua=mailto:dmarc@unnati.in` | DMARC Enforcement |
| **MX** | `mail.unnati.in` | `feedback-smtp.ap-south-1.amazonses.com` (Priority 10) | Bounce & Complaint Handling |

---

## 9. Domain, DNS & Hosting Infrastructure

### 9.1 DNS Architecture (Cloudflare Recommended)
* **Root Domain:** `unnati.in`
* **Production Web App:** `unnati.in` (Apex) and `www.unnati.in` → CNAME to Vercel (`cname.vercel-dns.com`).
* **Production API Service:** `api.unnati.in` → CNAME to backend container service (Render, Railway, Fly.io, or AWS ALB).
* **Staging Web App:** `staging.unnati.in`
* **Staging API Service:** `api-staging.unnati.in`

### 9.2 Frontend Hosting (Vercel)
* **Framework Preset:** Next.js
* **Build Command:** `pnpm --filter @unnati/web build`
* **Root Directory:** `apps/web`
* **Environment Variables:** Configure all `NEXT_PUBLIC_*` and server-side Clerk secrets.
* **Security Headers Configured in `next.config.mjs`:**
  * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 9.3 Backend Hosting (FastAPI Container)
* **Runtime:** Docker container running `uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --workers 4`.
* **Health Check Endpoint:** `GET /health` (must return `{"status": "healthy"}` with HTTP 200).
* **Resources:** Minimum 1 vCPU, 2GB RAM per replica; auto-scale between 2 and 6 replicas on CPU > 70%.

---

## 10. Monitoring, Logging & Observability

| Observability Pillar | Service Provider | Purpose & Configuration |
|:---|:---|:---|
| **Error Tracking** | **Sentry** | Full-stack exception tracking. Separate Sentry projects for `unnati-web` (React/Next) and `unnati-api` (FastAPI). PII scrubbing enabled. |
| **Metrics & Health** | **Prometheus + Grafana** | Export `/metrics` on internal port. Track request rate, P95/P99 latency, DB connection pool saturation, and token consumption. |
| **Structured Logging** | **Loki / Axiom / CloudWatch** | JSON-formatted logs with request correlation ID (`X-Request-ID`), tenant ID, status code, and latency. Passwords, secrets, and auth headers redacted. |
| **Uptime & Heartbeat** | **Better Uptime / Pingdom** | 60-second ping on `https://unnati.in` and `https://api.unnati.in/health`. Alert on Slack/SMS. |

---

## 11. External Data Sources & Taxonomies

To power UNNATI's Skill Intelligence and Career Discovery algorithms, the following open datasets and APIs are integrated:

| Dataset / Source | Format & Integration | Licensing & Terms | Storage Location |
|:---|:---|:---|:---|
| **O*NET 28.0+** | Tabular TSV / SQLite relational tables. Mappings of 900+ occupations to knowledge, skills, abilities (KSAs). | Creative Commons Attribution 4.0 International. Free for commercial use. | Seeded into PostgreSQL tables: `onet_occupations`, `onet_skills`. |
| **ESCO v1.1.2** | European Skills, Competences, Qualifications and Occupations (JSON-LD / CSV). | Open data license. Free attribution. | Cross-referenced for international and technical role synonyms. |
| **India National Classification of Occupations (NCO 2015)** | Ministry of Labour & Employment mapping. | Government of India open data policy. | Regional mapping layer for Indian educational curricula. |
| **Adzuna / Job Feed APIs** | REST API for real-time market demand and compensation benchmarks. | Developer API key required with search query attribution. | Cached in Redis with 24-hour TTL. |

---

## 12. Security, Legal & DPDP Compliance Inputs

The following compliance assets and appointments must be finalized prior to processing real student or user data:

1. **Digital Personal Data Protection Act (DPDP Act, India 2025/2026):**
   * **Consent Notice:** Multilingual consent banner (English + Hindi) detailing purpose of data collection, processing lifecycle, and withdrawal rights.
   * **Grievance Redressal Officer (GRO):** Published contact email (e.g., `grievance@unnati.in`) with 48-hour response acknowledgment SLA.
   * **Minor Data Protection:** Under-18 verification mechanism requiring verifiable parental consent if school students are enrolled.
2. **EU AI Act & Algorithmic Transparency:**
   * UNNATI student self-development features are classified as **non-Annex III** (informational guidance).
   * Any future employer screening/ranking features must undergo conformity assessment and bias audits.
   * Complete algorithmic transparency documentation for Algorithms A–J.
3. **Legal Agreements:**
   * Finalized Terms of Service (`/terms`).
   * Finalized Privacy Policy (`/privacy`).
   * Cookie & Tracking Policy.

---

## 13. Brand Identity & Visual Design Tokens

Confirmed from the official brand identity assets and design guidelines:

* **Primary Product Name:** `UNNATI` (उन्नति)
* **Tagline:** `Your Growth Companion.`
* **Campaign Motto:** `Learn. Build. Grow. Succeed.`
* **Logo Symbolism:** Purple/indigo base (`#4C1D95` / `#6D28D9`), vibrant saffron orange growth arrow (`#F97316` / `#EA580C`), graduation cap (scholarship), rising sun (aspiration), interconnected nodes (knowledge graph), and briefcase (career destination).
* **Official Hex Color Palette:**
  * **Primary Purple:** `#4C1D95` (Deep Violet) | `#6D28D9` (Brand Violet) | `#8B5CF6` (Light Violet)
  * **Accent Orange:** `#EA580C` (Saffron Core) | `#F97316` (Vibrant Orange) | `#FDBA74` (Soft Amber)
  * **Success Green:** `#059669` (Emerald 600) | `#10B981` (Emerald 500)
  * **Neutral Dark:** `#0F172A` (Slate 900) | `#1E293B` (Slate 800)
  * **Neutral Light:** `#F8FAFC` (Slate 50) | `#FFFFFF` (Pure White)
* **Typography:**
  * Headings: `Poppins`, sans-serif (Weights: 600, 700, 800).
  * Body: `Inter`, sans-serif (Weights: 400, 500).
  * Devanagari Scripts: `Noto Sans Devanagari` (उन्नति typography).

---

## 14. Final Decision Register

| ID | Required Input / Decision | Required For | Priority | Responsible Owner | Status | Target Date |
|:---|:---|:---|:---|:---|:---|:---|
| **DEC-01** | Approve MVP Learner Scope (Phase 0–4 vs Phase 5) | System Architecture & Sprints | **P0** | Project Owner | `[ ] Pending` | Sprint 0 |
| **DEC-02** | Select & Provision Primary AI Provider Key (Gemini) | RAG & Companion Engine | **P0** | Project Owner / DevOps | `[x] Provisioned & Verified` | Sprint 0 |
| **DEC-03** | Provision Neon PostgreSQL Managed Instance | Database Migrations & Schemas | **P0** | DevOps Engineer | `[x] Provisioned & Verified (v18.6 + pgvector)` | Sprint 0 |
| **DEC-04** | Create Clerk Project & Configure Social OAuth | User Authentication & Onboarding | **P0** | Tech Lead | `[x] Provisioned & Linked (app_3LsMbMp8UM6YHHAqFOIxG3teYpf)` | Sprint 0 |
| **DEC-05** | Provision Cloudflare R2 / S3 Storage Bucket | Document & Resume Ingestion | **P1** | DevOps Engineer | `[ ] Pending` | Sprint 1 |
| **DEC-06** | Setup Domain DNS & Verified Sending Domain (Resend) | Transactional Communications | **P1** | Project Owner / DevOps | `[ ] Pending` | Sprint 1 |
| **DEC-07** | Approve DPDP Privacy Policy & Consent Wording | Legal Compliance & Registration | **P0** | Legal Counsel / Owner | `[ ] Pending` | Sprint 1 |
| **DEC-08** | Nominate Grievance Redressal Officer (GRO) | India Regulatory Baseline | **P1** | Project Owner | `[ ] Pending` | Sprint 2 |
| **DEC-09** | Provision Groq API Key (Low-Latency Inference) | Fast Chat & Stream Responses | **P1** | Project Owner / DevOps | `[x] Provisioned & Verified` | Sprint 0 |
| **DEC-10** | Provision OpenRouter API Key (Gateway / Fallback) | Model Fallback Routing | **P2** | Project Owner / DevOps | `[x] Provisioned & Verified` | Sprint 0 |

---

## 15. Credential Setup Instructions for Project Owner

> [!CAUTION]
> **Zero Credential Exposure Rule:**  
> Never transmit raw secret keys, database passwords, or private signing keys through email, unencrypted chat, or public issue trackers. Store all provisioned secrets securely in a team password manager (e.g., 1Password, Bitwarden) or inject them directly into your deployment environment dashboard (Vercel / Cloud Provider).

### Step 1: Google Gemini API Key
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your dedicated organizational Google account.
3. Click **Get API key** → **Create API key in new project**.
4. Set up billing in Google Cloud Console and establish a monthly budget alert at **\$50.00 USD**.
5. Save the generated key as `GEMINI_API_KEY`.

### Step 2: Neon PostgreSQL
1. Sign in to [Neon Console](https://console.neon.tech/).
2. Create project named `unnati-production` in region `AWS ap-south-1` (Mumbai) or nearest target region.
3. Enable `pgvector` extension from the Neon SQL Editor: `CREATE EXTENSION IF NOT EXISTS vector;`.
4. Copy the **Pooled Connection String** (select "Pooled connection" checkbox) to `DATABASE_URL`.
5. Copy the **Direct Connection String** (uncheck "Pooled connection") to `DATABASE_DIRECT_URL`.

### Step 3: Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/).
2. Click **Create Application**, name it `UNNATI`.
3. Check **Email** and select **Google**, **LinkedIn**, and **GitHub** under Social connections.
4. Copy `Publishable Key` (`pk_test_...`) to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
5. Copy `Secret Key` (`sk_test_...`) to `CLERK_SECRET_KEY`.
6. Under **Configure** → **JWT Templates**, create `unnati-api` template.

### Step 4: Upstash Redis
1. Visit [Upstash Console](https://console.upstash.com/).
2. Click **Create Database**, name it `unnati-cache-prod`.
3. Select region matching your compute/database location (`ap-south-1`).
4. Enable **TLS**.
5. Copy the `UPSTASH_REDIS_REST_URL` or standard Redis connection URI `rediss://default:...@...upstash.io:6379` to `REDIS_URL`.

### Step 5: Cloudflare R2 Object Storage
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**.
2. Click **Create bucket**, name it `unnati-private-documents`.
3. Choose location hint: `APAC`.
4. Under **Manage R2 API Tokens**, click **Create API Token** with `Object Read & Write` permissions scoped to this bucket.
5. Record `Access Key ID`, `Secret Access Key`, and the Account S3 Endpoint URL.

---

## 16. Environment Variable Master Register

The following register details all environment variables across UNNATI services:

| Variable Name | Service | Required? | Valid Environments | Source / Provider | Secret? | Description & Validation Rule |
|:---|:---|:---|:---|:---|:---:|:---|
| `NEXT_PUBLIC_APP_NAME` | Web | Required | Dev, Staging, Prod | Config | No | Display name: `"UNNATI"`. |
| `NEXT_PUBLIC_APP_URL` | Web | Required | Dev, Staging, Prod | Vercel / DNS | No | Fully qualified web URL (e.g., `https://unnati.in`). |
| `NEXT_PUBLIC_API_URL` | Web | Required | Dev, Staging, Prod | DNS / ALB | No | Fully qualified API base URL (e.g., `https://api.unnati.in`). |
| `NEXT_PUBLIC_ENVIRONMENT` | Web | Required | Dev, Staging, Prod | Environment | No | `"development"`, `"staging"`, or `"production"`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Web | Required | Dev, Staging, Prod | Clerk Dashboard | No | Starts with `pk_test_` or `pk_live_`. |
| `CLERK_SECRET_KEY` | Web & API | Required | Dev, Staging, Prod | Clerk Dashboard | **YES** | Starts with `sk_test_` or `sk_live_`. |
| `CLERK_ISSUER` | API | Required | Dev, Staging, Prod | Clerk Dashboard | No | OIDC Issuer URL (e.g., `https://clerk.unnati.in`). |
| `CLERK_JWKS_URL` | API | Required | Dev, Staging, Prod | Clerk Dashboard | No | Public keys endpoint for RS256 token verification. |
| `APP_ENV` | API | Required | Dev, Staging, Prod | Environment | No | `"development"`, `"staging"`, or `"production"`. |
| `API_HOST` | API | Required | Dev, Staging, Prod | Server Config | No | Host bind address (typically `0.0.0.0`). |
| `API_PORT` | API | Required | Dev, Staging, Prod | Server Config | No | Port number (default `8000`). |
| `CORS_ORIGINS` | API | Required | Dev, Staging, Prod | Config | No | Comma-delimited list of allowed origin URLs. |
| `API_SECRET_KEY` | API | Required | Dev, Staging, Prod | Team Generated | **YES** | Minimum 32-character high-entropy secret. |
| `DATABASE_URL` | API | Required | Dev, Staging, Prod | Neon Console | **YES** | Pooled PostgreSQL connection string (`+psycopg`). |
| `DATABASE_DIRECT_URL` | API | Required | Dev, Staging, Prod | Neon Console | **YES** | Direct connection string for DDL migrations. |
| `REDIS_URL` | API | Required | Dev, Staging, Prod | Upstash / Redis | **YES** | Redis URI (`redis://` or `rediss://`). |
| `AI_PROVIDER` | API | Required | Dev, Staging, Prod | Config | No | `"gemini"`, `"openai"`, `"groq"`, or `"mock"`. |
| `GEMINI_API_KEY` | API | Optional* | Dev, Staging, Prod | Google AI Studio | **YES** | High-entropy Google AI Studio key. (*Required if provider is `gemini`). |
| `OPENAI_API_KEY` | API | Optional* | Dev, Staging, Prod | OpenAI Platform | **YES** | Starts with `sk-proj-`. (*Required if provider is `openai`). |
| `GROQ_API_KEY` | API | Optional* | Dev, Staging, Prod | Groq Console | **YES** | Starts with `gsk_`. (*Required for low-latency agent chat). |
| `STORAGE_BACKEND` | API | Required | Dev, Staging, Prod | Config | No | `"s3"` (for R2/AWS) or `"local"`. |
| `S3_ENDPOINT_URL` | API | Optional | Dev, Staging, Prod | Cloudflare R2 | No | Cloudflare endpoint (leave blank for native AWS S3). |
| `S3_REGION` | API | Required | Dev, Staging, Prod | Cloud Provider | No | Region identifier (e.g., `ap-south-1` or `auto`). |
| `S3_BUCKET` | API | Required | Dev, Staging, Prod | Cloud Provider | No | Target private bucket name. |
| `S3_ACCESS_KEY_ID` | API | Required | Dev, Staging, Prod | Cloud Provider | **YES** | Cloud storage access key identifier. |
| `S3_SECRET_ACCESS_KEY` | API | Required | Dev, Staging, Prod | Cloud Provider | **YES** | Cloud storage secret key. |
| `RESEND_API_KEY` | API | Optional | Staging, Prod | Resend Dashboard | **YES** | Starts with `re_`. |
| `EMAIL_FROM` | API | Required | Staging, Prod | Config | No | Standardized RFC sender: `"UNNATI <notifications@unnati.in>"`. |
| `DATA_ENCRYPTION_KEY` | API | Required | Staging, Prod | Team Generated | **YES** | 32-byte Base64-encoded symmetric encryption key. |
| `AUDIT_LOG_SIGNING_KEY` | API | Required | Staging, Prod | Team Generated | **YES** | Ed25519 hex private signing key for audit records. |
| `LOG_LEVEL` | API | Required | Dev, Staging, Prod | Config | No | `"DEBUG"`, `"INFO"`, `"WARNING"`, `"ERROR"`. |
| `SENTRY_DSN` | Web & API | Optional | Staging, Prod | Sentry Dashboard | No | Sentry Data Source Name URL. |

