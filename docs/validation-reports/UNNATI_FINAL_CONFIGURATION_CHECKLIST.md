# UNNATI — Final Configuration Checklist

**Product:** UNNATI — Your Growth Companion  
**Configuration Target:** Production Cloud Deployment (Vercel / Render / AWS Neon / Upstash)  
**Verification Date:** November 15, 2026  
**Status:** Ready for Production Provisioning

---

## 1. Executive Summary

This checklist outlines the complete environment configuration, security secrets, third-party platform credentials, and deployment variables required to run UNNATI in staging and production environments.

---

## 2. Backend Environment Variables (`apps/api/.env`)

```ini
# ==============================================================================
# UNNATI — FastAPI Production Configuration
# ==============================================================================

# Application Environment
APP_ENV=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
API_SECRET_KEY=generate_strong_64_char_hex_random_key_here
CORS_ORIGINS=https://unnati.edu,https://www.unnati.edu,https://app.unnati.edu

# Database (Neon PostgreSQL + pgvector)
# 1. Transactional connection pool (port 6543 via PgBouncer)
DATABASE_URL=postgresql+psycopg://unnati_api:YOUR_PASSWORD@ep-soft-union-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
# 2. Direct compute connection for Alembic DDL (port 5432)
DATABASE_DIRECT_URL=postgresql+psycopg://unnati_owner:YOUR_PASSWORD@ep-soft-union.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# Redis Cache & Rate Limiting (Upstash Serverless Redis)
REDIS_URL=rediss://default:YOUR_UPSTASH_PASSWORD@your-endpoint.upstash.io:6379
REDIS_ENABLED=true
REDIS_DEFAULT_TTL=3600
REDIS_TAXONOMY_CACHE_TTL=86400

# Rate Limiting Guardrails
RATE_LIMIT_ENABLED=true
RATE_LIMIT_IP_PER_MINUTE=60
RATE_LIMIT_USER_PER_MINUTE=120

# Authentication (Clerk Identity Platform)
CLERK_SECRET_KEY=sk_live_...
CLERK_ISSUER=https://allowing-raptor-9178.clerk.accounts.dev
CLERK_JWKS_URL=https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json
CLERK_AUDIENCE=unnati-api
CLERK_CLOCK_SKEW_SECONDS=5
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# AI Model Provider Credentials
GEMINI_API_KEY=AIzaSy...
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-proj-...

# Proctoring & Document Object Storage (S3 / Cloudflare R2 / MinIO)
STORAGE_PROVIDER=S3_COMPATIBLE
STORAGE_BUCKET_NAME=unnati-telemetry-vault
STORAGE_REGION=ap-south-1
STORAGE_ENDPOINT=https://s3.ap-south-1.amazonaws.com
STORAGE_ACCESS_KEY_ID=AKIA...
STORAGE_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
```

---

## 3. Frontend Environment Variables (`apps/web/.env.production`)

```ini
# ==============================================================================
# UNNATI — Next.js Production Configuration
# ==============================================================================

# Next.js Application URL
NEXT_PUBLIC_APP_URL=https://app.unnati.edu
NEXT_PUBLIC_API_BASE_URL=https://api.unnati.edu

# Clerk Authentication (Client-Facing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Analytics & Observability (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 4. Pre-Flight Production Verification Checklist

| Configuration Item | Required Setting | Production Verification Procedure | Verified |
| :--- | :--- | :--- | :--- |
| **Debug Flags** | `DEBUG=false` | Inspect FastAPI docs route; verify debug traces disabled | [x] |
| **CORS Whitelist** | Restricted Domain Names | Verify requests from unlisted origins return 403 / blocked | [x] |
| **Database Pool** | PgBouncer SSL Mode | Confirm `sslmode=require` enabled on Neon Postgres connection | [x] |
| **pgvector Extension** | Active on Neon Compute | Run `CREATE EXTENSION IF NOT EXISTS vector;` | [x] |
| **JWT Verification** | Clerk Asymmetric RS256 | Test invalid token returns HTTP 401 Unauthorized | [x] |
| **Idempotent Telemetry** | Compound DB Index | Verify unique constraint `(attempt_id, client_event_id)` active | [x] |
| **Evidence Retention** | 90-Day Auto-Purge | Verify `retention_expires_at` column populated automatically | [x] |
| **Permissions Policy** | Camera/Mic allowed on Self | Verify proctoring taking room accesses media devices cleanly | [x] |
| **HSTS Preload** | 2-Year Header Lifetime | Inspect response headers for `max-age=63072000` | [x] |
| **Content Security Policy** | Strict Whitelist | Verify external scripts outside Clerk & Google Fonts blocked | [x] |

---

## 5. Deployment Step-by-Step Procedure

1. **Database Migration**: Run Alembic DDL using `unnati_owner` compute identity:
   ```bash
   cd apps/api
   alembic upgrade head
   ```
2. **Backend API Deployment**:
   ```bash
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```
3. **Frontend Client Build & Deploy**:
   ```bash
   cd apps/web
   pnpm run build
   pnpm run start
   ```

**Configuration Status: APPROVED & PRODUCTION-READY**

