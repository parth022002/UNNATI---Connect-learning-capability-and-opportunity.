# UNNATI (उन्नति) — Contributor & Developer Onboarding Guide

Welcome to the engineering team of **UNNATI** — *Your Growth Companion*! This guide walks you through setting up your local development environment, running tests, and adhering to our development standards.

---

## 1. System Prerequisites

Before contributing, verify your local system has the required tooling installed:
* **Node.js:** `v20.x LTS` or `v22.x LTS`
* **Package Manager:** `pnpm` (`v9.x` or higher) — `npm install -g pnpm@latest`
* **Python Runtime:** `Python 3.11.x` or `Python 3.12.x`
* **Git:** Latest version
* **Docker Engine (Optional):** Docker Desktop for local PostgreSQL & Redis (or use cloud instances)

To automatically verify your system tooling, execute:
```bash
# Windows PowerShell
.\scripts\check-env.ps1

# Linux / macOS
./scripts/check-env.sh
```

---

## 2. Repository Setup & Dependencies

### 2.1 Clone the Repository
```bash
git clone https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity..git
cd "UNNATI Code"
```

### 2.2 Install Frontend Dependencies
```bash
pnpm install
```

### 2.3 Setup Python Virtual Environment
```bash
cd apps/api
python -m venv .venv

# Activate Virtual Environment:
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install requirements:
pip install -r requirements.txt pytest httpx
cd ../..
```

---

## 3. Environment Configuration

Copy the standardized environment template to `.env` in the repository root and `apps/api/.env`:
```bash
cp .env.example .env
cp .env.example apps/api/.env
```

Ensure the following minimal variables are configured:
* `DATABASE_URL`: Your PostgreSQL connection string.
* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk test publishable key.
* `CLERK_SECRET_KEY`: Clerk secret key.
* `GEMINI_API_KEY`: Google AI Studio API key.

---

## 4. Running the Platform Locally

### 4.1 Start Backend FastAPI Server
```bash
cd apps/api
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
* **API Home:** `http://localhost:8000`
* **Interactive Docs (Swagger UI):** `http://localhost:8000/docs`
* **System Health:** `http://localhost:8000/health`

### 4.2 Start Frontend Next.js Server
In a separate terminal window:
```bash
pnpm run dev
```
* **Web App:** `http://localhost:3000`
* **Candidate Dashboard:** `http://localhost:3000/dashboard`
* **Topological Roadmap:** `http://localhost:3000/roadmap`

---

## 5. Testing & Code Quality

### 5.1 Run Frontend Typechecks
```bash
pnpm --filter @unnati/web exec tsc --noEmit
```

### 5.2 Run Backend Unit Tests
```bash
cd apps/api
pytest -v tests/
```

---

## 6. Git Workflow & Commit Guidelines

* **Branch Naming:**
  - `feat/<feature-name>` for new features
  - `fix/<bug-name>` for bug fixes
  - `docs/<doc-name>` for documentation updates
* **Commit Messages:** Follow Conventional Commits format:
  - `feat(scope): brief description`
  - `fix(scope): brief description`
  - `docs(scope): brief description`
* **Security Rule:** ⚠️ **Never commit `.env` files, private keys, or API tokens.** Pre-commit secret scanning will reject commits containing credentials.
