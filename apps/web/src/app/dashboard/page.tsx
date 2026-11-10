"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  UserButton, 
  OrganizationSwitcher 
} from "@clerk/nextjs";
import { 
  Award, 
  BookOpen, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  FileText, 
  GraduationCap, 
  Layers, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  UploadCloud, 
  Zap,
  AlertCircle,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { 
  api, 
  getClerkApiToken,
  UserDetail, 
  CandidateSkill, 
  CandidateDocumentSummary, 
  CandidateDocumentDetail,
  CanonicalSkill
} from "@/lib/api";

const SKILL_STATE_CONFIG: Record<string, { label: string; badgeClass: string; desc: string }> = {
  CLAIMED: {
    label: "Claimed",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    desc: "Self-reported baseline",
  },
  INFERRED: {
    label: "Inferred",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Evidence-backed by resume/projects",
  },
  ASSESSED: {
    label: "Assessed",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Verified through diagnostic evaluation",
  },
  VERIFIED: {
    label: "Verified",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Institutional or credential backed",
  },
};

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [documents, setDocuments] = useState<CandidateDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resume Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeParsedDoc, setActiveParsedDoc] = useState<CandidateDocumentDetail | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [applyingDoc, setApplyingDoc] = useState(false);

  // Add Skill Modal State
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalSkill[]>([]);
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState(0.6);
  const [claiming, setClaiming] = useState(false);

  const fetchDashboardData = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      // 1. Sync / fetch user
      const user = await api.getCurrentUser(token).catch(async () => {
        return await api.syncUser(token, "student");
      });
      setUserData(user);

      // 2. Fetch skills
      const mySkills = await api.getMySkills(token).catch(() => []);
      setSkills(mySkills);

      // 3. Fetch documents
      const docs = await api.getMyDocuments(token).catch(() => []);
      setDocuments(docs);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboardData();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Skill search
  useEffect(() => {
    if (skillQuery.trim().length > 1) {
      api.searchCanonicalSkills(skillQuery)
        .then((res) => setSearchResults(res))
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [skillQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication token required.");

      const parsedDoc = await api.uploadDocument(token, file, "RESUME");
      setActiveParsedDoc(parsedDoc);
      setShowDocModal(true);
      // Refresh documents
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload and parse resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyDocument = async () => {
    if (!activeParsedDoc) return;
    setApplyingDoc(true);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      await api.applyDocument(token, activeParsedDoc.id, {
        apply_profile: true,
        apply_education: true,
        apply_experience: true,
        apply_skills: true,
      });

      setShowDocModal(false);
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Apply document error:", err);
      setError(err.message || "Failed to apply parsed resume information.");
    } finally {
      setApplyingDoc(false);
    }
  };

  const handleClaimSkill = async () => {
    if (!selectedSkillName.trim()) return;
    setClaiming(true);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      await api.claimSkill(token, {
        skill_name: selectedSkillName.trim(),
        proficiency: selectedProficiency,
      });

      setShowSkillModal(false);
      setSelectedSkillName("");
      setSkillQuery("");
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Claim skill error:", err);
      setError(err.message || "Failed to claim skill.");
    } finally {
      setClaiming(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading your Growth Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl max-w-md">
          <h1 className="text-2xl font-black text-unnati-indigo">Sign in to UNNATI</h1>
          <p className="mt-2 text-sm text-slate-600">Access your personalized growth roadmaps, skill assessments, and career companion.</p>
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

  const profile = userData?.profile;
  const completeness = profile?.profile_completeness_score || 0;
  const targetRole = profile?.target_role || "Full-Stack Software Engineer";

  return (
    <div className="min-h-screen bg-slate-50 text-unnati-midnight">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black tracking-tight text-unnati-indigo">
              UNNATI<span className="text-unnati-saffron">.</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
              <Link href="/dashboard" className="text-unnati-indigo font-bold">
                Dashboard
              </Link>
              <Link href="/roadmap" className="hover:text-unnati-violet transition">
                Career Roadmap
              </Link>
              <a href="#skills" className="hover:text-unnati-violet transition">
                Skills & Inventory
              </a>
              <a href="#documents" className="hover:text-unnati-violet transition">
                Resume & Documents
              </a>
              <a href="#actions" className="hover:text-unnati-violet transition">
                Next Actions
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
              afterSelectOrganizationUrl="/dashboard"
            />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs font-bold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Welcome Banner & Profile Completeness */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-unnati-indigo to-unnati-violet p-8 text-white shadow-xl shadow-violet-100">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {userData?.role?.toUpperCase() || "CANDIDATE"}
              </span>
              <span className="text-xs text-violet-200">Growth Companion Active</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
              Welcome back, {clerkUser?.firstName || userData?.full_name || "Learner"}!
            </h1>
            <p className="mt-2 text-violet-100 max-w-xl text-sm leading-relaxed">
              Target Direction: <strong className="text-white">{targetRole}</strong>. UNNATI is tracking your skill readiness, prerequisite gap, and evidence-backed capability.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-unnati-indigo shadow-md hover:bg-violet-50 transition"
              >
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Analyzing Resume..." : "Upload / Refresh Resume"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => setShowSkillModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Plus className="h-4 w-4" />
                Claim New Skill
              </button>
            </div>
          </div>

          {/* Completeness Card */}
          <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Completeness
                </span>
                <span className="text-xl font-black text-unnati-indigo">{completeness}%</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-unnati-indigo via-unnati-violet to-unnati-saffron transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${profile?.target_role ? "text-emerald-500" : "text-slate-300"}`} />
                  <span>Target Career Role Specified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${userData?.education_records?.length ? "text-emerald-500" : "text-slate-300"}`} />
                  <span>Academic Education Added</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${documents.length > 0 ? "text-emerald-500" : "text-slate-300"}`} />
                  <span>Resume Ingested for AI Parsing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${skills.length >= 5 ? "text-emerald-500" : "text-slate-300"}`} />
                  <span>5+ Core Skills Mapped ({skills.length}/5)</span>
                </div>
              </div>
            </div>

            {completeness < 100 && (
              <Link
                href="/onboarding"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Complete Remaining Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>

        {/* Stats Row */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Skills</span>
              <Layers className="h-4 w-4 text-unnati-violet" />
            </div>
            <p className="mt-2 text-2xl font-black text-unnati-midnight">{skills.length}</p>
            <p className="mt-1 text-xs text-slate-500">Across {new Set(skills.map(s => s.category)).size} categories</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Evidence Backed</span>
              <FileCheck2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-blue-600">
              {skills.filter(s => s.state !== "CLAIMED").length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Inferred or Assessed skills</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Estimated Readiness</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-600">
              {skills.length > 0 ? Math.min(95, Math.round((skills.length / 10) * 80)) : 20}%
            </p>
            <p className="mt-1 text-xs text-slate-500">Against {targetRole}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Documents Ingested</span>
              <FileText className="h-4 w-4 text-unnati-saffron" />
            </div>
            <p className="mt-2 text-2xl font-black text-unnati-midnight">{documents.length}</p>
            <p className="mt-1 text-xs text-slate-500">Verified by parsing engine</p>
          </div>
        </section>

        {/* Skills Inventory Section */}
        <section id="skills" className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-unnati-violet">Evidence-Weighted Capability</p>
              <h2 className="text-2xl font-black text-unnati-midnight">Your Skills Inventory</h2>
            </div>
            <button
              onClick={() => setShowSkillModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-unnati-indigo px-4 py-2 text-xs font-bold text-white hover:bg-unnati-violet transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Skill
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Zap className="mx-auto h-8 w-8 text-unnati-violet" />
              <h3 className="mt-3 text-lg font-bold text-slate-800">No skills mapped yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                Upload your resume or claim your baseline skills to unlock gap analysis and tailored learning roadmaps.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-unnati-indigo px-5 py-2.5 text-xs font-bold text-white hover:bg-unnati-violet"
                >
                  Upload Resume (Fastest)
                </button>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-400"
                >
                  Claim Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => {
                const tier = SKILL_STATE_CONFIG[s.state] || SKILL_STATE_CONFIG.CLAIMED;
                const profPercent = Math.round(s.proficiency * 100);
                return (
                  <div
                    key={s.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-base">{s.skill_name}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tier.badgeClass}`}>
                          {tier.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 capitalize">{s.category}</p>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Proficiency</span>
                        <span className="font-bold text-unnati-indigo">{profPercent}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-unnati-violet"
                          style={{ width: `${profPercent}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Confidence: {Math.round(s.confidence * 100)}%</span>
                        <span>Evidence: {s.evidence_count} source{s.evidence_count > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Resume & Documents Hub */}
        <section id="documents" className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-unnati-violet">Evidence Verification</p>
              <h2 className="text-2xl font-black text-unnati-midnight">Ingested Documents & Resumes</h2>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-unnati-violet transition"
            >
              <UploadCloud className="h-3.5 w-3.5 text-unnati-violet" />
              Upload PDF
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            {documents.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-500">
                No documents uploaded yet. Upload a resume to automatically extract verified skills, education, and experience.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-unnati-violet font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{doc.filename}</p>
                        <p className="text-xs text-slate-400">
                          {Math.round(doc.file_size_bytes / 1024)} KB • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        doc.status === "PARSED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        onClick={async () => {
                          const token = await getClerkApiToken(getToken);
                          if (token) {
                            const details = await api.getDocumentDetails(token, doc.id);
                            setActiveParsedDoc(details);
                            setShowDocModal(true);
                          }
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                      >
                        Inspect AI Extraction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Actionable Next Steps (Agentic Guidance) */}
        <section id="actions" className="mt-12 pb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">Personalized Recommendation</p>
          <h2 className="text-2xl font-black text-unnati-midnight">Recommended Next Actions</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-unnati-saffron">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Run Prerequisite Gap Analysis</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Compare your {skills.length} claimed/inferred capabilities against market requirements for {targetRole}.
              </p>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-unnati-violet hover:underline">
                Analyze Skill Gaps <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-unnati-violet">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Generate Milestone Roadmap</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Synthesize a topological roadmap with curated learning modules, milestones, and project sprints.
              </p>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-unnati-violet hover:underline">
                View Milestone Roadmap <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Diagnostic Assessment</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Upgrade your skills from CLAIMED to ASSESSED through formative non-evaluative skill challenges.
              </p>
              <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-unnati-violet hover:underline">
                Start Quick Assessment <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL 1: Claim Skill */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black text-unnati-indigo">Claim a Capability</h3>
            <p className="mt-1 text-xs text-slate-500">
              Add a skill to your baseline inventory with your self-rated proficiency.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Search or Enter Skill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Docker, Next.js"
                  value={skillQuery}
                  onChange={(e) => {
                    setSkillQuery(e.target.value);
                    setSelectedSkillName(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                />

                {searchResults.length > 0 && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-md">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkillName(item.name);
                          setSkillQuery(item.name);
                          setSearchResults([]);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs hover:bg-violet-50"
                      >
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Proficiency Level ({Math.round(selectedProficiency * 100)}%)
                </label>
                <div className="flex gap-2">
                  {[
                    { label: "Beginner", val: 0.3 },
                    { label: "Intermediate", val: 0.6 },
                    { label: "Advanced", val: 0.9 },
                  ].map((tier) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setSelectedProficiency(tier.val)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                        Math.abs(selectedProficiency - tier.val) < 0.1
                          ? "bg-unnati-violet text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSkillModal(false)}
                className="rounded-full px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedSkillName.trim() || claiming}
                onClick={handleClaimSkill}
                className="rounded-full bg-unnati-indigo px-6 py-2 text-xs font-bold text-white hover:bg-unnati-violet disabled:opacity-50"
              >
                {claiming ? "Saving..." : "Add to Inventory"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Parsed Resume Inspection & Ingestion */}
      {showDocModal && activeParsedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  AI Extraction Verified
                </span>
                <h3 className="mt-1 text-xl font-black text-unnati-indigo">{activeParsedDoc.filename}</h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {activeParsedDoc.parsed_payload?.headline && (
                <div>
                  <strong className="block text-slate-700 uppercase font-bold">Detected Headline</strong>
                  <p className="text-slate-600">{activeParsedDoc.parsed_payload.headline}</p>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.education && activeParsedDoc.parsed_payload.education.length > 0 && (
                <div>
                  <strong className="block text-slate-700 uppercase font-bold mb-1">Education Detected</strong>
                  <div className="space-y-1">
                    {activeParsedDoc.parsed_payload.education.map((edu, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-2 text-slate-800">
                        <strong>{edu.institution_name}</strong> — {edu.degree} ({edu.field_of_study || "General"})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.skills && activeParsedDoc.parsed_payload.skills.length > 0 && (
                <div>
                  <strong className="block text-slate-700 uppercase font-bold mb-1">
                    Inferred Skills ({activeParsedDoc.parsed_payload.skills.length})
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {activeParsedDoc.parsed_payload.skills.map((sk, idx) => (
                      <span key={idx} className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-700 font-semibold">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Applying updates will upgrade skills to <strong>INFERRED</strong> tier.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={applyingDoc}
                  onClick={handleApplyDocument}
                  className="rounded-full bg-unnati-indigo px-5 py-2 text-xs font-bold text-white hover:bg-unnati-violet disabled:opacity-50"
                >
                  {applyingDoc ? "Applying..." : "Apply to Profile & Inventory"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
