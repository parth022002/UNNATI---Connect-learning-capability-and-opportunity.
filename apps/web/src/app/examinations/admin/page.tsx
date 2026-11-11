"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CountUpNumber } from "@/components/motion";
import {
  api,
  getClerkApiToken,
  AdminReviewItem,
  AdminReviewDetail,
  ExamAnalyticsData
} from "@/lib/api";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ArrowLeft,
  RefreshCw,
  Search,
  SlidersHorizontal,
  User,
  FileText,
  Camera,
  Layers,
  Check,
  X
} from "lucide-react";

export default function ProctoringAdminDashboardPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [analytics, setAnalytics] = useState<ExamAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect Modal State
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminReviewDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Decision Form State
  const [decision, setDecision] = useState<string>("APPROVED");
  const [reviewerNotes, setReviewerNotes] = useState<string>("");
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  const loadDashboardData = async () => {
    if (!isLoaded || !isSignedIn) return;
    setLoading(true);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const [reviewsData, analyticsData] = await Promise.all([
        api.getAdminReviews(token, riskFilter, statusFilter),
        api.getAdminExamAnalytics(token)
      ]);
      setReviews(reviewsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load admin reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [riskFilter, statusFilter, isLoaded, isSignedIn]);

  const handleInspectAttempt = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setDetailLoading(true);
    setDecisionSuccess(null);
    setReviewerNotes("");
    try {
      const token = await getClerkApiToken(getToken);
      if (token) {
        const d = await api.getAdminReviewDetail(token, attemptId);
        setDetail(d);
      }
    } catch (err) {
      console.error("Failed to load attempt detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (!selectedAttemptId || !reviewerNotes.trim()) return;
    setSubmittingDecision(true);
    try {
      const token = await getClerkApiToken(getToken);
      if (token) {
        const updated = await api.recordAdminDecision(token, selectedAttemptId, {
          decision,
          reviewer_notes: reviewerNotes
        });
        setDetail(updated);
        setDecisionSuccess(`Decision '${decision}' recorded in tamper-evident audit log.`);
        loadDashboardData();
      }
    } catch (err: any) {
      console.error("Decision submission error:", err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.candidate_name.toLowerCase().includes(q) ||
      r.candidate_email.toLowerCase().includes(q) ||
      r.examination_title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere variant="dashboard" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link href="/examinations" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Examination Hub</span>
            </Link>

            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              Academic Examiner &amp; Integrity Portal
            </span>
          </div>

          {/* Header Banner */}
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-10 text-white shadow-soft-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Human-In-The-Loop Proctoring Audit Console</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black">
              Examination Integrity &amp; Telemetry Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Audit flagged examination sessions, review chronological browser focus and webcam presence telemetry, and record authoritative human determinations with immutable audit trails.
            </p>
          </div>

          {/* Analytics KPI Row */}
          {analytics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Attempts</span>
                <p className="font-heading text-3xl font-black text-slate-900 mt-1">
                  <CountUpNumber value={analytics.total_attempts} />
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">{analytics.completion_rate}% completion rate</span>
              </Card>

              <Card className="p-5 bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Score</span>
                <p className="font-heading text-3xl font-black text-unnati-indigo mt-1">
                  <CountUpNumber value={analytics.average_score_percentage} suffix="%" />
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Passing benchmark: 70%</span>
              </Card>

              <Card className="p-5 bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pass Rate</span>
                <p className="font-heading text-3xl font-black text-emerald-600 mt-1">
                  <CountUpNumber value={analytics.pass_rate} suffix="%" />
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Across all formal exams</span>
              </Card>

              <Card className="p-5 bg-white border border-amber-200 bg-amber-50/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
                <p className="font-heading text-3xl font-black text-amber-600 mt-1">
                  <CountUpNumber value={analytics.recent_flagged_count} />
                </p>
                <span className="text-xs text-amber-700 mt-0.5 block">Awaiting human examiner audit</span>
              </Card>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-soft-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate name, email, or exam title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-unnati-violet text-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Risk Category:
              </span>
              {[
                { id: "all", label: "All Risks" },
                { id: "HIGH", label: "High Risk" },
                { id: "MODERATE", label: "Moderate" },
                { id: "NORMAL", label: "Normal" }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRiskFilter(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    riskFilter === r.id
                      ? "bg-unnati-indigo text-white shadow-soft-sm"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews Table */}
          <div className="clean-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Candidate</th>
                    <th className="py-4 px-6">Examination</th>
                    <th className="py-4 px-6">Score</th>
                    <th className="py-4 px-6">Integrity Risk</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 text-unnati-indigo animate-spin mx-auto mb-2" />
                        <span>Loading telemetry reviews...</span>
                      </td>
                    </tr>
                  ) : filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No examination attempts match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((r) => {
                      const isHigh = r.integrity_risk_category === "HIGH";
                      const isMod = r.integrity_risk_category === "MODERATE";

                      return (
                        <tr key={r.attempt_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{r.candidate_name}</span>
                            <span className="text-xs text-slate-500">{r.candidate_email}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-900 block">{r.examination_title}</span>
                            <span className="text-xs text-slate-500">Attempt #{r.attempt_number}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{r.percentage}%</span>
                            <span className="text-xs text-slate-500">{r.score_obtained}/{r.total_marks} Marks</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                              isHigh
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : isMod
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {isHigh ? <AlertTriangle className="h-3 w-3" /> : isMod ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                              <span>{r.integrity_risk_category} ({r.event_count} Events)</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={r.status === "APPROVED" ? "success" : r.status === "UNDER_REVIEW" ? "error" : "outline"} className="text-[10px]">
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInspectAttempt(r.attempt_id)}
                              className="text-xs font-bold h-8 px-3 rounded-lg hover:border-purple-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span>Inspect Evidence</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================
          EVIDENCE AUDIT MODAL / DRAWER
         ======================================================== */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 text-slate-800">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-unnati-indigo" />
                  <span>Telemetry Audit &amp; Examiner Decision</span>
                </h3>
                <p className="text-xs text-slate-500">Attempt ID: {selectedAttemptId}</p>
              </div>
              <button onClick={() => setSelectedAttemptId(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="h-6 w-6 text-unnati-indigo animate-spin mx-auto mb-2" />
                <span>Loading telemetry event timeline...</span>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Candidate & Exam Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Candidate</span>
                    <span className="font-bold text-slate-800">{detail.candidate_name} ({detail.candidate_email})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Score / Result</span>
                    <span className="font-bold text-slate-800">{detail.percentage}% ({detail.is_passed ? "Pass" : "Fail"})</span>
                  </div>
                </div>

                {/* AI Integrity Assessment Summary */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-unnati-indigo">
                    <span>AI-Generated Integrity Assessment:</span>
                    <Badge variant={detail.integrity_risk_category === "HIGH" ? "error" : "violet"} className="text-[10px]">
                      {detail.integrity_risk_category} RISK
                    </Badge>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {detail.integrity_summary?.explanation || "Routine telemetry within parameters."}
                  </p>
                  <p className="text-[11px] text-purple-700 font-bold pt-1">
                    Recommended Action: {detail.integrity_summary?.recommended_action || "APPROVE_ATTEMPT"}
                  </p>
                </div>

                {/* Chronological Event Timeline */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Telemetry Event Timeline ({detail.events.length} Events):
                  </span>

                  {detail.events.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">No anomalies recorded during this session.</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {detail.events.map((e, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 block">{e.event_type}</span>
                              <span className="text-[10.5px] text-slate-500">
                                {new Date(e.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant={e.severity === "WARNING" ? "error" : "outline"} className="text-[9.5px]">
                            {e.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Human Reviewer Decision Form */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Authoritative Examiner Decision:
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "APPROVED", label: "Approve Attempt", desc: "No violation confirmed" },
                      { id: "CONFIRMED_VIOLATION", label: "Confirm Violation", desc: "Fail and reject attempt" },
                      { id: "DISMISSED", label: "Dismiss Telemetry", desc: "Technical false positive" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDecision(opt.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          decision === opt.id
                            ? "bg-unnati-indigo text-white border-unnati-indigo shadow-soft-sm font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs block font-bold">{opt.label}</span>
                        <span className="text-[10px] opacity-80 block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Audit Rationale &amp; Examiner Notes (Required):
                    </label>
                    <textarea
                      rows={3}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Explain your decision rationale for the immutable cryptographic audit log..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-unnati-violet bg-white"
                    />
                  </div>

                  {decisionSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      ✓ {decisionSuccess}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAttemptId(null)}>
                      Close
                    </Button>
                    <Button
                      variant="saffron"
                      size="sm"
                      onClick={handleSubmitDecision}
                      disabled={submittingDecision || !reviewerNotes.trim()}
                      className="font-bold text-xs h-9 px-5 rounded-xl text-white shadow-glow-saffron"
                    >
                      {submittingDecision ? "Recording Decision..." : "Submit Review Determination"}
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
      <CareerCompanionDrawer isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </div>
  );
}
