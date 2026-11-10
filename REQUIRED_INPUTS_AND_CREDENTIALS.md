# UNNATI (उन्नति) — Required Inputs, Accounts & Configuration Specification

**Document Version:** 2.0.0  
**Project:** UNNATI — Your Growth Companion (*Learn. Build. Grow. Succeed.*)  
**Location:** `REQUIRED_INPUTS_AND_CREDENTIALS.md`  
**Security Notice:** Never paste private keys, API secrets, or database passwords into Git repositories or public channels. All values below are described with purpose, verification methods, and placeholders.

---

## 1. Overview & Service Architecture

UNNATI utilizes a **hybrid cloud, modular monolith architecture** designed for high throughput, sub-50ms cache hits, strict data privacy, and zero data leakage. 

```
                                  ┌───────────────────────────┐
                                  │   Clerk Identity Server   │
                                  └─────────────┬─────────────┘
                                                │ OIDC / JWKS
                                                ▼
┌──────────────────┐    HTTPS / CORS     ┌───────────────────────────┐
│ Next.js Frontend │ ──────────────────▶ │  FastAPI Backend Engine   │
│   (Vercel Web)   │                     │      (Render/Fly.io)      │
└──────────────────┘                     └──────┬──────┬──────┬──────┘
                                                │      │      │
            ┌───────────────────────────────────┘      │      └───────────────────────────────────┐
            ▼                                          ▼                                          ▼
┌───────────────────────┐                  ┌───────────────────────┐                  ┌───────────────────────┐
│   Neon PostgreSQL     │                  │     Upstash Redis     │                  │  Google Gemini / R2   │
│ (Relational+pgvector) │                  │ (Cache & Rate Limits) │                  │ (LLM & Document Blob) │
└───────────────────────┘                  └───────────────────────┘                  └───────────────────────┘
```

---

## 2. Comprehensive Credentials & Configuration Matrix

### 2.1 Authentication & Identity (Clerk)

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Obtaining Source | Component Used | Verification Method |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Publishable Key** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Required** | Both | [Clerk Dashboard](https://dashboard.clerk.com) &rarr; API Keys | `apps/web` (RootLayout, SignIn, SignUp) | Frontend compiles; `<ClerkProvider>` boots without throwing missing publishable key warning. |
| **Secret Key** | `CLERK_SECRET_KEY` | **Required** | Both | Clerk Dashboard &rarr; API Keys | `apps/web` (Middleware, Server Actions) | Next.js server validates authenticated sessions. |
| **JWKS Endpoint** | `CLERK_JWKS_URL` / `JWKS_URL` | **Required** | Both | `https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json` | `apps/api` (`app/core/auth.py`) | FastAPI validates RS256 JWT tokens without local secret exchange. |
| **Clerk Issuer** | `CLERK_ISSUER` | **Required** | Both | `https://<your-instance>.clerk.accounts.dev` | `apps/api` (Token validation) | Matching `iss` claim check passes in backend unit tests. |
| **Webhook Secret** | `CLERK_WEBHOOK_SECRET` | Optional (Prod) | Production | Clerk Dashboard &rarr; Webhooks (`user.created`, `user.deleted`) | `apps/api` (`/api/v1/webhooks/clerk`) | Svix signature verification returns 200 OK on test payload. |

*Security Rule:* The secret key (`sk_live_...` or `sk_test_...`) must never be prefixed with `NEXT_PUBLIC_` and must never appear in client bundles.

---

### 2.2 Relational Database & Vector Search (Neon PostgreSQL)

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Obtaining Source | Component Used | Verification Method |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Pooled Database URL** | `DATABASE_URL` | **Required** | Both | [Neon Console](https://console.neon.tech) &rarr; Connection Details (Pooled / PgBouncer) | `apps/api` (SQLAlchemy Session pool) | Backend starts; `SELECT 1;` succeeds; health check endpoint `/health` returns status healthy. |
| **Direct Migration URL** | `DATABASE_DIRECT_URL` | **Required** | Both | Neon Console &rarr; Connection Details (Direct, unpooled port 5432) | `apps/api` (Alembic DDL migrations) | `alembic upgrade head` creates tables without prepared statement pool errors. |
| **Connection Pool Size** | `DB_POOL_SIZE` | Optional | Both | Set integer (Default: `10`) | `apps/api` (Engine configuration) | Inspected via SQLAlchemy engine pool metrics. |

*Security Rule:* Database credentials use SSL (`sslmode=require`). Row-Level Security (RLS) is enabled for all candidate-owned tables. Direct DDL permissions are reserved strictly for migration scripts.

---

### 2.3 AI & Intelligence Services (Google Gemini)

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Obtaining Source | Component Used | Verification Method |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Gemini API Key** | `GEMINI_API_KEY` | **Required** | Both | [Google AI Studio](https://aistudio.google.com/) &rarr; Get API Key | `apps/api` (`app/services/gemini_service.py`) | Test query to `gemini-2.0-flash` returns structured JSON response. |
| **Fast Model Name** | `GEMINI_MODEL_FAST` | Optional | Both | Default: `gemini-2.0-flash` | Resume parsing, skill extraction, instant chatbot | Valid model ID returns response within < 1.2s. |
| **Reasoning Model** | `GEMINI_MODEL_REASONING` | Optional | Both | Default: `gemini-2.0-pro-exp` | Complex milestone generation, prerequisite ordering | Multi-step topological graph generation passes verification. |
| **Embedding Model** | `GEMINI_EMBEDDING_MODEL` | Optional | Both | Default: `text-embedding-004` | 768-dim skill vector similarity in pgvector | Generated vectors match database column dimensionality. |

*Fallback Note:* When `GEMINI_API_KEY` is not provided, the API automatically activates a local deterministic mock engine (`AI_PROVIDER="mock"`) so unit tests and UI development can proceed offline with 100% reliability.

---

### 2.4 Caching, Session State & Rate Limiting (Upstash Redis)

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Obtaining Source | Component Used | Verification Method |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Redis REST URL** | `REDIS_URL` | **Required (Prod)** | Production | [Upstash Console](https://console.upstash.com) &rarr; Create Database | `apps/api` (Rate limiter, taxonomy cache) | `redis.ping()` returns `PONG`. |
| **Rate Limit Enabled** | `RATE_LIMIT_ENABLED` | Optional | Both | Boolean: `true` / `false` | `apps/api` (FastAPI middleware) | 61st request from single IP in 1 minute receives 429 Too Many Requests. |

*Fallback Note:* If Redis is unavailable or unconfigured in local development, the system automatically falls back to an in-memory TTL dictionary cache (`app/core/memory_cache.py`), preventing any hard crash.

---

### 2.5 Private Object Storage (Cloudflare R2 / AWS S3)

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Obtaining Source | Component Used | Verification Method |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **S3 Endpoint URL** | `S3_ENDPOINT_URL` | **Required (Prod)** | Production | [Cloudflare Dashboard](https://dash.cloudflare.com) &rarr; R2 &rarr; Account Details | `apps/api` (`app/services/storage_service.py`) | Presigned URL generated successfully. |
| **Access Key ID** | `S3_ACCESS_KEY_ID` | **Required (Prod)** | Production | Cloudflare R2 API Tokens (Read/Write) | Blob upload of resume documents | Uploaded test file appears in private bucket. |
| **Secret Access Key** | `S3_SECRET_ACCESS_KEY` | **Required (Prod)** | Production | Cloudflare R2 API Tokens | Secure HMAC authorization | 403 Forbidden received if secret is wrong. |
| **Private Bucket Name** | `S3_BUCKET` | **Required** | Both | Default: `unnati-private-documents` | Isolation of private user PDFs | Bucket enforces private ACL; no public URL access permitted. |

*Security Rule:* Documents stored in R2 are encrypted at rest with AES-256. Files undergo automatic cryptographic shredding upon account erasure within 72 hours under DPDP Act requirements.

---

### 2.6 Cryptography & DPDP Compliance Secrets

| Parameter | Environment Variable | Required / Optional | Dev / Prod | Purpose | Security Considerations |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Field Encryption Key** | `DATA_ENCRYPTION_KEY` | **Required** | Both | 256-bit AES key (base64 encoded) used for encrypting PII fields (phone, address, national ID) in database. | Must be 32 bytes base64-encoded. If compromised or rotated without re-encryption, encrypted columns cannot be decrypted. |
| **Audit Log Signing Key** | `AUDIT_LOG_SIGNING_KEY` | **Required** | Both | Ed25519 private key (hex encoded) for computing immutable cryptographic audit chains. | Guarantees tamper-evidence of candidate assessment logs. |
| **Grievance Redressal Officer** | `GRIEVANCE_EMAIL` | **Required** | Both | Statutory GRO contact email published on website (`grievance@unnati.in`). | Monitored inbox responding to DPDP data subject rights requests within 48 hours. |

---

### 2.7 Application & Networking URLs

| Parameter | Environment Variable | Development Value | Production Value | Component Used |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Public URL** | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://unnati.in` | Clerk redirects, canonical SEO metadata |
| **Backend API URL** | `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://api.unnati.in` | Frontend API client queries |
| **CORS Origins** | `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | `https://unnati.in,https://www.unnati.in` | FastAPI CORS middleware |

---

## 3. Configuration Step-by-Step Setup Guide

### Local Development Quick-Start

1. **Clone and Setup Environment Files:**
   ```powershell
   cp .env.example .env
   cp .env.example apps/web/.env.local
   ```
2. **Configure Essential Development Variables:**
   - Add your Clerk publishable & secret keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
   - Add your Gemini API key (`GEMINI_API_KEY`) to enable real LLM resume parsing.
   - Set `DATABASE_URL` to your local PostgreSQL or free Neon serverless instance.
3. **Verify Local Integrity:**
   ```powershell
   # 1. Run backend automated tests
   $env:PYTHONPATH="apps/api"; apps/api/.venv/Scripts/python -m pytest apps/api/tests

   # 2. Verify frontend compilation and type-safety
   pnpm --filter @unnati/web build
   ```

---

## 4. Production Deployment Security Protocol

1. **Zero Hardcoded Secrets:** Verify using Git pre-commit hooks that no actual keys exist in any repository branch (`git diff` inspection).
2. **Environment Variable Injection:** Inject credentials solely through the hosting platform's secure secret manager (Vercel Environment Variables for `apps/web`; Render / Fly.io Secrets for `apps/api`).
3. **Key Rotation Schedule:**
   - Clerk API Keys: Rotate every 180 days.
   - S3 / R2 API Tokens: Rotate every 90 days.
   - Database Passwords: Managed through Neon automated connection rotation.

