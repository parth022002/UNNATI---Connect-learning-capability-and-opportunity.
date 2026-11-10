# UNNATI — Design System & Visual Strategy

**Product:** UNNATI (उन्नति) — Your Growth Companion  
**Campaign:** *Learn. Build. Grow. Succeed.*  
**Version:** 2.0 (Inclusive, Modern, Human-Centred)  

---

## 1. Brand Identity & Logo Guidelines

### 1.1 Official Wordmark & Tagline
- **Primary Wordmark:** `UNNATI (उन्नति)`
- **Official Tagline:** `Your Growth Companion.`
- **Campaign Line:** `Learn. Build. Grow. Succeed.`

### 1.2 Logo Presentation Standards
1. **Header Display:** The logo mark is rendered at **48px &times; 48px** minimum with a generous clear-space ring and crisp border. The wordmark is set in `font-heading font-extrabold text-xl` paired with the Devanagari script `(उन्नति)` and the subtitle `Your Growth Companion`.
2. **Footer Display:** The logo mark is rendered prominently at **56px &times; 56px**, establishing brand permanence and institutional authority.
3. **Favicons & Touch Icons:** High-DPI icons generated from the source artwork at `32x32`, `180x180`, and vector SVG.
4. **Distortion & Recreation Prohibitions:** Never recreate the logo using generic font icons or emoji; always source from `/logo.png`.

---

## 2. Color System & Semantic Tokens

UNNATI balances the institutional gravitas of **Deep Indigo** with the optimism and energy of **Indian Saffron**, grounded by warm, clean surfaces for maximum reading comfort and accessibility.

### 2.1 Core Palette

| Token Name | Hex Code | Semantic Role |
|:---|:---|:---|
| `unnati.indigo` | `#4C1D95` | Brand Foundation, primary hero titles, prominent action backgrounds. |
| `unnati.violet` | `#6D28D9` | Interactive links, active tab borders, secondary gradients. |
| `unnati.violet-light` | `#7C3AED` | Focus rings, vibrant hover states, accent highlights. |
| `unnati.saffron` | `#EA580C` | Primary conversion CTAs (*Get Started*, *Launch Roadmap*), milestones. |
| `unnati.saffron-bright` | `#FF8A00` | Saffron gradient glow, beacon indicators, progress badges. |
| `unnati.midnight` | `#0F172A` | Primary body headings, dark contrast elements. |
| `unnati.cloud` | `#F8FAFC` | Warm neutral page canvas, gentle light backgrounds. |
| `surface.card` | `#FFFFFF` | Crisp elevated content cards with subtle borders. |
| `emerald.success` | `#059669` | Verified skills, completed milestones, DPDP compliance checkmarks. |

### 2.2 Semantic State Tiers (Plain English)

| State Tier | Plain English Label | UI Visual Treatment |
|:---|:---|:---|
| `CLAIMED` | **Self-Reported** | Slate badge, neutral border (baseline reported by user). |
| `INFERRED` | **Extracted from Resume** | Sky blue badge, AI-assisted extraction via Gemini. |
| `ASSESSED` | **Diagnostic Verified** | Purple badge, evaluated through formative skill quizzes. |
| `VERIFIED` | **Certified / Demonstrated** | Emerald badge, backed by credentials or capstone projects. |

---

## 3. Typography Hierarchy

UNNATI pairs **Poppins** (for friendly, authoritative, modern headings) with **Inter** (for high-legibility UI controls and body prose).

- **Display Headings (`h1`):** `font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]`
- **Section Titles (`h2`):** `font-heading text-2xl sm:text-3xl font-extrabold tracking-tight`
- **Card Titles (`h3`):** `font-heading text-lg sm:text-xl font-bold tracking-tight`
- **Body Prose (`p`):** `font-sans text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed`
- **Labels & Captions:** `font-sans text-xs sm:text-sm font-semibold tracking-wide`
- **Micro-Copy & Metadata:** `font-sans text-xs text-slate-500 font-medium` (never below 11px)

---

## 4. Layout, Spacing & Container Hierarchy

- **Global Page Container:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- **Reading Container (Docs/Privacy):** `mx-auto max-w-4xl px-4 sm:px-6`
- **Section Vertical Spacing:** `py-16 sm:py-24`
- **Card Padding:** `p-6 sm:p-8`
- **Grid Gaps:** `gap-6 sm:gap-8`
- **Corner Radii:** Cards `rounded-3xl` (24px); Buttons `rounded-xl` (12px); Badges `rounded-full`.

---

## 5. Tone of Voice & Content Standards

| Technical / Intimidating Formulation | Human-Centred, Encouraging Standard |
|:---|:---|
| *Topological Milestone DAG Optimizer* | **Your Personalised Learning Roadmap** |
| *Evidence-Weighted Bayesian Belief Matrix* | **Your Verified Skill Inventory** |
| *Algorithm B Competency Gap Engine* | **Skills Needed for Your Target Career** |
| *Item Response Theory $\theta$ Assessment* | **Diagnostic Skill Check** |
| *Autonomous L2 AI Agent* | **UNNATI — Your AI Career Mentor** |
| *Multi-Modal Ingestion Pipeline* | **Build Your Profile from Your Resume** |
| *Inspect Graph Nodes* | **View Study Modules & Projects** |
| *Monolithic Tech Stack Focus* | **Paths for Tech, Business, Finance, Design & Analytics** |
| *Required for 100% Readiness* | **Recommended Skills to Strengthen Your Profile** |

---

## 6. Global AI Career Companion Widget Standards

- **Placement:** Docked persistently at `fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40`.
- **Launcher Badge:** Warm indigo-violet gradient pill with 24px logo, pulsing emerald beacon, and `Ask UNNATI AI` label.
- **Universal Persona Selector:** 6 1-click persona tabs (`All Topics`, `Students & Freshers`, `Business & Marketing`, `Finance & Analytics`, `Tech & Design`, `Career Switchers`) to ensure any type of learner immediately receives relevant starter questions.
- **Footer Clearance:** All page footers must enforce `pb-24 sm:pb-8` and right-hand clearance (`sm:pr-32`) to guarantee the launcher badge never obscures statutory links or text.

---

## 7. Continuous Growth Cycle Pattern

Growth is designed not as a terminal test, but as a continuous 6-stage loop:
$$\text{Discover} \longrightarrow \text{Understand} \longrightarrow \text{Build} \longrightarrow \text{Demonstrate} \longrightarrow \text{Grow} \longrightarrow \text{Reassess} \longrightarrow \text{Discover}$$

1. **Discover Direction:** Explore 20+ validated career trajectories.
2. **Understand Baseline:** Ingest resume, coursework, and claimed competencies.
3. **Identify Gaps:** Evidence-weighted competency delta against industry benchmarks.
4. **Build Roadmap:** 3-phase topological milestone plan tailored to weekly hours.
5. **Demonstrate Capability:** Complete hands-on capstone projects and diagnostic practice checks.
6. **Reassess & Level Up:** Live Bayesian updates promote skills to Verified; candidate loops to higher goals.

---

## 8. Responsible Metrics & Claims Standards

- **Salary Figures:** Always distinguish between median and range (e.g. *Median: ₹18.0L CTC; Range: ₹12.0L – ₹24.0L CTC*). Never label a range as a median.
- **Sample Disclaimers:** All sandbox calculators must carry the notice: *"\*Illustrative sample diagnostic based on curated labor market benchmarks."*
- **No Artificial Guarantees:** UNNATI strictly provides formative capability enhancement, verifiable milestone evidence, and readiness scoring—never artificial placement guarantees.

