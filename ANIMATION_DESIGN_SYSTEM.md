# UNNATI — Animation Design System

**System:** UNNATI Ambient Motion Architecture (उन्नति)  
**Version:** 2.0 (Production Master)  
**Author:** Designed & Developed by Parth Ahuja  
**Quality Target:** 9.5+/10 across Brand Consistency, Fluidity, Hierarchy, and Accessibility  

---

## 1. Philosophy & Purpose

At UNNATI, motion is not mere decoration. Every animation serves a specific cognitive function:
1. **Communicating Growth & Momentum:** Subtle upward drifts and forward path progressions reinforce the psychological journey from learner to industry-ready practitioner.
2. **Establishing Spatial Depth:** Multi-tiered layering (geometric grid -> ambient gradient orbs -> trajectory waves -> micro-particles) gives the digital workspace tactile sophistication inspired by leading design standards (Cerebrium, Trionn, Stripe, Linear).
3. **Guiding Focus Without Distraction:** Ambient effects operate at whisper-quiet thresholds (10%–35% opacity with 80px–105px gaussian blur) so that text legibility, cognitive load, and decision speed are never compromised.

---

## 2. Core Motion Constants & Keyframe Registry

### 2.1 CSS Keyframes (`globals.css` & `tailwind.config.ts`)

| Keyframe Name | Duration | Timing Function | Property Manipulations | Visual Intent |
| :--- | :--- | :--- | :--- | :--- |
| `ambientDrift1` | 26s | `ease-in-out` | `translate(0,0) scale(1)` -> `translate(40px,-30px) scale(1.08)` -> `translate(-30px,35px) scale(0.95)` | Organic atmospheric breathing (violet & lavender orbs) |
| `ambientDrift2` | 32s | `ease-in-out` | `translate(0,0) scale(1)` -> `translate(-45px,35px) scale(1.06)` -> `translate(35px,-25px) scale(0.94)` | Counter-weighted gentle drift (saffron & amber orbs) |
| `ambientParticle`| 14s – 26s | `ease-in-out` | `translate3d(0,0,0)` -> `translate3d(12px,-18px,0)` -> `translate3d(-10px,14px,0)` | Micro-particles floating like ambient luminescence |
| `flowDash` | 28s – 35s | `linear` | `stroke-dashoffset: 0` -> `stroke-dashoffset: -200` | Vector progression lines illustrating career trajectories |
| `floatSlow` | 9s | `ease-in-out` | `translateY(0px) rotate(0deg)` -> `translateY(-14px) rotate(1.5deg)` | Subtle flotation for hero preview badges and diagnostic pills |

---

## 3. Layering & Stacking Context

```
Viewport Top
|
|-- [z-50] Modals, Drawers (CareerCompanionDrawer.tsx), Fixed Overlays
|-- [z-40] Top Navigation (Navbar.tsx in normal document flow, relative)
|-- [z-30] Popovers, Tooltips, Dropdowns
|-- [z-20] Sticky Section Headers / Filter Bars
|-- [z-10] Main Page Content (<main>, .clean-card, interactive forms)
|-- [z-0]  Animated Background System Container (fixed inset-0, pointer-events-none)
|     |-- Layer 4: Micro-Particles (FloatingParticles.tsx)
|     |-- Layer 3: Connection Trajectory Paths (ConnectionPaths.tsx)
|     |-- Layer 2: Ambient Gradient Orbs (GradientOrbs.tsx)
|     +-- Layer 1: Technical Geometric Grid (GeometricGrid.tsx)
|
Viewport Bottom
```

---

## 4. Variant Presets & Aesthetic Tuning

### 4.1 `landing`
- **Atmosphere:** Expansive, aspirational, high-energy yet grounded.
- **Components:** Full 5-orb ambient gradient cascade, 22 floating particles, dual trajectory wave lines, subtle trajectory orbit rings.
- **Palette:** `#6D28D9` (UNNATI Violet), `#EA580C` (Saffron), `#14B8A6` (Teal), `#EDE9FE` (Soft Lavender).

### 4.2 `auth` (`/sign-in`, `/sign-up`)
- **Atmosphere:** Warm, welcoming, centered, non-distracting.
- **Components:** Subdued grid (20% opacity), dual centered gradient halo, 10 subtle particles.
- **Palette:** Soft Lavender (`#EDE9FE`), Warm Saffron (`#FFF7ED`), Slate (`#64748B`).

### 4.3 `onboarding` (`/onboarding`)
- **Atmosphere:** Guided progression, step-by-step confidence.
- **Components:** Dynamic grid, dual forward-leaning orbs, progression wave line, 16 particles.
- **Palette:** Saffron, Deep Violet, Growth Emerald.

### 4.4 `dashboard` (`/dashboard`)
- **Atmosphere:** Clarity, analytical precision, personal readiness.
- **Components:** Metric ambient orbs positioned behind key summary cards, 16 floating particles.
- **Palette:** Violet, Mint/Teal, Soft Lavender.

### 4.5 `explore` (`/explore`)
- **Atmosphere:** Discovery, curiosity, broad horizons.
- **Components:** Radar trajectory rings, dual drifting orbs, connection lines, 22 rich particles.
- **Palette:** Violet, Teal, Indigo, Warm Saffron.

### 4.6 `assessments` (`/assessments`)
- **Atmosphere:** Cognitive focus, calm deliberation, minimal sensory load.
- **Components:** Focus grid, muted emerald & violet ambient halo, 10 subtle particles.
- **Palette:** Emerald, Lavender, Deep Violet.

### 4.7 `roadmap` (`/roadmap`)
- **Atmosphere:** Structured career trajectory, milestone velocity.
- **Components:** Full dual trajectory wave lines, 4 progression orbs, dynamic grid, 22 rich particles.
- **Palette:** Violet, Saffron, Emerald, Fuchsia.

### 4.8 `privacy` (`/privacy`)
- **Atmosphere:** Statutory compliance, data safety, institutional trust.
- **Components:** Subdued grid, protective top halo, emerald compliance glow, minimal particles.
- **Palette:** Slate, Soft Lavender, Subtle Emerald.

### 4.9 `not-found` (`404`)
- **Atmosphere:** Reassuring, exploratory, guidance back to course.
- **Components:** Dual drifting orbs, exploratory grid, 16 particles.
- **Palette:** Violet, Saffron, Amber.

---

## 5. Reduced-Motion & Accessibility Architecture

1. **Automatic Detection:** Uses CSS media query `@media (prefers-reduced-motion: reduce)`.
2. **Selective Preservation:**
   - Movement, scaling, translation, and rotation keyframes are disabled (`animation: none !important`).
   - SVG animated dash offsets are neutralized.
   - Ambient color orbs remain softly visible in their static base coordinates, ensuring visual hierarchy and contrast remain identical.
3. **No Flashing or Rapid Strobing:** All transitions strictly exceed 14 seconds per cycle (up to 35 seconds), well below any vestibular or photosensitive threshold.

---

## 6. Verification & Developer Credit

- **Engineering Lead:** Parth Ahuja
- **Designation:** Designed & Developed by Parth Ahuja
- **Framework:** Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + React 18
- **Status:** Complete, production-verified, 100% TypeScript typechecked.

