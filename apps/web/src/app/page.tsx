"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
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
  Sliders
} from "lucide-react";

export default function HomePage() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [activeHeroStep, setActiveHeroStep] = useState<number>(0);
  const [selectedDemoDomain, setSelectedDemoDomain] = useState<"business" | "data" | "finance" | "design" | "tech">("business");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"dashboard" | "explore" | "assessments" | "roadmap" | "companion">("dashboard");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 1. Audience Pathways Data
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

  // 3. Hero Interactive Step Details
  const heroSteps = [
    {
      title: "1. Target Role",
      tag: "Career Direction",
      summary: "Set your goal: Product & Business Strategy Lead",
      content: {
        badge: "Target Benchmark",
        heading: "Product & Business Strategy Lead",
        sub: "Cross-disciplinary role spanning Business, UX & Technology",
        metrics: ["Median: ₹18L CTC", "Demand: High Growth", "Prep: ~6 Weeks"]
      }
    },
    {
      title: "2. Current Profile",
      tag: "Verified Evidence",
      summary: "Resume & background extracted into 4-tier ledger",
      content: {
        badge: "Competency Baseline",
        heading: "3 Verified Core Competencies",
        sub: "Identified from uploaded resume and academic coursework",
        metrics: ["User Research (Assessed: 88%)", "Data Modeling (Inferred: 75%)", "Communication (Claimed)"]
      }
    },
    {
      title: "3. Skills Delta",
      tag: "Skill Gap Analysis",
      summary: "Pinpoint exact recommended skills to strengthen",
      content: {
        badge: "Prioritized Gaps",
        heading: "2 High-Impact Skills to Strengthen",
        sub: "Targeted gaps separating current state from target benchmark",
        metrics: ["Unit Economics (Priority 1)", "A/B Testing Metrics (Priority 2)", "Overall Readiness: 78%"]
      }
    },
    {
      title: "4. 3-Phase Roadmap",
      tag: "Adaptive Learning",
      summary: "Milestone journey mapped to 8 hrs/week",
      content: {
        badge: "Milestone Architecture",
        heading: "Step-by-Step Action Roadmap",
        sub: "Ordered by prerequisites so you learn fundamentals first",
        metrics: ["Phase 1: Core Strategy", "Phase 2: Metrics Sprint", "Phase 3: Industry Capstone"]
      }
    },
    {
      title: "5. Recommended Action",
      tag: "Next Step",
      summary: "Take a 10-minute diagnostic check to advance",
      content: {
        badge: "Immediate Action",
        heading: "Diagnostic Skill Check Ready",
        sub: "Verify your product metrics skills and unlock Verified status",
        metrics: ["10-Min Quiz", "Real-World Scenarios", "+8% Readiness Boost"]
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
            HERO SECTION: Warm, Aspirational, High-Impact
           ======================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Core Positioning */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Campaign Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/90 border border-purple-200 px-4 py-1.5 text-xs font-bold text-unnati-indigo shadow-soft-sm">
                <Sparkles className="h-4 w-4 text-unnati-saffron" />
                <span>Your Growth Companion</span>
                <span className="h-1.5 w-1.5 rounded-full bg-unnati-saffron" />
                <span className="text-slate-600 font-medium">Learn. Build. Grow. Succeed.</span>
              </div>

              {/* Aspirational Headline */}
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
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
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/onboarding">
                  <Button variant="saffron" size="lg" className="btn-shimmer text-base font-bold shadow-soft-md">
                    Start Your Free Journey <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="lg" className="text-base font-semibold">
                    <Compass className="h-4 w-4 mr-1.5 text-unnati-violet" /> Explore 20+ Career Paths
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
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
              <div className="clean-card p-5 sm:p-7 bg-white border-2 border-purple-100 shadow-soft-xl relative overflow-hidden">
                
                {/* Stepper Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700">
                      Live Product Walkthrough
                    </span>
                  </div>
                  <Badge variant="violet" className="text-[10px] py-0.5 px-2">
                    Step {activeHeroStep + 1} of 5
                  </Badge>
                </div>

                {/* Step Selector Tabs */}
                <div className="grid grid-cols-5 gap-1 my-3.5 bg-slate-100 p-1 rounded-xl">
                  {heroSteps.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroStep(idx)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer truncate px-1 text-center ${
                        activeHeroStep === idx
                          ? "bg-white text-unnati-indigo shadow-soft-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title={s.title}
                    >
                      {s.title.split(".")[0]}
                    </button>
                  ))}
                </div>

                {/* Step Card Content */}
                <div className="rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-orange-50/40 border border-purple-100 p-4 min-h-[220px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-unnati-saffron">
                        {heroSteps[activeHeroStep].tag}
                      </span>
                      <span className="text-[10px] bg-purple-100 text-unnati-indigo px-2 py-0.5 rounded-md font-bold">
                        {heroSteps[activeHeroStep].content.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900 mt-1.5">
                      {heroSteps[activeHeroStep].content.heading}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {heroSteps[activeHeroStep].content.sub}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-purple-100/80 space-y-2">
                    {heroSteps[activeHeroStep].content.metrics.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stepper Navigation Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {heroSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveHeroStep(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeHeroStep === i ? "w-6 bg-unnati-indigo" : "w-2 bg-slate-200"
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
            </div>

          </div>
        </section>

        {/* ========================================================
            SECTION 2: AUDIENCE PATHWAYS (Who UNNATI Helps)
           ======================================================== */}
        <section id="audiences" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="violet" className="text-xs mb-2">
              Tailored For Your Stage
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Personalised Growth Journey for Every Ambition
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Whether you are exploring degrees, stepping into your first role, upskilling, or switching careers, UNNATI provides an authentic roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <Card 
                  key={idx}
                  hoverEffect
                  className="clean-card p-6 flex flex-col justify-between bg-white border border-slate-200/90 shadow-soft-sm group hover:border-purple-300 transition-all"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-unnati-indigo border border-purple-200 mb-4 group-hover:bg-purple-200 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
                      {aud.title}
                    </h3>
                    <p className="text-xs font-semibold text-unnati-saffron mb-3">
                      {aud.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {aud.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="block text-[11px] font-bold text-slate-500">
                      ★ {aud.highlight}
                    </span>
                    <Link 
                      href={aud.href} 
                      className="inline-flex items-center justify-center w-full px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-unnati-indigo border border-purple-200 text-xs font-bold transition-all"
                    >
                      <span>{aud.ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            SECTION 3: CONTINUOUS CAREER JOURNEY (Continuous Loop)
           ======================================================== */}
        <section id="how-it-works" className="bg-white py-20 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="saffron" className="text-xs mb-2">
                Continuous Growth Cycle
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How UNNATI Powers Your Lifelong Growth
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Growth is not a one-time test. It is a continuous feedback loop that adapts as you gain skills and aim for higher opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  num: "01",
                  title: "Discover Direction",
                  desc: "Explore 20+ pathways across Business, Analytics, Finance, Design, and Tech.",
                  icon: Compass,
                  color: "text-purple-600"
                },
                {
                  num: "02",
                  title: "Ingest Baseline",
                  desc: "Extract verified coursework, projects, and skills from your resume or syllabus.",
                  icon: Layers,
                  color: "text-indigo-600"
                },
                {
                  num: "03",
                  title: "Pinpoint Gaps",
                  desc: "Compare profile against industry benchmarks to identify exact skills to strengthen.",
                  icon: Target,
                  color: "text-orange-600"
                },
                {
                  num: "04",
                  title: "Build Roadmap",
                  desc: "Follow an ordered, 3-phase milestone plan tailored to your weekly study hours.",
                  icon: MapPin,
                  color: "text-violet-600"
                },
                {
                  num: "05",
                  title: "Demonstrate",
                  desc: "Complete practical capstones and diagnostic checks to earn Verified status.",
                  icon: Award,
                  color: "text-emerald-600"
                },
                {
                  num: "06",
                  title: "Grow & Reassess",
                  desc: "Update your Bayesian competency profile continuously as you level up.",
                  icon: RefreshCw,
                  color: "text-purple-700"
                }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-soft-sm flex flex-col justify-between relative group hover:border-purple-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-heading text-2xl font-black text-unnati-indigo">
                          {step.num}
                        </span>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 ${step.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-slate-900 mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {idx === 5 && (
                      <div className="mt-3 pt-2 border-t border-purple-100 flex items-center gap-1 text-[10px] font-bold text-unnati-violet">
                        <RefreshCw className="h-3 w-3 animate-spin text-unnati-saffron" />
                        <span>Continuous Feedback Loop</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: PRODUCT SHOWCASE (Real Experiences)
           ======================================================== */}
        <section id="showcase" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="violet" className="text-xs mb-2">
              Inside UNNATI
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore the Implemented Platform Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              See the actual working interfaces engineered to guide your skills, milestones, and career trajectory.
            </p>
          </div>

          {/* Feature Showcase Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeShowcaseTab === tab.id
                      ? "bg-unnati-indigo text-white shadow-soft-md"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Showcase Display Card */}
          <div className="clean-card p-6 sm:p-10 bg-white border-2 border-purple-100 shadow-soft-xl max-w-5xl mx-auto">
            {activeShowcaseTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="violet" className="text-xs">
                    Candidate Growth Hub
                  </Badge>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    Comprehensive Learner Dashboard
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Track your overall readiness score, upload resumes for instant AI information extraction, and view your 4-tier skill evidence ledger.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>4-Tier Skill Ledger:</strong> Self-Reported, Resume Extracted, Diagnostic Assessed &amp; Verified.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>AI Document Parsing:</strong> Gemini-powered extraction of education, projects, and work history.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Weekly Goal Setting:</strong> Adaptive hours tracking tailored to your study availability.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/dashboard">
                      <Button variant="saffron" size="sm" className="font-bold text-xs">
                        Open Learner Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800">Skill Competency Ledger</span>
                    <Badge variant="success" className="text-[10px]">Active Profile</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">Product Roadmapping</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Assessed (85%)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">SQL &amp; Data Extraction</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-unnati-indigo text-[10px] font-bold">Inferred from Resume</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">Financial Modeling</span>
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">Recommended to Learn</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "explore" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="saffron" className="text-xs">
                    Multi-Disciplinary Catalog
                  </Badge>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    Career Discovery &amp; Benchmarks
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Explore 20+ validated career pathways across Business, Data, Finance, Design, and Engineering. Compare roles side-by-side to understand salary brackets, study hours, and skill overlaps.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Side-by-Side Comparison:</strong> Compare 2 roles to find transferable skills.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Real Labor Market Data:</strong> Typical compensation and bridge time estimates.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Set Target Direction:</strong> Link chosen career directly to your personalized roadmap.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/explore">
                      <Button variant="saffron" size="sm" className="font-bold text-xs">
                        Open Career Catalog <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-soft-sm">
                    <span className="text-[10px] uppercase font-bold text-unnati-saffron">Featured Pathway</span>
                    <h4 className="font-heading text-sm font-bold text-slate-900 mt-0.5">Product &amp; Business Strategy Lead</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Connects engineering execution, UX empathy, and market metrics.</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-700 pt-2 border-t border-slate-100">
                      <span>Typical Range: ₹14L – ₹28L CTC</span>
                      <span className="text-emerald-700">Bridge Time: ~6 Weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "assessments" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="violet" className="text-xs">
                    Formative Verification
                  </Badge>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    Diagnostic Practice Skill Checks
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Verify what you know through 10-minute scenario challenges. We don't punish mistakes; every question includes immediate formative explanations to reinforce your understanding.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Multi-Domain Tracks:</strong> Business Strategy, Data Intelligence, and Web Architecture.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Bayesian Level-Up:</strong> Instantly upgrades skill state to 'Diagnostic Verified'.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Non-Punitive:</strong> Designed as formative guidance, not an elimination barrier.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/assessments">
                      <Button variant="saffron" size="sm" className="font-bold text-xs">
                        Take a Skill Check <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-unnati-indigo pb-2 border-b border-purple-200">
                    <span>Scenario: Product Metric Prioritization</span>
                    <Badge variant="saffron" className="text-[10px]">10 Min Check</Badge>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    &quot;Your e-commerce application experiences a 25% checkout drop-off at the payment step. Which analytical approach should you prioritize first?&quot;
                  </p>
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 font-semibold text-unnati-indigo">
                    ✓ Diagnostic Answer: Inspect payment failure codes &amp; conduct funnel friction audit.
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "roadmap" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="saffron" className="text-xs">
                    Milestone Progression
                  </Badge>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    Adaptive 3-Phase Learning Roadmap
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Stop drowning in random tutorials. UNNATI synthesizes an ordered progression: Core Foundations, Applied Capability, and Industry Capstone.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Topological Prerequisite Order:</strong> Learn prerequisite concepts first.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Interactive Task Checklists:</strong> Mark off modules and track readiness score dynamically.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Portfolio Capstone Rubric:</strong> Build realistic, employer-ready showcase projects.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/roadmap">
                      <Button variant="saffron" size="sm" className="font-bold text-xs">
                        Inspect Your Roadmap <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-unnati-indigo">
                      <span>Phase 1: Foundations</span>
                      <span className="text-emerald-700">100% Completed</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">Core business modeling and analytical workflows.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border-2 border-purple-300">
                    <div className="flex items-center justify-between font-bold text-unnati-indigo">
                      <span>Phase 2: Applied Capability</span>
                      <span className="text-orange-600">In Progress (60%)</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">Hands-on user research &amp; unit economics metrics sprint.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-500">
                      <span>Phase 3: Industry Capstone</span>
                      <span>Locked (Complete Phase 2)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "companion" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <Badge variant="violet" className="text-xs">
                    Persistent Mentor
                  </Badge>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    AI Career Companion (Bottom-Right Widget)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Docked in the bottom-right corner of every page, UNNATI AI provides 24/7 mentoring. It features a universal persona selector so students, non-tech pros, and career switchers find immediate clarity.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Universal Persona Tabs:</strong> 1-Click starter questions for students, business, and switchers.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Grounded Advice:</strong> Cites O*NET, ESCO, and UNNATI curated standards.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Continuous Memory:</strong> Conversation history persists as you navigate across pages.</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button 
                      onClick={() => setIsCompanionOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-unnati-indigo to-unnati-violet text-white text-xs font-bold shadow-soft-sm hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                      <span>Launch AI Chatbot (Bottom-Right)</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-purple-200 pb-2 border-b border-white/10">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                      UNNATI Growth Advisor
                    </span>
                    <span className="text-[10px] text-emerald-400">Live &amp; Online</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    &quot;Namaste! Whether you are exploring degrees, transitioning from non-tech, or preparing for product interviews, I can break down the exact skills and roadmap for you.&quot;
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-purple-200">🎓 Students</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-purple-200">💼 Business &amp; PM</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-purple-200">📊 Data &amp; Finance</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            SECTION 5: INTERACTIVE SKILL GAP DIAGNOSTIC
           ======================================================== */}
        <section id="diagnostic" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="violet" className="text-xs mb-2">
              Interactive Career Diagnostic
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              See How Your Roadmap Adapts to Any Career
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Select a career discipline below to see how UNNATI pinpoints required skills, calculates study effort, and plans your path.
            </p>
          </div>

          {/* Domain Tabs (5 Multi-Disciplinary Tracks) */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {(["business", "data", "finance", "design", "tech"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedDemoDomain(key)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedDemoDomain === key
                    ? "bg-unnati-indigo text-white shadow-soft-md"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {domainDemos[key].domain}
              </button>
            ))}
          </div>

          {/* Interactive Calculation Card */}
          <div className="max-w-4xl mx-auto clean-card p-6 sm:p-10 bg-white border-2 border-purple-100 shadow-soft-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">Target Career Direction</span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">{currentDemo.roleTitle}</h3>
              </div>
              <Badge variant="violet" className="text-xs font-semibold py-1">
                {currentDemo.domain}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-100 text-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Estimated Readiness</p>
                <p className="font-heading text-3xl font-black text-emerald-600 mt-1">{currentDemo.readinessPct}%</p>
                <p className="text-xs text-slate-400 mt-0.5">Based on sample candidate profile</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Estimated Study Effort</p>
                <p className="font-heading text-2xl sm:text-3xl font-black text-orange-600 mt-1">{currentDemo.studyHours.split(" (")[0]}</p>
                <p className="text-xs text-slate-400 mt-0.5">Tailored to your weekly availability</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Typical Market Compensation</p>
                <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900 mt-1">{currentDemo.medianSalary}</p>
                <p className="text-xs text-slate-400 mt-0.5">Range: {currentDemo.salaryRange}</p>
              </div>
            </div>

            {/* Recommended Skills (Responsible Wording) */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Recommended Skills to Strengthen Your Profile:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentDemo.skillsToLearn.map((skill, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs font-semibold text-unnati-indigo flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-unnati-saffron shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How Readiness is Calculated Callout */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-unnati-indigo" />
                How is Career Readiness Calculated?
              </p>
              <p className="leading-relaxed text-[11px]">
                Readiness is an evidence-weighted Bayesian score comparing your verified capabilities against target role benchmarks. Self-reported skills give baseline credit, while resume-extracted background and diagnostic practice checks increase confidence toward industry expectations.
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                *Illustrative sample diagnostic based on curated labor market benchmarks. Individual progress depends on study commitment.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Want to build your exact roadmap based on your real resume or degree?
              </span>
              <Link href="/onboarding">
                <Button variant="saffron" size="sm" className="btn-shimmer text-xs font-bold">
                  Start Your Free Assessment <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: TRUST, ETHICS & DATA PROTECTION
           ======================================================== */}
        <section className="bg-purple-950 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="text-xs mb-2 border-purple-400/40 text-purple-200">
                Data Trust &amp; Ethics
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold text-white">
                Engineered for Your Privacy and Autonomy
              </h2>
              <p className="text-sm text-purple-200 mt-2">
                UNNATI is designed as a supportive mentor, not a punitive monitoring system.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">Formative, Not High-Risk</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Classified as Non-Annex III formative mentorship under AI governance. We provide guidance for candidate self-growth—never automated rejection or high-risk employee monitoring.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 font-bold mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">72-Hour Data Erasure</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Your data belongs to you. When you request account deletion, all private documents and profile records are cryptographically wiped within 72 hours under DPDP Act requirements.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold mb-3">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">Evidence Transparency</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  We clearly distinguish between self-reported skills, AI-extracted background, and diagnostic checks. You can inspect or correct any detail at any time.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/privacy" className="text-xs text-purple-300 hover:text-white underline font-medium">
                Read our complete DPDP Privacy Notice &amp; Grievance Redressal Protocol &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: FREQUENTLY ASKED QUESTIONS
           ======================================================== */}
        <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <Badge variant="violet" className="text-xs mb-2">
              Common Questions
            </Badge>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Everything you need to know about UNNATI.
            </p>
          </div>

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
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-unnati-indigo transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-unnati-saffron shrink-0 ml-3" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      <p className="mt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            SECTION 8: FINAL CONVERSION BANNER
           ======================================================== */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-unnati-indigo via-purple-900 to-unnati-indigo p-8 sm:p-14 text-center text-white shadow-soft-xl relative overflow-hidden">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Your Career Journey Starts With One Step
            </h2>
            <p className="text-sm sm:text-base text-purple-200 max-w-xl mx-auto mt-3 leading-relaxed">
              Join students, graduates, and professionals building verifiable capability and moving toward the careers they deserve.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button variant="saffron" size="lg" className="btn-shimmer text-base font-bold shadow-soft-md">
                  Get Started Free <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30">
                  Explore Career Pathways
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Reusable Enterprise Brand Footer */}
      <Footer />

      {/* Global AI Career Mentor Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
