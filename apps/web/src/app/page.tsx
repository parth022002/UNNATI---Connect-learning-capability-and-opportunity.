"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
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
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  Code2,
  FileCheck2,
  ArrowUpRight
} from "lucide-react";

export default function HomePage() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedDemoRole, setSelectedDemoRole] = useState<"fullstack" | "aiml" | "devops">("fullstack");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const demoRoles = {
    fullstack: {
      title: "Senior Full-Stack Engineer",
      matchScore: 82,
      gapHours: "65 Study Hours",
      missingSkills: ["Next.js App Router (P1)", "Redis Streams (P2)", "pgvector RAG (P1)"],
      medianCtc: "₹24.5 LPA"
    },
    aiml: {
      title: "Generative AI Systems Engineer",
      matchScore: 68,
      gapHours: "110 Study Hours",
      missingSkills: ["Agentic Tool Calling (P0)", "LoRA Fine-Tuning (P1)", "Groq Low-Latency (P2)"],
      medianCtc: "₹32.0 LPA"
    },
    devops: {
      title: "Platform Infrastructure & Cloud",
      matchScore: 74,
      gapHours: "85 Study Hours",
      missingSkills: ["Kubernetes Operators (P1)", "Terraform State (P1)", "eBPF Tracing (P2)"],
      medianCtc: "₹26.0 LPA"
    }
  };

  const currentDemo = demoRoles[selectedDemoRole];

  const faqs = [
    {
      q: "How does UNNATI differ from standard job boards or online course platforms?",
      a: "UNNATI is an autonomous AI growth companion, not a static job board. Using Algorithm A (Bayesian skill belief modeling), Algorithm B (evidence-weighted gap scoring), and Algorithm C (topological milestone DAGs), UNNATI diagnoses the exact delta between your current capabilities and target market benchmarks, synthesizing an ordered, step-by-step roadmap tailored to your weekly schedule."
    },
    {
      q: "How does the AI Resume Extraction work?",
      a: "When you upload your resume or transcript, Gemini 2.5 Flash extracts your education, verified experiences, and skills into structured Pydantic models. Skills enter the INFERRED state with a baseline confidence factor, which increases to ASSESSED and VERIFIED as you complete diagnostic quizzes and showcase real projects."
    },
    {
      q: "Is my personal and academic data protected under Indian privacy laws?",
      a: "Yes. UNNATI is engineered in full compliance with the Digital Personal Data Protection Act (DPDP Act, India 2025/2026). We enforce strict purpose-specific consent logging, Row-Level Security (RLS) on PostgreSQL, zero plaintext storage, and an automated 72-hour crypto-shredding right-to-erasure pipeline."
    },
    {
      q: "What is Non-Annex III classification under AI governance?",
      a: "UNNATI's student-facing guidance functions as a formative self-development tool rather than a high-risk employer screening gate. This keeps student advisory non-punitive, transparent, and focused entirely on empowering candidate progress."
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Vision & Calls to Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-semibold text-purple-200 backdrop-blur-md shadow-glow-violet animate-pulse-slow">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
              <span>Next-Gen Autonomous Career Architecture</span>
              <span className="rounded-full bg-unnati-saffron px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                v1.0 Live
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Connect Learning, <br />
              <span className="text-gradient-violet">Capability</span> &amp; <br />
              <span className="text-gradient-saffron">Opportunity.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              UNNATI extracts your authentic skills, calculates evidence-weighted competency gaps using <strong>Algorithm B</strong>, and maps a personalized topological milestone DAG to propel your career forward.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/onboarding">
                <Button variant="saffron" size="lg" className="btn-shimmer text-sm font-bold shadow-glow-saffron">
                  Launch Your Roadmap <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="text-sm font-semibold">
                  <Compass className="h-4 w-4 mr-1 text-purple-400" /> Explore Roles &amp; CTC
                </Button>
              </Link>
            </div>

            {/* Trust & Compliance Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>DPDP Act (India 2026) Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Gemini 2.5 + Groq Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-400" />
                <span>Zero-Data Retention Crypto-Shred</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/15 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-purple-950/40">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                    0.94
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Belief State</h4>
                    <p className="text-[11px] text-slate-400">Bayesian Belief: High Confidence</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Verified Learner
                </Badge>
              </div>

              {/* Dynamic State Progression */}
              <div className="mt-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">FastAPI &amp; Async Microservices</span>
                    <span className="font-mono text-emerald-400 font-bold">VERIFIED (0.96)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full w-[96%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">PostgreSQL pgvector RAG</span>
                    <span className="font-mono text-purple-300 font-bold">ASSESSED (0.88)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-unnati-violet rounded-full w-[88%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Next.js 15 Server Components</span>
                    <span className="font-mono text-orange-400 font-bold">INFERRED (0.65)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-orange-400 rounded-full w-[65%]" />
                  </div>
                </div>
              </div>

              {/* Next Recommended Milestone Teaser */}
              <div className="mt-6 p-4 rounded-2xl border border-purple-500/30 bg-purple-950/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-300 font-bold">Next Optimized Milestone</span>
                  <span className="text-[10px] text-orange-400 font-mono">12h Target</span>
                </div>
                <p className="text-xs text-white font-semibold">
                  Phase 2: Event-Driven Task Queues with Upstash Redis Streams
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Prerequisite: FastAPI Async Verified</span>
                  <Link href="/roadmap" className="text-orange-300 hover:text-orange-200 font-bold flex items-center gap-1">
                    Inspect DAG <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Live Skill Gap Diagnostic Sandbox Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="saffron" className="text-xs mb-2">
            Interactive Diagnostic Engine
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See Algorithm B Gap Scoring in Action
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Select a target trajectory below to observe how our Bayesian scoring model estimates competency gaps and required learning hours.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(["fullstack", "aiml", "devops"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedDemoRole(key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedDemoRole === key
                  ? "bg-gradient-to-r from-purple-700 to-unnati-violet text-white shadow-glow-violet border border-purple-400/40"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {demoRoles[key].title}
            </button>
          ))}
        </div>

        {/* Live Calculation Output Card */}
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/15">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center pb-6 border-b border-white/10">
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Algorithm B Readiness</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">{currentDemo.matchScore}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Weighted Competency Match</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Estimated Bridge Time</p>
              <p className="text-3xl font-extrabold text-orange-400 mt-1">{currentDemo.gapHours}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Topological Path Length</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono">Median Indian Tech CTC</p>
              <p className="text-3xl font-extrabold text-white mt-1">{currentDemo.medianCtc}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Adzuna Benchmark 2026</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Identified Core Competency Gaps:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentDemo.missingSkills.map((skill, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-200 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-unnati-saffron" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Want a tailored roadmap based on your actual resume?
            </span>
            <Link href="/onboarding">
              <Button size="sm" variant="saffron" className="text-xs">
                Run Personalized Audit <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Stage Learner Journey Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="violet" className="text-xs mb-2">
            End-to-End Learner Journey
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How UNNATI Bridges the Capability Gap
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Five synchronized algorithmic stages designed to turn raw potential into verified technical expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              num: "01",
              title: "Career Discovery",
              desc: "Explore 900+ occupations mapped across ESCO and O*NET taxonomies with compensation insights.",
              icon: Compass,
              badge: "Stage 1"
            },
            {
              num: "02",
              title: "Resume Extraction",
              desc: "Gemini 2.5 Flash ingests resumes and transcripts with structured Pydantic schema validation.",
              icon: FileCheck2,
              badge: "Stage 2"
            },
            {
              num: "03",
              title: "Gap Diagnostics",
              desc: "Algorithm B computes evidence-weighted deltas accounting for Bayesian state and recency decay.",
              icon: Cpu,
              badge: "Stage 3"
            },
            {
              num: "04",
              title: "Roadmap Synthesis",
              desc: "Algorithm C builds a prerequisite-aware topological milestone DAG fit to your weekly hours.",
              icon: MapPin,
              badge: "Stage 4"
            },
            {
              num: "05",
              title: "Adaptive Mastery",
              desc: "Item Response Theory quizzes verify capability and transition skills to verified employment state.",
              icon: Award,
              badge: "Stage 5"
            }
          ].map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                className="glass-panel p-5 rounded-2xl border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-unnati-saffron">
                      {stage.num}
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      {stage.badge}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs font-semibold text-purple-300">
                  <Icon className="h-4 w-4 mr-1 text-purple-400" />
                  <span>Autonomous Agent</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="text-center mb-10">
          <Badge variant="default" className="text-xs mb-2">
            FAQ &amp; Governance
          </Badge>
          <h2 className="font-heading text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-purple-200 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-unnati-saffron shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    <p className="mt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 text-center border border-purple-500/30 relative overflow-hidden">
          <div className="glow-orb-saffron w-[350px] h-[350px] -top-20 -right-20 opacity-40" />
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Accelerate Your Career Trajectory?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-3 leading-relaxed">
            Join hundreds of ambitious students and software engineers mapping their capabilities to high-growth opportunities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/onboarding">
              <Button variant="saffron" size="lg" className="btn-shimmer text-sm font-bold shadow-glow-saffron">
                Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="text-sm">
                Explore Tech Trajectories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="UNNATI" width={28} height={28} className="rounded-lg object-contain" />
            <span className="font-heading font-bold text-white text-sm">
              UNNATI<span className="text-unnati-saffron">.</span>
            </span>
            <span className="text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/explore" className="hover:text-white transition-colors">Roles</Link>
            <Link href="/assessments" className="hover:text-white transition-colors">Assessments</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">DPDP Privacy</Link>
          </div>
        </div>
      </footer>

      {/* Global AI Companion Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
