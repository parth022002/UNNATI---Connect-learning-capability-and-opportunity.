# UNNATI — Required Configuration & Services Guide
## AI-Proctored Examination & Assessment Integrity System

This document outlines all external services, environment variables, configuration parameters, and development fallbacks required to operate the UNNATI Examination & Proctoring System in development and production environments.

---

## 1. External Services & Providers Overview

| Service / Provider | Purpose in Examination System | Mandatory in Prod? | Local Development Fallback |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 15+** | Relational data persistence (Examinations, Attempts, Telemetry, Certificates) | **Yes** | **SQLite (In-Memory / File)**: Automatically used if `DATABASE_URL` is omitted or points to `sqlite:///./unnati.db`. |
| **Google Gemini API** (`gemini-2.5-flash`) | Semantic evaluation of descriptive responses, scenario rubrics, and personalized study recommendations | **Yes** (Recommended) | **Deterministic Heuristic Evaluator**: If `GEMINI_API_KEY` is unset or unreachable, the system automatically uses token-overlap rubric scoring and rule-based feedback without throwing 500 errors. |
| **Clerk Auth** | Learner authentication, examiner role authorization, and JWT verification | **Yes** | **Header/Mock Auth**: In local development, `X-User-Id` and `X-User-Role` headers are accepted when Clerk keys are in test mode. |
| **WebRTC / MediaDevices** | Client-side camera presence testing and proctoring feed | **Yes** (Client browser) | **Mock Camera Stream / Graceful Skip**: Users in environments without webcam hardware can still attempt unproctored examinations; proctored attempts cleanly indicate hardware absence. |
| **Local / S3 Storage** | Digital certificate PDF storage and tamper-evident exports | Optional | **Data URI / Dynamic Render**: Dynamic on-the-fly rendering with SHA-256 verification hash without requiring external cloud object buckets. |

---

## 2. Environment Variables Specification

### Backend Configuration (`apps/api/.env`)

| Variable | Type | Default / Example | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | `postgresql://user:pass@localhost:5432/unnati` | Optional | Connection string. Defaults to SQLite (`sqlite:///./unnati.db`) for zero-friction local execution. |
| `GEMINI_API_KEY` | String | `AIzaSy...` | Optional | Google Gemini API key for descriptive evaluation and AI recommendations. Falls back gracefully if absent. |
| `CLERK_SECRET_KEY` | String | `sk_test_...` | Optional | Backend secret for authenticating learner and examiner JWT tokens. |
| `ENVIRONMENT` | String | `development` | Optional | Runtime mode: `development`, `staging`, `production`. In `development`, seeder automatically creates default certifications. |
| `PROCTORING_DATA_RETENTION_HOURS` | Integer | `72` | Optional | Retention lifespan for proctoring telemetry in compliance with India's DPDP Act 2026. Defaults to 72 hours. |
| `CERTIFICATE_SIGNING_SALT` | String | `unnati-crypto-salt-2026` | Optional | Secret salt used in SHA-256 tamper-evident digital certificate signature generation. |

### Frontend Configuration (`apps/web/.env.local`)

| Variable | Type | Default / Example | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:8000` | **Yes** | Root URL of the UNNATI FastAPI backend. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | String | `pk_test_...` | Optional | Clerk authentication client key. |
| `NEXT_PUBLIC_ENABLE_PROCTORING_CAMERA`| Boolean | `true` | Optional | Toggle for local webcam presence check in pre-exam diagnostic. |

---

## 3. High-Availability & Development Fallbacks

### 3.1. Zero-Dependency AI Fallback
When `GEMINI_API_KEY` is not supplied:
- **Descriptive & Scenario Questions:** Handled by `_heuristic_evaluate_descriptive` in `apps/api/app/services/examination_service.py`. It calculates semantic keyword density, rubric constraint matching, and sentence complexity metrics, awarding objective partial marks.
- **Recommendations:** Standard competency-targeted review paths and revision intervals are populated deterministically based on questions answered incorrectly.

### 3.2. Server-Side Timer Safety
- Timer expiration is calculated strictly on the backend:
  $$\text{expires\_at} = \text{started\_at} + \text{interval}(\text{time\_limit\_minutes})$$
- Even if a client modifies system clock or disables JavaScript timers, all autosave submissions past `expires_at` are rejected with HTTP 400 (`Exam attempt has expired`).

### 3.3. DPDP Act 2026 Privacy Safeguards
- **Zero Raw Media Retention:** Local webcam streams run strictly in the user's browser via HTML5 `<video>` and canvas elements. No video or audio streams are uploaded to or stored on UNNATI servers.
- **Sanitized Telemetry:** Only structured JSON telemetry events (`TAB_SWITCH`, `FULLSCREEN_EXIT`, `WINDOW_BLUR`, `COPY_PASTE_ATTEMPT`) with millisecond timestamps and numeric risk weights are transmitted.
- **Informed Consent Gate:** The UI enforces an explicit informed consent toggle prior to enabling camera hardware or initializing the examination session.

---

## 4. Setup & Verification Instructions

### 1. Backend Service Setup
```bash
# Navigate to backend directory
cd apps/api

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed default examinations
python -c "from app.core.database import engine, Base; from app.models import examination; Base.metadata.create_all(bind=engine); from app.services.examination_service import seed_default_examinations; from app.core.database import SessionLocal; db = SessionLocal(); seed_default_examinations(db); db.close(); print('Examinations seeded successfully!')"

# Run examination test suite (8 tests)
pytest tests/test_examinations.py -v

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Web Application Setup
```bash
# Navigate to web directory
cd apps/web

# Install packages
pnpm install

# Verify TypeScript compilation
pnpm exec tsc --noEmit

# Run production build check
pnpm build

# Start Next.js development server
pnpm dev
```

### 3. Accessing the Features
- **Learner Examination Hub:** `http://localhost:3000/examinations`
- **Pre-Exam Device & Camera Check:** `http://localhost:3000/examinations/1`
- **Active Exam Room:** `http://localhost:3000/examinations/1/take`
- **Examiner & Integrity Review Dashboard:** `http://localhost:3000/examinations/admin`
- **Public Certificate Verification:** `http://localhost:3000/examinations/certificates/UNN-APM-2026-6819`
