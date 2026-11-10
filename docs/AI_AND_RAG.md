# AI, RAG and agent design

## Recommended bounded capabilities
- Document understanding agent: extracts facts and cites page/section evidence.
- Taxonomy mapping service: maps extracted course outcomes to canonical skills.
- Career exploration assistant: helps users compare roles and pathways.
- Gap analysis engine: deterministic comparison of profile evidence and role requirements.
- Roadmap planner: prerequisite-aware ordering with time, difficulty and resource constraints.
- Progress coach: helps users interpret progress and choose a next action.

## Guardrails
- Never fabricate qualifications, experience, skills or job outcomes.
- Clearly distinguish user-provided facts, extracted facts and model-generated suggestions.
- Show evidence and confidence for document extraction and skill mapping.
- Ask for human confirmation when confidence is low.
- Do not make hiring decisions solely from model output.
- Treat uploaded documents and retrieved content as untrusted input.
- Evaluate recommendation quality, fairness and hallucination rates before launch.
