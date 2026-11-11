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
  Building2, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart3, 
  BookOpen, 
  Download, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronRight,
  Filter
} from "lucide-react";
import { 
  api, 
  InstitutionSummary, 
  CohortSummary, 
  CohortAnalytics 
} from "@/lib/api";

export default function InstitutionPage() {
  const [institution, setInstitution] = useState<InstitutionSummary | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fallback demo data if backend connection is unavailable
  const fallbackInstitution: InstitutionSummary = {
    id: "inst-01",
    name: "Indian Institute of Technology & Management (IITM)",
    code: "IITM-UNN",
    institution_type: "Autonomous University",
    domain: "iitm.ac.in",
    location: "New Delhi / Bengaluru, India",
    is_verified: true,
    contact_email: "dean.academics@iitm.ac.in",
    cohorts: [
      {
        id: "c-01",
        name: "B.Tech Computer Science & AI (Class of 2026)",
        department: "Computer Science & Engineering",
        target_degree: "B.Tech",
        graduation_year: 2026,
        total_students: 120,
        average_readiness_score: 71.5
      },
      {
        id: "c-02",
        name: "MBA Business Analytics & Product (Class of 2025)",
        department: "School of Management",
        target_degree: "MBA",
        graduation_year: 2025,
        total_students: 85,
        average_readiness_score: 69.2
      },
      {
        id: "c-03",
        name: "B.Com Finance & Fintech (Class of 2026)",
        department: "Department of Commerce & Finance",
        target_degree: "B.Com Hons",
        graduation_year: 2026,
        total_students: 95,
        average_readiness_score: 64.8
      }
    ]
  };

  const fallbackAnalytics: CohortAnalytics = {
    cohort_id: "c-01",
    cohort_name: "B.Tech Computer Science & AI (Class of 2026)",
    department: "Computer Science & Engineering",
    total_learners: 120,
    average_readiness_score: 71.5,
    job_ready_percentage: 38.0,
    active_roadmaps_count: 105,
    distribution: [
      { tier: "Job-Ready (>=75%)", count: 45, percentage: 38.0 },
      { tier: "Developing (50-74%)", count: 53, percentage: 44.0 },
      { tier: "Foundations (<50%)", count: 22, percentage: 18.0 }
    ],
    top_curriculum_gaps: [
      {
        skill_name: "Docker & Containerization",
        category: "DevOps & Cloud",
        importance: "Critical",
        affected_students_count: 74,
        gap_percentage: 61.6,
        recommended_action: "Integrate 2-week hands-on containerization sprint into Systems Practicum."
      },
      {
        skill_name: "Distributed System Design",
        category: "Architecture",
        importance: "Critical",
        affected_students_count: 68,
        gap_percentage: 56.7,
        recommended_action: "Introduce microservice scalability case studies and CAP theorem labs."
      },
      {
        skill_name: "FastAPI & Async IO",
        category: "Backend Engineering",
        importance: "High",
        affected_students_count: 52,
        gap_percentage: 43.3,
        recommended_action: "Upgrade legacy Python servlet modules to modern async FastAPI patterns."
      },
      {
        skill_name: "PostgreSQL Optimization & Indexing",
        category: "Databases",
        importance: "High",
        affected_students_count: 45,
        gap_percentage: 37.5,
        recommended_action: "Add EXPLAIN ANALYZE query tuning module in Database Management syllabus."
      }
    ],
    top_target_roles: [
      { role: "Full-Stack Software Engineer", interested_percentage: 42.0 },
      { role: "AI / Machine Learning Engineer", interested_percentage: 28.0 },
      { role: "Backend Systems Engineer", interested_percentage: 18.0 },
      { role: "Cloud DevOps Engineer", interested_percentage: 12.0 }
    ]
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const instData = await api.getInstitutionSummary();
        if (instData && instData.cohorts && instData.cohorts.length > 0) {
          setInstitution(instData);
          const firstCohortId = instData.cohorts[0].id;
          setSelectedCohortId(firstCohortId);
          const analyticsData = await api.getCohortAnalytics(firstCohortId);
          setAnalytics(analyticsData);
        } else {
          setInstitution(fallbackInstitution);
          setSelectedCohortId(fallbackInstitution.cohorts[0].id);
          setAnalytics(fallbackAnalytics);
        }
      } catch (err) {
        console.warn("Using fallback institution data:", err);
        setInstitution(fallbackInstitution);
        setSelectedCohortId(fallbackInstitution.cohorts[0].id);
        setAnalytics(fallbackAnalytics);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCohortChange = async (cohortId: string) => {
    setSelectedCohortId(cohortId);
    try {
      const analyticsData = await api.getCohortAnalytics(cohortId);
      setAnalytics(analyticsData);
    } catch {
      // Switch fallback mock based on selection
      if (cohortId === "c-02") {
        setAnalytics({
          ...fallbackAnalytics,
          cohort_id: "c-02",
          cohort_name: "MBA Business Analytics & Product (Class of 2025)",
          department: "School of Management",
          total_learners: 85,
          average_readiness_score: 69.2,
          job_ready_percentage: 34.0,
          active_roadmaps_count: 76,
          distribution: [
            { tier: "Job-Ready (>=75%)", count: 29, percentage: 34.0 },
            { tier: "Developing (50-74%)", count: 41, percentage: 48.0 },
            { tier: "Foundations (<50%)", count: 15, percentage: 18.0 }
          ],
          top_curriculum_gaps: [
            {
              skill_name: "Business SQL & Window Functions",
              category: "Analytics",
              importance: "Critical",
              affected_students_count: 52,
              gap_percentage: 61.2,
              recommended_action: "Implement mandatory weekly relational database querying workshops."
            },
            {
              skill_name: "Product Metric Modeling (LTV/CAC)",
              category: "Product Management",
              importance: "Critical",
              affected_students_count: 48,
              gap_percentage: 56.5,
              recommended_action: "Add real-world SaaS unit economics modeling in Marketing elective."
            }
          ],
          top_target_roles: [
            { role: "Product Manager", interested_percentage: 38.0 },
            { role: "Business & Data Analyst", interested_percentage: 34.0 },
            { role: "Growth Strategy Associate", interested_percentage: 18.0 }
          ]
        });
      } else {
        setAnalytics(fallbackAnalytics);
      }
    }
  };

  const inst = institution || fallbackInstitution;
  const currentAnalytics = analytics || fallbackAnalytics;

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col font-sans">
      <BackgroundAtmosphere variant="dashboard" />
      <Navbar />

      <main className="flex-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        
        {/* ========================================================
            HEADER: INSTITUTION IDENTITY & VERIFIED ACCREDITATION
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-unnati-indigo text-xs font-bold border border-purple-200">
                <Building2 className="h-3.5 w-3.5 text-unnati-saffron" />
                Unnati Campus Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                NAAC &amp; AICTE Compliant
              </span>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {inst.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
              <span>Code: <strong className="text-slate-800">{inst.code}</strong></span>
              <span>•</span>
              <span>{inst.location}</span>
              <span>•</span>
              <span className="text-unnati-indigo font-semibold">{inst.domain}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Institutional Accreditation & Cohort Report downloaded.")}
              className="rounded-2xl border-slate-300 text-slate-700 font-semibold gap-2 shadow-soft-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export Accreditation Report</span>
            </Button>
            <Link href="/talent">
              <Button
                variant="saffron"
                size="sm"
                className="rounded-2xl shadow-glow-saffron font-bold text-white gap-1.5 btn-shimmer"
              >
                <span>Employer Talent Portal</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================
            COHORT SELECTOR TABS
           ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-unnati-violet" />
              Select Active Cohort &amp; Department
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing analytics for <strong>{inst.cohorts.length}</strong> active programs
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {inst.cohorts.map((cohort) => {
              const active = cohort.id === selectedCohortId;
              return (
                <button
                  key={cohort.id}
                  onClick={() => handleCohortChange(cohort.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    active
                      ? "bg-unnati-indigo text-white border-unnati-indigo shadow-soft-md shadow-purple-950/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <span>{cohort.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {cohort.total_students}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            METRIC KPI CARDS (Phase 5.1 Cohort Health)
           ======================================================== */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" delayStepMs={75}>
          {/* Card 1: Total Enrolled */}
          <StaggerItem index={0}>
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Learners</span>
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-unnati-indigo flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                <CountUpNumber value={currentAnalytics.total_learners} durationMs={1000} />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Active students enrolled in {currentAnalytics.department}
              </p>
            </Card>
          </StaggerItem>

          {/* Card 2: Average Readiness */}
          <StaggerItem index={1}>
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Average Readiness</span>
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-700 tracking-tight font-heading flex items-baseline">
                <CountUpNumber value={Math.round(currentAnalytics.average_readiness_score)} durationMs={1200} />
                <span className="text-lg ml-0.5">%</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <span>+6.4%</span>
                <span className="text-slate-500 font-normal">above national campus average</span>
              </p>
            </Card>
          </StaggerItem>

          {/* Card 3: Job-Ready Ratio */}
          <StaggerItem index={2}>
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Job-Ready Ratio</span>
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-unnati-saffron flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight font-heading flex items-baseline">
                <CountUpNumber value={Math.round(currentAnalytics.job_ready_percentage)} durationMs={1200} />
                <span className="text-lg ml-0.5">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Scoring &ge;75% across core industry benchmarks
              </p>
            </Card>
          </StaggerItem>

          {/* Card 4: Active Roadmaps */}
          <StaggerItem index={3}>
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Active Roadmaps</span>
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                <CountUpNumber value={currentAnalytics.active_roadmaps_count} durationMs={1000} />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Learners actively tracking 3-phase milestones
              </p>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* ========================================================
            READINESS TIER DISTRIBUTION BREAKDOWN
           ======================================================== */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-white border-slate-200 shadow-soft-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                Cohort Competency Distribution
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Calibrated via continuous Bayesian assessment attempts and completed milestone capstones.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentAnalytics.total_learners} Total Students
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {currentAnalytics.distribution.map((tier, idx) => {
              const isJobReady = tier.tier.includes("Job-Ready");
              const isDev = tier.tier.includes("Developing");
              const colorBg = isJobReady ? "bg-emerald-500" : isDev ? "bg-purple-600" : "bg-amber-500";
              const borderTheme = isJobReady ? "border-emerald-200 bg-emerald-50/30" : isDev ? "border-purple-200 bg-purple-50/30" : "border-amber-200 bg-amber-50/30";

              return (
                <div key={idx} className={`p-4.5 rounded-2xl border ${borderTheme} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{tier.tier}</span>
                    <span className="text-sm font-black text-slate-900">{tier.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${colorBg} transition-all duration-700`}
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    <strong>{tier.count}</strong> students meeting this competency bracket
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ========================================================
            CURRICULUM BLIND SPOTS & ACTIONABLE INTERVENTIONS
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Actionable Curriculum Gaps */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-unnati-saffron" />
                  Identified Curriculum Blind Spots
                </h3>
                <p className="text-xs text-slate-500">
                  Critical capabilities demanded by current recruiters missing from standard university syllabi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentAnalytics.top_curriculum_gaps.map((gap, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm hover:border-purple-300 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        gap.importance === "Critical" 
                          ? "bg-red-50 text-red-700 border border-red-200" 
                          : "bg-purple-50 text-unnati-indigo border border-purple-200"
                      }`}>
                        {gap.importance} Priority
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {gap.skill_name}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-500">
                      <strong className="text-slate-800">{gap.affected_students_count} students</strong> ({gap.gap_percentage}%) lack evidence
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Recommended Action: </strong>
                      {gap.recommended_action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Career Aspirations Breakdown */}
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-unnati-violet" />
                Target Role Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Primary career targets chosen by this cohort.
              </p>
            </div>

            <Card className="p-5 rounded-2xl bg-white border-slate-200 shadow-soft-sm space-y-4">
              {currentAnalytics.top_target_roles.map((roleItem, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{roleItem.role}</span>
                    <span className="text-unnati-indigo">{roleItem.interested_percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-unnati-violet rounded-full transition-all duration-500"
                      style={{ width: `${roleItem.interested_percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100">
                <Link href="/explore">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-xs font-bold text-unnati-indigo gap-1">
                    <span>Browse 20+ Canonical Role Taxonomies</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
