"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  IndianRupee, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Scale,
  X,
  Target
} from "lucide-react";

interface RoleBenchmark {
  id: string;
  title: string;
  sector: "Engineering" | "AI & Data" | "Cloud & DevOps" | "Security & Systems";
  medianCtc: string;
  growthRate: string;
  matchScore: number;
  timeToBridgeWeeks: number;
  description: string;
  coreSkills: string[];
  emergingSkills: string[];
  openPositions: string;
}

const ROLES_CATALOG: RoleBenchmark[] = [
  {
    id: "full-stack-eng",
    title: "Senior Full-Stack Engineer",
    sector: "Engineering",
    medianCtc: "₹24.5 LPA",
    growthRate: "+28% YoY",
    matchScore: 82,
    timeToBridgeWeeks: 6,
    description: "Architect scalable multi-tier web applications leveraging Next.js App Router, asynchronous FastAPI, and resilient event streaming with Redis.",
    coreSkills: ["React 19", "Next.js 15", "FastAPI", "PostgreSQL", "Docker", "TypeScript"],
    emergingSkills: ["pgvector RAG", "Server Actions", "Redis Streams"],
    openPositions: "12,400+ active roles"
  },
  {
    id: "ai-engineer",
    title: "Generative AI & Agentic Systems Engineer",
    sector: "AI & Data",
    medianCtc: "₹32.0 LPA",
    growthRate: "+74% YoY",
    matchScore: 68,
    timeToBridgeWeeks: 10,
    description: "Design multi-agent orchestration workflows, evaluate LLM prompts, build low-latency RAG systems, and optimize inference pipelines.",
    coreSkills: ["Python 3.12", "LangChain/LlamaIndex", "Vector DBs", "Prompt Engineering", "FastAPI"],
    emergingSkills: ["Agentic Tool Calling", "Fine-Tuning LoRA", "Groq Inference"],
    openPositions: "8,900+ active roles"
  },
  {
    id: "data-engineer",
    title: "Modern Data Platform Engineer",
    sector: "AI & Data",
    medianCtc: "₹22.0 LPA",
    growthRate: "+34% YoY",
    matchScore: 71,
    timeToBridgeWeeks: 8,
    description: "Build robust data ingestion pipelines, manage lakehouses, enforce data contracts, and optimize distributed SQL query performance.",
    coreSkills: ["Python", "SQL / CTEs", "Apache Spark", "Airflow / Prefect", "Snowflake / BigQuery"],
    emergingSkills: ["Iceberg Tables", "dbt Core", "Kafka Streaming"],
    openPositions: "9,800+ active roles"
  },
  {
    id: "cloud-devops",
    title: "Cloud & Platform Infrastructure Engineer",
    sector: "Cloud & DevOps",
    medianCtc: "₹26.0 LPA",
    growthRate: "+41% YoY",
    matchScore: 62,
    timeToBridgeWeeks: 12,
    description: "Implement immutable Infrastructure as Code, configure Kubernetes clusters, secure CI/CD deployment pipelines, and guarantee 99.99% uptime.",
    coreSkills: ["AWS / GCP", "Terraform", "Kubernetes", "Docker", "CI/CD Actions", "Linux"],
    emergingSkills: ["eBPF Observability", "Zero Trust IAM", "ArgoCD GitOps"],
    openPositions: "14,200+ active roles"
  },
  {
    id: "cybersecurity-analyst",
    title: "Cloud Security & DevSecOps Specialist",
    sector: "Security & Systems",
    medianCtc: "₹28.5 LPA",
    growthRate: "+52% YoY",
    matchScore: 54,
    timeToBridgeWeeks: 14,
    description: "Safeguard cloud perimeters, perform OWASP API threat modeling, automate vulnerability remediation, and ensure DPDP & SOC2 compliance.",
    coreSkills: ["OWASP Top 10", "OAuth 2.0 / OIDC", "CloudTrail / SIEM", "Cryptography", "Python"],
    emergingSkills: ["API Shielding", "Runtime Security", "Post-Quantum Crypto"],
    openPositions: "6,700+ active roles"
  },
  {
    id: "mobile-developer",
    title: "Cross-Platform Mobile Engineer (React Native / Flutter)",
    sector: "Engineering",
    medianCtc: "₹19.5 LPA",
    growthRate: "+22% YoY",
    matchScore: 76,
    timeToBridgeWeeks: 7,
    description: "Craft high-performance, responsive native mobile experiences for iOS and Android with offline-first caching and biometric authentication.",
    coreSkills: ["React Native", "TypeScript", "Mobile State Management", "REST/GraphQL", "App Store Deployments"],
    emergingSkills: ["Turborepo Mobile", "Biometric Auth", "Skia Graphics"],
    openPositions: "7,300+ active roles"
  }
];

export default function ExploreCareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(["full-stack-eng", "ai-engineer"]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [targetSetSuccess, setTargetSetSuccess] = useState<string | null>(null);

  const sectors = ["All", "Engineering", "AI & Data", "Cloud & DevOps", "Security & Systems"];

  const filteredRoles = ROLES_CATALOG.filter((role) => {
    const matchesSearch = role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.coreSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSector = selectedSector === "All" || role.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const toggleComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 2) {
        setSelectedForComparison([selectedForComparison[1], id]);
      } else {
        setSelectedForComparison([...selectedForComparison, id]);
      }
    }
  };

  const handleSetTargetRole = (role: RoleBenchmark) => {
    setTargetSetSuccess(role.title);
    setTimeout(() => setTargetSetSuccess(null), 3500);
  };

  const comparedRoles = ROLES_CATALOG.filter((r) => selectedForComparison.includes(r.id));

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet" className="text-xs">
                Stage 1 Discovery Engine
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                O*NET 29.1 & ESCO v1.2 Curated
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Tech Trajectories & Benchmarks
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Discover in-demand tech roles, compare real-world compensation benchmarks across Indian tech hubs, and calculate your exact readiness gap using Algorithm B.
            </p>
          </div>

          {/* Quick Comparison Bar */}
          {selectedForComparison.length > 0 && (
            <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-2 border border-white/10">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200">
                  {selectedForComparison.length} {selectedForComparison.length === 1 ? "role" : "roles"} selected
                </span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowCompareModal(true)}
                disabled={selectedForComparison.length < 2}
                className="text-xs py-1 px-3"
              >
                Compare Side-by-Side
              </Button>
            </div>
          )}
        </div>

        {/* Success Alert When Role Set */}
        {targetSetSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-200 flex items-center justify-between backdrop-blur-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Target Role Updated!</p>
                <p className="text-xs text-emerald-300/80">
                  <strong>{targetSetSuccess}</strong> is now configured as your target. Your roadmap milestones and skill gaps have been dynamically regenerated.
                </p>
              </div>
            </div>
            <Link href="/roadmap">
              <Button size="sm" variant="saffron" className="text-xs">
                View Updated Roadmap <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-white/10 mb-8">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or skill (e.g. Next.js, Python, Cloud)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-400 text-white focus:outline-none"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedSector === sector
                    ? "bg-gradient-to-r from-purple-700 to-unnati-violet text-white shadow-md border border-purple-400/30"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRoles.map((role) => {
            const isCompared = selectedForComparison.includes(role.id);
            return (
              <Card
                key={role.id}
                hoverEffect
                className="relative flex flex-col justify-between border-white/10 bg-slate-900/60 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300"
              >
                <div>
                  {/* Top Badge & Match Meter */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="violet" className="text-[11px]">
                      {role.sector}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-400">
                        {role.matchScore}% Match
                      </span>
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                          style={{ width: `${role.matchScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-lg font-bold text-white mb-2 leading-snug">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-white/5 border border-white/5 mb-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Median CTC</p>
                      <p className="text-xs font-extrabold text-white mt-0.5">{role.medianCtc}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Growth</p>
                      <p className="text-xs font-extrabold text-emerald-400 mt-0.5">{role.growthRate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Gap Bridge</p>
                      <p className="text-xs font-extrabold text-orange-400 mt-0.5">{role.timeToBridgeWeeks} wks</p>
                    </div>
                  </div>

                  {/* Core Skills Chips */}
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Core Competencies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.coreSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => toggleComparison(role.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      isCompared
                        ? "bg-purple-600/20 border-purple-400 text-purple-200"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    {isCompared ? "Compared" : "Compare"}
                  </button>

                  <Button
                    size="sm"
                    variant="saffron"
                    onClick={() => handleSetTargetRole(role)}
                    className="text-xs py-1.5 px-3"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Set as Target
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Side-by-Side Comparison Modal */}
        {showCompareModal && comparedRoles.length >= 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl rounded-3xl bg-slate-950 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      Side-by-Side Trajectory Comparison
                    </h3>
                    <p className="text-xs text-slate-400">
                      Algorithmic readiness delta based on candidate verified skill profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comparison Table Grid */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                {comparedRoles.slice(0, 2).map((role) => (
                  <div key={role.id} className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <Badge variant="violet" className="text-xs mb-2">
                        {role.sector}
                      </Badge>
                      <h4 className="font-heading text-lg font-bold text-white mb-2">
                        {role.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Median Compensation:</span>
                          <span className="font-bold text-white">{role.medianCtc}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Demand Trajectory:</span>
                          <span className="font-bold text-emerald-400">{role.growthRate}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Your Algorithm B Match:</span>
                          <span className="font-bold text-purple-300">{role.matchScore}%</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Estimated Study Time:</span>
                          <span className="font-bold text-orange-400">{role.timeToBridgeWeeks} Weeks (10h/wk)</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-300 uppercase mb-2">
                          Core Required Stack:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.coreSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] border border-white/10">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <Button
                        variant="saffron"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          handleSetTargetRole(role);
                          setShowCompareModal(false);
                        }}
                      >
                        Set {role.title.split(" ")[0]} as Target
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </main>

      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
