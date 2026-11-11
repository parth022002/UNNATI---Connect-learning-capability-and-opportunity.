# UNNATI — AI-Proctored Skill Assessment & Intelligent Learning Recommendation System
## Production Operations & Environment Configuration Checklist

**Document Version:** 1.0.0  
**Target Environment:** Staging & Production Deployments  
**Author:** UNNATI Platform Engineering Team  

---

## 1. Overview & Architecture Prerequisites

The **AI-Proctored Skill Assessment & Intelligent Learning Recommendation System** runs as an integrated subsystem within the UNNATI platform. It links:
- The **FastAPI Backend (`apps/api`)** providing server-authoritative assessment state, proctoring telemetry evaluation, Bayesian skill calibration, and learning catalog queries.
- The **Next.js 15 App Router Frontend (`apps/web`)** providing client proctoring sensors (Webcam, Fullscreen, Blur/Focus), readiness decision gates, catalog discovery, and learner dashboard.
- The **Google Gemini AI Engine** generating dynamic scenario questions, evaluating descriptive answers, and tailoring adaptive upskilling pathways.
- The **PostgreSQL / SQLite Database** storing courses, enrollments, readiness logs, exams, and proctoring telemetry.

---

## 2. Environment Variables & Secret Configuration

### 2.1 Backend (`apps/api/.env`)
Ensure the following environment variables are configured in the backend environment:

```ini
# ==============================================================================
# DATABASE & CORE SETTINGS
# ==============================================================================
DATABASE_URL=postgresql://unnati_user:secure_password@localhost:5432/unnati_db
# For local testing fallback: sqlite:///./unnati_dev.db
ENVIRONMENT=production
DEBUG=false
API_V1_STR=/api/v1
PROJECT_NAME="UNNATI - Your Growth Companion"

# ==============================================================================
# CLERK AUTHENTICATION & JWT VERIFICATION
# ==============================================================================
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ALGORITHM=RS256

# ==============================================================================
# GOOGLE GEMINI AI CONFIGURATION
# ==============================================================================
GEMINI_API_KEY=AIzaSy...
GEMINI_DEFAULT_MODEL=gemini-2.5-flash
GEMINI_EVALUATION_MODEL=gemini-2.5-pro
GEMINI_MAX_OUTPUT_TOKENS=4096
GEMINI_TEMPERATURE=0.2

# ==============================================================================
# AI-PROCTORING SENSITIVITY & INTEGRITY THRESHOLDS
# ==============================================================================
PROCTORING_MAX_FULLSCREEN_VIOLATIONS=3
PROCTORING_MAX_TAB_SWITCHES=3
PROCTORING_MAX_BLUR_SECONDS_TOLERANCE=5
PROCTORING_AUDIO_SPIKE_DB_THRESHOLD=75.0
PROCTORING_TIMER_SYNC_TOLERANCE_SECONDS=15
PROCTORING_PERSIST_RAW_VIDEO=false
PROCTORING_REQUIRE_WEBCAM_DEFAULT=true
PROCTORING_REQUIRE_FULLSCREEN_DEFAULT=true

# ==============================================================================
# LEARNING RESOURCE CATALOG SETTINGS
# ==============================================================================
LEARNING_CATALOG_AUTO_SEED=true
LEARNING_CATALOG_MAX_PAGE_SIZE=50
LEARNING_CATALOG_DEFAULT_PAGE_SIZE=12
LEARNING_CATALOG_ALLOW_EXTERNAL_REDIRECTS=true
```

### 2.2 Frontend (`apps/web/.env.local` or Production Environment)
Ensure the following variables are configured in the Next.js runtime:

```ini
# Base API Connection
NEXT_PUBLIC_API_URL=https://api.unnati.career
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Proctoring Feature Flags
NEXT_PUBLIC_ENABLE_AI_PROCTORING=true
NEXT_PUBLIC_ENABLE_AUDIO_MONITORING=true
NEXT_PUBLIC_ENABLE_DEVTOOLS_DETECTION=true
```

---

## 3. AI Proctoring Engine Configuration

### 3.1 Event Classification & Severity Matrix
Proctoring telemetry evaluates infractions according to strict probabilistic thresholds:

| Violation Event | Detection Trigger | Severity | Action Triggered |
| :--- | :--- | :--- | :--- |
| `FULLSCREEN_EXIT` | Document fullscreen element becomes null | `HIGH` | Immediate modal warning; counts toward violation limit |
| `TAB_HIDDEN` | `document.visibilityState === 'hidden'` | `HIGH` | Clock continues running; logged to telemetry stream |
| `WINDOW_BLUR` | `window.onblur` event fired | `MEDIUM` | Warning banner displayed to candidate |
| `AUDIO_SPIKE` | WebAudio AnalyserNode exceeds 75 dB | `LOW` | Audio level event logged (no audio recorded or stored) |
| `MULTIPLE_FACES` | Face detection model detects >1 face | `HIGH` | Telemetry flag recorded for human reviewer |
| `NO_FACE_DETECTED`| Face detection model detects 0 faces for >10s | `MEDIUM` | On-screen prompt: "Please face your camera" |
| `DEVTOOLS_OPENED` | Window resize anomaly or debugger break | `CRITICAL` | Attempt flagged for security review |
| `COPY_PASTE` | `clipboard` or `ctrl+c`/`ctrl+v` interception | `HIGH` | Clipboard write/paste blocked; incident logged |

### 3.2 Privacy Safeguards (Privacy by Design)
- **Zero Video Stream Storage:** UNNATI does **NOT** record or persist continuous candidate video or audio files. Only discrete event metadata (event type, millisecond timestamp, duration, severity score) is stored in the database.
- **Client-Side Edge Inference:** Face presence and gaze orientation are evaluated client-side via lightweight browser models (e.g., MediaPipe / FaceMesh) where supported; raw frames never leave the candidate's browser session.
- **Explicit Consent:** Every candidate must complete the **Exam Environment Pre-check**, granting camera and microphone permissions and reviewing the privacy disclosure before starting the proctored attempt.

### 3.3 Server-Authoritative Timer Synchronization
- Expiration time is calculated strictly on the backend: `expires_at = attempt.started_at + timedelta(minutes=exam.duration_minutes)`.
- Client timers query `/api/v1/examinations/attempts/{id}` to fetch `time_remaining_seconds` based on the authoritative server clock.
- Submissions arriving past `expires_at + 15 seconds` (grace period for network latency) are rejected or automatically submitted with status `EXPIRED`.

---

## 4. Learning Resource Catalog Configuration

### 4.1 Provider Inclusion & Verification Protocol
All entries in `LearningResource` must satisfy strict data integrity criteria:
1. **Verifiable Quality:** High completion rates, modern curriculum, up-to-date syntax (e.g., Python 3.10+, React 19+, PostgreSQL 15+).
2. **Provider Diversity:**
   - **Free Providers:** FreeCodeCamp, MDN Web Docs, YouTube (official channels), Microsoft Learn, Kaggle Learn, Harvard CS50, MIT OpenCourseWare.
   - **Paid / Subscription Providers:** Coursera, Udemy, Pluralsight, edX.
3. **Fair Presentation Rule:** Free resources must **never** be deprioritized behind paid options. When recommending a 4-stage pathway, free options are surfaced prominently.
4. **Zero Fabrication Policy:** All pricing, ratings, and course durations must correspond to verified public figures. If a course is free, `pricing_display="Free"` and `provider_type="FREE"`.

### 4.2 Seed Catalog Initial Set
The default migration seeds 15 canonical resources:
1. *Python for Everybody Specialization* (Coursera / University of Michigan)
2. *Scientific Computing with Python Certification* (FreeCodeCamp - 100% Free)
3. *Complete Python Bootcamp from Zero to Hero* (Udemy / Jose Portilla)
4. *Intermediate Python Programming Course* (freeCodeCamp.org YouTube)
5. *Machine Learning Specialization* (Coursera / DeepLearning.AI & Stanford)
6. *Intro to Machine Learning & Data Science* (Kaggle Learn - 100% Free)
7. *Hands-On Machine Learning with Scikit-Learn, Keras & TF* (Documentation & Repo)
8. *Deep Learning Specialization* (Coursera / Andrew Ng)
9. *Full Stack Open 2024* (University of Helsinki - 100% Free)
10. *MDN Web Docs: Web Development Tutorials* (Mozilla - 100% Free)
11. *React: The Complete Guide 2024* (Udemy / Maximilian Schwarzmüller)
12. *PostgreSQL Tutorial & Interactive Lab* (PostgreSQL Official Docs & SQLBolt - 100% Free)
13. *Docker and Kubernetes: The Complete Guide* (Udemy / Stephen Grider)
14. *Algorithms and Data Structures Masterclass* (freeCodeCamp.org - 100% Free)
15. *Microsoft Learn: Azure Cloud Fundamentals* (Microsoft Learn - 100% Free)

---

## 5. Bayesian Skill Evidence Model Configuration

When an assessment is completed or readiness is declared, the candidate's skill state in `CandidateSkill` is calibrated according to Bayesian belief updating:

```
P(Competent | Evidence) = [P(Evidence | Competent) * P(Competent)] / P(Evidence)
```

| Lifecycle State | Prior Confidence | Input Evidence | Calibrated Posterior | Status Tag |
| :--- | :--- | :--- | :--- | :--- |
| **Self-Declared** | 0.20 | Option A selected at Readiness Gate | 0.25 | `CLAIMED` |
| **Course Completed**| 0.25 | 100% completed on verified learning resource | 0.50 | `IN_PROGRESS` |
| **Diagnostic Quiz** | 0.30 | Scored ≥ 70% on 5-question quiz | 0.60 | `CLAIMED` (Tested) |
| **Formal Proctored**| 0.50 | Scored ≥ Passing % on proctored exam with Normal risk | 0.90 - 0.95 | `ASSESSED` |
| **Integrity Flagged**| Any | Proctored exam completed with High integrity risk | Stalled at prior | `FLAGGED_FOR_REVIEW`|

---

## 6. Deployment & Operational Runbook

### Step 1: Verify Database Schema
Run in the API environment to ensure all assessment and learning tables exist:
```bash
cd apps/api
.venv\Scripts\python -c "from app.db.session import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database tables verified!')"
```

### Step 2: Seed / Refresh Learning Catalog
If re-seeding the verified catalog is required:
```bash
cd apps/api
.venv\Scripts\python -c "from app.db.session import SessionLocal; from app.services.learning_service import LearningService; db = SessionLocal(); LearningService._seed_initial_catalog(db); print('Catalog re-seeded successfully!')"
```

### Step 3: Run Full Automated Regression Suite
Execute the full test suite before promoting code:
```bash
cd apps/api
.venv\Scripts\python -m pytest tests/ -v
```

### Step 4: Verify Frontend Production Build
Confirm the Next.js static and dynamic routes compile without errors:
```bash
cd apps/web
npx tsc --noEmit
npm run build
```
