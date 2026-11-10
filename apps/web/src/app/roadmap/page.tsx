"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  Target,
  Radar,
  BarChart3,
  CheckSquare,
  Square,
  Award
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
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"radar" | "matrix">("matrix");
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const fetchRoadmapAndGaps = async (role: string) => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication token required.");

      const gaps = await api.getGapAnalysis(token, role);
      setGapData(gaps);

      let roadmap = await api.getMyActiveRoadmap(token);
      if (!roadmap || roadmap.target_role !== role) {
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

      const gaps = await api.getGapAnalysis(token, selectedRole);
      setGapData(gaps);
    } catch (err: any) {
      console.error("Regeneration failed:", err);
      setError(err.message || "Failed to regenerate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent shadow-glow-violet" />
          <p className="text-sm font-semibold text-purple-200">Synthesizing Topological Milestone DAG...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100 selection:bg-purple-500 selection:text-white">
        <BackgroundAtmosphere />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
          <h1 className="font-heading text-2xl font-black text-white">Sign in to UNNATI</h1>
          <p className="mt-2 text-xs text-slate-400">Access your personalized learning roadmaps and Algorithm B gap analytics.</p>
          <Link href="/sign-in" className="mt-6 block">
            <Button variant="saffron" size="lg" className="w-full text-xs font-bold">
              Sign In Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readiness = gapData?.readiness_score || activeRoadmap?.overall_readiness_score || 0;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs font-medium text-rose-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs font-bold underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Hero Banner */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="violet" className="text-[10px]">
                  Algorithm C Topological Synthesis
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Cycle-Free Prerequisite Graph
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeRoadmap?.title || `${selectedRole} Roadmap`}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {activeRoadmap?.description || "Structured learning sequence based on evidence-weighted prerequisite gap analysis."}
              </p>

              {/* Role Selector Tabs */}
              <div className="mt-5 flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selectedRole === role
                        ? "bg-purple-600 text-white shadow-glow-violet border border-purple-400/40"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Readiness Gauge Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 p-6 text-center min-w-[200px] shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Readiness</span>
              <div className="mt-1 text-4xl font-black text-emerald-400 font-mono">{readiness}%</div>
              <p className="mt-1 text-xs text-slate-300">
                {gapData ? `${gapData.skills_met_count} of ${gapData.total_skills_required} skills met` : "Calculating..."}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-unnati-saffron">
                <TrendingUp className="h-3.5 w-3.5" />
                Evidence-Weighted
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "matrix" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Gap Breakdown
              </button>
              <button
                onClick={() => setViewMode("radar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "radar" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Radar className="h-3.5 w-3.5" /> Diagnostic Radar
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={generating}
              className="text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 text-purple-400 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Recalibrating..." : "Recalibrate Roadmap"}
            </Button>
          </div>
        </section>

        {/* Diagnostic Radar / Matrix View Mode */}
        {viewMode === "radar" && gapData && (
          <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 animate-in fade-in duration-300">
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Competency Radar Diagnostic (Algorithm B)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Compares your evidence-weighted capability against industry benchmark expectations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gapData.skills_breakdown.map((item) => {
                const currentPct = Math.round(item.current_proficiency * 100);
                const targetPct = Math.round(item.target_proficiency * 100);
                return (
                  <div key={item.skill_name} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">{item.skill_name}</span>
                      <Badge variant={item.is_met ? "success" : "saffron"} className="text-[10px]">
                        {item.is_met ? "Met" : `-${Math.round(item.gap * 100)}%`}
                      </Badge>
                    </div>

                    {/* Comparative Dual Bar */}
                    <div className="space-y-1.5 text-[10px]">
                      <div>
                        <div className="flex justify-between text-slate-400">
                          <span>Your Level:</span>
                          <span className="font-mono text-purple-300 font-bold">{currentPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-400">
                          <span>Market Benchmark:</span>
                          <span className="font-mono text-slate-300">{targetPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-orange-500/80 rounded-full" style={{ width: `${targetPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Milestone Phases: Algorithm C Topological Roadmap */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Topological Learning DAG</p>
              <h2 className="font-heading text-2xl font-bold text-white">Milestone Execution Sequence</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
              <Clock className="h-4 w-4 text-unnati-saffron" />
              <span>{activeRoadmap?.total_estimated_weeks || 12} Weeks • {activeRoadmap?.weekly_hours || 10}h/wk</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeRoadmap?.milestones?.map((milestone, mIdx) => {
              const isLocked = milestone.status === "LOCKED";
              const isInProgress = milestone.status === "IN_PROGRESS";
              const isCompleted = milestone.status === "COMPLETED";

              return (
                <div
                  key={milestone.id}
                  className={`glass-panel rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative ${
                    isInProgress
                      ? "border-purple-500/60 shadow-glow-violet bg-slate-900/80"
                      : isCompleted
                      ? "border-emerald-500/40 bg-slate-900/60"
                      : "border-white/10 bg-slate-900/40 opacity-85"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold text-sm ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isInProgress
                            ? "bg-gradient-to-tr from-purple-700 to-unnati-violet text-white shadow-md shadow-purple-950"
                            : "bg-white/5 text-slate-500 border border-white/5"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : `P${milestone.phase_number}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
                            Phase {milestone.phase_number} • {milestone.estimated_weeks} Weeks
                          </span>
                          <Badge
                            variant={isCompleted ? "success" : isInProgress ? "violet" : "default"}
                            className="text-[10px]"
                          >
                            {milestone.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{milestone.title}</h3>
                      </div>
                    </div>

                    {isInProgress && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-200">
                        <Play className="h-3 w-3 fill-current text-unnati-saffron" /> Active Phase
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mb-4">
                    {milestone.description}
                  </p>

                  {/* Target Skills in this Phase */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Target Competencies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.target_skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-purple-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modules & Deliverable Grid */}
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    {/* Learning Modules with Checkbox Trackers */}
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-3">
                        <BookOpen className="h-3.5 w-3.5 text-unnati-saffron" />
                        Curated Learning Modules
                      </p>
                      <div className="space-y-2">
                        {milestone.learning_modules.map((mod, idx) => {
                          const taskKey = `${milestone.id}-mod-${idx}`;
                          const isDone = completedTasks[taskKey] || isCompleted;
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleTask(taskKey)}
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition cursor-pointer ${
                                isDone
                                  ? "border-emerald-500/30 bg-emerald-950/20 text-slate-300"
                                  : "border-white/5 bg-white/5 text-slate-200 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isDone ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-500 shrink-0" />
                                )}
                                <span className={isDone ? "line-through text-slate-400" : "font-medium"}>
                                  {mod.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {mod.duration_hours}h • {mod.type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Capstone Project Deliverable */}
                    {milestone.project_deliverable && (
                      <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-2">
                            <FolderGit2 className="h-3.5 w-3.5 text-orange-400" />
                            Milestone Project Sprint
                          </p>
                          <h4 className="font-bold text-white text-sm">
                            {milestone.project_deliverable.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            {milestone.project_deliverable.description}
                          </p>

                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Evaluation Rubric:
                            </p>
                            <ul className="space-y-1 text-[11px] text-slate-300">
                              {milestone.project_deliverable.rubric?.map((r, rIdx) => (
                                <li key={rIdx} className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-unnati-saffron" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <Link href="/assessments">
                            <Button size="sm" variant="glass" className="text-[11px] py-1 px-3">
                              <Award className="h-3 w-3 mr-1 text-emerald-400" /> Verify Capability
                            </Button>
                          </Link>
                          <span className="text-[10px] text-purple-300 font-mono">
                            GitHub Evaluation Ready
                          </span>
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
        {gapData && gapData.skills_breakdown.length > 0 && viewMode === "matrix" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Algorithmic Diagnostic</p>
                <h2 className="font-heading text-xl font-bold text-white">Skill Gap Diagnostic Matrix</h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 glass-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Competency</th>
                      <th className="px-4 py-3">Evidence State</th>
                      <th className="px-4 py-3">Current vs Target</th>
                      <th className="px-4 py-3">Algorithm B Gap</th>
                      <th className="px-4 py-3">Prerequisites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gapData.skills_breakdown.map((item) => (
                      <tr key={item.skill_name} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 font-bold text-white">
                          {item.skill_name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              item.state === "CLAIMED"
                                ? "default"
                                : item.state === "INFERRED"
                                ? "sky"
                                : item.state === "ASSESSED"
                                ? "violet"
                                : item.state === "VERIFIED"
                                ? "success"
                                : "error"
                            }
                            className="text-[10px]"
                          >
                            {item.state}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-purple-300">
                              {Math.round(item.current_proficiency * 100)}%
                            </span>
                            <span className="text-slate-500">/</span>
                            <span className="text-slate-400">
                              {Math.round(item.target_proficiency * 100)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${Math.round(item.current_proficiency * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.is_met ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Met
                            </span>
                          ) : (
                            <span className="font-bold text-orange-400 font-mono">
                              -{Math.round(item.gap * 100)}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
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

      {/* Global AI Companion Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
