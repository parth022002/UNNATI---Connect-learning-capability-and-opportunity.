from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.routes.users import get_db_user
from app.schemas.assessment import (
    AssessmentQuestionResponse,
    AssessmentOption,
    AssessmentSubmissionRequest,
    AssessmentSubmissionResponse,
    SkillUpdateDetail,
    InterviewPrepQuestionResponse
)
from app.services.skill_service import assess_candidate_skill
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/assessments", tags=["assessments"])

# Canonical Assessment Bank with Private Answer Keys & Explanations
ASSESSMENT_QUESTION_BANK: List[Dict[str, Any]] = [
    # Business Track
    {
        "id": 1,
        "track": "business",
        "skill": "Product Prioritization",
        "category": "business",
        "difficulty": "Intermediate",
        "prompt": "When prioritizing features under the RICE framework, what happens if an initiative has very high Effort with moderate Reach and Impact?",
        "scenario": "Your team is deciding between building an automated PDF exporter (Reach: 200, Impact: 1, Confidence: 80%, Effort: 5 person-weeks) versus a 1-click Quick Filter (Reach: 5,000, Impact: 2, Confidence: 90%, Effort: 1 person-week).",
        "options": [
            {"id": "A", "text": "The high-effort project receives a higher RICE score because difficulty signals strategic differentiation."},
            {"id": "B", "text": "Effort is the denominator in RICE: higher effort drastically reduces the overall score, making quick-win high-reach items rank higher."},
            {"id": "C", "text": "Effort is multiplied with Reach and Impact, so higher effort increases the project score."},
            {"id": "D", "text": "The RICE framework does not account for development effort."}
        ],
        "correct_option_id": "B",
        "explanation": "In RICE = (Reach × Impact × Confidence) / Effort, Effort is in the denominator. When effort is high relative to reach and impact, the priority score drops, ensuring teams focus on maximum ROI first.",
        "practical_takeaway": "Use RICE or MoSCoW to prevent high-effort edge-case features from delaying high-impact core user value."
    },
    {
        "id": 2,
        "track": "business",
        "skill": "Business Metrics & Analytics",
        "category": "business",
        "difficulty": "Foundational",
        "prompt": "If your subscription platform observes that Customer Acquisition Cost (CAC) is ₹4,500 and Customer Lifetime Value (LTV) is ₹3,000, what is the core business problem?",
        "scenario": "A direct-to-consumer educational subscription startup scales marketing spend by 300% without verifying renewal rates.",
        "options": [
            {"id": "A", "text": "The platform is highly profitable because acquisition is outpacing churn."},
            {"id": "B", "text": "The unit economics are unsustainable (LTV:CAC < 1:1); the company loses money on every acquired customer."},
            {"id": "C", "text": "The platform should immediately double advertising spend to lower the LTV."},
            {"id": "D", "text": "LTV and CAC have no direct relationship in business financial health."}
        ],
        "correct_option_id": "B",
        "explanation": "Healthy unit economics generally require an LTV to CAC ratio of at least 3:1. When LTV is lower than CAC, every newly acquired customer destroys value rather than generating profit.",
        "practical_takeaway": "Focus on improving retention/expansion revenue or reducing acquisition channels before scaling customer acquisition."
    },
    # Data Track
    {
        "id": 3,
        "track": "data",
        "skill": "Data-Driven Decision Making",
        "category": "data",
        "difficulty": "Intermediate",
        "prompt": "In an A/B test with 50,000 users per variant, Variant B shows a 4% lift in click-through rate with p = 0.01. What does this statistical result indicate?",
        "scenario": "An e-commerce checkout page tests a sticky 'Buy Now' button against the classic static placement.",
        "options": [
            {"id": "A", "text": "There is only a 1% probability that Variant B works."},
            {"id": "B", "text": "The observed lift is statistically significant (p < 0.05), meaning it is very unlikely to be caused by random chance alone."},
            {"id": "C", "text": "All users in Variant B will unconditionally purchase the product."},
            {"id": "D", "text": "The test is inconclusive and must run for another year."}
        ],
        "correct_option_id": "B",
        "explanation": "A p-value of 0.01 (below the standard threshold of 0.05) means there is only a 1% chance the observed difference happened under the null hypothesis (random noise).",
        "practical_takeaway": "Combine statistical significance with practical significance to ensure metric lifts warrant product rollout."
    },
    {
        "id": 4,
        "track": "data",
        "skill": "SQL & Relational Querying",
        "category": "data",
        "difficulty": "Foundational",
        "prompt": "Which SQL construct allows filtering aggregations produced by a GROUP BY clause?",
        "scenario": "You need to retrieve departments that have more than 15 active employees from an employee database.",
        "options": [
            {"id": "A", "text": "WHERE COUNT(*) > 15"},
            {"id": "B", "text": "HAVING COUNT(*) > 15"},
            {"id": "C", "text": "ORDER BY COUNT(*) > 15"},
            {"id": "D", "text": "LIMIT 15"}
        ],
        "correct_option_id": "B",
        "explanation": "WHERE filters raw rows before aggregation, while HAVING filters aggregated group metrics produced after GROUP BY.",
        "practical_takeaway": "Use WHERE to eliminate unneeded raw records early, and HAVING exclusively for thresholding group aggregates."
    },
    # Tech Track
    {
        "id": 5,
        "track": "tech",
        "skill": "Web Architecture & API Design",
        "category": "technical",
        "difficulty": "Intermediate",
        "prompt": "Why should web applications handle long-running operations (such as document processing or video rendering) via asynchronous background tasks rather than synchronous HTTP requests?",
        "scenario": "A user uploads a 50MB resume PDF for parsing and OCR extraction.",
        "options": [
            {"id": "A", "text": "Synchronous HTTP requests block browser connections, cause gateway timeouts (504), and degrade user experience."},
            {"id": "B", "text": "HTTP does not allow transmitting files larger than 10 kilobytes."},
            {"id": "C", "text": "Because background tasks cannot be executed in cloud environments."},
            {"id": "D", "text": "Synchronous requests automatically crash database servers."}
        ],
        "correct_option_id": "A",
        "explanation": "Standard web requests expect responses within milliseconds. Long tasks block server worker threads and cause browser client timeouts. Decoupling work into background workers with task status polling or webhooks provides resilience.",
        "practical_takeaway": "Always offload jobs taking longer than 500ms to background task queues or async workers."
    },
    {
        "id": 6,
        "track": "tech",
        "skill": "System Design & Architecture",
        "category": "technical",
        "difficulty": "Advanced",
        "prompt": "In an event-driven microservices architecture, how can idempotent consumer endpoints prevent duplicate side-effects from at-least-once message delivery?",
        "scenario": "A payment processing queue delivers the same 'charge_user' webhook twice within 2 seconds due to an intermittent network retry.",
        "options": [
            {"id": "A", "text": "By discarding all messages arriving with odd timestamps."},
            {"id": "B", "text": "By tracking processed idempotency keys in a fast persistent store (e.g. Redis/PostgreSQL) and skipping duplicate executions."},
            {"id": "C", "text": "By running only one server instance worldwide."},
            {"id": "D", "text": "Idempotency cannot be achieved in distributed computing."}
        ],
        "correct_option_id": "B",
        "explanation": "Tracking unique event IDs or client-supplied idempotency keys ensures that re-delivered messages execute the underlying state modification exactly once, returning the cached outcome for subsequent duplicates.",
        "practical_takeaway": "Attach unique idempotency tokens to all mutating operations across distributed systems."
    },
    # Finance Track
    {
        "id": 7,
        "track": "finance",
        "skill": "Financial Analysis & Valuation",
        "category": "finance",
        "difficulty": "Intermediate",
        "prompt": "In a Discounted Cash Flow (DCF) model, what effect does an increase in the Weighted Average Cost of Capital (WACC) have on the enterprise value?",
        "scenario": "Rising central bank interest rates increase the risk-free rate, elevating the company's cost of capital from 9% to 12%.",
        "options": [
            {"id": "A", "text": "Enterprise value increases because higher discount rates signify higher company growth."},
            {"id": "B", "text": "Enterprise value decreases because future cash flows are discounted at a higher hurdle rate, reducing their present value."},
            {"id": "C", "text": "WACC has no effect on present value calculations."},
            {"id": "D", "text": "The company's historical earnings are doubled."}
        ],
        "correct_option_id": "B",
        "explanation": "WACC is the denominator in DCF present value calculations: PV = CF / (1 + WACC)^t. As the discount rate rises, each dollar of projected future cash flow is worth less today.",
        "practical_takeaway": "Understand cost of capital sensitivity when valuing early-stage or capital-intensive ventures in changing interest rate environments."
    }
]

# Curated Role-Specific Interview Preparation Scenarios & Rubrics
INTERVIEW_PREP_BANK: List[Dict[str, Any]] = [
    {
        "id": 1,
        "role": "Full-Stack Software Engineer",
        "track": "tech",
        "category": "system_design",
        "question": "How would you design a resilient file ingestion and extraction service for UNNATI that scales to 10,000 resumes daily without dropping requests?",
        "scenario": "During peak placement season, 5,000 university students upload PDF/DOCX resumes simultaneously within a 2-hour window.",
        "evaluation_rubric": [
            "Decoupling upload ingestion from heavy OCR/parsing via pre-signed S3 storage and message queue (e.g. SQS, Celery, Redis)",
            "Handling transient extraction failures with exponential backoff retries and Dead Letter Queue (DLQ)",
            "Database write batching and optimistic concurrency control for candidate profile updates",
            "Observability: metrics on queue lag, parsing latency p95, and error rates"
        ],
        "sample_approach": "1. Direct presigned upload to object store -> 2. Ingestion webhook pushes job ID to queue -> 3. Auto-scaling worker cluster consumes jobs with OCR fallback -> 4. Updates database with cryptographic audit hash -> 5. Client polls or receives WebSocket completion event.",
        "tips": [
            "Clarify throughput and SLA constraints first",
            "Draw clear boundaries between synchronous API requests and async worker tasks",
            "Explicitly discuss failure modes and idempotent re-delivery"
        ]
    },
    {
        "id": 2,
        "role": "Associate Product Manager",
        "track": "business",
        "category": "product_sense",
        "question": "If day-7 learner retention drops from 42% to 28% following the launch of a mandatory 15-question skill quiz, how would you diagnose and resolve this?",
        "scenario": "A newly introduced onboarding gate aims to capture deep skill verification but appears to increase candidate churn.",
        "evaluation_rubric": [
            "Friction analysis across funnel steps (onboarding drop-off heatmaps)",
            "Qualitative user interviews to uncover cognitive load or intimidation factors",
            "Hypothesis formulation: mandatory up-front assessment vs progressive profiling",
            "A/B experiment design: optional 3-question quick-check vs comprehensive diagnostic"
        ],
        "sample_approach": "1. Segment drop-off by user background (students vs experienced professionals) -> 2. Move assessment from blocking onboarding gate to post-signup milestone incentive -> 3. Implement progressive disclosure: start with 2 quick questions, offering the full check as a bonus roadmap accelerator.",
        "tips": [
            "Never assume user intent without funnel telemetry",
            "Balance business data needs against learner time-to-first-value",
            "Frame product decisions around user trust and momentum"
        ]
    },
    {
        "id": 3,
        "role": "Business & Data Analyst",
        "track": "data",
        "category": "case_study",
        "question": "The VP of Marketing and VP of Sales report contradictory figures for total qualified leads in Q3. How do you reconcile these numbers and establish a single source of truth?",
        "scenario": "Marketing claims 1,200 Marketing Qualified Leads (MQLs), but Sales reports only 650 Sales Accepted Leads (SALs) entered their CRM pipeline.",
        "evaluation_rubric": [
            "Audit definitions: identify exact criteria differences between MQL and SAL lifecycle stages",
            "Inspect data pipeline lineage: CRM sync delays, duplicate records, or attribution model discrepancies",
            "Develop canonical data dictionary and automated reconciliation reporting in dbt/SQL",
            "Present clear root-cause breakdown to leadership with agreed operational SLAs"
        ],
        "sample_approach": "1. Trace raw webhook logs from marketing landing pages to CRM lead objects -> 2. Quantify leads filtered out by qualification rules (e.g., student vs corporate domain) -> 3. Uncover 350 leads stuck in routing queue due to unassigned territory -> 4. Publish unified lead funnel dashboard.",
        "tips": [
            "Focus on definitions and data lineage before assigning fault",
            "Quantify each leak in the funnel with exact numbers",
            "Establish recurring metric governance so the issue does not repeat"
        ]
    }
]

@router.get("/questions", response_model=List[AssessmentQuestionResponse])
def get_assessment_questions(
    track: Optional[str] = Query(None, description="Filter by track: business, data, tech, finance"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Foundational, Intermediate, Advanced")
):
    """
    Retrieves assessment questions for skill diagnostic evaluation.
    Sensitive answer keys and explanations are omitted from the response.
    """
    results = []
    for q in ASSESSMENT_QUESTION_BANK:
        if track and track.lower() != "all" and q["track"].lower() != track.lower():
            continue
        if difficulty and q["difficulty"].lower() != difficulty.lower():
            continue
        
        results.append(
            AssessmentQuestionResponse(
                id=q["id"],
                track=q["track"],
                skill=q["skill"],
                difficulty=q["difficulty"],
                prompt=q["prompt"],
                scenario=q.get("scenario"),
                options=[AssessmentOption(**opt) for opt in q["options"]],
                estimated_minutes=2
            )
        )
    return results

@router.post("/submit", response_model=AssessmentSubmissionResponse)
def submit_assessment_answer(
    submission: AssessmentSubmissionRequest,
    user: User = Depends(get_db_user),
    db: Session = Depends(get_db)
):
    """
    Submits a candidate's answer to an assessment question.
    Validates correctness, calculates score, updates Bayesian skill proficiency,
    promotes skill state to ASSESSED, and logs an audit trail event.
    """
    question = next((q for q in ASSESSMENT_QUESTION_BANK if q["id"] == submission.question_id), None)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {submission.question_id} not found."
        )

    is_correct = submission.selected_option_id.upper() == question["correct_option_id"].upper()
    score = 1.0 if is_correct else 0.45

    # Update candidate skill with Bayesian calibration and promote to ASSESSED
    updated_cs = assess_candidate_skill(
        db=db,
        user=user,
        skill_name=question["skill"],
        category=question.get("category", "general"),
        score=score
    )

    # Cryptographic Audit Log
    log_action(
        db=db,
        action="ASSESSMENT_COMPLETED",
        user_id=user.id,
        resource_id=str(submission.question_id),
        metadata={
            "track": question["track"],
            "skill": question["skill"],
            "is_correct": is_correct,
            "score": score,
            "selected_option": submission.selected_option_id,
            "time_taken_seconds": submission.time_taken_seconds
        }
    )

    skill_update = SkillUpdateDetail(
        skill_name=question["skill"],
        category=question.get("category", "general"),
        state=updated_cs.state,
        proficiency=updated_cs.proficiency,
        confidence=updated_cs.confidence,
        evidence_count=updated_cs.evidence_count
    )

    return AssessmentSubmissionResponse(
        question_id=submission.question_id,
        is_correct=is_correct,
        correct_option_id=question["correct_option_id"],
        score=score,
        explanation=question["explanation"],
        practical_takeaway=question["practical_takeaway"],
        skill_update=skill_update
    )

@router.get("/interview-prep", response_model=List[InterviewPrepQuestionResponse])
def get_interview_prep(
    role: Optional[str] = Query(None, description="Filter by target career role"),
    track: Optional[str] = Query(None, description="Filter by track: business, data, tech, finance")
):
    """
    Retrieves curated role-specific interview preparation questions,
    scenario frameworks, evaluation rubrics, and model approaches.
    """
    results = []
    for item in INTERVIEW_PREP_BANK:
        if role and role.lower() not in item["role"].lower():
            continue
        if track and track.lower() != "all" and item["track"].lower() != track.lower():
            continue
        results.append(InterviewPrepQuestionResponse(**item))
    return results

