"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Video,
  Mic,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  ResumeListItem,
  JobDescriptionItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

const PRESET_ROLES = [
  "Full-Stack Developer",
  "Frontend Engineer",
  "Backend / Cloud Engineer",
  "Data Scientist / AI Engineer",
  "Product Manager",
  "Business & Strategy Analyst",
  "Financial Analyst"
];

function NewInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [targetRole, setTargetRole] = useState(searchParams.get("role") || "Software Engineer");
  const [interviewMode, setInterviewMode] = useState(searchParams.get("mode") || "COMBINED");
  const [difficultyLevel, setDifficultyLevel] = useState(searchParams.get("difficulty") || "MID");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJdId, setSelectedJdId] = useState<string>("");

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionItem[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setLoadingContext(true);
        const token = await getClerkApiToken(getToken);
        if (!token) return;

        const [resumeList, jdList] = await Promise.all([
          api.getResumes(token).catch(() => []),
          api.getJobDescriptions(token).catch(() => [])
        ]);

        setResumes(resumeList);
        if (resumeList.length > 0) {
          const primary = resumeList.find(r => r.is_primary) || resumeList[0];
          setSelectedResumeId(primary.id);
          if (!searchParams.get("role") && primary.target_role) {
            setTargetRole(primary.target_role);
          }
        }

        setJobDescriptions(jdList);
        if (jdList.length > 0) {
          setSelectedJdId(jdList[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load user resumes or JDs:", err);
      } finally {
        setLoadingContext(false);
      }
    }

    if (isLoaded && isSignedIn) {
      loadArtifacts();
    }
  }, [isLoaded, isSignedIn, getToken, searchParams]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setError("Please specify a target career role.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication required.");

      const durationMap: Record<string, number> = {
        ENTRY: 15,
        MID: 25,
        SENIOR: 40
      };

      const session = await api.createInterviewSession(token, {
        target_role: targetRole.trim(),
        interview_mode: interviewMode,
        difficulty_level: difficultyLevel,
        target_duration_minutes: durationMap[difficultyLevel] || 25,
        voice_mode_enabled: voiceModeEnabled,
        resume_id: selectedResumeId || undefined,
        job_description_id: selectedJdId || undefined
      });

      router.push(`/interviews/${session.id}`);
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Failed to create interview session.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 pb-20">
      <BackgroundAtmosphere />

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/interviews"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Studio
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="violet" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron mr-1.5" />
              Configure Simulation
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
            Launch New Realistic Simulation
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Personalize your interview questions using your actual resume projects and target job criteria.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLaunch} className="mt-8 space-y-8">
          {/* ========================================================
              STEP 1: TARGET ROLE SELECTION
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <label className="block font-heading text-base font-bold text-slate-900 mb-2">
              1. Target Career Role
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Questions, rubric standards, and technical scenarios will align with this role standard.
            </p>

            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer, Product Manager"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-unnati-indigo focus:outline-none focus:ring-2 focus:ring-purple-200"
              required
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET_ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    targetRole === role
                      ? "bg-purple-100 border-unnati-indigo text-unnati-indigo font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              STEP 2: INTERVIEW MODE
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <label className="block font-heading text-base font-bold text-slate-900 mb-2">
              2. Interview Track &amp; Mode
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Select the dimension and evaluation criteria to prioritize.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "COMBINED",
                  title: "Combined 360° Simulation",
                  desc: "Balanced balance of technical problem solving, system design, and behavioral STAR stories.",
                  badge: "Most Realistic"
                },
                {
                  id: "TECHNICAL",
                  title: "Technical Architecture & Coding",
                  desc: "Deep technical interrogation, architectural trade-offs, algorithms, and domain knowledge.",
                  badge: "In-Depth"
                },
                {
                  id: "HR_BEHAVIOURAL",
                  title: "HR, Leadership & STAR",
                  desc: "Evaluates conflict resolution, project leadership, situational ownership, and cultural fit.",
                  badge: "STAR Focused"
                },
                {
                  id: "RESUME_DEEP_DIVE",
                  title: "Resume & Project Deep-Dive",
                  desc: "The interviewer explicitly cross-examines projects, metrics, and claims from your resume.",
                  badge: "Personalized"
                },
                {
                  id: "JD_SPECIFIC",
                  title: "Target Job Description Alignment",
                  desc: "Directly matches mandatory and preferred qualifications in your target job posting.",
                  badge: "Targeted"
                }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setInterviewMode(m.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    interviewMode === m.id
                      ? "border-unnati-indigo bg-purple-50/50 shadow-soft-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{m.title}</span>
                    <Badge variant={interviewMode === m.id ? "violet" : "outline"} className="text-[10px]">
                      {m.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              STEP 3: GROUNDING & PERSONALIZATION
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="font-heading text-base font-bold text-slate-900">
                3. Grounding &amp; Personalization Context
              </label>
              <Badge variant="saffron" className="text-[10px]">Recommended</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Grounding questions in your actual resume and target job prevents generic questions and generates realistic deep probes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Resume Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Candidate Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-unnati-indigo focus:outline-none"
                >
                  <option value="">No Resume (Use standard domain questions)</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} {r.target_role ? `(${r.target_role})` : ""} {r.is_primary ? "★ Primary" : ""}
                    </option>
                  ))}
                </select>
                {resumes.length === 0 && !loadingContext && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    No resumes in studio. <Link href="/resumes" className="text-unnati-indigo underline">Create one</Link> for grounded probing.
                  </p>
                )}
              </div>

              {/* Job Description Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Target Job Description
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-unnati-indigo focus:outline-none"
                >
                  <option value="">No JD (Use industry benchmark role expectations)</option>
                  {jobDescriptions.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title} {jd.company ? `@ ${jd.company}` : ""}
                    </option>
                  ))}
                </select>
                {jobDescriptions.length === 0 && !loadingContext && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    No JDs saved. <Link href="/resumes" className="text-unnati-indigo underline">Add a job posting</Link> to target specific criteria.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              STEP 4: DIFFICULTY & DURATION
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <label className="block font-heading text-base font-bold text-slate-900 mb-2">
              4. Experience Tier &amp; Pace
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Calibrates the depth of technical trade-offs and edge-case rigor expected from the candidate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "ENTRY",
                  label: "Entry / Associate",
                  time: "15 mins",
                  questions: "4 questions",
                  desc: "Core fundamentals, structured problem solving, clear fundamentals."
                },
                {
                  id: "MID",
                  label: "Mid-Level Professional",
                  time: "25 mins",
                  questions: "6 questions",
                  desc: "System design trade-offs, modularity, active project ownership."
                },
                {
                  id: "SENIOR",
                  label: "Senior / Staff Specialist",
                  time: "40 mins",
                  questions: "8 questions",
                  desc: "High-scale distributed systems, strategic trade-offs, organizational impact."
                }
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setDifficultyLevel(tier.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    difficultyLevel === tier.id
                      ? "border-unnati-indigo bg-purple-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{tier.label}</div>
                  <div className="text-xs text-unnati-indigo font-semibold mt-1">
                    {tier.time} • {tier.questions}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              STEP 5: INTERACTION FORMAT (VOICE / TEXT)
             ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <label className="block font-heading text-base font-bold text-slate-900 mb-2">
              5. Simulation Interaction Mode
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Choose between interactive voice dialogue or standard written simulation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setVoiceModeEnabled(false)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  !voiceModeEnabled
                    ? "border-unnati-indigo bg-purple-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Standard Text Mode</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Type structured answers with live word counter and STAR framework guideline hints.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setVoiceModeEnabled(true)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  voiceModeEnabled
                    ? "border-unnati-indigo bg-purple-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 text-unnati-indigo shrink-0">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    Interactive Voice Mode
                    <Badge variant="saffron" className="text-[10px]">Real-time</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Uses browser speech recognition to speak answers aloud with real-time transcription and voice interviewer playback.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              LAUNCH BUTTON & DISCLAIMER
             ======================================================== */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 max-w-md">
              <ShieldCheck className="h-4 w-4 inline text-emerald-600 mr-1" />
              Responses are evaluated objectively using standardized non-hallucinatory rubrics. Your session history is saved to your UNNATI profile.
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="py-3 px-8 text-sm font-bold flex items-center justify-center gap-2 shadow-soft-lg"
            >
              {submitting ? (
                <>Synthesizing Personalized Interview...</>
              ) : (
                <>
                  <Video className="h-4 w-4 fill-white" />
                  Begin Simulation
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading interview setup...</div>}>
      <NewInterviewForm />
    </Suspense>
  );
}

