# UNNATI — REST API Reference Guide

**Product:** UNNATI (उन्नति) — Your Growth Companion  
**API Version:** v1 (`/api/v1/*`)  
**Base URL:** `https://api.unnati.edu` (Local: `http://localhost:8000`)  
**Last Updated:** November 2026  

---

## 1. Authentication & Global Headers

All protected endpoints require a valid Clerk session token passed in the `Authorization` header:

```http
Authorization: Bearer <clerk_session_jwt>
Content-Type: application/json
Accept: application/json
```

### Standard Error Response Format
```json
{
  "detail": "Descriptive error message explaining the failure condition."
}
```

### Standard HTTP Status Codes
- `200 OK`: Request succeeded; response contains requested data.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: Validation failure or business rule violation.
- `401 Unauthorized`: Missing, expired, or cryptographically invalid JWT token.
- `403 Forbidden`: Authenticated user lacks permission to access resource (e.g. non-owner attempt inspection).
- `404 Not Found`: Resource ID does not exist.
- `429 Too Many Requests`: Rate limit exceeded (60 req/min for IP, 120 req/min for user).
- `500 Internal Server Error`: Unhandled server-side exception.

---

## 2. API Endpoints by Domain

### 2.1 Health & Diagnostics (`/api/v1/health`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Returns service status, database ping, and Redis cache health. | No |

---

### 2.2 Identity & Profile Management (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Fetches current user profile and role details. | Yes |
| `PUT` | `/api/v1/users/profile` | Updates professional headline, target role, and career summary. | Yes |
| `POST` | `/api/v1/users/education` | Appends a formal academic education record. | Yes |
| `POST` | `/api/v1/users/experience` | Appends a work history or internship record. | Yes |

---

### 2.3 Skills Taxonomy & Inventory (`/api/v1/skills`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/skills` | Returns global canonical skill taxonomy with domain filters. | No |
| `GET` | `/api/v1/skills/my-skills` | Retrieves candidate's verified and self-reported skills ledger. | Yes |
| `POST` | `/api/v1/skills/claim` | Adds a self-reported skill to candidate profile. | Yes |

---

### 2.4 Examination & Proctoring Integrity (`/api/v1/examinations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/examinations` | Lists available examinations filtered by track and category. Answers concealed. | No |
| `GET` | `/api/v1/examinations/{id}` | Retrieves examination metadata, duration, rules, and proctoring config. | No |
| `POST` | `/api/v1/examinations/{id}/start` | Starts or resumes an attempt. Requires `proctoring_consent: true`. | Yes |
| `POST` | `/api/v1/examinations/attempts/{attempt_id}/answers` | Autosaves a candidate answer for a specific question. | Yes |
| `POST` | `/api/v1/examinations/attempts/{attempt_id}/proctoring-events` | Ingests telemetry event with `client_event_id` idempotency. | Yes |
| `POST` | `/api/v1/examinations/attempts/{attempt_id}/proctoring-evidence` | Registers evidence reference with cryptographic SHA-256 hash. | Yes |
| `POST` | `/api/v1/examinations/attempts/{attempt_id}/proctoring-reviews` | Records human reviewer decision and notes. | Yes (Admin/Proctor) |
| `GET` | `/api/v1/examinations/attempts/{attempt_id}/proctoring-summary` | Returns full proctoring summary with events, evidence, and audit logs. | Yes (Owner/Admin) |
| `POST` | `/api/v1/examinations/attempts/{attempt_id}/submit` | Submits attempt for evaluation, computes score, and generates recommendations. | Yes |
| `GET` | `/api/v1/examinations/certificates/{certificate_number}` | Public cryptographic verification of an issued certificate. | No |
| `GET` | `/api/v1/examinations/admin/reviews` | Administrative review queue for flagged attempts. | Yes (Admin/Proctor) |
| `GET` | `/api/v1/examinations/admin/analytics` | High-level participation, pass rates, and integrity distribution. | Yes (Admin) |

---

### 2.5 Learning Hub & Assessment Readiness (`/api/v1/learning`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/learning/resources` | Searches catalog of 15+ verified free and paid courses. | No |
| `POST` | `/api/v1/learning/pathway` | Generates a 4-stage personalized sequential learning pathway. | Yes |
| `POST` | `/api/v1/learning/readiness` | Evaluates student choice at readiness gate (Options A, B, or C). | Yes |
| `POST` | `/api/v1/learning/progress` | Updates resource status (`SAVED`, `STARTED`, `IN_PROGRESS`, `COMPLETED`). | Yes |
| `GET` | `/api/v1/learning/dashboard` | Returns learner metrics, enrolled courses, and completion stats. | Yes |

---

### 2.6 AI Interview Studio (`/api/v1/interviews`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/interviews/sessions` | Creates an interactive mock interview tailored to target role and resume. | Yes |
| `GET` | `/api/v1/interviews/sessions/{id}` | Fetches current interview turn, questions, and transcript state. | Yes |
| `POST` | `/api/v1/interviews/sessions/{id}/turns` | Submits candidate verbal/text response for turn-by-turn AI evaluation. | Yes |
| `POST` | `/api/v1/interviews/sessions/{id}/complete` | Finalizes interview and calculates multi-criteria rubric scores. | Yes |
| `GET` | `/api/v1/interviews/sessions/{id}/report` | Retrieves comprehensive diagnostic scorecard with STAR feedback. | Yes |

---

### 2.7 Resume Intelligence & ATS Checker (`/api/v1/resumes`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resumes/upload` | Uploads PDF/DOCX resume, parses sections, and extracts skill entities. | Yes |
| `GET` | `/api/v1/resumes/{id}` | Retrieves structured resume profile and extracted skill inventory. | Yes |
| `POST` | `/api/v1/resumes/{id}/ats` | Generates ATS formatting score, keyword analysis, and impact metrics. | Yes |
| `POST` | `/api/v1/resumes/{id}/match` | Benchmarks resume against target Job Description using semantic vectors. | Yes |

---

### 2.8 Global Job Discovery & Recommendations (`/api/v1/jobs`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | Queries aggregated job postings across Indian and global markets. | No |
| `GET` | `/api/v1/jobs/{id}` | Retrieves detailed job listing with personalized skill-match breakdown. | No |
| `POST` | `/api/v1/jobs/{id}/save` | Adds job opportunity to candidate's saved tracker. | Yes |
| `POST` | `/api/v1/jobs/{id}/apply` | Logs job application and tracks status (`APPLIED`, `INTERVIEWING`, `OFFER`). | Yes |

---

### 2.9 Career Roadmap & Milestones (`/api/v1/roadmaps`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/roadmaps` | Retrieves candidate's active visual career progression pathway. | Yes |
| `POST` | `/api/v1/roadmaps/generate` | Synthesizes personalized milestones based on skill gap analysis. | Yes |
