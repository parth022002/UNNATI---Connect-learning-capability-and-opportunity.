# UNNATI (उन्नति) — 31-Agent Architecture Registry

**Document Version:** 1.0.0  
**Specification:** Talvyn Master Specification V15 / UNNATI Candidate Core  
**Autonomy Taxonomy:**  
* **L0 — Informational / Read-Only:** Queries read-only state; produces reports without mutating state.
* **L1 — Suggestive / Recommendation:** Suggests options or milestones; requires candidate selection.
* **L2 — Collaborative / In-The-Loop:** Proposes structured updates (e.g., extracted resume skills); requires candidate confirmation before persistence.
* **L3 — Supervised Autonomous:** Executes automated tasks under safety guardrails; logs audit events; cancellable by user.
* **L4 — Autonomous with Human Safeguard:** Fully automated background orchestration with anomaly detection and automated rollback.

---

## 1. Candidate Core 31-Agent Matrix

| Agent ID | Agent Name | Domain / Subsystem | Autonomy Level | Primary Input | Primary Output / Artifact |
|:---|:---|:---|:---:|:---|:---|
| **AGT-01** | `IdentitySyncAgent` | Auth & Onboarding | **L3** | Clerk Webhook / JWT | Synchronized PostgreSQL User & Profile |
| **AGT-02** | `OnboardingAdvisorAgent` | Profile Discovery | **L1** | Persona & Academic Tier | Recommended Discovery Journey Profile |
| **AGT-03** | `DocumentIngestionAgent` | Document Pipeline | **L3** | Uploaded PDF/DOCX | S3 Presigned Key & Raw Text Dump |
| **AGT-04** | `OcrFallbackAgent` | Document Pipeline | **L3** | Scanned / Low-DPI PDF | Cleaned Structured Text Stream |
| **AGT-05** | `ResumeExtractionAgent` | Intelligence Core | **L2** | Document Text Stream | Pydantic Extracted Candidate Schema |
| **AGT-06** | `VerificationUiAgent` | Human-in-the-Loop | **L2** | Extracted Resume Payload | Side-by-Side User Correction Interface |
| **AGT-07** | `CanonicalSkillMapperAgent` | Taxonomy Engine | **L3** | Raw Extracted Skill Strings | Mapped Canonical Skill UUIDs & Aliases |
| **AGT-08** | `SkillStateModelingAgent` | Algorithm A | **L3** | Skill Claims & Evidence | Bayesian Belief State (0.0–1.0) |
| **AGT-09** | `RecencyDecayAgent` | Algorithm A | **L3** | Timestamped Evidence | Calibrated Temporal Decay Multiplier |
| **AGT-10** | `OccupationBenchmarkAgent` | Labor Market Intel | **L0** | Target Occupation Code | Benchmark Competency Profile |
| **AGT-11** | `SkillGapScoringAgent` | Algorithm B | **L3** | Candidate vs Target Skills | Evidence-Weighted Gap Vector & Fit Score |
| **AGT-12** | `PrerequisiteGraphAgent` | Graph Engine | **L0** | Skill Competencies | Prerequisite DAG Adjacency Matrix |
| **AGT-13** | `CycleDetectionAgent` | Graph Engine | **L3** | Milestone Relationships | DAG Verification (Cycle-Free Guarantee) |
| **AGT-14** | `TopologicalRoadmapAgent` | Algorithm C | **L3** | Gaps, DAG & Time Budget | 3-Phase Milestone Learning Roadmap |
| **AGT-15** | `CurriculumCourseAgent` | Learning Resources | **L1** | Target Skill Milestone | Curated High-Yield Open Course Modules |
| **AGT-16** | `ProjectScaffoldingAgent` | Practical Learning | **L1** | Milestone Learning Goal | Portfolio Project Brief & GitHub Template |
| **AGT-17** | `MilestoneProgressAgent` | Learner Tracking | **L3** | Task Toggle / Completion | Updated Roadmap Readiness Score |
| **AGT-18** | `IrtQuestionSelectorAgent` | Formative Assessment | **L3** | Latent Ability Estimate $\theta$ | Maximized Fisher Information Item |
| **AGT-19** | `AdaptiveQuizScoringAgent` | Formative Assessment | **L3** | Candidate Response Vector | Updated Bayesian $\theta$ Skill Score |
| **AGT-20** | `FormativeFeedbackAgent` | Formative Assessment | **L1** | Incorrect Response Option | Socratic Explanation & Remedial Link |
| **AGT-21** | `SemanticSearchAgent` | RAG Engine | **L0** | User Query Embedding | Grounded Course & Skill Text Chunks |
| **AGT-22** | `CareerCompanionAgent` | Career Guidance | **L1** | Learner Prompt & Context | Streaming Chat with Source Citations |
| **AGT-23** | `GuardrailFilterAgent` | Safety & Governance | **L4** | Companion Response Stream | Policy Filtered Output (Zero Jailbreak) |
| **AGT-24** | `TransactionalEmailAgent` | Notification Core | **L3** | Lifecycle Event | Resend Branded Email Trigger |
| **AGT-25** | `RateLimitPoliceAgent` | API Security | **L4** | Client IP & User Token | Sliding-Window Pass/Block Token |
| **AGT-26** | `CryptoShreddingAgent` | DPDP Compliance | **L4** | Right-to-Erasure Request | Permanent R2 Deletion & Cascade Purge |
| **AGT-27** | `AuditChainSignerAgent` | Security Ledger | **L4** | Security-Sensitive Event | SHA-256 Chained Hash Log Entry |
| **AGT-28** | `CacheOrchestratorAgent` | Performance | **L3** | Taxonomy & Role Queries | 24h Upstash Redis Cached Result |
| **AGT-29** | `FailoverRouterAgent` | AI Acceleration | **L4** | Provider 429/500 Exception | Gemini &rarr; Groq &rarr; OpenRouter Fallback |
| **AGT-30** | `ReadinessForecastAgent` | Analytics | **L1** | Milestone Trajectory | Estimated Weeks to Job-Ready Milestone |
| **AGT-31** | `GrievanceRoutingAgent` | Regulatory Ethics | **L0** | Candidate Complaint | Ticket Dispatched to GRO (`gro@unnati.dev`) |
