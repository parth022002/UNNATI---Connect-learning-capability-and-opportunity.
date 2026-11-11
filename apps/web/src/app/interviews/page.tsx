"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Video,
  Mic,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  BarChart2,
  TrendingUp,
  AlertCircle,
  FileText,
  Target,
  Trash2,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  InterviewStudioDashboardData,
  InterviewSessionListItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

export default function InterviewStudioDashboardPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [dashboard, setDashboard] = useState<InterviewStudioDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      const data = await api.getInterviewDashboard(token);
      setDashboard(data);
    } catch (err: any) {
      console.error("Failed to load interview studio:", err);
      setError(err.message || "Failed to load interview studio dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboard();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview record? This action cannot be undone.")) {
      return;
    }
    try {
      setDeletingId(sessionId);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      await api.deleteInterviewSession(token, sessionId);
      await fetchDashboard();
    } catch (err: any) {
      alert("Failed to delete interview session: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getTierBadgeVariant = (tier?: string | null) => {
    switch (tier) {
      case "Exceptional":
        return "success";
      case "Strong Candidate":
        return "violet";
      case "Moderately Prepared":
        return "sky";
      case "Developing":
      default:
        return "warning";
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 pb-20">
      <BackgroundAtmosphere />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================
            HERO HEADER & ACTIONS
           ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet" className="px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-unnati-saffron mr-1.5" />
                Adaptive AI Simulation • STAR Rubric
              </Badge>
              <Badge variant="outline" className="text-slate-600">
                0.0 – 5.0 Standardized Scale
              </Badge>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              AI Interview Preparation Studio
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Practice realistic technical, behavioral, and HR interviews grounded in your actual resume, target job descriptions, and domain skills with interactive voice and real-time adaptive probing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/interviews/new">
              <Button variant="primary" className="flex items-center gap-2 shadow-soft-md">
                <Play className="h-4 w-4 fill-white" />
                Start Simulation
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================
            ACTIVE SESSION BANNER (IF RESUMABLE)
           ======================================================== */}
        {dashboard?.active_session && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-orange-500/10 border-2 border-unnati-indigo/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-unnati-indigo text-white flex items-center justify-center shrink-0 shadow-soft-md">
                <Play className="h-6 w-6 fill-white ml-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg">In-Progress Simulation</span>
                  <Badge variant="saffron" className="text-xs">Active Session</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Role: <strong className="text-slate-800">{dashboard.active_session.target_role}</strong> • {dashboard.active_session.interview_mode.replace("_", " ")} ({dashboard.active_session.difficulty_level})
                </p>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Started {new Date(dashboard.active_session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <Link href={`/interviews/${dashboard.active_session.id}`}>
              <Button variant="primary" className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                Resume Interview <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* ========================================================
            KPI METRICS OVERVIEW CARDS
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {/* Card 1: Overall Readiness */}
          <Card className="border-slate-200/90 shadow-soft-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Readiness Tier</span>
                <Award className="h-5 w-5 text-unnati-indigo" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {dashboard ? dashboard.average_readiness_score.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={getTierBadgeVariant(dashboard?.overall_readiness_tier)}>
                  {dashboard?.overall_readiness_tier || "Developing"}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  {dashboard ? Math.round((dashboard.average_readiness_score / 5) * 100) : 0}% Match
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Technical Readiness */}
          <Card className="border-slate-200/90 shadow-soft-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical Depth</span>
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {dashboard ? dashboard.technical_readiness_average.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-medium">
                System design, algorithms, architecture
              </p>
            </CardContent>
          </Card>

          {/* Card 3: HR / Behavioral Readiness */}
          <Card className="border-slate-200/90 shadow-soft-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Behavioral & STAR</span>
                <UserCheck className="h-5 w-5 text-unnati-saffron" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {dashboard ? dashboard.hr_readiness_average.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-medium">
                Situation, Task, Action, Metric Result
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Total Completed Sessions */}
          <Card className="border-slate-200/90 shadow-soft-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
                <BarChart2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {dashboard ? dashboard.total_interviews_completed : 0}
                </span>
                <span className="text-sm font-semibold text-slate-500">simulations</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-medium">
                {dashboard?.competencies_mastered_count || 0} competencies benchmarked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================
            RECOMMENDED PRACTICE ROADMAPS
           ======================================================== */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Recommended Practice Tracks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Curated simulation modules targeting high-frequency hiring rubrics and candidate weak spots.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {dashboard?.recommended_practice && dashboard.recommended_practice.length > 0 ? (
              dashboard.recommended_practice.map((item, idx) => (
                <Card key={idx} hoverEffect className="flex flex-col justify-between border-slate-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="violet" className="text-xs font-bold">
                        {item.mode.replace("_", " ")}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-500 capitalize">
                        {item.recommended_difficulty}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {item.role}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.priority_reason}
                    </p>
                  </CardContent>
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      href={`/interviews/new?role=${encodeURIComponent(item.role)}&mode=${encodeURIComponent(item.mode)}&difficulty=${encodeURIComponent(item.recommended_difficulty)}`}
                    >
                      <Button variant="outline" className="w-full flex items-center justify-center gap-1.5 text-xs font-bold">
                        Launch Track <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-slate-400 text-sm">
                No custom recommendations yet. Start your first simulation!
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RECENT INTERVIEWS LIST & TRANSCRIPTS
           ======================================================== */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Simulation History &amp; Performance Reports
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review past transcripts, AI rubric scores, STAR evaluations, and generated roadmap recommendations.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-soft-sm">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-3" />
              <p className="text-slate-600 font-medium">Loading simulation archives...</p>
            </div>
          ) : !dashboard || dashboard.recent_sessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-soft-sm">
              <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-bold text-slate-800">No Simulations Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                Kick off your first interview simulation to receive multi-dimensional rubric scoring, STAR rigor analysis, and actionable upskilling roadmaps.
              </p>
              <Link href="/interviews/new" className="mt-6 inline-block">
                <Button variant="primary" className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-white" />
                  Start First Simulation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.recent_sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-soft-sm hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 text-unnati-indigo flex items-center justify-center shrink-0 font-bold border border-purple-200/60">
                      {sess.target_role.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                          {sess.target_role}
                        </h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {sess.interview_mode.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize text-slate-500">
                          {sess.difficulty_level}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {sess.target_duration_minutes} mins ({sess.question_count} questions)
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(sess.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span>•</span>
                        <span className={`font-bold ${sess.status === "COMPLETED" ? "text-emerald-600" : "text-amber-600"}`}>
                          {sess.status === "COMPLETED" ? "Completed" : "In Progress"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    {sess.overall_score !== null && sess.overall_score !== undefined ? (
                      <div className="text-right mr-2">
                        <div className="text-xs font-bold uppercase text-slate-400">Score</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900">{sess.overall_score.toFixed(1)}</span>
                          <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                        </div>
                        <Badge variant={getTierBadgeVariant(sess.readiness_tier)} className="text-[10px] mt-0.5">
                          {sess.readiness_tier || "Evaluated"}
                        </Badge>
                      </div>
                    ) : null}

                    {sess.status === "COMPLETED" ? (
                      <Link href={`/interviews/${sess.id}/report`}>
                        <Button variant="outline" className="flex items-center gap-1.5 text-xs font-bold">
                          <FileText className="h-3.5 w-3.5" /> View Report
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/interviews/${sess.id}`}>
                        <Button variant="primary" className="flex items-center gap-1.5 text-xs font-bold">
                          <Play className="h-3.5 w-3.5 fill-white" /> Continue
                        </Button>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      disabled={deletingId === sess.id}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete interview session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            EDUCATIONAL & RUBRIC METHODOLOGY CARD
           ======================================================== */}
        <div className="mt-14 rounded-3xl bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-purple-200 mb-4 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-unnati-saffron" />
              Standardized Candidate Evaluation Rubric
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              Non-Hallucinatory, Multi-Dimensional Evaluation
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Unlike generic conversational bots that grade based on answer length, UNNATI’s interview intelligence checks for real engineering trade-offs, structured behavioral STAR models (Situation, Task, Action, Metric Result), and dynamically probes deeper when statements lack quantifiable outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
              <div>
                <span className="text-xl font-bold text-unnati-saffron">STAR Rigor</span>
                <p className="text-xs text-slate-400 mt-1">Automatic detection of situation context, active ownership, and measurable quantitative impact.</p>
              </div>
              <div>
                <span className="text-xl font-bold text-sky-400">Adaptive Probing</span>
                <p className="text-xs text-slate-400 mt-1">Simulates real interviewers by asking targeted follow-ups when candidates state high-level abstractions.</p>
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-400">Roadmap Bridging</span>
                <p className="text-xs text-slate-400 mt-1">Weak competencies scored under 3.5 automatically link to curated learning modules in your career roadmap.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

