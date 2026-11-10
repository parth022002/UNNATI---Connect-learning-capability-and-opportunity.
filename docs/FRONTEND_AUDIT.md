# UNNATI — Comprehensive Frontend UI/UX Audit

**Date:** November 10, 2026  
**Auditor:** Principal Product Designer & Frontend Architecture Specialist  
**Product:** UNNATI (उन्नति) — Your Growth Companion  
**Campaign:** *Learn. Build. Grow. Succeed.*  

---

## 1. Executive Summary

This audit evaluates the current frontend implementation of UNNATI across visual design, user experience (UX), product positioning, accessibility, and frontend engineering.

### Key Finding 1: Invisible & Undersized Brand Identity (Logo & Wordmark)
- **Current State:** The official UNNATI logo was rendered at a diminutive 28px–38px in headers and 28px in footers, with tiny typography and low visual prominence.
- **User Impact:** High. Visitors cannot distinguish or remember the brand identity. The logo feels like an afterthought rather than establishing confidence and credibility.
- **Required Action:** Substantially enlarge the logo mark (44px–52px in header, 56px–64px in footer), pair it with a bold, legible wordmark `UNNATI (उन्नति)`, and prominent display of the official tagline *"Your Growth Companion"*.

### Key Finding 2: Severe Over-Indexing on Developer / Hacker Jargon
- **Current State:** The copy and aesthetic across all pages became dominated by software engineering and compiler terminology: *"Bayesian Belief State Machine"*, *"Topological Milestone DAG"*, *"Item Response Theory 2PL $\theta=1.25$"*, *"pgvector RAG"*, *"eBPF tracing"*, *"CPU-bound FastAPI event loops"*.
- **User Impact:** Critical. A student aiming for Business Management, Finance, Product Design, Marketing, or Data Analytics feels immediately alienated and intimidated.
- **Required Action:** Re-anchor copy in plain, encouraging, human-centred English. Transition from an intimidating dark neon hacker aesthetic to a **warm, premium, approachable multi-disciplinary career platform** accommodating Technology, Business, Analytics, Finance, Design, and Operations.

### Key Finding 3: Inadequate Footer & Missing Public Navigation
- **Current State:** The footer was a rudimentary one-line strip with barely visible links. Public navigation mixed authenticated dashboard links with unauthenticated visitor routes.
- **User Impact:** High. Prospective learners, university partners, and corporate sponsors cannot discover "How It Works", "Career Pathways", or institutional trust information.
- **Required Action:** Author a multi-column, comprehensive brand footer and separate public navigation from authenticated dashboard navigation.

---

## 2. Page-by-Page Audit Matrix

| Page / Route | Current State Issues | UX & Product Impact | Proposed Redesign Solution | Priority |
|:---|:---|:---|:---|:---:|
| **Header & Navbar** (`/`) | Logo is too small (32px); tagline is hidden; navigation exposes `/dashboard` to signed-out users. | Visitors cannot identify brand; cognitive confusion for first-time visitors. | Enlarge logo mark to 48px; display bold wordmark `UNNATI (उन्नति)` and visible tagline; provide public links (How It Works, Explore Careers, Learning, Features, About). | **P0 (Critical)** |
| **Landing Page Hero** (`/`) | Heavy dark neon aesthetic; headline *"Connect Learning, Capability & Opportunity"* is abstract; right card shows developer-only code. | Fails to explain what UNNATI is in 5 seconds; alienates non-engineers. | Warm, bright, premium atmosphere; clear value proposition: *"Your career journey deserves a clear direction"*; interactive multi-disciplinary preview card. | **P0 (Critical)** |
| **Audience Pathways** (`/`) | Missing audience-specific entry cards. | Students, graduates, working professionals, and switchers don't know where to start. | Add 4 audience selector pathways: *I am a Student*, *I am a Recent Graduate*, *I am a Professional*, *I want to Switch Careers*. | **P1 (High)** |
| **How UNNATI Works** (`/`) | Overly technical terminology (Algorithm A, B, C); DAG references. | Creates friction; user does not understand practical steps. | Reframe as clear 5-stage human journey: **Discover &rarr; Understand &rarr; Build &rarr; Demonstrate &rarr; Grow** with concrete milestones. | **P0 (Critical)** |
| **Career Exploration** (`/explore`) | Catalog limited to tech engineering roles (Full-Stack, DevOps, AI, Cloud). | Students from Commerce, Arts, Business, and Design cannot find their careers. | Expand to 8+ multi-disciplinary career tracks (Product Management, Business Analytics, Financial Analyst, UX Design, Growth Marketing, Software Systems). | **P0 (Critical)** |
| **Skills Diagnostic Quiz** (`/assessments`) | Coding question format exclusively; hardcoded Python/FastAPI questions. | Non-technical learners cannot experience assessment value. | Multi-disciplinary assessment selector (Analytical Thinking, Business Communication, React/Web, Data Interpretation) with formative feedback. | **P1 (High)** |
| **Learner Dashboard** (`/dashboard`) | Dark terminal cards; complex Bayesian formula references; small text. | Feels clinical and high-stakes rather than supportive and empowering. | Warm executive cards; profile completeness ring; clear *"Next Recommended Action"* card; clear 4-tier skill badges in plain language. | **P0 (Critical)** |
| **Career Roadmap** (`/roadmap`) | Technical DAG jargon; intimidating node lines; developer capstones. | Users want a clear study guide, not graph theory terminology. | Clear 3-Phase Milestone journey: Phase 1 (Foundations), Phase 2 (Applied Capability), Phase 3 (Industry Capstone) with weekly time budget slider. | **P0 (Critical)** |
| **5-Step Onboarding** (`/onboarding`) | High cognitive density; developer-centric role picker. | New learners abandon onboarding before seeing value. | Friendly stepped wizard with diverse career personas, role search, academic selectors, and baseline skills across multiple fields. | **P0 (Critical)** |
| **AI Career Companion** (`CareerCompanionDrawer`) | Labeled as "Autonomous L2 Agent"; prompts are developer-only. | Users feel they are testing software rather than talking to a supportive career mentor. | Rebrand as **"UNNATI — Your AI Career Mentor"**; provide prompts for resume feedback, interview prep, career switching, and study schedules. | **P1 (High)** |
| **Footer & Brand Section** (All Pages) | Undersized 28px logo; weak contrast; lacking navigation pillars. | Looks unfinished; fails to establish institutional trust. | Enterprise-grade brand footer: prominent logo, tagline, 5 structured columns (Explore, Platform, Audiences, Support, Legal), and DPDP trust badges. | **P0 (Critical)** |
| **DPDP Privacy & Consent** (`/privacy`, `ConsentModal`) | Good legal baseline, but dense formatting and low contrast text. | Users skip or reject consent due to wall-of-text fatigue. | Clean, respectful bilingual layout with clear checkboxes for formative guidance, non-Annex III status, and 72-hour crypto-shredding. | **P1 (High)** |

---

## 3. Accessibility & Technical Audit

1. **Color Contrast:** The previous dark palette featured several small text elements (`text-slate-500` on `#080B14`) that fell below the WCAG 2.2 AA threshold of 4.5:1. The redesigned palette establishes deep contrast ratios $\ge 7:1$.
2. **Typography Scale:** Explanatory text in cards was frequently set to `text-[10px]` or `text-[9px]`. The minimum body size is now standardized to `12px` (captions) and `14px` (body), with robust line heights.
3. **Clerk Auth SSR Prerender Compatibility:** In `@clerk/nextjs` Core 3, `<SignedIn>` / `<SignedOut>` components must not break static page prerendering. All navigation components now use `useAuth()` with explicit `isLoaded` hydration guards.
4. **Data Integrity:** No fabricated salary figures or fake testimonial claims. Sample benchmark figures are clearly contextualized as curated market references from O*NET and ESCO.

