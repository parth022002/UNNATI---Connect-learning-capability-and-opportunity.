# Architecture

## High-level components
- Next.js web client: public pages, learner workspace and later institution/employer portals.
- FastAPI application: authentication boundary, APIs, domain orchestration and validation.
- PostgreSQL: canonical transactional records and relational data.
- pgvector: semantic embeddings and retrieval.
- Neo4j: relationships across courses, skills, prerequisites, roles, sectors and learning resources.
- Redis + Celery: asynchronous document processing, embeddings and roadmap jobs.
- S3-compatible storage: original uploads and generated artefacts.
- AI provider adapters: LLM and embedding integrations behind provider-neutral interfaces.

## Data flow: academic document to roadmap
Upload → quarantine/validation → object storage → parse/OCR → structured extraction → user review → taxonomy mapping → graph updates → role requirements comparison → skill-gap analysis → prerequisite ordering → roadmap generation → progress tracking.

## Design principles
- Modular monolith first; split services only when scale or team boundaries justify it.
- Human review for uncertain document extraction and skill mapping.
- Explain recommendations with evidence and confidence.
- Keep AI providers replaceable.
- Separate PII from analytics wherever practical.
- Version taxonomies, prompts, models and roadmap algorithms.
