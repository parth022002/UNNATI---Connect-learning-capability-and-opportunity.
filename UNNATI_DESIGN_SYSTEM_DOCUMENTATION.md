# UNNATI — Design System Documentation
## Premium SaaS UI/UX Guidelines, Tokens & Component Specifications

**Document Version:** 1.0.0  
**Design Philosophy:** Modern, Warm, Sophisticated, Highly Functional, WCAG 2.2 AA Compliant  
**Core Motif:** Connecting Potential to Opportunity (Deep Indian Indigo, Royal Violet, Energetic Saffron, Clean Slate)  

---

## 1. Design Principles

1. **Clear Visual Hierarchy:** High information density without visual clutter. Use typography scales, whitespace, and subtle tonal borders to distinguish levels of importance.
2. **Intentional Motion:** Animations must serve a UX purpose (e.g., guide focus, provide feedback, reveal progressive disclosure) and respect `prefers-reduced-motion`.
3. **Cohesive SaaS Grouping:** Features are structured around the user journey:
   - **Discover** (Career Explorer)
   - **Understand** (Skill Gap Analysis & ATS Resume Check)
   - **Build** (Curated Learning Hub & Roadmap Milestones)
   - **Demonstrate** (AI-Proctored Assessments & AI Interview Studio)
   - **Grow** (Global Job Discovery & AI Career Companion)
4. **Accessible by Default:** All text meets or exceeds WCAG 2.2 AA contrast ratios ($4.5:1$ for normal body text, $3:1$ for large headings). Keyboard navigability and visible focus rings on all interactive elements.

---

## 2. Color System & Design Tokens

### 2.1 Primary Brand Palette
```css
/* Core Brand Hues */
--color-unnati-indigo: #4C1D95;        /* Deep Primary Indigo */
--color-unnati-indigo-dark: #310F68;   /* Night Indigo (Header/Footer emphasis) */
--color-unnati-indigo-light: #5B21B6;  /* Interactive Hover Indigo */

--color-unnati-violet: #6D28D9;        /* Royal Violet (Primary Buttons & Accents) */
--color-unnati-violet-light: #7C3AED;  /* High-Contrast Interactive Violet */
--color-unnati-violet-soft: #EDE9FE;   /* Subtle Pill / Badge Background */
--color-unnati-violet-tint: #F5F3FF;   /* Card Surface Tint */

--color-unnati-saffron: #EA580C;       /* Energetic Warmth & Highlights */
--color-unnati-saffron-bright: #FF8A00;/* Call-to-action glow & pulse indicators */
--color-unnati-saffron-soft: #FFF7ED;  /* Saffron badge background */

--color-unnati-teal: #14B8A6;          /* Growth & Success Verification */
```

### 2.2 Neutral & Surface Palette
```css
--color-bg-primary: #F8FAFC;           /* Slate 50 - Main Application Canvas */
--color-bg-surface: #FFFFFF;           /* Pure White - Primary Card & Container */
--color-bg-card-hover: #F1F5F9;        /* Slate 100 - Interactive Card Hover */
--color-border-subtle: #E2E8F0;        /* Slate 200 - Structure & Card Borders */
--color-border-strong: #CBD5E1;        /* Slate 300 - Input & Active Borders */

--color-text-primary: #0F172A;         /* Slate 900 - High-Contrast Headings */
--color-text-secondary: #334155;       /* Slate 700 - Body Copy & Labels */
--color-text-muted: #64748B;           /* Slate 500 - Captions & Helper Text */
```

### 2.3 Semantic Status Palette
- **Success (`VERIFIED`):** Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46` (Emerald).
- **Assessed (`ASSESSED`):** Background `#F5F3FF`, Border `#DDD6FE`, Text `#5B21B6` (Royal Violet).
- **Inferred (`INFERRED`):** Background `#F0F9FF`, Border `#BAE6FD`, Text `#0369A1` (Sky).
- **Claimed (`CLAIMED`):** Background `#F8FAFC`, Border `#E2E8F0`, Text `#475569` (Slate).
- **Warning / Alert:** Background `#FFFBEB`, Border `#FDE68A`, Text `#92400E` (Amber).
- **Destructive / Error:** Background `#FEF2F2`, Border `#FECACA`, Text `#991B1B` (Rose).

---

## 3. Typography Scale

- **Display Heading 1:** `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight` (Poppins/Inter)
- **Section Heading 2:** `text-2xl sm:text-3xl font-bold tracking-tight`
- **Card Heading 3:** `text-lg sm:text-xl font-bold tracking-tight text-slate-900`
- **Subheading / Section Label:** `text-xs uppercase tracking-wider font-bold text-unnati-violet`
- **Body Regular:** `text-sm sm:text-base leading-relaxed text-slate-700`
- **Caption / Meta Text:** `text-xs text-slate-500 font-medium`

---

## 4. Component Standards

### 4.1 Buttons
- **Primary:** `bg-gradient-to-r from-unnati-indigo to-unnati-violet hover:opacity-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-soft-sm transition-all focus-visible:ring-2 focus-visible:ring-purple-400`
- **Secondary / Ghost:** `border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2.5 px-4 rounded-xl shadow-soft-sm transition-all`
- **Accent:** `bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-bold py-2 px-4 rounded-xl shadow-soft-sm`

### 4.2 Cards & Containers
- **Standard Card:** `bg-white border border-slate-200/80 rounded-2xl shadow-soft-sm p-6 hover:border-slate-300 transition-all`
- **Elevated Interactive Card:** `bg-white border border-slate-200 rounded-2xl shadow-soft-sm hover:shadow-soft-md hover:border-purple-200 transition-all duration-200`
- **Glassmorphic Hero Card:** `bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-soft-lg`

### 4.3 Form Inputs & Search Fields
- **Search Field:** `w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all`
- **Dropdown / Select:** `px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-purple-300`

---

## 5. Navigation & Global Shell Architecture

### 5.1 Desktop Header (Authenticated SaaS Layout)
Organized into 5 logical domains to eliminate horizontal crowding:
1. **Overview:** Direct link to `Dashboard` (`/dashboard`).
2. **Career:** Dropdown containing `Career Explorer` (`/explore`), `Career Roadmap` (`/roadmap`), and `Skills Inventory` (`/dashboard#skills`).
3. **Learn:** Dropdown containing `Learning Hub` (`/assessments?tab=learn`) and `Capstone Examinations` (`/examinations`).
4. **Prepare:** Dropdown containing `AI Interview Studio` (`/interviews`) and `AI Resume Studio & ATS` (`/resumes`).
5. **Opportunities:** Direct link to `Job Discovery` (`/jobs`).
6. **Utility Strip:** `AI Companion` quick trigger pill (`Sparkles` icon) + Clerk `UserButton`.

### 5.2 Mobile Responsive Navigation
- Accessible slide-over drawer triggered via hamburger button.
- Grouped accordion sections mirroring the desktop hierarchy.
- Direct quick links to AI Companion, Profile, and Sign Out.
- Touch-friendly 44px+ hit targets.

