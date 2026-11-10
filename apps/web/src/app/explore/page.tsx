"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Search, 
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
  Target,
  Briefcase,
  GraduationCap,
  Compass,
  Building2,
  PieChart,
  Palette,
  Cpu,
  LineChart
} from "lucide-react";

interface RoleBenchmark {
  id: string;
  title: string;
  sector: "Business & Management" | "Data & Analytics" | "Finance & Strategy" | "Design & Creative" | "Technology & AI";
  targetAudience: string;
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
    id: "product-manager",
    title: "Associate Product Manager (APM)",
    sector: "Business & Management",
    targetAudience: "Freshers, MBA Graduates & Switchers",
    medianCtc: "₹16.5 LPA",
    growthRate: "+32% YoY",
    matchScore: 86,
    timeToBridgeWeeks: 6,
    description: "Lead product discovery, translate customer insights into user stories, define product roadmaps, and collaborate closely with cross-functional teams.",
    coreSkills: ["Product Roadmapping", "User Story Mapping", "Data Analysis (SQL)", "Agile / Scrum", "Wireframing"],
    emergingSkills: ["AI Feature Design", "A/B Testing Experiments", "Growth Loops"],
    openPositions: "9,400+ active roles"
  },
  {
    id: "bi-analyst",
    title: "Business Intelligence & Analytics Specialist",
    sector: "Data & Analytics",
    targetAudience: "Commerce, Science & Engineering Graduates",
    medianCtc: "₹14.0 LPA",
    growthRate: "+38% YoY",
    matchScore: 89,
    timeToBridgeWeeks: 5,
    description: "Transform raw organizational data into actionable executive dashboards, KPI models, and automated business health reports.",
    coreSkills: ["Advanced SQL", "Power BI / Tableau", "Excel Financial Modeling", "Data Storytelling", "Statistical Analysis"],
    emergingSkills: ["dbt Modeling", "Predictive Forecasting", "Python Automation"],
    openPositions: "15,800+ active roles"
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst & Valuation Associate",
    sector: "Finance & Strategy",
    targetAudience: "Finance, B.Com, BBA & Economics Graduates",
    medianCtc: "₹15.2 LPA",
    growthRate: "+24% YoY",
    matchScore: 81,
    timeToBridgeWeeks: 7,
    description: "Perform discounted cash flow (DCF) modeling, budget variance analysis, market comparable research, and strategic capital allocation.",
    coreSkills: ["Financial Modeling", "Valuation Analysis", "Three-Statement Modeling", "Variance Analysis", "PowerPoint Storytelling"],
    emergingSkills: ["FinTech APIs", "Python for Quant Analysis", "ESG Reporting"],
    openPositions: "8,200+ active roles"
  },
  {
    id: "ux-designer",
    title: "Product & UX/UI Designer",
    sector: "Design & Creative",
    targetAudience: "Designers, Humanities & Creative Thinkers",
    medianCtc: "₹15.8 LPA",
    growthRate: "+29% YoY",
    matchScore: 84,
    timeToBridgeWeeks: 6,
    description: "Conduct user research interviews, design intuitive mobile and web journeys, create design system components, and validate prototypes.",
    coreSkills: ["Figma Design Systems", "User Research & Usability Testing", "Wireframing", "Interaction Design", "Design Thinking"],
    emergingSkills: ["Accessibility (WCAG 2.2)", "Micro-Interactions", "Generative Prototyping"],
    openPositions: "7,900+ active roles"
  },
  {
    id: "operations-lead",
    title: "Operations & Supply Chain Lead",
    sector: "Business & Management",
    targetAudience: "Engineers, Generalists & MBA Candidates",
    medianCtc: "₹13.5 LPA",
    growthRate: "+21% YoY",
    matchScore: 78,
    timeToBridgeWeeks: 7,
    description: "Optimize end-to-end operational workflows, manage vendor SLAs, streamline logistical turnaround times, and automate process bottlenecks.",
    coreSkills: ["Process Optimization (Lean)", "Vendor Management", "Root Cause Analysis", "Excel Analytics", "Supply Chain Planning"],
    emergingSkills: ["ERP Systems", "Automated Workflow Bots", "Inventory Forecasting"],
    openPositions: "11,100+ active roles"
  },
  {
    id: "full-stack-eng",
    title: "Full-Stack Software Engineer",
    sector: "Technology & AI",
    targetAudience: "Computer Science Students, Tech Switchers",
    medianCtc: "₹22.5 LPA",
    growthRate: "+28% YoY",
    matchScore: 82,
    timeToBridgeWeeks: 6,
    description: "Build robust, responsive web applications leveraging Next.js App Router, asynchronous Python/FastAPI backends, and cloud databases.",
    coreSkills: ["React / Next.js", "TypeScript", "Python / FastAPI", "PostgreSQL", "Docker", "REST APIs"],
    emergingSkills: ["Vector Search", "Cloud Deployments", "Microservices"],
    openPositions: "18,400+ active roles"
  },
  {
    id: "ai-engineer",
    title: "Generative AI & Machine Learning Engineer",
    sector: "Technology & AI",
    targetAudience: "Data Scientists, Math/Stats & Software Engineers",
    medianCtc: "₹30.0 LPA",
    growthRate: "+64% YoY",
    matchScore: 68,
    timeToBridgeWeeks: 10,
    description: "Design multi-agent orchestration workflows, evaluate LLM prompts, build retrieval-augmented generation (RAG) pipelines, and deploy models.",
    coreSkills: ["Python", "Machine Learning Fundamentals", "LangChain / LlamaIndex", "Vector Databases", "Model Evaluation"],
    emergingSkills: ["Agentic Tool Calling", "LoRA Fine-Tuning", "Low-Latency Inference"],
    openPositions: "9,600+ active roles"
  },
  {
    id: "cloud-devops",
    title: "Cloud & Infrastructure Engineer",
    sector: "Technology & AI",
    targetAudience: "Systems Admins, IT Graduates & Engineers",
    medianCtc: "₹24.0 LPA",
    growthRate: "+36% YoY",
    matchScore: 64,
    timeToBridgeWeeks: 9,
    description: "Implement immutable Infrastructure as Code, configure Kubernetes clusters, secure deployment pipelines, and maintain 99.99% system reliability.",
    coreSkills: ["AWS / Cloud Architecture", "Docker & Containers", "CI/CD Automation", "Linux Administration", "Terraform"],
    emergingSkills: ["GitOps Workflows", "Zero-Trust Security", "Observability Monitoring"],
    openPositions: "13,200+ active roles"
  }
];

export default function ExploreCareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(["product-manager", "bi-analyst"]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [targetSetSuccess, setTargetSetSuccess] = useState<string | null>(null);

  const sectors = [
    "All", 
    "Business & Management", 
    "Data & Analytics", 
    "Finance & Strategy", 
    "Design & Creative", 
    "Technology & AI"
  ];

  const filteredRoles = ROLES_CATALOG.filter((role) => {
    const matchesSearch = 
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.coreSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
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
    setTimeout(() => setTargetSetSuccess(null), 4000);
  };

  const comparedRoles = ROLES_CATALOG.filter((r) => selectedForComparison.includes(r.id));

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet" className="text-xs font-semibold">
                Career Discovery &amp; Benchmarks
              </Badge>
              <span className="text-xs text-slate-700 font-medium">
                Multi-Disciplinary Pathways
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Careers Across Every Domain
            </h1>
            <p className="text-sm text-slate-700 max-w-2xl mt-1.5 leading-relaxed">
              Discover real-world career trajectories across Business, Analytics, Finance, Design, and Technology. Compare typical industry salaries, assess readiness, and map your path forward.
            </p>
          </div>

          {/* Quick Comparison Bar */}
          {selectedForComparison.length > 0 && (
            <div className="flex items-center gap-3 clean-card rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {selectedForComparison.length} {selectedForComparison.length === 1 ? "role" : "roles"} selected
                </span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowCompareModal(true)}
                disabled={selectedForComparison.length < 2}
                className="text-xs py-1.5 px-3"
              >
                Compare Side-by-Side
              </Button>
            </div>
          )}
        </div>

        {/* Success Alert When Role Set */}
        {targetSetSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Target Career Updated!</p>
                <p className="text-xs text-emerald-700">
                  <strong>{targetSetSuccess}</strong> is now saved as your target direction. Your personalized roadmap milestones and learning recommendations are ready.
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 clean-card rounded-2xl p-4 mb-8">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, skill, or keyword (e.g. Product, SQL, Figma)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl clean-input text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedSector === sector
                    ? "bg-purple-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
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
                className="clean-card rounded-3xl p-6 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Top Badge & Match Meter */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="violet" className="text-[11px] font-semibold">
                      {role.sector}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-700">
                        {role.matchScore}% Match
                      </span>
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${role.matchScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-1 leading-snug">
                    {role.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-purple-700 mb-2">
                    Ideal For: {role.targetAudience}
                  </p>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-purple-50/60 border border-purple-100 mb-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Median CTC</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">{role.medianCtc}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Outlook</p>
                      <p className="text-xs font-extrabold text-emerald-700 mt-0.5">{role.growthRate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Est. Bridge</p>
                      <p className="text-xs font-extrabold text-orange-600 mt-0.5">{role.timeToBridgeWeeks} wks</p>
                    </div>
                  </div>

                  {/* Core Skills Chips */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Core Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.coreSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => toggleComparison(role.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      isCompared
                        ? "bg-purple-100 border-purple-300 text-purple-900"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 border border-purple-200">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      Side-by-Side Career Pathway Comparison
                    </h3>
                    <p className="text-xs text-slate-700">
                      Compare skills, compensation benchmarks, and estimated preparation time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comparison Table Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {comparedRoles.slice(0, 2).map((role) => (
                  <div key={role.id} className="clean-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <Badge variant="violet" className="text-xs mb-2">
                        {role.sector}
                      </Badge>
                      <h4 className="font-heading text-lg font-bold text-slate-900 mb-1">
                        {role.title}
                      </h4>
                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="space-y-2.5 mb-5">
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Median Compensation:</span>
                          <span className="font-bold text-slate-900">{role.medianCtc}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Growth Outlook:</span>
                          <span className="font-bold text-emerald-700">{role.growthRate}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Current Readiness Match:</span>
                          <span className="font-bold text-purple-700">{role.matchScore}%</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Estimated Prep Time:</span>
                          <span className="font-bold text-orange-600">{role.timeToBridgeWeeks} Weeks (10h/wk)</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                          Core Required Skills:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.coreSkills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
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

      <Footer />

      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
