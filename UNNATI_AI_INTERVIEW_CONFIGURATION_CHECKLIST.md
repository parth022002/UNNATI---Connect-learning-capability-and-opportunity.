# UNNATI — AI Interview Simulation Studio
## Configuration & Environment Deployment Checklist

This document provides complete instructions for configuring, provisioning, and operating the **AI Interview Preparation & Simulation System** in development, staging, and production environments.

---

### 1. Environment Variables Configuration

#### Backend API (`apps/api/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `sqlite:///./unnati.db` | PostgreSQL or SQLite database connection URI. |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for dynamic adaptive question synthesis, follow-up probing, and rubric grading. When omitted, system seamlessly falls back to high-fidelity deterministic heuristics. |
| `CLERK_SECRET_KEY` | **Yes** (Prod) | `""` | Clerk secret key for validating candidate JWT tokens and verifying user identities. |
| `CLERK_WEBHOOK_SECRET`| Optional | `""` | Webhook signing secret for synchronizing Clerk user events. |
| `ENVIRONMENT` | **Yes** | `development` | Set to `production` in live deployments to enforce strict CORS and HTTPS. |
| `CORS_ORIGINS` | **Yes** | `http://localhost:3000` | Comma-separated list of allowed frontend origins. |

#### Frontend Web (`apps/web/.env.local`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:8000` | FastAPI backend base URL. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Yes** | `""` | Clerk frontend publishable key for user authentication. |
| `CLERK_SECRET_KEY` | **Yes** | `""` | Server-side Clerk key. |

---

### 2. AI Model & Evaluator Configuration
The simulation engine uses **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) for low-latency JSON structured outputs:
- **Temperature**: `0.3` (ensures objective, consistent rubric evaluations without hallucinations).
- **Output Schema**: Pydantic v2 JSON schema strictly enforcing 0.0–5.0 score boundaries, STAR presence booleans, and string arrays for strengths and improvements.
- **Graceful Fallback Mode**: If `GEMINI_API_KEY` is not provided or API quotas are exceeded, the service automatically executes the internal deterministic evaluation algorithm (`_evaluate_deterministic`), which inspects word count, STAR keywords, metrics quantification, and technical terminology. No simulation session will ever fail due to external AI unavailability.

---

### 3. Voice & Audio Interaction Requirements
- **Speech-to-Text (Candidate Voice)**: Powered by the standardized browser **Web Speech API** (`window.SpeechRecognition` or `window.webkitSpeechRecognition`).
  - Supported natively in Chrome, Edge, Safari, and Chromium-based browsers.
  - Requires microphone permission consent from the candidate upon first activation.
  - Automatic fallback to standard text input when microphone is not permitted or unavailable.
- **Text-to-Speech (Interviewer Voice)**: Powered by the browser **Web SpeechSynthesis API** (`window.speechSynthesis`).
  - Native browser audio engine; operates with zero latency and requires zero external cloud audio subscriptions.
  - Voice rate set to `1.0` and pitch set to `1.0` for natural interviewer cadence.

---

### 4. Database Schema Provisioning
Ensure database tables are provisioned before launching the API:
```bash
# From apps/api directory with Python virtual environment active:
python -c "from app.core.database import engine, Base; import app.models; Base.metadata.create_all(bind=engine)"
```
This provisions:
- `interview_sessions`
- `interview_questions`
- `interview_turns`
alongside existing UNNATI user, skill, assessment, examination, and resume tables.

---

### 5. Career Roadmap Competency Bridging Configuration
The service links weak competencies scored `< 3.5` directly to curated UNNATI upskilling modules in the learner's Career Roadmap:
| Competency Key | Curated Learning Module | Suggested Roadmap Action |
| :--- | :--- | :--- |
| `System Architecture` | Scalable Microservices Architecture & High-Availability Design | Complete Hands-On Architecture Lab |
| `Algorithmic Optimization` | Advanced Data Structures & Time-Complexity Analysis | Complete 10 Practice Algorithm Sets |
| `Data Modeling` | Relational Indexing, Sharding & Distributed Storage Patterns | Build Database Schema Benchmark |
| `STAR Behavioral Storytelling` | Leadership & Executive STAR Communication Masterclass | Practice 3 High-Impact Behavioral Scenarios |
| `Conflict Resolution` | Cross-Functional Team Negotiation & Engineering Empathy | Complete Conflict Resolution Module |
| `Unit Economics` | Business Analytics, CAC/LTV & Cohort Retention Modeling | Analyze SaaS Financial Model Case Study |

---

### 6. Production Health Checks & Verification
1. **API Health**: `GET /health` returns `{"status": "healthy"}` with 200 OK.
2. **Interview Studio Dashboard Probe**: `GET /api/v1/interviews/studio/dashboard` with Bearer JWT returns valid KPI object.
3. **Automated Test Suite**:
   ```bash
   $env:PYTHONPATH="apps/api"
   apps/api/.venv/Scripts/python.exe -m pytest apps/api/tests/test_interviews.py -v
   ```
   All 6 tests must pass.

