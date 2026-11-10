# ADR 0004: Multi-Provider AI Acceleration with Automated Failover

## Status
Accepted

## Context
UNNATI relies heavily on Large Language Models for resume text extraction, Pydantic schema generation, skill matching, and topological learning roadmaps. Vendor lock-in, token rate limits (HTTP 429), and upstream outages represent significant operational risks.

## Decision
We implemented a **Provider-Agnostic LLM Routing Architecture**:
1. **Primary Reasoning Engine:** **Google Gemini 2.5 Flash** (via `google-genai` SDK) for complex structured JSON extraction and DAG validation.
2. **Low-Latency Inference:** **Groq** (`llama-3.3-70b-versatile`) for sub-400ms conversational queries.
3. **Gateway Redundancy:** **OpenRouter** as automated fallback if the primary provider experiences transient rate limits or outages.
4. **Resilient Local Heuristic Fallback:** If all external AI providers fail, heuristic regex extractors ensure candidate profile onboarding never halts.

## Consequences
- High resilience and zero single-point-of-failure in AI inference.
- Unified prompt templates adhering to structured Pydantic schemas.

