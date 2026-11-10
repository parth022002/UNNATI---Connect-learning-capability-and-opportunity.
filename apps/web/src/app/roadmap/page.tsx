"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FolderGit2, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Lock, 
  Play, 
  RefreshCw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Target
} from "lucide-react";
import { 
  api, 
  getClerkApiToken,
  CareerRoadmap, 
  GapAnalysisResponse, 
  SkillGapItem 
} from "@/lib/api";

const TARGET_ROLES = [
  "Full-Stack Software Engineer",
  "AI / Machine Learning Engineer",
  "Frontend Engineer (React/Next.js)",
  "Backend Systems Engineer (Python/Go)",
];

export default function RoadmapPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [gapData, setGapData] = useState<GapAnalysisResponse | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmapAndGaps = async (role: string) => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication token required.");

      // 1. Fetch Gap Analysis
      const gaps = await api.getGapAnalysis(token, role);
      setGapData(gaps);

      // 2. Fetch Active Roadmap
      let roadmap = await api.getMyActiveRoadmap(token);
      if (!roadmap || roadmap.target_role !== role) {
        // Auto-generate if none exists for this role
        roadmap = await api.generateRoadmap(token, { target_role: role, weekly_hours: 10 });
      }
      setActiveRoadmap(roadmap);
    } catch (err: any) {
      console.error("Failed to load roadmap data:", err);
      setError(err.message || "Failed to load roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchRoadmapAndGaps(selectedRole);
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, selectedRole]);

  const handleRegenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const newRoadmap = await api.generateRoadmap(token, {
        target_role: selectedRole,
        weekly_hours: 10,
      });
      setActiveRoadmap(newRoadmap);

      // Re-fetch gaps
      const gaps = await api.getGapAnalysis(token, selectedRole);
      setGapData(gaps);
    } catch (err: any) {
      console.error("Regeneration failed:", err);
      setError(err.message || "Failed to regenerate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Synthesizing Topological Career Roadmap...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl max-w-md">
          <h1 className="text-2xl font-black text-unnati-indigo">Sign in to UNNATI</h1>
          <p className="mt-2 text-sm text-slate-600">Access your personalized learning roadmaps and gap analytics.</p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-unnati-indigo py-3 text-sm font-bold text-white shadow-md hover:bg-unnati-violet"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const readiness = gapData?.readiness_score || activeRoadmap?.overall_readiness_score || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-unnati-midnight">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-unnati-indigo">
              <Image src="/logo.png" alt="UNNATI" width={28} height={28} className="rounded-md shadow-xs" priority />
              <span>UNNATI<span className="text-unnati-saffron">.</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:border-unnati-violet transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-unnati-violet ${generating ? "animate-spin" : ""}`} />
              {generating ? "Recalibrating..." : "Recalibrate Roadmap"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Hero Banner: Role & Readiness Gauge */}
        <section className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                  Topological Career Synthesis
                </span>
                <span className="text-xs font-semibold text-slate-400">Algorithm B & C Grounded</span>
              </div>
              <h1 className="mt-3 text-3xl font-black text-unnati-midnight md:text-4xl">
                {activeRoadmap?.title || `${selectedRole} Roadmap`}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                {activeRoadmap?.description || "Structured learning sequence based on evidence-weighted prerequisite gap analysis."}
              </p>

              {/* Role Selector Tabs */}
              <div className="mt-5 flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedRole === role
                        ? "bg-unnati-indigo text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Readiness Gauge Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-orange-50 border border-violet-100 p-6 text-center min-w-[200px]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Readiness</span>
              <div className="mt-2 text-4xl font-black text-unnati-indigo">{readiness}%</div>
              <p className="mt-1 text-xs text-slate-600">
                {gapData ? `${gapData.skills_met_count} of ${gapData.total_skills_required} skills met` : "Calculating..."}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-unnati-saffron">
                <TrendingUp className="h-3.5 w-3.5" />
                Evidence Weighted
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Phases: Algorithm C Topological Roadmap */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-unnati-violet">Structured Learning Path</p>
              <h2 className="text-2xl font-black text-unnati-midnight">Milestone Execution Phases</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="h-4 w-4 text-unnati-saffron" />
              <span>{activeRoadmap?.total_estimated_weeks || 12} Weeks • {activeRoadmap?.weekly_hours || 10} hrs/week</span>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {activeRoadmap?.milestones?.map((milestone) => {
              const isLocked = milestone.status === "LOCKED";
              const isInProgress = milestone.status === "IN_PROGRESS";
              const isCompleted = milestone.status === "COMPLETED";

              return (
                <div
                  key={milestone.id}
                  className={`rounded-3xl border p-6 transition-all ${
                    isInProgress
                      ? "border-unnati-violet bg-white shadow-md shadow-violet-100 ring-2 ring-violet-500/10"
                      : isCompleted
                      ? "border-emerald-200 bg-white"
                      : "border-slate-200 bg-slate-50/70 opacity-90"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-sm ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isInProgress
                            ? "bg-unnati-indigo text-white shadow-md shadow-violet-200"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : `P${milestone.phase_number}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">
                            Phase {milestone.phase_number} • {milestone.estimated_weeks} Weeks
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : isInProgress
                                ? "bg-violet-100 text-unnati-violet"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {milestone.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{milestone.title}</h3>
                      </div>
                    </div>

                    {isInProgress && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-unnati-violet">
                        <Play className="h-3 w-3 fill-current" /> Active Milestone
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 max-w-3xl">
                    {milestone.description}
                  </p>

                  {/* Target Skills in this Phase */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Target Competencies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.target_skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modules & Deliverable Grid */}
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    {/* Learning Modules */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-unnati-violet" />
                        Curated Learning Modules
                      </p>
                      <div className="space-y-2">
                        {milestone.learning_modules.map((mod, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2 text-xs"
                          >
                            <span className="font-semibold text-slate-800">{mod.title}</span>
                            <span className="text-slate-400 font-medium">{mod.duration_hours} hrs • {mod.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Capstone Project Deliverable */}
                    {milestone.project_deliverable && (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-unnati-indigo flex items-center gap-1.5 mb-2">
                          <FolderGit2 className="h-3.5 w-3.5 text-unnati-violet" />
                          Practical Milestone Project
                        </p>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {milestone.project_deliverable.title}
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {milestone.project_deliverable.description}
                        </p>

                        <div className="mt-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Evaluation Rubric:
                          </p>
                          <ul className="space-y-0.5 text-[11px] text-slate-600">
                            {milestone.project_deliverable.rubric?.map((r, rIdx) => (
                              <li key={rIdx} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-unnati-violet" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Algorithm B: Skill Gap Matrix Table */}
        {gapData && gapData.skills_breakdown.length > 0 && (
          <section className="mt-12 pb-16">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-unnati-violet">Prerequisite Diagnostic</p>
                <h2 className="text-2xl font-black text-unnati-midnight">Evidence-Weighted Skill Gap Matrix</h2>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Competency</th>
                      <th className="px-4 py-3">State / Evidence Tier</th>
                      <th className="px-4 py-3">Current vs Target</th>
                      <th className="px-4 py-3">Calculated Gap</th>
                      <th className="px-4 py-3">Prerequisites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gapData.skills_breakdown.map((item) => (
                      <tr key={item.skill_name} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {item.skill_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.state === "CLAIMED"
                                ? "bg-slate-100 text-slate-700"
                                : item.state === "INFERRED"
                                ? "bg-blue-50 text-blue-700"
                                : item.state === "ASSESSED"
                                ? "bg-purple-50 text-purple-700"
                                : item.state === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.state}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {Math.round(item.current_proficiency * 100)}%
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-500">
                              {Math.round(item.target_proficiency * 100)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-unnati-violet rounded-full"
                              style={{ width: `${Math.round(item.current_proficiency * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.is_met ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Met
                            </span>
                          ) : (
                            <span className="font-bold text-amber-600">
                              -{Math.round(item.gap * 100)}% gap
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {item.prerequisites.length > 0 ? item.prerequisites.join(", ") : "None (Foundational)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

