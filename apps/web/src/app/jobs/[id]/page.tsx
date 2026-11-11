"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Briefcase,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
  ArrowRight,
  ChevronRight,
  FileText,
  AlertTriangle,
  Send,
  Check,
  Info,
  Share2,
  RefreshCw
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  CanonicalJobDetail,
  JobRedirectValidationResponse,
  JobMatchSkillItem,
  JobMissingSkillItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<CanonicalJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [isSaved, setIsSaved] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>("SAVED");
  const [candidateNotes, setCandidateNotes] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // External Redirect Modal State
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<{ portalName: string; url: string } | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Load Job Detail
  useEffect(() => {
    async function loadData() {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        let token: string | null = null;
        if (isSignedIn) {
          token = await getClerkApiToken(getToken);
        }

        const data = await api.getJobDetail(token || "", jobId);
        setJob(data);
        setIsSaved(data.is_saved);
        if (data.application_status) {
          setApplicationStatus(data.application_status);
        }
      } catch (err: any) {
        console.error("Failed to load job details:", err);
        setError(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadData();
    }
  }, [jobId, isSignedIn, isLoaded]);

  // Toggle Save Job
  const handleToggleSave = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/jobs/${jobId}`);
      return;
    }
    try {
      setSavingAction(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      if (isSaved) {
        await api.removeSavedJob(token, jobId);
        setIsSaved(false);
      } else {
        await api.saveJob(token, jobId);
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error("Save job error:", err);
    } finally {
      setSavingAction(false);
    }
  };

  // Open Safe Apply Gateway Modal
  const initiateApplyRedirect = (portalName: string, externalUrl: string) => {
    setRedirectTarget({ portalName, url: externalUrl });
    setShowRedirectModal(true);
  };

  // Confirm External Application Redirect
  const handleConfirmRedirect = async () => {
    if (!job || !redirectTarget) return;

    try {
      setRedirecting(true);
      let targetUrl = redirectTarget.url;

      if (isSignedIn) {
        const token = await getClerkApiToken(getToken);
        if (token) {
          try {
            const redirectResp = await api.trackApplyRedirect(token, job.id);
            if (redirectResp.destination_url) {
              targetUrl = redirectResp.destination_url;
            }
            // Update tracking state locally
            setApplicationStatus("LINK_OPENED");
          } catch (telemetryErr) {
            console.warn("Telemetry warning:", telemetryErr);
          }
        }
      }

      // Safe client-side open with noopener and noreferrer
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      setShowRedirectModal(false);
    } catch (err: any) {
      console.error("Redirect execution error:", err);
    } finally {
      setRedirecting(false);
    }
  };

  // Update Manual Application Pipeline Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/jobs/${jobId}`);
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusSuccessMessage(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      await api.updateJobApplicationStatus(token, jobId, {
        status: newStatus,
        candidate_notes: candidateNotes
      });

      setApplicationStatus(newStatus);
      setStatusSuccessMessage(`Pipeline updated to ${newStatus.replace(/_/g, " ")}`);
      setTimeout(() => setStatusSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50 pt-24 pb-20">
        <BackgroundAtmosphere />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-block p-4 rounded-2xl bg-purple-50 text-unnati-indigo mb-4 animate-spin">
            <RefreshCw className="h-8 w-8" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-800">Analyzing Job Opportunity...</h3>
          <p className="text-slate-500 text-sm mt-1">Retrieving verified postings and computing personalized match analysis</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="relative min-h-screen bg-slate-50 pt-24 pb-20">
        <BackgroundAtmosphere />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 inline-block mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-slate-900">Job Opportunity Not Found</h2>
          <p className="text-slate-600 mt-2 text-sm">{error || "This job listing is either inactive or no longer available."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/jobs">
              <Button className="bg-unnati-indigo hover:bg-unnati-indigo/90 text-white font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Job Discovery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const match = job.match_analysis;
  const destinationHost = (() => {
    try {
      return new URL(job.primary_application_url).hostname.replace("www.", "");
    } catch {
      return job.primary_source_name;
    }
  })();

  return (
    <div className="relative min-h-screen bg-slate-50/60 pt-24 pb-28">
      <BackgroundAtmosphere />

      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-unnati-indigo transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Jobs Discovery
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Posted: {new Date(job.posted_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Listing
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* MAIN COLUMN (LEFT 8 COLUMNS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">

            {/* HEADER CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 text-unnati-indigo font-black text-xl flex items-center justify-center shrink-0 border border-purple-200/60 shadow-soft-sm">
                    {job.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-unnati-indigo tracking-wide uppercase">
                        {job.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <Badge variant="outline" className="text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                        {job.workplace_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                        {job.employment_type}
                      </Badge>
                    </div>

                    <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                      {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-slate-600 mt-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-slate-400" /> {job.company_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" /> {job.city ? `${job.city}, ${job.country}` : job.country}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-slate-400" /> {job.experience_level} ({job.experience_min_years}-{job.experience_max_years || `${job.experience_min_years}+`} yrs)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    disabled={savingAction}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSaved
                        ? "bg-orange-50 border-orange-200 text-unnati-saffron"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 fill-unnati-saffron text-unnati-saffron" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" /> Save Job
                      </>
                    )}
                  </button>

                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400 block">Source</span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                      {job.primary_source_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* SALARY & CROSS-POSTING BAR */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Estimated Compensation</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-lg mt-0.5">
                    <DollarSign className="h-5 w-5 text-emerald-600 shrink-0" />
                    {job.salary_min || job.salary_max ? (
                      <span>
                        {job.salary_currency === "INR" ? "₹" : job.salary_currency}{" "}
                        {job.salary_min ? (job.salary_min / 100000).toFixed(1) + " L" : ""}
                        {job.salary_min && job.salary_max ? " - " : ""}
                        {job.salary_max ? (job.salary_max / 100000).toFixed(1) + " LPA" : " PA"}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-sm font-semibold">Competitive / Undisclosed</span>
                    )}
                  </div>
                </div>

                {job.external_references && job.external_references.length > 1 && (
                  <div className="flex items-center gap-2 bg-purple-50/70 border border-purple-200/60 px-3 py-1.5 rounded-xl">
                    <Layers className="h-4 w-4 text-unnati-indigo" />
                    <span className="text-xs font-bold text-unnati-indigo">
                      Aggregated across {job.external_references.length} legitimate job portals
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 10-DIMENSION AI MATCH ANALYSIS CARD */}
            {match && (
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/40 rounded-3xl border border-purple-200/80 p-6 sm:p-8 shadow-soft-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="h-48 w-48 text-unnati-indigo" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-unnati-indigo to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-soft-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-slate-900">
                        10-Dimension Compatibility Breakdown
                      </h3>
                      <p className="text-xs text-slate-600">
                        Explainable match computed against your verified skills, roadmap, and career trajectory
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 bg-white border border-purple-200 px-4 py-2 rounded-2xl shadow-soft-sm shrink-0">
                    <span className="text-3xl font-black text-unnati-indigo">
                      {match.overall_match_percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold text-slate-500">Match</span>
                  </div>
                </div>

                {/* Why Recommended Narrative */}
                <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/70 p-4">
                  <span className="text-xs font-extrabold text-unnati-indigo uppercase tracking-wider block mb-1">
                    Why UNNATI Recommends This Role
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {match.recommendation_explanation}
                  </p>
                </div>

                {/* Score Breakdown Progress Bars */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Skills Overlap (Weight 25%)</span>
                      <span className="text-unnati-indigo">{match.skills_match_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-unnati-indigo rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, match.skills_match_score)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Target Role Relevance (Weight 20%)</span>
                      <span className="text-unnati-indigo">{match.role_relevance_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, match.role_relevance_score)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Experience Compatibility (Weight 15%)</span>
                      <span className="text-unnati-indigo">{match.experience_compatibility_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, match.experience_compatibility_score)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Career Roadmap Synergy (Weight 10%)</span>
                      <span className="text-unnati-indigo">{match.career_alignment_score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, match.career_alignment_score)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Matched Skills With Evidence Labels */}
                <div className="mt-6">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Matched Skills with Verification Evidence
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.matched_skills.map((item) => (
                      <div
                        key={item.skill}
                        className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-soft-sm"
                      >
                        <span>{item.skill}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            item.evidence_state === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.evidence_state === "ASSESSED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.evidence_state}
                        </span>
                      </div>
                    ))}
                    {match.matched_skills.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No direct skill matches identified.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills & Roadmap Action Bridges */}
                {match.missing_skills.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-purple-100">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-500" /> Skill Gaps & Roadmap Action Bridges
                    </h4>
                    <div className="space-y-2">
                      {match.missing_skills.map((gap) => (
                        <div
                          key={gap.skill}
                          className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{gap.skill}</span>
                            {gap.is_mandatory && (
                              <Badge variant="outline" className="text-[9px] border-rose-300 text-rose-700 bg-rose-50">
                                Required by Employer
                              </Badge>
                            )}
                            {gap.in_candidate_roadmap && (
                              <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700 bg-emerald-50 font-bold">
                                In Your Roadmap
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {gap.suggested_roadmap_module && (
                              <span className="text-slate-500 text-[11px]">
                                Module: <strong className="text-slate-700">{gap.suggested_roadmap_module}</strong>
                              </span>
                            )}
                            <Link href="/roadmap">
                              <Button variant="outline" className="text-[11px] font-bold py-1 px-2.5 h-auto border-purple-200 text-unnati-indigo hover:bg-purple-50">
                                Learn in Roadmap <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Concerns */}
                {match.potential_concerns && match.potential_concerns.length > 0 && (
                  <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" /> Points to Consider Before Applying
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                      {match.potential_concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* JOB DESCRIPTION CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-6">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 mb-3">
                  About the Role
                </h3>
                <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {job.description_clean || job.description_raw}
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-heading font-bold text-base text-slate-900 mb-3">
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <Check className="h-4 w-4 text-unnati-indigo shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Minimum Qualifications */}
              {job.min_qualifications && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-heading font-bold text-base text-slate-900 mb-2">
                    Minimum Qualifications & Prerequisites
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {job.min_qualifications}
                  </p>
                </div>
              )}

              {/* Skills Tags */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Preferred Skills & Nice-to-Haves
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.preferred_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-lg bg-purple-50 text-unnati-indigo text-xs font-medium border border-purple-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CROSS-LISTING & SOURCES BREAKDOWN */}
            {job.external_references && job.external_references.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm">
                <h3 className="font-heading font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-unnati-indigo" /> Source Attribution & Official Portals
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  This opportunity is collected from verified public feeds and job networks. You can view or apply through any of the following verified sources:
                </p>

                <div className="divide-y divide-slate-100">
                  {job.external_references.map((ref) => (
                    <div key={ref.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {ref.portal_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{ref.portal_name}</span>
                            {ref.is_primary_source && (
                              <Badge variant="outline" className="text-[9px] bg-purple-50 text-unnati-indigo border-purple-200 font-bold">
                                Primary Source
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs block">
                            {ref.external_url}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => initiateApplyRedirect(ref.portal_name, ref.external_url)}
                        className="text-xs font-bold py-1.5 px-3 h-auto border-slate-200 text-slate-700 hover:text-unnati-indigo shrink-0"
                      >
                        Apply via {ref.portal_name} <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SIDEBAR (RIGHT 4 COLUMNS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">

            {/* ACTION & APPLY CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm space-y-5 sticky top-28">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ready to Take Action?
                </span>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Apply via Official Portal
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  UNNATI connects you directly to the verified listing on <strong>{destinationHost}</strong>.
                </p>
              </div>

              {/* Primary Apply Button */}
              <Button
                onClick={() => initiateApplyRedirect(job.primary_source_name, job.primary_application_url)}
                className="w-full bg-gradient-to-r from-unnati-indigo to-purple-600 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl shadow-soft-md flex items-center justify-center gap-2 text-sm"
              >
                Apply on {job.primary_source_name} <ExternalLink className="h-4 w-4" />
              </Button>

              {/* Compare with Resume Button */}
              <Link href={`/resume?jd_id=${job.id}`}>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 text-unnati-indigo hover:bg-purple-50 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs"
                >
                  <FileText className="h-4 w-4" /> Compare with My Resume
                </Button>
              </Link>

              {/* Practice for this role button */}
              <Link href={`/interview-prep?role=${encodeURIComponent(job.title)}`}>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs"
                >
                  <Sparkles className="h-4 w-4 text-unnati-indigo" /> Practice Interview for this Role
                </Button>
              </Link>

              {/* APPLICATION PIPELINE TRACKER */}
              <div className="pt-5 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  My Application Pipeline
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Current Status</label>
                    <select
                      value={applicationStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={updatingStatus}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="SAVED">Saved / Interested</option>
                      <option value="READY_TO_APPLY">Ready to Apply</option>
                      <option value="LINK_OPENED">Application Link Opened</option>
                      <option value="APPLIED">Applied on Employer Portal</option>
                      <option value="INTERVIEW">Interview Scheduled</option>
                      <option value="OFFER">Offer Received 🎉</option>
                      <option value="REJECTED">Archived / Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>

                  {statusSuccessMessage && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{statusSuccessMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">My Notes (Private)</label>
                    <textarea
                      value={candidateNotes}
                      onChange={(e) => setCandidateNotes(e.target.value)}
                      placeholder="Add interview dates, contact details, or notes..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(applicationStatus)}
                      disabled={updatingStatus}
                      className="w-full text-xs font-bold py-1.5 mt-1 border-slate-200 text-slate-700"
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>

              {/* SAFE REDIRECT & DISCLAIMER NOTICE */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> Application Transparency
                </div>
                UNNATI aggregates authentic jobs from verified portals. UNNATI is not the hiring employer. When applying, you submit your details directly on the employer or portal website.
              </div>
            </div>

            {/* OVERVIEW SUMMARY CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm space-y-4">
              <h4 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                Opportunity Summary
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Industry</span>
                  <span className="font-semibold text-slate-800">{job.industry || "Technology"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Employment Type</span>
                  <span className="font-semibold text-slate-800">{job.employment_type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Workplace Type</span>
                  <span className="font-semibold text-slate-800">{job.workplace_type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Experience Required</span>
                  <span className="font-semibold text-slate-800">{job.experience_min_years}-{job.experience_max_years || `${job.experience_min_years}+`} years</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-800">{job.city || "Remote"}, {job.country}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Direct Employer</span>
                  <span className="font-semibold text-slate-800">{job.is_direct_employer ? "Yes" : "Via Verified Agency"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SAFE EXTERNAL APPLICATION REDIRECT MODAL */}
      {/* ========================================================================= */}
      {showRedirectModal && redirectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-unnati-indigo flex items-center justify-center shrink-0 border border-purple-200">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Redirecting to External Application
                </h3>
                <p className="text-xs text-slate-500">
                  Safe External Application Gateway
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destination Portal:</span>
                <strong className="text-slate-900 font-bold">{redirectTarget.portalName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destination Domain:</span>
                <span className="font-mono text-purple-700 font-semibold truncate max-w-[240px]">
                  {(() => {
                    try {
                      return new URL(redirectTarget.url).hostname;
                    } catch {
                      return redirectTarget.url;
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="text-slate-800 font-semibold">{job.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Company:</span>
                <span className="text-slate-800 font-semibold">{job.company_name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Important Notice:</strong> You are submitting your application directly on the external partner or company career portal. UNNATI does not act as an employer and will never ask you for money or sensitive financial credentials to apply.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRedirectModal(false)}
                className="text-xs font-bold py-2.5 px-4 rounded-xl border-slate-200 text-slate-700"
              >
                Cancel
              </Button>

              <Button
                onClick={handleConfirmRedirect}
                disabled={redirecting}
                className="bg-gradient-to-r from-unnati-indigo to-purple-600 hover:opacity-95 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-soft-sm flex items-center gap-2"
              >
                {redirecting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Proceed to {redirectTarget.portalName} <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
