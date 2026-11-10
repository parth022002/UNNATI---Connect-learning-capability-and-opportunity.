# UNNATI — Your Growth Companion

A development starter monorepo for an AI-enabled career-growth and talent-intelligence ecosystem.

## Product direction
UNNATI connects learners, professionals, educational institutions and employers through:
- Academic/career document ingestion and structured extraction
- Curriculum → skills → prerequisites → roles/sectors mapping
- Career discovery and role exploration
- Skill-gap and readiness analysis
- Personalised, ordered learning roadmaps
- Learning resources, projects and assessments
- Job and interview preparation
- Later-stage institutional and employer talent intelligence

## Repository layout
- `apps/web` — Next.js + TypeScript + Tailwind frontend
- `apps/api` — FastAPI backend
- `services/worker` — Celery background worker scaffold
- `packages/shared` — shared product contracts and design tokens
- `infra` — Docker Compose and local infrastructure
- `docs` — product, architecture, data and AI documentation
- `scripts` — developer setup helpers

## Quick start
### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker Desktop

### 1. Configure environment
Copy `.env.example` to `.env` and fill in values as needed. The starter runs locally without live AI or Clerk credentials; those integrations remain disabled until configured.

### 2. Start infrastructure
```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Start the API
```bash
cd apps/api
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API health: http://localhost:8000/health  
API docs: http://localhost:8000/docs

### 4. Start the web app
```bash
pnpm install
pnpm --filter @unnati/web dev
```
Web app: http://localhost:3000

## Important implementation notes
- This is a structured starter foundation, not a finished production platform.
- Authentication, AI providers, document parsing/OCR, payments, email and external job integrations require credentials and implementation.
- Do not commit `.env`, API keys, user documents or personal data.
- Review `docs/ROADMAP.md` and `docs/SECURITY.md` before building production features.
