"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  TrendingUp, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  GraduationCap,
  Briefcase,
  Users,
  Target,
  BarChart3,
  BookOpen,
  FolderGit2,
  CheckCheck,
  RefreshCw,
  FileCheck2,
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  Eye,
  Sliders,
  Check,
  CheckCircle
} from "lucide-react";

export default function HomePage() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [activeHeroStep, setActiveHeroStep] = useState<number>(0);
  const [selectedDemoDomain, setSelectedDemoDomain] = useState<"business" | "data" | "finance" | "design" | "tech">("business");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"dashboard" | "explore" | "assessments" | "roadmap" | "companion">("dashboard");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 1. Audience Pathways Data (Direct Onboarding Query Routing)
  const audiences = [
    {
      title: "Students & Freshers",
      subtitle: "College & University Learners",
      icon: GraduationCap,
      description: "Connect your coursework to real industry expectations, discover what degrees lead to which roles, and prepare for campus placements without guesswork.",
      highlight: "Coursework-to-role skill mapping",
      href: "/onboarding?persona=student",
      ctaLabel: "Start Student Path"
    },
    {
      title: "Recent Graduates",
      subtitle: "0 – 1 Year Post-Degree",
      icon: Award,
      description: "Overcome the 'experience paradox'. Identify exactly which tools high-growth employers require, and build verified capstone projects that prove competence.",
      highlight: "Hands-on capstone sprint rubrics",
      href: "/onboarding?persona=graduate",
      ctaLabel: "Bridge Experience Gap"
    },
    {
      title: "Working Professionals",
      subtitle: "2 – 6+ Years Experience",
      icon: Briefcase,
      description: "Target higher-impact specialties or cross-functional leadership. Identify exact capability gaps for senior roles across Management, Tech, and Strategy.",
      highlight: "Benchmark gaps for senior roles",
      href: "/onboarding?persona=professional",
      ctaLabel: "Explore Upgrades"
    },
    {
      title: "Career Switchers",
      subtitle: "Transitioning Disciplines",
      icon: Compass,
      description: "Moving from non-tech to analytics, or operations to product management? Map your transferable strengths and take targeted prerequisite roadmaps.",
      highlight: "Transferable skill mapping",
      href: "/onboarding?persona=switcher",
      ctaLabel: "Plan Career Pivot"
    }
  ];

  // 2. Multi-Disciplinary Diagnostic Demos
  const domainDemos = {
    business: {
      roleTitle: "Associate Product Manager (APM)",
      domain: "Business & Management",
      readinessPct: 76,
      studyHours: "45 Study Hours (~6 wks at 8 hrs/wk)",
      medianSalary: "₹18.0L CTC",
      salaryRange: "₹12.0L – ₹24.0L CTC",
      skillsToLearn: ["Product Roadmap Planning", "User Metrics & A/B Testing", "Financial Modeling & Unit Economics"],
      existingStrengths: ["User Story Writing", "Stakeholder Communication", "Market Research"]
    },
    data: {
      roleTitle: "Business Intelligence & Data Analyst",
      domain: "Data & Analytics",
      readinessPct: 81,
      studyHours: "50 Study Hours (~6 wks at 8 hrs/wk)",
      medianSalary: "₹14.5L CTC",
      salaryRange: "₹10.0L – ₹20.0L CTC",
      skillsToLearn: ["Advanced SQL & Window Functions", "Power BI / Tableau Dashboards", "Applied Python (Pandas)"],
      existingStrengths: ["Excel Modeling", "Business Logic", "Data Cleaning"]
    },
    finance: {
      roleTitle: "Financial Analyst & Corporate Strategy",
      domain: "Finance & Strategy",
      readinessPct: 72,
      studyHours: "55 Study Hours (~7 wks at 8 hrs/wk)",
      medianSalary: "₹16.0L CTC",
      salaryRange: "₹11.0L – ₹22.0L CTC",
      skillsToLearn: ["3-Statement Financial Modeling", "DCF & Comparable Valuation", "Variance & FP&A Reporting"],
      existingStrengths: ["Accounting Fundamentals", "Financial Ratios", "Spreadsheet Automation"]
    },
    design: {
      roleTitle: "Product & UI/UX Designer",
      domain: "Design & Creative",
      readinessPct: 84,
      studyHours: "40 Study Hours (~5 wks at 8 hrs/wk)",
      medianSalary: "₹15.0L CTC",
      salaryRange: "₹9.5L – ₹22.0L CTC",
      skillsToLearn: ["Design Systems in Figma", "Quantitative Usability Testing", "Interactive Prototyping"],
      existingStrengths: ["User Research", "Wireframing", "Visual Hierarchy"]
    },
    tech: {
      roleTitle: "Full-Stack Software Engineer",
      domain: "Technology & Engineering",
      readinessPct: 79,
      studyHours: "60 Study Hours (~8 wks at 8 hrs/wk)",
      medianSalary: "₹19.5L CTC",
      salaryRange: "₹13.0L – ₹28.0L CTC",
      skillsToLearn: ["Asynchronous APIs & FastAPI", "PostgreSQL & Database Indexing", "Cloud Deployment (Docker)"],
      existingStrengths: ["React & TypeScript", "Component Architecture", "Git Version Control"]
    }
  };

  const currentDemo = domainDemos[selectedDemoDomain];

  // 3. Hero Stepped Product Preview Steps (Goal -> Skills -> Gaps -> Path -> Action)
  const heroSteps = [
    {
      title: "1. Goal",
      tag: "Target Career Direction",
      summary: "Set benchmark: Product & Business Strategy Lead",
      content: {
        badge: "Industry Benchmark",
        heading: "Product & Business Strategy Lead",
        sub: "Cross-disciplinary role connecting Business, UX and Analytical Decision-Making.",
        metrics: ["Typical Median: ₹18.0L CTC", "Market Demand: High Growth", "Est. Preparation: ~6 Weeks (8 hrs/wk)"]
      }
    },
    {
      title: "2. Skills",
      tag: "4-Tier Skill Ledger",
      summary: "Profile & coursework extracted into verified ledger",
      content: {
        badge: "Competency Baseline",
        heading: "3 Verified Core Competencies",
        sub: "Identified from your uploaded resume and college coursework transcripts.",
        metrics: ["User Research (Assessed: 88%)", "SQL & Data Modeling (Inferred: 75%)", "Stakeholder Communication (Claimed)"]
      }
    },
    {
      title: "3. Gaps",
      tag: "Skill Gap Analysis",
      summary: "Pinpoint recommended skills to strengthen",
      content: {
        badge: "Prioritized Gaps",
        heading: "2 High-Impact Skills to Strengthen",
        sub: "Targeted capability gaps separating current state from employer expectations.",
        metrics: ["Unit Economics & Financial Modeling (Priority 1)", "A/B Testing Metrics & Cohorts (Priority 2)", "Overall Readiness: 76%"]
      }
    },
    {
      title: "4. Path",
      tag: "Adaptive Milestone Plan",
      summary: "3-phase curriculum tailored to your schedule",
      content: {
        badge: "Topological Milestones",
        heading: "Ordered 3-Phase Action Roadmap",
        sub: "Organized by prerequisites so foundational principles are mastered first.",
        metrics: ["Phase 1: Core Strategy Foundations (Done)", "Phase 2: Metrics Sprint (In Progress)", "Phase 3: Industry Capstone Project"]
      }
    },
    {
      title: "5. Action",
      tag: "Immediate Next Step",
      summary: "Take a 10-minute diagnostic check to advance",
      content: {
        badge: "Immediate Action",
        heading: "10-Minute Diagnostic Skill Check Ready",
        sub: "Complete a real-world scenario challenge to promote your skill to 'Verified' status.",
        metrics: ["10-Min Scenario Challenge", "Formative Guidance on Answers", "+8% Readiness Boost on Completion"]
      }
    }
  ];

  // 4. Frequently Asked Questions
  const faqs = [
    {
      q: "What is UNNATI, and how does it help my career?",
      a: "UNNATI (उन्नति) is an AI-powered career growth companion and talent intelligence ecosystem. Rather than functioning as a passive job board or generic video course catalog, UNNATI diagnoses the exact delta between your current capabilities and real-world employer benchmarks. It generates a personalized 3-phase learning roadmap tailored to your weekly schedule, provides hands-on capstone sprint guides, and verifies your progress through diagnostic checks."
    },
    {
      q: "Is UNNATI only for software engineers and coders?",
      a: "No! UNNATI is built for multi-disciplinary career paths including Business & Management, Data & Analytics, Finance & Accounting, Product Design, Operations, Supply Chain, and Technology. Whether you are a commerce graduate, MBA candidate, designer, or engineering fresher, the platform provides tailored skill taxonomies and benchmarks."
    },
    {
      q: "How does UNNATI calculate my career readiness percentage?",
      a: "Readiness is an evidence-weighted Bayesian score calculated by comparing your profile against verified industry competency benchmarks. Your self-reported skills establish an initial baseline; skills extracted from resumes or course syllabi add empirical weight; and diagnostic assessment challenges promote your skills to 'Assessed' or 'Verified'. This prevents inflated self-evaluations while giving fair credit for authentic ability."
    },
    {
      q: "How is my personal data protected under Indian privacy laws?",
      a: "UNNATI is built in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2025/2026 (India). All data collection requires affirmative bilingual notice-and-consent. We maintain an appointed Grievance Redressal Officer (contact: grievance@unnati.in) and guarantee that when you request account deletion, your personal data and documents undergo cryptographic erasure within 72 hours."
    },
    {
      q: "Is UNNATI considered high-risk AI under AI regulations?",
      a: "No. UNNATI is strictly classified as a Non-Annex III formative self-development companion under the EU AI Act and Indian AI governance frameworks. We provide constructive, formative learning advice to empower candidates. We never perform automated high-risk employment screening, filtering out, or punitive ranking."
    },
    {
      q: "Does UNNATI guarantee a job or placement?",
      a: "No. UNNATI does not make misleading employment guarantees. Instead, we provide authentic capability development, structured portfolio milestones, and verified readiness scoring that make you genuinely competitive and confident for high-impact roles."
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1">
        
        {/* ========================================================
            HERO SECTION: Porsche / Trionn Visual Confidence & Polish
            Surface: Warm white with subtle lavender ambient gradient
           ======================================================== */}
        <section className="w-full relative overflow-hidden pt-10 sm:pt-16 pb-20 bg-gradient-to-b from-[#FAF8FF] via-[#FCFAFF] to-white border-b border-purple-100/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Core Positioning & Typography */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Campaign Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-purple-100/90 border border-purple-200/90 px-4 py-1.5 text-xs font-bold text-unnati-indigo shadow-soft-sm">
                <Sparkles className="h-4 w-4 text-unnati-saffron animate-pulse" />
                <span>Your Growth Companion</span>
                <span className="h-1.5 w-1.5 rounded-full bg-unnati-saffron" />
                <span className="text-slate-600 font-medium">Learn. Build. Grow. Succeed.</span>
              </div>

              {/* Aspirational Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[62px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Your career journey deserves a <br className="hidden sm:inline" />
                <span className="text-gradient-indigo">clear, confident</span>{" "}
                <br className="hidden sm:inline" />
                <span className="text-gradient-saffron">direction forward.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Discover your strengths, understand your skill gaps, and follow a personalised, step-by-step roadmap to the career you want — across <strong>Business, Management, Analytics, Finance, Design, and Technology</strong>.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link href="/onboarding" className="w-full sm:w-auto">
                  <Button 
                    variant="saffron" 
                    size="lg" 
                    className="btn-shimmer w-full sm:w-auto text-base font-bold shadow-soft-md shadow-glow-saffron h-13 px-7 sm:px-8 rounded-2xl text-white justify-center"
                  >
                    <span>Start Your Free Journey</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto text-base font-semibold h-13 px-7 sm:px-8 rounded-2xl hover:border-purple-300 bg-white/80 justify-center"
                  >
                    <Compass className="h-4 w-4 mr-2 text-unnati-violet" /> 
                    <span>Explore 20+ Career Paths</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators (Desktop view - rendered under CTAs) */}
              <div className="hidden lg:flex pt-6 border-t border-slate-200/80 flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>DPDP Act (India 2026) Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-unnati-indigo" />
                  <span>For Students, Grads &amp; Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span>72-Hour Data Erasure Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Stepped Product Preview */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="up" delayMs={150}>
                <div className="clean-card p-5 sm:p-7 md:p-8 bg-white border-2 border-purple-100 shadow-soft-xl relative overflow-hidden">
                  
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700">
                        Interactive Walkthrough
                      </span>
                    </div>
                    <Badge variant="violet" className="text-[10px] py-0.5 px-2.5 font-bold">
                      Step {activeHeroStep + 1} of 5
                    </Badge>
                  </div>

                  {/* Step Selector Tabs (Guaranteed no collision with 1. Goal, 2. Skills, 3. Gaps, 4. Path, 5. Action) */}
                  <div className="grid grid-cols-5 gap-1 my-4 bg-slate-100 p-1.5 rounded-xl">
                    {heroSteps.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveHeroStep(idx)}
                        className={`py-1.5 text-[10.5px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-0.5 sm:px-1 text-center ${
                          activeHeroStep === idx
                            ? "bg-white text-unnati-indigo shadow-soft-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                        title={s.summary}
                      >
                        <span className="whitespace-nowrap">{s.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Step Card Content */}
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-orange-50/40 border border-purple-100 p-5 min-h-[235px] flex flex-col justify-between transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-unnati-saffron">
                          {heroSteps[activeHeroStep].tag}
                        </span>
                        <span className="text-[10px] bg-purple-100 text-unnati-indigo px-2.5 py-0.5 rounded-md font-bold">
                          {heroSteps[activeHeroStep].content.badge}
                        </span>
                      </div>
                      <h3 className="font-heading text-[17px] font-bold text-slate-900 mt-2">
                        {heroSteps[activeHeroStep].content.heading}
                      </h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">
                        {heroSteps[activeHeroStep].content.sub}
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-purple-100/80 space-y-2">
                      {heroSteps[activeHeroStep].content.metrics.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12.5px] text-slate-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stepper Navigation Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {heroSteps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveHeroStep(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            activeHeroStep === i ? "w-7 bg-unnati-indigo" : "w-2 bg-slate-200"
                          }`}
                          aria-label={`Jump to step ${i + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeHeroStep < 4 ? (
                        <button
                          onClick={() => setActiveHeroStep(prev => prev + 1)}
                          className="text-xs font-bold text-unnati-indigo hover:text-unnati-violet flex items-center gap-1 cursor-pointer"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <Link
                          href="/onboarding"
                          className="text-xs font-bold text-unnati-saffron hover:underline flex items-center gap-1"
                        >
                          <span>Try on Your Profile</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </ScrollReveal>

              {/* Mobile Trust Indicators (rendered in requested sequence below the preview card on mobile) */}
              <div className="lg:hidden mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>DPDP Act (India 2026) Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-unnati-indigo shrink-0" />
                  <span>For Students, Grads &amp; Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600 shrink-0" />
                  <span>72-Hour Data Erasure Guarantee</span>
                </div>
              </div>
            </div>

          </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: AUDIENCE PATHWAYS (Who UNNATI Helps)
            Surface: Pure white with clean subtle boundary
           ======================================================== */}
        <section id="audiences" className="w-full bg-white border-b border-slate-200/80 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="violet" className="text-xs mb-3">
                Tailored For Your Stage
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                A Personalised Growth Journey for Every Ambition
              </h2>
              <p className="text-base text-slate-600 mt-3 leading-relaxed">
                Whether you are exploring degrees, stepping into your first role, upskilling, or switching careers, UNNATI provides an authentic roadmap.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <ScrollReveal key={idx} direction="up" delayMs={idx * 90}>
                  <Card 
                    hoverEffect
                    className="clean-card h-full p-8 flex flex-col justify-between bg-white border border-slate-200/90 shadow-soft-sm group hover:border-purple-300 transition-all duration-300"
                  >
                    <div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-unnati-indigo border border-purple-200 mb-6 group-hover:bg-purple-200 transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 mb-1.5">
                        {aud.title}
                      </h3>
                      <p className="text-xs font-bold text-unnati-saffron mb-3.5">
                        {aud.subtitle}
                      </p>
                      <p className="text-[14.5px] text-slate-600 leading-relaxed mb-6">
                        {aud.description}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-slate-100 space-y-3.5">
                      <span className="block text-xs font-bold text-slate-500">
                        ★ {aud.highlight}
                      </span>
                      <Link 
                        href={aud.href} 
                        className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-unnati-indigo border border-purple-200 text-xs font-bold transition-all"
                      >
                        <span>{aud.ctaLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: CONTINUOUS CAREER JOURNEY (21hrs Storytelling Flow)
            Surface: Soft cool grey/lavender surface
           ======================================================== */}
        <section id="how-it-works" className="w-full bg-[#F6F7FC] border-b border-slate-200/80 py-20 sm:py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <ScrollReveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <Badge variant="saffron" className="text-xs mb-3">
                  Continuous 6-Stage Growth Cycle
                </Badge>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  How UNNATI Powers Your Lifelong Career Growth
                </h2>
                <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-2xl mx-auto">
                  Growth is not a one-time test. It is an adaptive 6-stage feedback loop that evolves as you acquire practical competencies, build real proof of work, and unlock high-impact opportunities.
                </p>
              </div>
            </ScrollReveal>

            {/* Desktop Animated Connector Line */}
            <div className="hidden lg:block absolute top-[280px] left-[6%] right-[6%] h-[2px] bg-gradient-to-r from-purple-300 via-orange-300 to-emerald-300 z-0 opacity-40" />

            {/* Connected Journey Grid: 1 Col on Mobile (Vertical Timeline), 3 Col on Tablet, 6 Col on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 relative z-10">
              {[
                {
                  num: "01",
                  title: "Discover Direction",
                  desc: "Explore 20+ pathways across Business, Analytics, Finance, Design, and Tech.",
                  icon: Compass,
                  color: "text-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  num: "02",
                  title: "Ingest Baseline",
                  desc: "Extract verified coursework, projects, and skills from your resume or syllabus.",
                  icon: Layers,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50"
                },
                {
                  num: "03",
                  title: "Pinpoint Gaps",
                  desc: "Compare profile against industry benchmarks to identify exact skills to strengthen.",
                  icon: Target,
                  color: "text-orange-600",
                  bg: "bg-orange-50"
                },
                {
                  num: "04",
                  title: "Build Roadmap",
                  desc: "Follow an ordered, 3-phase milestone plan tailored to your weekly study hours.",
                  icon: MapPin,
                  color: "text-violet-600",
                  bg: "bg-violet-50"
                },
                {
                  num: "05",
                  title: "Demonstrate",
                  desc: "Complete practical capstones and diagnostic checks to earn Verified status.",
                  icon: Award,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                },
                {
                  num: "06",
                  title: "Grow & Reassess",
                  desc: "Update your Bayesian competency profile continuously as you level up.",
                  icon: RefreshCw,
                  color: "text-purple-700",
                  bg: "bg-purple-100"
                }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <ScrollReveal key={idx} direction="up" delayMs={idx * 80}>
                    <div className="h-full p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md hover:border-purple-300 flex flex-col justify-between relative group transition-all duration-300">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-heading text-3xl font-black text-unnati-indigo">
                            {step.num}
                          </span>
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 shadow-soft-sm ${step.color}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                        </div>
                        <h3 className="font-heading text-[16px] font-bold text-slate-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-[13.5px] text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      {idx === 5 ? (
                        <div className="mt-4 pt-3 border-t border-purple-200/80 flex items-center justify-between text-[11px] font-bold text-unnati-indigo">
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-unnati-saffron" />
                            <span>Continuous Loop ↻</span>
                          </span>
                          <span className="text-[10px] bg-purple-100 text-unnati-indigo px-2 py-0.5 rounded-full font-bold">
                            Adaptive
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-unnati-indigo transition-colors">
                          <span>Stage {step.num} of 06</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-unnati-saffron" />
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: PRODUCT SHOWCASE (Epiminds / Cerebrium Working Tools)
            Surface: Very light neutral surface
           ======================================================== */}
        <section id="showcase" className="w-full bg-[#F8FAFC] border-b border-slate-200/80 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="violet" className="text-xs mb-3">
                Inside UNNATI
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Explore the Implemented Platform Tools
              </h2>
              <p className="text-base text-slate-600 mt-3 leading-relaxed">
                See the actual working interfaces engineered to guide your skills, milestones, and career trajectory.
              </p>
            </div>
          </ScrollReveal>

          {/* Feature Showcase Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {[
              { id: "dashboard", label: "Learner Dashboard", icon: LayoutDashboard },
              { id: "explore", label: "Career Discovery", icon: Compass },
              { id: "assessments", label: "Diagnostic Checks", icon: FileCheck2 },
              { id: "roadmap", label: "3-Phase Roadmap", icon: MapPin },
              { id: "companion", label: "AI Career Mentor", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcaseTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeShowcaseTab === tab.id
                      ? "bg-unnati-indigo text-white shadow-soft-md"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Showcase Display Card */}
          <ScrollReveal direction="up" delayMs={100}>
            <div className="clean-card p-6 sm:p-12 bg-white border-2 border-purple-100 shadow-soft-xl max-w-5xl mx-auto">
              
              {/* TAB 1: DASHBOARD */}
              {activeShowcaseTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="violet" className="text-xs">
                      Candidate Growth Hub
                    </Badge>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Comprehensive Learner Dashboard
                    </h3>
                    <p className="text-[14.5px] text-slate-600 leading-relaxed">
                      Track your overall readiness score, upload resumes for instant AI information extraction, and view your 4-tier skill evidence ledger.
                    </p>
                    <ul className="space-y-2.5 text-[14px] text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>4-Tier Skill Ledger:</strong> Self-Reported, Resume Extracted, Diagnostic Assessed &amp; Verified.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>AI Document Parsing:</strong> Gemini-powered extraction of education, projects, and work history.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Weekly Goal Setting:</strong> Adaptive hours tracking tailored to your study availability.</span>
                      </li>
                    </ul>
                    <div className="pt-3">
                      <Link href="/dashboard">
                        <Button variant="saffron" size="sm" className="font-bold text-xs h-11 px-5 rounded-xl shadow-glow-saffron text-white">
                          Open Learner Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-bold text-sm text-slate-800">Skill Competency Ledger</span>
                      <Badge variant="success" className="text-[10px]">Active Profile</Badge>
                    </div>
                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Product Roadmapping</span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Assessed (85%)</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">SQL &amp; Data Extraction</span>
                        <span className="px-2.5 py-1 rounded-md bg-purple-100 text-unnati-indigo text-[10px] font-bold">Inferred from Resume</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Financial Modeling</span>
                        <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">Recommended to Learn</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPLORE CAREERS */}
              {activeShowcaseTab === "explore" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="saffron" className="text-xs">
                      Multi-Disciplinary Catalog
                    </Badge>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Career Discovery &amp; Benchmarks
                    </h3>
                    <p className="text-[14.5px] text-slate-600 leading-relaxed">
                      Explore 20+ validated career pathways across Business, Data, Finance, Design, and Engineering. Compare roles side-by-side to understand salary brackets, study hours, and skill overlaps.
                    </p>
                    <ul className="space-y-2.5 text-[14px] text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Side-by-Side Comparison:</strong> Compare 2 roles to find transferable skills.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Real Labor Market Data:</strong> Typical compensation and bridge time estimates.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Set Target Direction:</strong> Link chosen career directly to your personalized roadmap.</span>
                      </li>
                    </ul>
                    <div className="pt-3">
                      <Link href="/explore">
                        <Button variant="saffron" size="sm" className="font-bold text-xs h-11 px-5 rounded-xl shadow-glow-saffron text-white">
                          Open Career Catalog <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3.5">
                    <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-soft-sm">
                      <span className="text-[10px] uppercase font-bold text-unnati-saffron">Featured Pathway</span>
                      <h4 className="font-heading text-base font-bold text-slate-900 mt-1">Product &amp; Business Strategy Lead</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Connects engineering execution, UX empathy, and market metrics.</p>
                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-700 pt-3 border-t border-slate-100">
                        <span>Typical Range: ₹14L – ₹28L CTC</span>
                        <span className="text-emerald-700 font-semibold">Bridge Time: ~6 Weeks</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ASSESSMENTS */}
              {activeShowcaseTab === "assessments" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="violet" className="text-xs">
                      Formative Verification
                    </Badge>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Diagnostic Practice Skill Checks
                    </h3>
                    <p className="text-[14.5px] text-slate-600 leading-relaxed">
                      Verify what you know through 10-minute scenario challenges. We don&apos;t punish mistakes; every question includes immediate formative explanations to reinforce your understanding.
                    </p>
                    <ul className="space-y-2.5 text-[14px] text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Multi-Domain Tracks:</strong> Business Strategy, Data Intelligence, and Web Architecture.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Bayesian Level-Up:</strong> Instantly upgrades skill state to &apos;Diagnostic Verified&apos;.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Non-Punitive:</strong> Designed as formative guidance, not an elimination barrier.</span>
                      </li>
                    </ul>
                    <div className="pt-3">
                      <Link href="/assessments">
                        <Button variant="saffron" size="sm" className="font-bold text-xs h-11 px-5 rounded-xl shadow-glow-saffron text-white">
                          Take a Skill Check <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-unnati-indigo pb-2.5 border-b border-purple-200">
                      <span>Scenario: Product Metric Prioritization</span>
                      <Badge variant="saffron" className="text-[10px]">10 Min Check</Badge>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium text-xs sm:text-[13px]">
                      &quot;Your e-commerce application experiences a 25% checkout drop-off at the payment step. Which analytical approach should you prioritize first?&quot;
                    </p>
                    <div className="p-3.5 rounded-xl bg-white border border-purple-200 font-semibold text-unnati-indigo text-xs">
                      ✓ Diagnostic Answer: Inspect payment failure codes &amp; conduct funnel friction audit.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ROADMAP */}
              {activeShowcaseTab === "roadmap" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="saffron" className="text-xs">
                      Milestone Progression
                    </Badge>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Adaptive 3-Phase Learning Roadmap
                    </h3>
                    <p className="text-[14.5px] text-slate-600 leading-relaxed">
                      Stop drowning in random tutorials. UNNATI synthesizes an ordered progression: Core Foundations, Applied Capability, and Industry Capstone.
                    </p>
                    <ul className="space-y-2.5 text-[14px] text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Topological Prerequisite Order:</strong> Learn prerequisite concepts first.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Interactive Task Checklists:</strong> Mark off modules and track readiness score dynamically.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Portfolio Capstone Rubric:</strong> Build realistic, employer-ready showcase projects.</span>
                      </li>
                    </ul>
                    <div className="pt-3">
                      <Link href="/roadmap">
                        <Button variant="saffron" size="sm" className="font-bold text-xs h-11 px-5 rounded-xl shadow-glow-saffron text-white">
                          Inspect Your Roadmap <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-unnati-indigo text-xs sm:text-sm">
                        <span>Phase 1: Foundations</span>
                        <span className="text-emerald-700 font-semibold">100% Completed</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Core business modeling and analytical workflows.</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-purple-300">
                      <div className="flex items-center justify-between font-bold text-unnati-indigo text-xs sm:text-sm">
                        <span>Phase 2: Applied Capability</span>
                        <span className="text-orange-600 font-semibold">In Progress (60%)</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Hands-on user research &amp; unit economics metrics sprint.</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-500 text-xs sm:text-sm">
                        <span>Phase 3: Industry Capstone</span>
                        <span>Locked (Complete Phase 2)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AI COMPANION */}
              {activeShowcaseTab === "companion" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <Badge variant="violet" className="text-xs">
                      Persistent Mentor
                    </Badge>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      AI Career Companion (Bottom-Right Widget)
                    </h3>
                    <p className="text-[14.5px] text-slate-600 leading-relaxed">
                      Docked in the bottom-right corner of every page, UNNATI AI provides 24/7 mentoring. It features a universal persona selector so students, non-tech pros, and career switchers find immediate clarity.
                    </p>
                    <ul className="space-y-2.5 text-[14px] text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Universal Persona Tabs:</strong> 1-Click starter questions for students, business, and switchers.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Grounded Advice:</strong> Cites O*NET, ESCO, and UNNATI curated standards.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Continuous Memory:</strong> Conversation history persists as you navigate across pages.</span>
                      </li>
                    </ul>
                    <div className="pt-3">
                      <button 
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("open-unnati-companion"));
                          }
                        }}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-unnati-indigo to-unnati-violet text-white text-xs font-bold shadow-soft-sm hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4 text-unnati-saffron" />
                        <span>Launch AI Chatbot (Bottom-Right)</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 text-white text-xs space-y-3.5">
                    <div className="flex items-center justify-between text-purple-200 pb-2.5 border-b border-white/10">
                      <span className="font-bold flex items-center gap-1.5 text-sm">
                        <Sparkles className="h-4 w-4 text-unnati-saffron" />
                        UNNATI Growth Advisor
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">Live &amp; Online</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-[13px]">
                      &quot;Namaste! Whether you are exploring degrees, transitioning from non-tech, or preparing for product interviews, I can break down the exact skills and roadmap for you.&quot;
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-3 py-1 rounded-md bg-white/10 text-xs text-purple-200">🎓 Students</span>
                      <span className="px-3 py-1 rounded-md bg-white/10 text-xs text-purple-200">💼 Business &amp; PM</span>
                      <span className="px-3 py-1 rounded-md bg-white/10 text-xs text-purple-200">📊 Data &amp; Finance</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
          </div>
        </section>

        {/* ========================================================
            SECTION 5: INTERACTIVE SKILL GAP DIAGNOSTIC
            Surface: Subtle lavender and peach ambient gradient
           ======================================================== */}
        <section id="diagnostic" className="w-full bg-gradient-to-b from-[#FAF7FF] via-[#FFFDF5] to-white border-b border-slate-200/80 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="violet" className="text-xs mb-3">
                Interactive Career Diagnostic
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                See How Your Roadmap Adapts to Any Career
              </h2>
              <p className="text-base text-slate-600 mt-3 leading-relaxed">
                Select a career discipline below to see how UNNATI pinpoints required skills, calculates study effort, and plans your path.
              </p>
            </div>
          </ScrollReveal>

          {/* Domain Tabs (5 Multi-Disciplinary Tracks) */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {(["business", "data", "finance", "design", "tech"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedDemoDomain(key)}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDemoDomain === key
                    ? "bg-unnati-indigo text-white shadow-soft-md"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span className="whitespace-nowrap">{domainDemos[key].domain}</span>
              </button>
            ))}
          </div>

          {/* Interactive Calculation Card */}
          <ScrollReveal direction="up" delayMs={100}>
            <div className="max-w-4xl mx-auto clean-card p-6 sm:p-12 bg-white border-2 border-purple-100 shadow-soft-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">Target Career Direction</span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{currentDemo.roleTitle}</h3>
                </div>
                <Badge variant="violet" className="text-xs font-semibold py-1 px-3">
                  {currentDemo.domain}
                </Badge>
              </div>

              {/* Display Metrics Grid with Prominent Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-b border-slate-100 text-center">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Readiness</p>
                  <p className="font-heading text-4xl sm:text-5xl font-black text-emerald-600 mt-2">{currentDemo.readinessPct}%</p>
                  <p className="text-xs text-slate-400 mt-1">Based on sample candidate profile</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Study Effort</p>
                  <p className="font-heading text-2xl sm:text-3xl font-black text-orange-600 mt-2">{currentDemo.studyHours.split(" (")[0]}</p>
                  <p className="text-xs text-slate-400 mt-1">Tailored to your weekly availability</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Typical Market Compensation</p>
                  <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900 mt-2">{currentDemo.medianSalary}</p>
                  <p className="text-xs text-slate-600 font-medium mt-1">Market Range: <span className="font-bold text-slate-700">{currentDemo.salaryRange}</span></p>
                </div>
              </div>

              {/* Recommended Skills (Responsible Wording) */}
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Recommended Skills to Strengthen Your Profile:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {currentDemo.skillsToLearn.map((skill, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs sm:text-[13px] font-semibold text-unnati-indigo flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-unnati-saffron shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How Readiness is Calculated Callout */}
              <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-unnati-indigo" />
                  How is Career Readiness Calculated?
                </p>
                <p className="leading-relaxed text-xs sm:text-[13px]">
                  Readiness is an evidence-weighted Bayesian score comparing your verified capabilities against target role benchmarks. Self-reported skills give baseline credit, while resume-extracted background and diagnostic practice checks increase confidence toward industry expectations.
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  *Illustrative sample diagnostic based on curated labor market benchmarks. Individual progress depends on study commitment.
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  Want to build your exact roadmap based on your real resume or degree?
                </span>
                <Link href="/onboarding">
                  <Button variant="saffron" size="sm" className="btn-shimmer text-xs sm:text-sm font-bold h-11 px-5 rounded-xl shadow-glow-saffron text-white">
                    Start Your Free Assessment <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: TRUST, ETHICS & DATA PROTECTION (Deep Brand Purple)
            Surface: Deep brand purple
           ======================================================== */}
        <section id="trust" className="w-full bg-[#2A0E5C] text-white border-b border-purple-900 py-20 sm:py-24 relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            <ScrollReveal direction="up">
              <div className="text-center max-w-3xl mx-auto">
                <Badge variant="outline" className="text-xs mb-3 border-purple-400/40 text-purple-200">
                  Data Trust &amp; Ethics
                </Badge>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-tight">
                  Engineered for Your Privacy and Autonomy
                </h2>
                <p className="text-base text-purple-200 mt-3 leading-relaxed">
                  UNNATI is designed as a supportive mentor, not a punitive monitoring system.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delayMs={0}>
                <div className="p-7 rounded-2xl bg-white/5 border border-white/10 h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Formative, Not High-Risk</h3>
                  <p className="text-xs sm:text-[13px] text-purple-200 leading-relaxed">
                    Classified as Non-Annex III formative mentorship under AI governance. We provide guidance for candidate self-growth—never automated rejection or high-risk employee monitoring.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={100}>
                <div className="p-7 rounded-2xl bg-white/5 border border-white/10 h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 font-bold mb-4">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">72-Hour Data Erasure</h3>
                  <p className="text-xs sm:text-[13px] text-purple-200 leading-relaxed">
                    Your data belongs to you. When you request account deletion, all private documents and profile records are cryptographically wiped within 72 hours under DPDP Act requirements.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={200}>
                <div className="p-7 rounded-2xl bg-white/5 border border-white/10 h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold mb-4">
                    <CheckCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Evidence Transparency</h3>
                  <p className="text-xs sm:text-[13px] text-purple-200 leading-relaxed">
                    We clearly distinguish between self-reported skills, AI-extracted background, and diagnostic checks. You can inspect or correct any detail at any time.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <div className="text-center pt-3">
              <Link href="/privacy" className="text-xs sm:text-sm text-purple-300 hover:text-white underline font-semibold">
                Read our complete DPDP Privacy Notice &amp; Grievance Redressal Protocol &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: FREQUENTLY ASKED QUESTIONS
            Surface: Clean white surface
           ======================================================== */}
        <section id="faq" className="w-full bg-white border-b border-slate-200/80 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <Badge variant="violet" className="text-xs mb-3">
                  Common Questions
                </Badge>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-base text-slate-600 mt-3 leading-relaxed">
                  Everything you need to know about UNNATI.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="clean-card overflow-hidden transition-all border border-slate-200 bg-white"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-unnati-indigo transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-unnati-saffron shrink-0 ml-3" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 ml-3" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                        <p className="mt-3.5 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 8: FINAL CONVERSION BANNER
            Surface: Separate soft container
           ======================================================== */}
        <section className="w-full bg-slate-50/90 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="rounded-[2.5rem] bg-gradient-to-r from-unnati-indigo via-purple-900 to-unnati-indigo p-8 sm:p-14 text-center text-white shadow-soft-xl relative overflow-hidden">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  Your Career Journey Starts With One Step
                </h2>
                <p className="text-sm sm:text-base text-purple-200 max-w-xl mx-auto mt-4 leading-relaxed">
                  Join students, graduates, and professionals building verifiable capability and moving toward the careers they deserve.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/onboarding" className="w-full sm:w-auto">
                    <Button variant="saffron" size="lg" className="btn-shimmer w-full sm:w-auto text-base font-bold shadow-soft-md shadow-glow-saffron h-13 px-8 rounded-2xl text-white">
                      Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/explore" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 h-13 px-8 rounded-2xl">
                      Explore Career Pathways
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>

      {/* Reusable Enterprise Brand Footer */}
      <Footer />

      {/* Backward-Compatible AI Career Mentor Drawer Forwarder */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
