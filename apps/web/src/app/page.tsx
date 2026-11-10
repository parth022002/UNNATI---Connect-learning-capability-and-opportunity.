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
  CheckCheck
} from "lucide-react";

export default function HomePage() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<number>(0);
  const [selectedDemoDomain, setSelectedDemoDomain] = useState<"business" | "tech" | "finance">("business");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const audiences = [
    {
      title: "Students & Freshers",
      subtitle: "College & University Learners",
      icon: GraduationCap,
      description: "Connect your coursework to industry expectations, build verified project portfolios, and prepare for campus and off-campus placements with zero guesswork.",
      highlight: "87% faster time to first portfolio project"
    },
    {
      title: "Recent Graduates",
      subtitle: "0 – 1 Year Post-Degree",
      icon: Award,
      description: "Overcome the 'experience paradox'. Identify exactly which tools and practical skills high-growth companies expect, and bridge gaps with step-by-step milestones.",
      highlight: "Personalized study paths fit to your pace"
    },
    {
      title: "Working Professionals",
      subtitle: "2 – 6+ Years Experience",
      icon: Briefcase,
      description: "Accelerate your career trajectory. Upskill in modern methodologies, lead complex cross-functional initiatives, and earn benchmarked recognition for senior roles.",
      highlight: "Targeted skill upgrades for promotions"
    },
    {
      title: "Career Switchers",
      subtitle: "Transitioning Disciplines",
      icon: Compass,
      description: "Switching from non-tech to analytics, or operations to product? Map your transferable capabilities, pinpoint missing skills, and transition confidently.",
      highlight: "Prerequisite mapping for smooth pivots"
    }
  ];

  const domainDemos = {
    business: {
      roleTitle: "Product & Business Strategy Lead",
      domain: "Business & Management",
      readinessPct: 78,
      studyHours: "45 Study Hours",
      skillsToLearn: ["Product Roadmap Planning", "User Metrics & A/B Testing", "Financial Modeling"],
      benchmarkSalary: "₹16.5L – ₹28.0L CTC"
    },
    tech: {
      roleTitle: "Modern Software & Systems Engineer",
      domain: "Technology & Engineering",
      readinessPct: 82,
      studyHours: "55 Study Hours",
      skillsToLearn: ["Next.js & React Architecture", "Asynchronous Python / APIs", "Cloud Infrastructure (Docker)"],
      benchmarkSalary: "₹18.0L – ₹30.0L CTC"
    },
    finance: {
      roleTitle: "Financial & Data Analytics Specialist",
      domain: "Finance & FinTech",
      readinessPct: 72,
      studyHours: "60 Study Hours",
      skillsToLearn: ["Advanced SQL & Forecasting", "Financial Ratio Diagnostics", "Business Intelligence (Power BI)"],
      benchmarkSalary: "₹14.0L – ₹24.0L CTC"
    }
  };

  const currentDemo = domainDemos[selectedDemoDomain];

  const faqs = [
    {
      q: "What is UNNATI, and how does it help my career?",
      a: "UNNATI (उन्नति) is an AI-powered career growth companion. Rather than functioning as a passive job board or generic course catalog, UNNATI diagnoses the exact delta between your current skills and target career benchmarks. It builds an ordered, step-by-step learning roadmap tailored to your weekly schedule and verifies your progress through practical milestones."
    },
    {
      q: "Is UNNATI only for software engineers and programmers?",
      a: "No! UNNATI is engineered for diverse career pathways including Business & Management, Data & Analytics, Finance & FinTech, Product Design, Operations, Supply Chain, and Technology. Any learner aiming to bridge the gap between education and real-world capability is supported."
    },
    {
      q: "How does the AI Resume & Academic Ingestion work?",
      a: "When you upload your resume or academic transcript, Gemini 2.5 Flash extracts your verified education, experiences, and background into structured profiles. Skills enter the 'Extracted' state with baseline confidence, which increases to 'Verified' as you complete practical diagnostic checks and build projects."
    },
    {
      q: "How is my personal data protected under Indian privacy laws?",
      a: "UNNATI is built in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2025/2026 (India). Your data is used exclusively for formative career self-development (Non-Annex III under EU AI Act). You maintain the right to erasure at any time, with automated 72-hour cryptographic shredding."
    },
    {
      q: "Does UNNATI guarantee a job or placement?",
      a: "UNNATI does not make artificial employment guarantees. Instead, we provide authentic capability development, structured portfolio milestones, and evidence-weighted readiness scoring that make you genuinely competitive for high-impact roles."
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1">
        
        {/* HERO SECTION: Warm, Aspirational, High-Impact */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Core Positioning */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Campaign Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 border border-purple-200/90 px-4 py-1.5 text-xs font-bold text-unnati-indigo shadow-soft-sm">
                <Sparkles className="h-4 w-4 text-unnati-saffron" />
                <span>Your Growth Companion</span>
                <span className="h-1.5 w-1.5 rounded-full bg-unnati-saffron" />
                <span className="text-slate-600 font-medium">Learn. Build. Grow. Succeed.</span>
              </div>

              {/* Aspirational Headline (Human-centred) */}
              <h1 className="font-heading text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Your career journey deserves a <br />
                <span className="text-gradient-indigo">clear, confident</span> <br />
                <span className="text-gradient-saffron">direction forward.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Discover your strengths, understand your skill gaps, and follow a personalised, step-by-step roadmap to the career you want — across <strong>Technology, Business, Finance, Design, and Analytics</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/onboarding">
                  <Button variant="saffron" size="lg" className="btn-shimmer text-base font-bold shadow-soft-md">
                    Start Your Free Journey <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="lg" className="text-base font-semibold">
                    <Compass className="h-4 w-4 mr-1.5 text-unnati-violet" /> Explore Career Paths
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
                  <span>Built for Students &amp; Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span>72-Hour Data Erasure Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Real-World Experience Showcase Card */}
            <div className="lg:col-span-5">
              <div className="clean-card p-6 sm:p-8 bg-white border-2 border-purple-100 shadow-soft-xl relative">
                
                {/* Showcase Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-unnati-indigo font-bold text-sm">
                      84%
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-slate-900">Career Readiness Profile</h4>
                      <p className="text-xs text-slate-500">Target: Product &amp; Technology Strategy</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">
                    On Track
                  </Badge>
                </div>

                {/* Practical Skill Confidence Progression */}
                <div className="mt-5 space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Business Analytics &amp; User Research</span>
                      <span className="font-semibold text-emerald-700">Verified (Project Backed)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Strategic Product Roadmapping</span>
                      <span className="font-semibold text-unnati-violet">Diagnostic Check Met</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-unnati-violet rounded-full w-[80%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Financial Metrics &amp; Unit Economics</span>
                      <span className="font-semibold text-orange-600">Next Priority Skill</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-[55%]" />
                    </div>
                  </div>
                </div>

                {/* Next Milestone Study Card */}
                <div className="mt-5 p-4 rounded-2xl bg-purple-50/80 border border-purple-200/90">
                  <div className="flex items-center justify-between text-xs mb-1 font-bold">
                    <span className="text-unnati-indigo">Next Milestone Recommendation</span>
                    <span className="text-orange-700 font-mono">10 Hours</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Phase 2: Complete User Journey Mapping &amp; Product Metrics Sprint
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Curated Resources &amp; Rubric</span>
                    <Link href="/roadmap" className="text-unnati-violet hover:text-unnati-indigo font-bold flex items-center gap-1">
                      View Roadmap <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: AUDIENCE PATHWAYS (Who UNNATI Helps) */}
        <section id="audiences" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="violet" className="text-xs mb-2">
              Tailored For Your Stage
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Personalised Growth Journey for Every Ambition
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Whether you are in college, stepping into your first role, or aiming for a leadership leap, UNNATI adapts to where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <Card 
                  key={idx}
                  hoverEffect
                  className="clean-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-unnati-indigo border border-purple-200 mb-4">
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

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {aud.highlight}
                    </span>
                    <Link href="/onboarding" className="text-unnati-violet hover:text-unnati-indigo">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: HOW UNNATI WORKS (5-Stage Visual Journey) */}
        <section id="how-it-works" className="bg-white py-20 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="saffron" className="text-xs mb-2">
                The UNNATI Pathway
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How UNNATI Powers Your Career Growth
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Five synchronized stages connecting education, capability, and opportunity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  num: "01",
                  title: "Discover Direction",
                  desc: "Explore career pathways across business, tech, finance, design, and analytics matching your strengths.",
                  icon: Compass
                },
                {
                  num: "02",
                  title: "Understand Skills",
                  desc: "Upload your resume or syllabus to extract verified coursework, past projects, and capabilities.",
                  icon: Layers
                },
                {
                  num: "03",
                  title: "Identify Gaps",
                  desc: "Compare what you know against real-world employer benchmarks to pinpoint exact missing skills.",
                  icon: Target
                },
                {
                  num: "04",
                  title: "Build Roadmap",
                  desc: "Follow an ordered, milestone-based learning plan fit to your weekly study hours.",
                  icon: MapPin
                },
                {
                  num: "05",
                  title: "Demonstrate & Grow",
                  desc: "Build real projects, complete diagnostic checks, and prove readiness for high-growth opportunities.",
                  icon: Award
                }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-soft-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-heading text-3xl font-black text-unnati-indigo">
                          {step.num}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-unnati-violet">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE SKILL GAP DEMO (In Plain English) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80">
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

          {/* Domain Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {(["business", "tech", "finance"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedDemoDomain(key)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
                <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">Target Career Track</span>
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
                <p className="text-xs text-slate-400 mt-0.5">Based on existing profile</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Required Study Time</p>
                <p className="font-heading text-3xl font-black text-orange-600 mt-1">{currentDemo.studyHours}</p>
                <p className="text-xs text-slate-400 mt-0.5">~6 weeks at 8 hrs/week</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Median Compensation</p>
                <p className="font-heading text-3xl font-black text-slate-900 mt-1">{currentDemo.benchmarkSalary}</p>
                <p className="text-xs text-slate-400 mt-0.5">Indian Industry Benchmark</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Key Skills Recommended to Reach 100% Readiness:
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

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* SECTION 5: TRUST, ETHICS & DATA PROTECTION */}
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
                  Classified as Non-Annex III formative mentorship under AI governance. We never perform automated screening out or punitive ranking.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 font-bold mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">72-Hour Crypto-Shredding</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Your data belongs to you. When you request account deletion, all private documents and profile records are cryptographically wiped within 72 hours.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold mb-3">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">Evidence Transparency</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  We clearly distinguish between self-reported skills, AI-extracted background, and diagnostic checks. You can correct any detail at any time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
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
                  className="clean-card overflow-hidden transition-all border border-slate-200"
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

        {/* SECTION 7: FINAL CONVERSION BANNER */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-unnati-indigo via-purple-900 to-unnati-indigo p-8 sm:p-14 text-center text-white shadow-soft-xl relative overflow-hidden">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Your Career Journey Starts With One Step
            </h2>
            <p className="text-sm sm:text-base text-purple-200 max-w-xl mx-auto mt-3 leading-relaxed">
              Join students, graduates, and professionals building verifiable capability and moving towards the careers they deserve.
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
