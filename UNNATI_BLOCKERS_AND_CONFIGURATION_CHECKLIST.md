# UNNATI — External Blockers, Integrations & Environment Configuration Checklist
## Production Deployment & Credential Boundary Specification

**Document Version:** 1.0.0  
**Scope:** Production Dependencies, External APIs, Credential Boundaries, and Resilient Fallbacks  

---

## 1. External Integration & Credential Status Summary

| External Dependency / Service | Production Purpose | Staging / Local State | Fallback Architecture | Operational Status |
| :--- | :--- | :--- | :--- | :--- |
| **Clerk Authentication** | User authentication, session management, social login | Configured (`.env`) | Demo / Test JWT template verification | ✅ Operational |
| **Google Gemini API** | Question synthesis, answer grading, AI companion, ATS analysis | Configured (`GEMINI_API_KEY`) | Rule-based heuristics & template fallbacks | ✅ Operational |
| **PostgreSQL Database** | Persistent relational storage for users, courses, exams, jobs | Configured / SQLite local support | Automatic SQLite fallback (`unnati_dev.db`) | ✅ Operational |
| **External Job Feeds** | Real-time syndicated job listings across India & Global | Configured with curated seed registry | Deduplicated multi-source job cache in database | ✅ Operational |
| **External Learning Catalogs**| Free & Paid course listings (FreeCodeCamp, MDN, Coursera, Udemy) | Curated & Verified 15-course initial registry | Internal `LearningResource` database cache | ✅ Operational |
| **Email SMTP Service** | Email notifications, password reset, exam results delivery | Console logger in local dev | Structured logger (`logger.info("[MOCK EMAIL]...")`) | ⚠️ Staging Mode (Requires live SMTP for prod) |
| **Browser MediaStream API** | Camera and microphone permission checks during proctoring | Browser standard WebRTC APIs | Environment pre-check modal with retry prompt | ✅ Operational |

---

## 2. Environment Configuration Reference

### 2.1 Backend Environment Configuration (`apps/api/.env`)
```ini
# Core Backend Settings
ENVIRONMENT=production
DEBUG=false
PROJECT_NAME="UNNATI - Your Growth Companion"
API_V1_STR=/api/v1
DATABASE_URL=postgresql://unnati_user:secure_password@localhost:5432/unnati_db

# Clerk Authentication (RS256 JWT)
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
GEMINI_DEFAULT_MODEL=gemini-2.5-flash
GEMINI_EVALUATION_MODEL=gemini-2.5-pro

# AI Proctoring Thresholds
PROCTORING_MAX_FULLSCREEN_VIOLATIONS=3
PROCTORING_MAX_TAB_SWITCHES=3
PROCTORING_TIMER_SYNC_TOLERANCE_SECONDS=15
PROCTORING_PERSIST_RAW_VIDEO=false

# CORS & Network Origins
BACKEND_CORS_ORIGINS=["https://unnati.career","http://localhost:3000"]
```

### 2.2 Frontend Environment Configuration (`apps/web/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## 3. Resilient Fallback Guarantees

1. **Database Fallback:** If `DATABASE_URL` is unset or PostgreSQL is unreachable, the system safely initializes a local SQLite file database (`sqlite:///./unnati_dev.db`) with automatic table creation via SQLAlchemy.
2. **AI Provider Fallback:** In the event of Gemini API network timeouts or rate limits, the AI services fall back to deterministic scoring rubrics, keyword matching, and pre-generated learning pathways so user workflows never crash.
3. **External Job Links:** When users click "Apply on Company Site", the system performs client-side URL protocol validation (`http://` or `https://`) and prompts a confirmation drawer, preventing malicious external redirects.
4. **Email Dispatch:** In development and staging environments where live SMTP credentials are not provisioned, transactional emails are safely logged to console output rather than failing attempt submissions.

---

## 4. Production Release Checklist

- [x] All secret keys isolated in server environment variables (never exposed in client browser bundles).
- [x] CORS origins restricted to approved web domains.
- [x] Client and server API timeouts established with retry policies.
- [x] DPDP Act (India 2026) consent disclosures present on public and authenticated views.
- [x] Zero blockers preventing complete local execution, build, and test verification.

