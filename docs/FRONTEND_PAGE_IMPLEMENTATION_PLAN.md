# UNNATI — Page-by-Page Implementation Plan

**Product:** UNNATI (उन्नति) — Your Growth Companion  
**Version:** 2.0 (Inclusive, Modern, Human-Centred)  

---

## 1. Overview of Application Routes

```
Public Experiences:
├── /                     → Public Landing Page (Brand, Vision, Audience Paths, How It Works, Features, FAQ)
├── /explore              → Multi-Disciplinary Career Discovery & Trajectory Comparison
├── /assessments          → Diagnostic Skill Check & Formative Quiz Interface
└── /privacy              → DPDP Statutory Privacy Notice & Rights Center

Authenticated Learner Experiences:
├── /dashboard            → Comprehensive Learner Growth Dashboard & Profile Hub
├── /roadmap              → Personalised 3-Phase Milestone Roadmap & Skill Gaps
└── /onboarding           → Guided 5-Step Learner Profile Setup Wizard

Global Overlays & Modals:
├── Navbar.tsx            → Public & Authenticated Responsive Header with 48px Logo
├── Footer.tsx            → Multi-Column Brand Footer with 56px Logo & Campaign Slogan
├── CareerCompanionDrawer → AI Career Mentor Slide-Over Drawer
└── ConsentModal.tsx      → Bilingual DPDP 2026 Statutory Notice-and-Consent Modal
```

---

## 2. Route Specifications

### 2.1 Public Landing Page (`/`)
* **Objective:** Introduce UNNATI to visitors who have never heard of the platform in under 5 seconds.
* **Audiences:** Students, recent graduates, early-career talent, career switchers, and university partners.
* **Key Sections:**
  1. **Brand Hero:** High-visibility logo mark, warm lighting, aspirational headline (*"Your career journey deserves a clear direction"*), dual CTAs (*Start Your Journey* & *Explore Career Paths*), and interactive product preview card.
  2. **Audience Pathways:** 4 interactive pathway selector cards (*I am a Student*, *I am a Recent Graduate*, *I am a Professional*, *I want to Switch Careers*).
  3. **How UNNATI Works:** 5-stage human journey (*Discover &rarr; Understand &rarr; Build &rarr; Demonstrate &rarr; Grow*).
  4. **Multi-Disciplinary Career Pathways:** Showcase Technology, Business & Management, Data & Analytics, Finance, Product Design, and Operations.
  5. **Interactive Skill Gap Explainer:** Plain-English interactive sandbox showing how target benchmarks and study hours are calculated.
  6. **Trust, Ethics & Privacy:** DPDP 2026 compliance, non-Annex III formative guidance, and 72-hour crypto-shredding commitment.
  7. **Frequently Asked Questions:** Expandable accordion answering common queries in accessible language.
  8. **Final Conversion CTA:** Clean banner with direct sign-up action.

### 2.2 Career Discovery & Exploration (`/explore`)
* **Objective:** Enable learners to discover diverse career trajectories, compare real-world requirements, and choose a target career.
* **Tracks Included:**
  - Product Manager (Business & Strategy)
  - Business Intelligence & Data Analyst (Analytics)
  - Financial Analyst & FinTech Associate (Finance)
  - Product & UX Designer (Design & Research)
  - Senior Full-Stack Engineer (Technology)
  - Generative AI & Systems Specialist (Emerging Tech)
  - Operations & Supply Chain Lead (Operations)
  - Cloud & DevOps Engineer (Infrastructure)
* **Features:** Search by title/skill, category filters, median CTC indicators (in LPA), difficulty level, estimated study weeks, side-by-side comparison modal, and *"Set as My Target Career"* button.

### 2.3 Diagnostic Skill Check (`/assessments`)
* **Objective:** Provide a distraction-free, encouraging formative evaluation to verify existing capabilities and update confidence scores.
* **Features:** Topic selector (Analytical Reasoning, Product Strategy, Modern Web Development, Python & Data), 5-minute timer, progress bar, clear scenario-based questions, instant formative explanations with citations, and celebration summary screen.

### 2.4 Learner Growth Dashboard (`/dashboard`)
* **Objective:** Serve as the learner's central command center answering: *Where am I?*, *What is my goal?*, *What progress have I made?*, and *What should I do next?*
* **Features:**
  - Warm, personal greeting (*"Welcome back, [Name]!"*).
  - Profile completeness progress ring with clear next steps.
  - Stat cards: Skills Mapped, Verified Skills, Readiness Score, Documents Analyzed.
  - Skill Inventory organized into 4 clear plain-English tiers (*Self-Reported*, *Extracted from Resume*, *Diagnostic Verified*, *Certified*).
  - Resume upload dropzone with Gemini extraction review modal.
  - Next Action cards (*Take a Practice Check*, *View Your Roadmap*, *Explore Careers*).

### 2.5 Personalised Learning Roadmap (`/roadmap`)
* **Objective:** Provide a clear, step-by-step learning guide with milestones, estimated study hours, practical project sprints, and curated resources.
* **Features:**
  - Role switcher with readiness gauge.
  - Toggle between **Milestone Study Path** and **Skill Gap Diagnostic**.
  - 3 structured phases: Phase 1 (Core Foundations), Phase 2 (Applied Capability), Phase 3 (Industry Capstone).
  - Task checkboxes allowing learners to check off completed modules.
  - Project sprint briefs with clear evaluation rubrics.

### 2.6 Guided 5-Step Onboarding (`/onboarding`)
* **Objective:** Onboard learners with zero friction, capturing essential context to personalize their experience without cognitive overload.
* **Steps:** Step 1 (Persona), Step 2 (Career Direction), Step 3 (Academic Background), Step 4 (Current Skills), Step 5 (Time Commitment & Goal).

### 2.7 AI Career Mentor (`CareerCompanionDrawer.tsx`)
* **Objective:** Provide approachable, contextual AI career guidance.
* **Features:** Rebranded as *"UNNATI — Your AI Career Mentor"*, helpful prompt suggestions, markdown rendering, copy-to-clipboard, citation tags, and clean clear history.

### 2.8 Global Header & Enterprise Footer (`Navbar.tsx` & `Footer.tsx`)
* **Header:** Prominent 48px logo mark, readable wordmark `UNNATI (उन्नति)`, subtitle `Your Growth Companion`, public navigation links, and clear auth actions.
* **Footer:** 56px logo mark, brand mission, campaign slogan *Learn. Build. Grow. Succeed.*, 5 navigation columns (Explore, Platform, For Users, Support, Legal), and copyright.

