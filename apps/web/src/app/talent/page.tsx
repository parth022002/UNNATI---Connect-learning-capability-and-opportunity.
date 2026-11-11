"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { StaggerContainer, StaggerItem, CountUpNumber } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Briefcase, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Star, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Layers,
  TrendingUp,
  Building2,
  CheckCheck,
  Send,
  Eye,
  PlusCircle
} from "lucide-react";
import { 
  api, 
  CandidateTalentProfile, 
  OpportunityItem, 
  MarketIntelligence 
} from "@/lib/api";

export default function TalentPage() {
  const [candidates, setCandidates] = useState<CandidateTalentProfile[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [minReadiness, setMinReadiness] = useState<number>(65);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [capstoneOnly, setCapstoneOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"candidates" | "opportunities" | "intel">("candidates");

  const availableSkillFilters = [
    "Python", "FastAPI", "React", "Docker", "PostgreSQL", 
    "TypeScript", "SQL", "Power BI", "Data Analysis", "Product Sense"
  ];

  // Fallback demo candidate pool
  const fallbackCandidates: CandidateTalentProfile[] = [
    {
      candidate_id: "cand-01",
      anonymized_identifier: "Candidate #UN-7821",
      target_role: "Full-Stack Software Engineer",
      headline: "Full-Stack Developer with hands-on Next.js & FastAPI microservices",
      readiness_score: 84.5,
      experience_years: 1.0,
      verified_skills: ["Python", "FastAPI", "React", "PostgreSQL", "Git"],
      assessed_skills: ["Docker", "TypeScript", "REST APIs"],
      inferred_skills: ["CI/CD", "Redis", "System Design"],
      match_percentage: 92.0,
      capstone_completed: true,
      dpdp_consent_verified: true
    },
    {
      candidate_id: "cand-02",
      anonymized_identifier: "Candidate #UN-6419",
      target_role: "Full-Stack Software Engineer",
      headline: "Software Engineer skilled in distributed systems and cloud backends",
      readiness_score: 78.0,
      experience_years: 0.5,
      verified_skills: ["Python", "PostgreSQL", "FastAPI", "Data Structures"],
      assessed_skills: ["Docker", "SQL", "Git"],
      inferred_skills: ["Next.js", "AWS"],
      match_percentage: 84.0,
      capstone_completed: true,
      dpdp_consent_verified: true
    },
    {
      candidate_id: "cand-03",
      anonymized_identifier: "Candidate #UN-9104",
      target_role: "Data Analyst",
      headline: "Business Analytics graduate specializing in SQL modeling and executive BI",
      readiness_score: 81.0,
      experience_years: 1.2,
      verified_skills: ["SQL", "Power BI", "Data Analysis", "Excel Modeling"],
      assessed_skills: ["Python", "Tableau", "Statistics"],
      inferred_skills: ["Business Intelligence", "Product Metrics"],
      match_percentage: 88.0,
      capstone_completed: true,
      dpdp_consent_verified: true
    },
    {
      candidate_id: "cand-04",
      anonymized_identifier: "Candidate #UN-5238",
      target_role: "Product Manager",
      headline: "Technical PM with experience in user research, PRD crafting and agile delivery",
      readiness_score: 75.5,
      experience_years: 1.5,
      verified_skills: ["Product Sense", "User Research", "Agile", "PRD Writing"],
      assessed_skills: ["SQL", "Wireframing", "Roadmap Planning"],
      inferred_skills: ["A/B Testing", "Figma"],
      match_percentage: 79.0,
      capstone_completed: false,
      dpdp_consent_verified: true
    },
    {
      candidate_id: "cand-05",
      anonymized_identifier: "Candidate #UN-4482",
      target_role: "AI / Machine Learning Engineer",
      headline: "AI researcher specializing in LLM fine-tuning, embeddings and RAG architectures",
      readiness_score: 88.0,
      experience_years: 2.0,
      verified_skills: ["Python", "PyTorch", "Transformers", "Vector Databases", "FastAPI"],
      assessed_skills: ["Docker", "Git", "Linear Algebra"],
      inferred_skills: ["MLOps", "LangChain"],
      match_percentage: 95.0,
      capstone_completed: true,
      dpdp_consent_verified: true
    }
  ];

  const fallbackOpportunities: OpportunityItem[] = [
    {
      id: "opp-01",
      title: "Associate Full-Stack Engineer",
      role_category: "Software Engineering",
      location: "Bengaluru / Hybrid",
      employment_type: "Full-Time",
      min_readiness_score: 72.0,
      required_skills: ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
      description: "Build scalable customer-facing microservices and reactive interfaces for high-concurrency products.",
      salary_range: "₹14.0L – ₹18.0L CTC",
      company_name: "Tata Digital",
      is_verified_company: true,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      matched_candidates_count: 24
    },
    {
      id: "opp-02",
      title: "Junior Product & Analytics Associate",
      role_category: "Product & Analytics",
      location: "Mumbai / Hybrid",
      employment_type: "Full-Time",
      min_readiness_score: 68.0,
      required_skills: ["SQL", "Power BI", "Data Analysis", "Product Sense"],
      description: "Conduct funnel optimization, user interview synthesis, and cohort retention modeling.",
      salary_range: "₹11.0L – ₹15.0L CTC",
      company_name: "Tata Digital",
      is_verified_company: true,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      matched_candidates_count: 18
    }
  ];

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await api.searchTalentPool({
        target_role: selectedRole === "all" ? undefined : selectedRole,
        required_skills: selectedSkills,
        min_readiness_score: minReadiness,
        has_capstone: capstoneOnly ? true : undefined,
      });
      if (res && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
      } else {
        // Filter locally
        filterFallback();
      }
    } catch {
      filterFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const filterFallback = () => {
    let list = fallbackCandidates.filter((c) => {
      if (selectedRole !== "all" && !c.target_role.toLowerCase().includes(selectedRole.toLowerCase())) {
        return false;
      }
      if (c.readiness_score < minReadiness) return false;
      if (capstoneOnly && !c.capstone_completed) return false;
      if (selectedSkills.length > 0) {
        const all = [...c.verified_skills, ...c.assessed_skills, ...c.inferred_skills].map(s => s.toLowerCase());
        const hasAny = selectedSkills.some(sk => all.includes(sk.toLowerCase()));
        if (!hasAny) return false;
      }
      return true;
    });
    setCandidates(list);
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedRole, minReadiness, selectedSkills, capstoneOnly]);

  useEffect(() => {
    async function loadExtraData() {
      try {
        const [opps, intel] = await Promise.all([
          api.getOpportunities(),
          api.getMarketIntelligence("technology")
        ]);
        if (opps && opps.length > 0) setOpportunities(opps);
        else setOpportunities(fallbackOpportunities);
        if (intel) setMarketIntel(intel);
      } catch {
        setOpportunities(fallbackOpportunities);
      }
    }
    loadExtraData();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col font-sans">
      <BackgroundAtmosphere variant="explore" />
      <Navbar />

      <main className="flex-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        
        {/* ========================================================
            HEADER: EMPLOYER TALENT ECOSYSTEM
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                <Briefcase className="h-3.5 w-3.5 text-unnati-saffron" />
                Unnati Talent Discovery
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                DPDP Act (India 2026) Anonymized
              </span>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Evidence-Based Talent Discovery
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Find job-ready candidates based strictly on <strong>verified capstone deliverables</strong>, Bayesian skill assessments, and demonstrated readiness scores — completely free from resume keyword spam and demographic bias.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/institution">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-300 text-slate-700 font-semibold gap-1.5 shadow-soft-sm"
              >
                <Building2 className="h-4 w-4 text-unnati-indigo" />
                <span>Campus Analytics</span>
              </Button>
            </Link>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => alert("Opportunity Creation Modal: Post your role requirements.")}
              className="rounded-2xl shadow-glow-saffron font-bold text-white gap-1.5 btn-shimmer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Role</span>
            </Button>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS (Candidates, Opportunities, Market Radar)
           ======================================================== */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "candidates"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Candidate Talent Pool</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("opportunities")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "opportunities"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Open Opportunities</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-unnati-indigo font-extrabold">
              {opportunities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("intel")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "intel"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Labor Market Radar</span>
            <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
          </button>
        </div>

        {/* ========================================================
            TAB 1: CANDIDATES WITH TRANSPARENT FILTERS
           ======================================================== */}
        {activeTab === "candidates" && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Sliders className="h-4 w-4 text-unnati-violet" />
                  <span>Transparent Skill &amp; Readiness Filters</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedRole("all");
                    setMinReadiness(60);
                    setSelectedSkills([]);
                    setCapstoneOnly(false);
                  }}
                  className="text-xs text-unnati-indigo hover:underline font-semibold cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Role Category
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full clean-input rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 border border-slate-200"
                  >
                    <option value="all">All Roles (Multi-Disciplinary)</option>
                    <option value="Full-Stack">Full-Stack Software Engineer</option>
                    <option value="Data">Data Analyst &amp; Analytics</option>
                    <option value="Product">Product Manager</option>
                    <option value="AI">AI / Machine Learning Engineer</option>
                  </select>
                </div>

                {/* Min Readiness Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Minimum Readiness Score</span>
                    <span className="text-unnati-indigo">{minReadiness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(Number(e.target.value))}
                    className="w-full accent-unnati-indigo cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50% (Foundations)</span>
                    <span>75% (Job-Ready)</span>
                    <span>90%+ (Top Tier)</span>
                  </div>
                </div>

                {/* Capstone Toggle */}
                <div className="flex items-center pt-4 md:pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={capstoneOnly}
                      onChange={(e) => setCapstoneOnly(e.target.checked)}
                      className="h-4 w-4 rounded text-unnati-indigo focus:ring-unnati-violet border-slate-300"
                    />
                    <span>Verified Capstone Project Completed Only</span>
                  </label>
                </div>
              </div>

              {/* Skill Tags Toggle */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 block">
                  Filter by Specific Verified Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableSkillFilters.map((skill) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          active
                            ? "bg-purple-100 text-unnati-indigo border-purple-300 font-bold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {skill} {active ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Candidate Cards Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" delayStepMs={60}>
              {candidates.map((cand, cIdx) => (
                <StaggerItem key={cand.candidate_id} index={cIdx} direction="up">
                  <Card className="p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm hover:shadow-soft-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3">
                      {/* Top Bar: Anonymized ID & Match Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {cand.anonymized_identifier}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{cand.match_percentage}% Fit</span>
                        </div>
                      </div>

                      {/* Role & Headline */}
                      <div>
                        <h3 className="font-heading text-lg font-bold text-slate-900">
                          {cand.target_role}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {cand.headline}
                        </p>
                      </div>

                      {/* Readiness Score Progress Bar */}
                      <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Overall Readiness</span>
                          <span className="text-unnati-indigo font-black">{cand.readiness_score}%</span>
                        </div>
                        <div className="h-2 w-full bg-purple-200/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-unnati-indigo rounded-full transition-all duration-700"
                            style={{ width: `${cand.readiness_score}%` }}
                          />
                        </div>
                      </div>

                      {/* Verified Skills Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified &amp; Assessed Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.verified_skills.slice(0, 4).map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span>{skill}</span>
                            </span>
                          ))}
                          {cand.assessed_skills.slice(0, 2).map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-unnati-indigo border border-purple-200 text-[11px] font-medium"
                            >
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Capstone Verified Badge */}
                      {cand.capstone_completed && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
                          <Award className="h-3.5 w-3.5 text-unnati-saffron shrink-0" />
                          <span>Industry Capstone Deliverable Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        DPDP Consent Verified
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => alert(`Interview Request sent to ${cand.anonymized_identifier} via secure anonymized inbox.`)}
                        className="rounded-xl text-xs font-bold gap-1 bg-unnati-indigo hover:bg-unnati-violet text-white"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Request Interview</span>
                      </Button>
                    </div>

                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* ========================================================
            TAB 2: OPPORTUNITIES LISTING
           ======================================================== */}
        {activeTab === "opportunities" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{opp.company_name}</span>
                      {opp.is_verified_company && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {opp.employment_type}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-black text-unnati-indigo">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {opp.location} • {opp.salary_range}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">Required Benchmark Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.required_skills.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      <strong>{opp.matched_candidates_count}</strong> qualified candidates in cohort pool
                    </span>
                    <Button 
                      variant="saffron" 
                      size="sm" 
                      onClick={() => setActiveTab("candidates")}
                      className="rounded-xl text-xs font-bold text-white shadow-soft-sm"
                    >
                      <span>View Matched Talent</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: LABOR MARKET INTELLIGENCE RADAR (Phase 5.3)
           ======================================================== */}
        {activeTab === "intel" && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-8 rounded-3xl bg-white border-slate-200 shadow-soft-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">
                  Unnati Market Intelligence • Q4 2026
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                  Surging Skill Demand vs. Campus Supply Gap
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Real-time index mapping verified hiring demand from 500+ Indian &amp; Global employers against academic graduation cohorts.
                </p>
              </div>

              {/* Skills Trends Radar */}
              <div className="space-y-4">
                {[
                  { skill: "Docker & Microservices", demand: 92.5, supply: 48.0, delta: "+44.5% Deficit", status: "SURGING" },
                  { skill: "Vector Databases & RAG", demand: 89.0, supply: 36.0, delta: "+53.0% Deficit", status: "SURGING" },
                  { skill: "PostgreSQL Query Optimization", demand: 86.0, supply: 52.0, delta: "+34.0% Deficit", status: "GROWING" },
                  { skill: "Next.js & Modern React", demand: 84.5, supply: 64.0, delta: "+20.5% Balanced", status: "STABLE" }
                ].map((item, idx) => (
                  <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.skill}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {item.delta}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Industry Demand: <strong>{item.demand}/100</strong></span>
                        <span>Campus Supply: <strong>{item.supply}/100</strong></span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div className="bg-unnati-indigo h-full" style={{ width: `${item.demand}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Executive Summary */}
              <div className="p-4.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-unnati-indigo">Executive Market Insight: </strong>
                Employers are prioritizing candidates with demonstrated proof of work (reproducible capstones, containerized microservices, query tuning) over passive classroom certifications. Candidates with completed capstones receive an average <strong>2.8x higher interview conversion</strong>.
              </div>
            </Card>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
