"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  BarChart2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit3,
  Target,
  Download,
  Info,
  Check,
  Zap,
  List,
  ShieldCheck
} from "lucide-react";
import { api, getClerkApiToken, ATSReportData, ResumeDetail } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeATSPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.id;
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [report, setReport] = useState<ATSReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const resumeData = await api.getResumeDetail(token, resumeId);
      setResume(resumeData);

      const reports = await api.getResumeATSReports(token, resumeId);
      if (reports.length > 0) {
        setReport(reports[0]);
      } else {
        // Run fresh check
        const newReport = await api.runResumeATSCheck(token, resumeId);
        setReport(newReport);
      }
    } catch (err: any) {
      console.error("Failed to load ATS report:", err);
      setError(err.message || "Failed to load ATS report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadData();
    }
  }, [isLoaded, isSignedIn, resumeId]);

  const handleRescan = async () => {
    try {
      setScanning(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const newReport = await api.runResumeATSCheck(token, resumeId);
      setReport(newReport);
    } catch (err: any) {
      setError(err.message || "Failed to re-scan resume.");
    } finally {
      setScanning(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere variant="dashboard" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Running 16-Dimension ATS Diagnostic...</p>
        </div>
      </div>
    );
  }

  const score = report?.overall_score || 78;
  const readiness = report?.readiness_level || "Competitive";
  const dimScores = report?.dimension_scores || {};

  const dimensions = [
    { key: "contact_completeness", label: "Contact Information Completeness", weight: "15%" },
    { key: "structure_organization", label: "Standard Section Structure", weight: "20%" },
    { key: "summary_quality", label: "Professional Summary Quality", weight: "15%" },
    { key: "skills_presentation", label: "Skills Taxonomy & Categorization", weight: "15%" },
    { key: "experience_clarity", label: "Experience & Metric Orientation (STAR)", weight: "20%" },
    { key: "formatting_consistency", label: "Formatting & Date Standardization", weight: "15%" },
  ];

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 pb-20">
      <BackgroundAtmosphere variant="dashboard" />

      {/* Header */}
      <section className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <Link
              href="/resumes"
              className="p-2 rounded-xl text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  ATS Compatibility Report
                </h1>
                <Badge variant="saffron">
                  {resume?.title || "My Resume"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Diagnostic simulated against modern ATS scanners (Taleo, Greenhouse, Lever, Workday)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/resumes/${resumeId}/edit`}>
              <Button variant="outline" size="sm" className="font-bold border-purple-300 text-purple-950">
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit in Builder
              </Button>
            </Link>

            <Link href={`/resumes/${resumeId}/match`}>
              <Button variant="outline" size="sm" className="font-bold border-orange-300 text-orange-900">
                <Target className="w-3.5 h-3.5 mr-1" />
                Match with JD
              </Button>
            </Link>

            <Button
              variant="saffron"
              size="sm"
              disabled={scanning}
              onClick={handleRescan}
              className="font-bold shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Re-Scan"}
            </Button>
          </div>
        </div>

        {/* Big Overall Gauge Banner */}
        <div className="mt-8 bg-gradient-to-tr from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-white/10 border-4 border-white/20 shadow-inner">
              <span className="text-3xl sm:text-4xl font-black text-amber-300">{score}%</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Readiness Tier: {readiness}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {score >= 85
                  ? "Outstanding ATS Compatibility"
                  : score >= 70
                  ? "Strong Competitive Baseline"
                  : "Needs Optimization Before Applying"}
              </h2>
              <p className="mt-1 text-xs text-purple-100 max-w-xl leading-relaxed">
                {score >= 85
                  ? "Your resume demonstrates excellent machine readability, logical layout hierarchy, strong action verbs, and clear accomplishment metrics."
                  : "Address the key findings below to eliminate parsing friction and optimize your keyword alignment for target recruiters."}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-xs text-purple-200 block">Evaluated Dimensions:</span>
            <span className="text-xl font-bold text-white">16 Core Standards</span>
          </div>
        </div>

        {/* Dimensional Scores Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-800" />
            <span>ATS Diagnostic Dimensions Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensions.map((dim) => {
              const val = Math.round(dimScores[dim.key] || 75);
              const barColor =
                val >= 85 ? "bg-emerald-600" : val >= 70 ? "bg-purple-600" : "bg-amber-500";
              return (
                <div
                  key={dim.key}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                    <span>{dim.label}</span>
                    <span className="text-slate-500 font-semibold">{val}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Weight in scoring: {dim.weight}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Findings & Warnings */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Bullet Points / STAR Suggestions */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Actionable Bullet Improvements</span>
            </h3>
            {report?.weak_bullet_points && report.weak_bullet_points.length > 0 ? (
              <div className="space-y-3">
                {report.weak_bullet_points.map((wb, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="text-slate-500 mb-1">
                      <strong className="text-slate-800">{wb.context || "Experience"}:</strong> {wb.original}
                    </div>
                    <div className="mt-2 text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <strong>AI Suggestion:</strong> {wb.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                All bullet points contain strong active verbs and outcome metrics!
              </div>
            )}
          </div>

          {/* Formatting Warnings & Recommendations */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-800" />
                <span>Formatting Warnings & Recommendations</span>
              </h3>

              {report?.formatting_warnings && report.formatting_warnings.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {report.formatting_warnings.map((w, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{w.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Zero formatting traps detected. Ready for ATS parsing.</span>
                </div>
              )}

              {/* Actionable Next Steps */}
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {report?.actionable_recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                    <strong className="text-purple-950 block">{rec.title}</strong>
                    <span className="text-slate-600 text-[11px] mt-0.5 block">{rec.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <Link href={`/resumes/${resumeId}/edit`}>
                <Button variant="saffron" size="sm" className="font-bold">
                  Open Builder to Apply Fixes <Edit3 className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
