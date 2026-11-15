# UNNATI — Configuration & Environment Reference Guide

**Product:** UNNATI (उन्नति) — Your Growth Companion  
**Target Environments:** Local Development, Staging, Production  
**Last Updated:** November 2026  
**Security Warning:** Never commit real secrets, private keys, or passwords to Git.

---

## 1. Backend Environment Variables (`apps/api/.env`)

| Variable Name | Required | Default / Example Value | Description & How to Obtain |
| :--- | :---: | :--- | :--- |
| `APP_ENV` | Yes | `production` (`development` for local) | Runtime environment selector. Toggles error traceback exposure. |
| `DEBUG` | Yes | `false` (`true` for local) | When true, enables verbose debug logging. Strictly false in production. |
| `API_HOST` | Yes | `0.0.0.0` | Host interface for FastAPI ASGI server. |
| `API_PORT` | Yes | `8000` | Port for FastAPI ASGI server. |
| `API_SECRET_KEY` | Yes | *(64-char hex string)* | System secret used for signing certificate hashes and cryptographic checksums. |
| `CORS_ORIGINS` | Yes | `https://app.unnati.edu,http://localhost:3000` | Comma-delimited list of permitted origins for browser CORS policies. |
| `DATABASE_URL` | Yes | `postgresql+psycopg://...:6543/neondb` | PgBouncer pooled connection string (port 6543) for transactional queries. |
| `DATABASE_DIRECT_URL` | Optional | `postgresql+psycopg://...:5432/neondb` | Direct connection string (port 5432) for running Alembic DDL migrations. |
| `DB_POOL_SIZE` | No | `10` | Base connection pool size for SQLAlchemy. |
| `DB_MAX_OVERFLOW` | No | `20` | Maximum temporary connections above pool size under peak load. |
| `REDIS_URL` | Yes | `rediss://default:...@...upstash.io:6379` | Upstash Serverless Redis connection string with TLS (`rediss://`). |
| `REDIS_ENABLED` | No | `true` | Toggles Redis caching and sliding-window rate limiting. |
| `REDIS_DEFAULT_TTL` | No | `3600` | Default cache expiration time in seconds (1 hour). |
| `REDIS_TAXONOMY_CACHE_TTL`| No | `86400` | Cache expiration for canonical skill taxonomy (24 hours). |
| `RATE_LIMIT_ENABLED` | No | `true` | Enforces sliding-window rate limiting across client requests. |
| `RATE_LIMIT_IP_PER_MINUTE` | No | `60` | Maximum requests permitted per unauthenticated IP per minute. |
| `RATE_LIMIT_USER_PER_MINUTE`| No | `120` | Maximum requests permitted per authenticated user ID per minute. |
| `CLERK_SECRET_KEY` | Yes | `sk_live_...` | Backend secret key from Clerk Dashboard -> API Keys. |
| `CLERK_ISSUER` | Yes | `https://allowing-raptor-9178.clerk.accounts.dev` | Clerk OIDC token issuer domain. |
| `CLERK_JWKS_URL` | Yes | `.../.well-known/jwks.json` | Public JWKS endpoint used to verify RS256 token signatures. |
| `CLERK_AUDIENCE` | Optional | `unnati-api` | Expected audience claim in JWT. |
| `CLERK_CLOCK_SKEW_SECONDS` | No | `5` | Permitted server clock variance for JWT timestamps. |
| `GEMINI_API_KEY` | Yes | `AIzaSy...` | Google AI Studio API Key for Gemini 1.5/2.0 Flash generation. |
| `DEEPSEEK_API_KEY` | Optional | `sk-...` | DeepSeek Platform API Key for specialized code/technical prompts. |
| `OPENAI_API_KEY` | Optional | `sk-proj-...` | OpenAI API Key for fallback text completions. |
| `STORAGE_PROVIDER` | No | `S3_COMPATIBLE` | Object storage provider type (`S3_COMPATIBLE`, `AZURE_BLOB`, `LOCAL`). |
| `STORAGE_BUCKET_NAME` | Optional | `unnati-vault` | Bucket name for proctoring snapshots and resume uploads. |
| `STORAGE_ACCESS_KEY_ID` | Optional | `AKIA...` | AWS S3 or Cloudflare R2 access key. |
| `STORAGE_SECRET_ACCESS_KEY`| Optional | *(secret)* | AWS S3 or Cloudflare R2 secret key. |

---

## 2. Frontend Environment Variables (`apps/web/.env.production`)

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://app.unnati.edu` | Canonical URL of the client application. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://api.unnati.edu` | Base URL of the backend API service. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | `pk_live_...` | Public publishable key for Clerk React components. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` | Route for Clerk sign-in modal/page. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` | Route for Clerk registration modal/page. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | `/dashboard` | Redirect destination upon successful login. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | `/onboarding` | Redirect destination upon new account registration. |

---

## 3. Safe Secret Acquisition & Rotation Protocol

1. **Clerk Credentials**: Access [Clerk Dashboard](https://dashboard.clerk.com), create or select project `UNNATI`, navigate to **API Keys**, and copy Publishable and Secret keys.
2. **Neon Database**: Access [Neon Console](https://console.neon.tech), select your project compute endpoint, copy the pooled connection string on port 6543.
3. **Upstash Redis**: Access [Upstash Console](https://console.upstash.com), select your Redis database, copy the `rediss://` TLS endpoint.
4. **Google Gemini**: Access [Google AI Studio](https://aistudio.google.com), create an API key, and restrict key usage to Gemini APIs.
5. **Credential Rotation**: In the event of suspected exposure, immediately rotate the affected key in its vendor dashboard, update the hosting platform environment variables (Vercel/Render), and restart the services.
