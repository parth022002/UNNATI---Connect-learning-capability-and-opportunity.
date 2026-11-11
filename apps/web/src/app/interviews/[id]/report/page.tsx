"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Award,
  Video,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart2,
  Target,
  UserCheck,
  TrendingUp,
  FileText,
  Download,
  Share2,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HelpCircle,
  Compass
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  InterviewReportData,
  QuestionReviewItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

export default function InterviewPerformanceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [report, setReport] = useState<InterviewReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        setError(null);
        const token = await getClerkApiToken(getToken);
        if (!token) return;

        const data = await api.getInterviewReport(token, sessionId);
        setReport(data);

        // Expand first question by default
        if (data.question_reviews && data.question_reviews.length > 0) {
          setExpandedQuestions({ [data.question_reviews[0].question_id]: true });
        }
      } catch (err: any) {
        console.error("Failed to fetch interview report:", err);
        setError(err.message || "Failed to load interview report.");
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && isSignedIn && sessionId) {
      fetchReport();
    }
  }, [isLoaded, isSignedIn, sessionId]);

  const toggleQuestion = (qid: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const getTierBadgeVariant = (tier?: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-3" />
          <p className="text-slate-600 font-medium">Synthesizing comprehensive performance report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Report Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">{error || "Unable to display interview report."}</p>
          <Link href="/interviews" className="mt-4 inline-block">
            <Button variant="outline">Back to Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-900 pb-20">
      <BackgroundAtmosphere />

      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <Link
            href="/interviews"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Studio
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="text-xs font-bold flex items-center gap-2"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF Report
            </Button>
            <Link
              href={`/interviews/new?role=${encodeURIComponent(report.target_role)}&mode=${encodeURIComponent(report.interview_mode)}`}
            >
              <Button variant="primary" className="text-xs font-bold flex items-center gap-2 shadow-soft-sm">
                <Video className="h-3.5 w-3.5 fill-white" /> Practice Again
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================
            HEADER & EXECUTIVE METRICS HERO
           ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-soft-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getTierBadgeVariant(report.readiness_tier)} className="px-3 py-1 text-xs">
                  <Award className="h-3.5 w-3.5 mr-1" />
                  {report.readiness_tier}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {report.interview_mode.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-xs text-slate-500 capitalize">
                  {report.difficulty_level} Tier
                </Badge>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {report.target_role} Simulation Report
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Concluded on {new Date(report.completed_at).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })} • {report.total_questions_answered} Questions Evaluated
              </p>

              <p className="text-slate-600 text-sm leading-relaxed pt-2">
                {report.executive_summary}
              </p>
            </div>

            {/* Score Showcase Gauge Card */}
            <div className="shrink-0 flex items-center gap-6 bg-slate-50/80 border border-slate-200/80 p-6 sm:p-8 rounded-3xl">
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Overall Score
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900">
                    {report.overall_score.toFixed(1)}
                  </span>
                  <span className="text-base font-bold text-slate-400">/ 5.0</span>
                </div>
                <div className="text-xs text-unnati-indigo font-bold mt-1">
                  {Math.round((report.overall_score / 5) * 100)}% Industry Benchmark
                </div>
              </div>

              <div className="h-16 w-px bg-slate-200" />

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Technical Score</div>
                  <div className="text-lg font-black text-slate-900">
                    {report.technical_score.toFixed(1)} <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">HR &amp; STAR Score</div>
                  <div className="text-lg font-black text-slate-900">
                    {report.hr_score.toFixed(1)} <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            DIMENSION AVERAGES & STAR RIGOR SECTION
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dimension Scores Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <BarChart2 className="h-5 w-5 text-unnati-indigo" />
              Multi-Dimensional Evaluation Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Evaluation across five primary hiring dimensions on a standardized 0–5 scale.
            </p>

            <div className="space-y-4">
              {[
                { key: "technical_depth", label: "Technical Depth & Architecture" },
                { key: "communication_clarity", label: "Communication & Structural Clarity" },
                { key: "problem_solving", label: "Problem Solving & Reasoning" },
                { key: "role_competency", label: "Role Alignment & Domain Acumen" },
                { key: "star_rigor", label: "STAR Behavioral Completeness" }
              ].map((dim) => {
                const score = report.dimension_averages[dim.key] || 0;
                const percentage = Math.round((score / 5) * 100);
                return (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{dim.label}</span>
                      <span className="font-mono text-slate-900">{score.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-unnati-indigo to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAR Rigor Framework Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-unnati-saffron" />
                  STAR Framework Adherence
                </h2>
                <Badge variant="saffron" className="text-[10px]">Behavioral Rigor</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Assesses how consistently you structured responses with Situation, Task, Action, and quantifiable Results.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500">Situation</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.star_rigor_summary.situation_adherence}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500">Task</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.star_rigor_summary.task_clarity}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500">Action</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.star_rigor_summary.action_depth}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200">
                  <div className="text-xs font-bold text-orange-900">Result Metric</div>
                  <div className="text-lg font-black text-orange-950 mt-1">
                    {report.star_rigor_summary.metric_quantification}%
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Rigor Feedback:</strong>
              {report.star_rigor_summary.summary}
            </div>
          </div>
        </div>

        {/* ========================================================
            STRENGTHS VS PRIORITY IMPROVEMENTS
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Key Demonstrated Strengths
            </h2>
            <ul className="space-y-3">
              {report.top_strengths.map((st, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Priority Improvement Areas
            </h2>
            <ul className="space-y-3">
              {report.priority_improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ========================================================
            ROADMAP RECOMMENDATIONS & CURATED LEARNING
           ======================================================== */}
        {report.roadmap_recommendations && report.roadmap_recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-soft-lg">
            <div className="max-w-3xl mb-6">
              <Badge variant="saffron" className="text-xs mb-3">
                <Compass className="h-3.5 w-3.5 mr-1" />
                Integrated Career Roadmap Actions
              </Badge>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Recommended Upskilling to Close Identified Gaps
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5">
                The simulation detected competencies that scored below your target role's hiring threshold. Complete these roadmap modules to advance your readiness score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.roadmap_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-2">
                      <span>{rec.competency}</span>
                      <span className="text-unnati-saffron">{rec.urgency} Priority</span>
                    </div>
                    <h3 className="font-bold text-sm text-white mb-2">
                      {rec.suggested_module}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Action: {rec.action_type.replace("_", " ")}
                    </p>
                  </div>

                  <div className="pt-4 mt-2">
                    <Link href="/roadmap">
                      <Button variant="outline" className="w-full text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20">
                        Open in Roadmap <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            QUESTION-BY-QUESTION TRANSCRIPT REVIEW
           ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Detailed Question &amp; Transcript Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Inspect your exact responses, evaluator feedback, follow-up probe answers, and benchmark exemplar answers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {report.question_reviews.map((qr) => {
              const isExpanded = expandedQuestions[qr.question_id];
              return (
                <div
                  key={qr.question_id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-soft-sm"
                >
                  {/* Header / Accordion Trigger */}
                  <div
                    onClick={() => toggleQuestion(qr.question_id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="h-7 w-7 rounded-lg bg-purple-50 text-unnati-indigo font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200/60 mt-0.5">
                        {qr.order_index}
                      </span>
                      <div>
                        <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                          {qr.question_text}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-unnati-indigo">{qr.target_competency}</span>
                          <span>•</span>
                          <span>{qr.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {qr.score.toFixed(1)} <span className="text-xs text-slate-400">/ 5.0</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                      {/* Candidate Answer */}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                          Your Initial Response:
                        </span>
                        <div className="rounded-2xl bg-white border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {qr.candidate_response}
                        </div>
                      </div>

                      {/* Adaptive Follow-up (If present) */}
                      {qr.follow_up_prompt && (
                        <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-4 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-unnati-indigo block">
                            Interviewer Adaptive Follow-Up Question:
                          </span>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            "{qr.follow_up_prompt}"
                          </p>
                          {qr.follow_up_response && (
                            <div className="pt-2 border-t border-purple-200/60">
                              <span className="text-[11px] font-bold text-slate-500 block mb-1">Your Follow-Up Answer:</span>
                              <p className="text-xs sm:text-sm text-slate-800 italic">
                                {qr.follow_up_response}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Exemplar Benchmark Answer */}
                      {qr.ideal_refinement && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-unnati-saffron block mb-2">
                            Benchmark Exemplar Answer (Top 1% Candidate Model):
                          </span>
                          <div className="rounded-2xl bg-slate-900 text-slate-200 p-5 text-xs sm:text-sm leading-relaxed border border-slate-800">
                            {qr.ideal_refinement}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

