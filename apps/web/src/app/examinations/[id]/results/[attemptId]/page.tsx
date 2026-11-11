"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StaggerContainer, StaggerItem, CountUpNumber } from "@/components/motion";
import {
  api,
  getClerkApiToken,
  ExamResultDetail
} from "@/lib/api";
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileText,
  RotateCcw,
  Check,
  Share2,
  Lock,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function ExaminationResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const attemptId = params.attemptId as string;
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const [result, setResult] = useState<ExamResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQId, setOpenQId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  useEffect(() => {
    async function loadResult() {
      if (!isLoaded || !isSignedIn) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getClerkApiToken(getToken);
        if (!token) throw new Error("Authentication required.");

        const data = await api.getExamResults(token, attemptId);
        setResult(data);
      } catch (err: any) {
        console.error("Failed to load results:", err);
        setError(err.message || "Failed to load examination results.");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      loadResult();
    }
  }, [attemptId, isLoaded, isSignedIn]);

  const handleShareCertificate = (certNumber: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const url = `${window.location.origin}/examinations/certificates/${certNumber}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-unnati-indigo animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Evaluating examination &amp; computing feedback...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md p-8 text-center space-y-4 bg-white border border-slate-200">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Result Not Available</h2>
            <p className="text-sm text-slate-500">{error || "Could not retrieve results for this attempt."}</p>
            <Link href="/examinations">
              <Button variant="outline" size="sm">Back to Examinations</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isUnderReview = result.status === "UNDER_REVIEW";

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere variant="explore" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumb Back */}
          <Link href="/examinations" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Examinations</span>
          </Link>

          {/* ========================================================
              RESULT SCORE HERO BANNER
             ======================================================== */}
          <div className={`rounded-3xl p-8 sm:p-12 text-white shadow-soft-xl relative overflow-hidden ${
            isUnderReview
              ? "bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950"
              : result.is_passed
              ? "bg-gradient-to-r from-emerald-900 via-[#1E0B4B] to-emerald-900"
              : "bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900"
          }`}>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={`text-[10.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    isUnderReview
                      ? "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                      : result.is_passed
                      ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40"
                      : "bg-slate-700/60 text-slate-200"
                  }`}>
                    {isUnderReview ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                        <span>Academic Review In Progress</span>
                      </>
                    ) : result.is_passed ? (
                      <>
                        <Award className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Competency Benchmark Passed</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
                        <span>Assessment Completed</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-purple-200 font-medium">Attempt #{result.attempt_number}</span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  {result.title}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-purple-200">
                  {result.course_name} • {result.module_name}
                </p>

                {isUnderReview ? (
                  <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-normal bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                    ℹ️ <strong>Academic Review Status:</strong> Several window focus changes were recorded during your attempt. In accordance with UNNATI&apos;s human-in-the-loop policy, your attempt is being independently audited by an academic examiner. Your score has been recorded.
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                    {result.is_passed
                      ? "Congratulations! Your performance demonstrates verifiable mastery of target role competencies. Your profile and skills ledger have been updated."
                      : "Assessment completed. Review your knowledge gap breakdown below to follow a personalised revision sprint before retaking."}
                  </p>
                )}
              </div>

              {/* Big Score Card */}
              <div className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[180px] shrink-0 backdrop-blur-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Final Score</span>
                <p className="font-heading text-4xl sm:text-5xl font-black text-white">
                  <CountUpNumber value={result.percentage} suffix="%" />
                </p>
                <span className="text-xs text-purple-200 block font-semibold">
                  {result.score_obtained} / {result.total_marks} Marks
                </span>
                <span className="text-[11px] text-purple-300 block pt-1">
                  Passing: {result.passing_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              VERIFIABLE CERTIFICATE CARD (If Passed & Eligible)
             ======================================================== */}
          {result.is_passed && result.certificate_number && (
            <div className="clean-card p-6 sm:p-8 bg-gradient-to-br from-amber-50/80 via-white to-purple-50/80 border-2 border-amber-200/90 shadow-soft-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
                      Verifiable Achievement Credential
                    </span>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      Certificate of Competence: {result.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Credential ID: <span className="font-bold text-slate-800">{result.certificate_number}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="saffron"
                  size="sm"
                  onClick={() => handleShareCertificate(result.certificate_number!)}
                  className="font-bold text-xs h-9 px-4 rounded-xl text-white shadow-glow-saffron"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>{copiedLink ? "Link Copied!" : "Share / Copy Verification Link"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================
              COMPETENCY PERFORMANCE GRID
             ======================================================== */}
          <div className="clean-card p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-unnati-indigo" />
                <span>Competency-Wise Performance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against the UNNATI verified skills ontology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.competency_performance.map((comp) => {
                const isStrong = comp.proficiency_level === "Mastered" || comp.proficiency_level === "Proficient";

                return (
                  <div key={comp.competency_tag} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{comp.competency_tag}</span>
                      <span className={isStrong ? "text-emerald-700 font-extrabold" : "text-amber-700 font-extrabold"}>
                        {comp.proficiency_level} ({comp.percentage}%)
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          comp.percentage >= 80
                            ? "bg-emerald-500"
                            : comp.percentage >= 65
                            ? "bg-unnati-indigo"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, comp.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Score: {comp.obtained_marks}/{comp.total_marks} Marks</span>
                      <span>{isStrong ? "✓ Benchmark met" : "⚠️ Knowledge gap"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              AI LEARNING RECOMMENDATIONS & ROADMAP SPRINT
             ======================================================== */}
          {result.ai_learning_recommendations && (
            <div className="clean-card p-6 sm:p-8 bg-white border border-purple-200 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-unnati-indigo">
                  <Sparkles className="h-5 w-5 text-unnati-saffron" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Personalised AI Learning Recommendations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tailored revision steps grounded in your exact assessment gaps.
                  </p>
                </div>
              </div>

              {/* Recommended Sprint Modules */}
              {result.ai_learning_recommendations.recommended_modules?.length > 0 && (
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Targeted Knowledge Gap Sprints:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {result.ai_learning_recommendations.recommended_modules.map((mod, i) => (
                      <div key={i} className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/90 text-xs space-y-1.5">
                        <span className="font-bold text-unnati-indigo text-[13px] block">
                          {mod.title}
                        </span>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {mod.recommended_action}
                        </p>
                        <span className="text-[11px] font-bold text-slate-500 block pt-1">
                          Est. Time: ~{mod.estimated_hours} Hours
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Actions List */}
              {result.ai_learning_recommendations.practice_actions?.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 block">Immediate Practice Actions:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    {result.ai_learning_recommendations.practice_actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-purple-700 font-semibold pt-1">
                    {result.ai_learning_recommendations.revision_schedule}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <Link href="/roadmap">
                  <Button variant="outline" size="sm" className="font-bold text-xs h-9 px-4 rounded-xl">
                    <Compass className="h-3.5 w-3.5 mr-1.5 text-unnati-violet" />
                    <span>View Career Roadmap Integration</span>
                  </Button>
                </Link>

                {result.can_retake && (
                  <Link href={`/examinations/${result.examination_id}`}>
                    <Button variant="saffron" size="sm" className="font-bold text-xs h-9 px-4 rounded-xl text-white shadow-glow-saffron">
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      <span>Retake Examination ({result.attempts_remaining} Remaining)</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              QUESTION-BY-QUESTION REVIEW ACCORDIONS
             ======================================================== */}
          <div className="clean-card p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-700" />
                <span>Question Breakdown &amp; Model Explanations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your responses against official evaluation rubrics and explanations.
              </p>
            </div>

            <div className="space-y-3">
              {result.question_breakdown.map((q) => {
                const isOpen = openQId === q.question_id;

                return (
                  <div key={q.question_id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenQId(isOpen ? null : q.question_id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {q.is_correct ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            Question {q.question_number}: {q.competency_tag}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Score: {q.marks_awarded} / {q.marks} Marks
                          </span>
                        </div>
                      </div>

                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs sm:text-[13px] text-slate-700 leading-relaxed animate-in fade-in duration-150">
                        <p className="font-semibold text-slate-900">{q.prompt}</p>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-800 text-xs block">Your Answer:</span>
                          <p className="text-slate-600">
                            {q.selected_options.length > 0 ? q.selected_options.join(", ") : q.ai_feedback ? "Text Response Evaluated" : "Unanswered"}
                          </p>
                        </div>

                        {q.ai_feedback && (
                          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                            <span className="font-bold text-xs block flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                              <span>Examiner AI Formative Feedback:</span>
                            </span>
                            <p>{q.ai_feedback}</p>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                            <span className="font-bold text-xs block">Pedagogical Explanation:</span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <CareerCompanionDrawer isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </div>
  );
}
