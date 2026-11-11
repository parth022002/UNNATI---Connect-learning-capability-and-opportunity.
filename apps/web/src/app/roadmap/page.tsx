"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
  "Associate Product Manager",
  "Business & Data Analyst",
  "Financial Analyst & Valuation",
  "Full-Stack Software Engineer",
  "Generative AI & ML Engineer",
  "Product & UX Designer",
  "Operations & Project Lead"
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

      const roadmap = await api.generateRoadmap(token, {
        target_role: selectedRole,
        weekly_hours: 10,
      });
      setActiveRoadmap(roadmap);

      const gaps = await api.getGapAnalysis(token, selectedRole);
      setGapData(gaps);
    } catch (err: any) {
      console.error("Roadmap regeneration error:", err);
      setError(err.message || "Failed to recalibrate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  // Sync initial module completion state from roadmap data
  useEffect(() => {
    if (activeRoadmap?.milestones) {
      const initialMap: Record<string, boolean> = {};
      activeRoadmap.milestones.forEach((m) => {
        m.learning_modules.forEach((mod, idx) => {
          if (mod.completed || m.status === "COMPLETED") {
            initialMap[`${m.id}-mod-${idx}`] = true;
          }
        });
      });
      setCompletedTasks((prev) => ({ ...initialMap, ...prev }));
    }
  }, [activeRoadmap]);

  const toggleTask = async (milestoneId: string, moduleIndex: number, currentDone: boolean) => {
    const taskKey = `${milestoneId}-mod-${moduleIndex}`;
    const nextDone = !currentDone;

    // Optimistically update local toggle state
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: nextDone
    }));

    // Update activeRoadmap state locally
    if (activeRoadmap) {
      const updatedMilestones = activeRoadmap.milestones.map((m) => {
        if (m.id === milestoneId) {
          const updatedMods = [...m.learning_modules];
          if (updatedMods[moduleIndex]) {
            updatedMods[moduleIndex] = { ...updatedMods[moduleIndex], completed: nextDone };
          }
          return { ...m, learning_modules: updatedMods };
        }
        return m;
      });
      setActiveRoadmap({ ...activeRoadmap, milestones: updatedMilestones });
    }

    // Persist to backend if signed in
    if (isSignedIn && activeRoadmap) {
      try {
        const token = await getClerkApiToken(getToken);
        if (token) {
          const res = await api.toggleModuleProgress(token, activeRoadmap.id, milestoneId, moduleIndex, nextDone);
          if (res.milestone_status) {
            setActiveRoadmap((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                milestones: prev.milestones.map((m) => {
                  if (m.id === milestoneId) {
                    return { ...m, status: res.milestone_status, learning_modules: res.learning_modules };
                  }
                  return m;
                })
              };
            });
          }
        }
      } catch (err) {
        console.warn("Module progress sync error:", err);
      }
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Calibrating your learning roadmap...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-warm-pattern px-6 text-center text-slate-900">
        <BackgroundAtmosphere />
        <div className="relative z-10 w-full max-w-md clean-card rounded-3xl p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-800 to-orange-500 p-3 shadow-md">
            <Image src="/logo.png" alt="UNNATI" width={48} height={48} className="object-contain" priority />
          </div>
          <h1 className="font-heading text-2xl font-black text-slate-900">Unlock Your Roadmap</h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Sign in to generate personalized milestones, skill gap breakdowns, and hands-on project sprints.
          </p>
          <Link href="/sign-in" className="mt-6 block">
            <Button variant="saffron" size="lg" className="btn-shimmer w-full text-xs font-bold">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readiness = gapData 
    ? Math.round(gapData.readiness_score > 1 ? gapData.readiness_score : gapData.readiness_score * 100) 
    : 0;

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-900 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs font-bold underline hover:text-rose-950">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Control Bar: Role Selection & Readiness Overview */}
        <section className="clean-card rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="violet" className="text-xs font-semibold">
                  Personalized Learning Path
                </Badge>
                <span className="text-xs text-slate-700 font-medium">
                  Step-by-Step Milestones
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Career Roadmap &amp; Skill Progression
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Choose your target career to view your current readiness match, bridge identified skill gaps, and complete project sprints.
              </p>

              {/* Target Role Selector Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selectedRole === role
                        ? "bg-purple-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Readiness Gauge Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-purple-50/70 border border-purple-100 p-6 text-center min-w-[210px]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Readiness Score</span>
              <div className="mt-1 text-4xl font-black text-emerald-700 font-mono">{readiness}%</div>
              <p className="mt-1 text-xs text-slate-600">
                {gapData ? `${gapData.skills_met_count} of ${gapData.total_skills_required} skills met` : "Calculating..."}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-orange-600">
                <TrendingUp className="h-3.5 w-3.5" />
                Evidence-Weighted Match
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "matrix" ? "bg-purple-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Gap Breakdown
              </button>
              <button
                onClick={() => setViewMode("radar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "radar" ? "bg-purple-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Radar className="h-3.5 w-3.5" /> Capability Radar
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={generating}
              className="text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 text-purple-700 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Recalibrating..." : "Recalibrate Roadmap"}
            </Button>
          </div>
        </section>

        {/* Diagnostic Radar / Matrix View Mode */}
        {viewMode === "radar" && gapData && (
          <section className="clean-card rounded-3xl p-6 sm:p-8 mb-8 animate-in fade-in duration-300">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
              Capability Benchmark Diagnostic
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Compares your verified proficiency against industry expectations for {selectedRole}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gapData.skills_breakdown.map((item) => {
                const currentPct = Math.round(item.current_proficiency * 100);
                const targetPct = Math.round(item.target_proficiency * 100);
                return (
                  <div key={item.skill_name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs">{item.skill_name}</span>
                      <Badge variant={item.is_met ? "success" : "saffron"} className="text-[10px]">
                        {item.is_met ? "Met" : `-${Math.round(item.gap * 100)}%`}
                      </Badge>
                    </div>

                    {/* Comparative Dual Bar */}
                    <div className="space-y-1.5 text-[10px]">
                      <div>
                        <div className="flex justify-between text-slate-500">
                          <span>Your Verified Level:</span>
                          <span className="font-mono text-purple-900 font-bold">{currentPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-purple-700 rounded-full" style={{ width: `${currentPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-500">
                          <span>Market Benchmark:</span>
                          <span className="font-mono text-slate-700 font-semibold">{targetPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${targetPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Milestone Phases Sequence */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Structured Milestone Sequence</p>
              <h2 className="font-heading text-2xl font-bold text-slate-900">Milestone Roadmap</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 font-mono">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>{activeRoadmap?.total_estimated_weeks || 12} Weeks • {activeRoadmap?.weekly_hours || 10}h/wk</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeRoadmap?.milestones?.map((milestone) => {
              const isLocked = milestone.status === "LOCKED";
              const isInProgress = milestone.status === "IN_PROGRESS";
              const isCompleted = milestone.status === "COMPLETED";

              return (
                <div
                  key={milestone.id}
                  className={`clean-card rounded-3xl p-6 sm:p-7 transition-all duration-300 relative ${
                    isInProgress
                      ? "border-purple-300 shadow-md ring-1 ring-purple-200 bg-white"
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-slate-200 bg-white/70 opacity-90"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold text-sm ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isInProgress
                            ? "bg-purple-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : `P${milestone.phase_number}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
                            Phase {milestone.phase_number} • {milestone.estimated_weeks} Weeks
                          </span>
                          <Badge
                            variant={isCompleted ? "success" : isInProgress ? "violet" : "default"}
                            className="text-[10px]"
                          >
                            {milestone.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{milestone.title}</h3>
                      </div>
                    </div>

                    {isInProgress && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-900">
                        <Play className="h-3 w-3 fill-current text-orange-600" /> Active Phase
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-4">
                    {milestone.description}
                  </p>

                  {/* Target Skills in this Phase */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Target Capabilities in this Phase:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.target_skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modules & Deliverable Grid */}
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    {/* Learning Modules with Checkbox Trackers */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      {(() => {
                        const completedCount = milestone.learning_modules.filter(
                          (mod, idx) => completedTasks[`${milestone.id}-mod-${idx}`] || mod.completed || isCompleted
                        ).length;
                        const totalCount = milestone.learning_modules.length;
                        const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                        return (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-orange-600" />
                                Curated Learning Modules
                              </p>
                              <span className="text-[11px] font-mono font-bold text-slate-600">
                                {completedCount} / {totalCount} completed ({pct}%)
                              </span>
                            </div>
                            {/* Subtle Milestone Progress Bar */}
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                      <div className="space-y-2">
                        {milestone.learning_modules.map((mod, idx) => {
                          const taskKey = `${milestone.id}-mod-${idx}`;
                          const isDone = completedTasks[taskKey] || mod.completed || isCompleted;
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleTask(milestone.id, idx, !!isDone)}
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition cursor-pointer select-none ${
                                isDone
                                  ? "border-emerald-200 bg-emerald-50 text-slate-700"
                                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isDone ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                                )}
                                <span className={isDone ? "line-through text-slate-400 font-medium" : "font-medium"}>
                                  {mod.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {mod.duration_hours}h • {mod.type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Capstone Project Deliverable */}
                    {milestone.project_deliverable && (
                      <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-2">
                            <FolderGit2 className="h-3.5 w-3.5 text-orange-600" />
                            Milestone Project Deliverable
                          </p>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {milestone.project_deliverable.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {milestone.project_deliverable.description}
                          </p>

                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Success Criteria:
                            </p>
                            <ul className="space-y-1 text-[11px] text-slate-700">
                              {milestone.project_deliverable.rubric?.map((r, rIdx) => (
                                <li key={rIdx} className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
                          <Link href="/assessments">
                            <Button size="sm" variant="outline" className="text-[11px] py-1 px-3 font-semibold text-slate-800 bg-white border-slate-200">
                              <Award className="h-3 w-3 mr-1 text-emerald-600" /> Verify Capability
                            </Button>
                          </Link>
                          <span className="text-[10px] text-purple-900 font-semibold">
                            Portfolio Ready
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

        {/* Skill Gap Matrix Table */}
        {gapData && gapData.skills_breakdown.length > 0 && viewMode === "matrix" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Objective Diagnostic</p>
                <h2 className="font-heading text-xl font-bold text-slate-900">Skill Gap Breakdown Matrix</h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 clean-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Competency</th>
                      <th className="px-4 py-3">Verification Tier</th>
                      <th className="px-4 py-3">Current vs Target</th>
                      <th className="px-4 py-3">Gap Status</th>
                      <th className="px-4 py-3">Prerequisites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gapData.skills_breakdown.map((item) => (
                      <tr key={item.skill_name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-900">
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
                            {item.state === "CLAIMED"
                              ? "Self-Reported"
                              : item.state === "INFERRED"
                              ? "Resume Extracted"
                              : item.state === "ASSESSED"
                              ? "Diagnostic Verified"
                              : item.state === "VERIFIED"
                              ? "Certified"
                              : item.state}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-purple-900">
                              {Math.round(item.current_proficiency * 100)}%
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600">
                              {Math.round(item.target_proficiency * 100)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-purple-700 rounded-full"
                              style={{ width: `${Math.round(item.current_proficiency * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.is_met ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Met
                            </span>
                          ) : (
                            <span className="font-bold text-orange-600 font-mono">
                              -{Math.round(item.gap * 100)}%
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

      <Footer />

      {/* Global AI Companion Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
