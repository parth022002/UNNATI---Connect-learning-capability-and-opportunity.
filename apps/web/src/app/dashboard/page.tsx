"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  ExternalLink,
  Target,
  ArrowRight,
  ShieldCheck,
  Cpu,
  MapPin,
  X
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

const SKILL_STATE_CONFIG: Record<string, { label: string; variant: "default" | "sky" | "violet" | "success"; desc: string; weight: number }> = {
  CLAIMED: {
    label: "Claimed",
    variant: "default",
    desc: "Self-reported baseline",
    weight: 0.45
  },
  INFERRED: {
    label: "Inferred",
    variant: "sky",
    desc: "Extracted via Gemini 2.5 from Resume",
    weight: 0.65
  },
  ASSESSED: {
    label: "Assessed",
    variant: "violet",
    desc: "Evaluated via IRT Diagnostic",
    weight: 0.85
  },
  VERIFIED: {
    label: "Verified",
    variant: "success",
    desc: "Production / Credential Validated",
    weight: 1.00
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
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

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

      const user = await api.getCurrentUser(token).catch(async () => {
        return await api.syncUser(token, "student");
      });
      setUserData(user);

      const mySkills = await api.getMySkills(token).catch(() => []);
      setSkills(mySkills);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent shadow-glow-violet" />
          <p className="text-sm font-semibold text-purple-200">Synchronizing Growth Companion...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100 selection:bg-purple-500 selection:text-white">
        <BackgroundAtmosphere />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-unnati-saffron p-2.5 shadow-lg shadow-purple-950/50">
            <Image src="/logo.png" alt="UNNATI" width={40} height={40} className="object-contain" priority />
          </div>
          <h1 className="font-heading text-2xl font-black text-white">Sign in to UNNATI</h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Access your personalized learning roadmap, Bayesian skill inventory, and AI Career Companion.
          </p>
          <Link href="/sign-in" className="mt-6 block">
            <Button variant="saffron" size="lg" className="btn-shimmer w-full text-xs font-bold">
              Sign In Now <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const profile = userData?.profile;
  const completeness = profile?.profile_completeness_score || 0;
  const targetRole = profile?.target_role || "Senior Full-Stack & AI Systems";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs font-medium text-rose-200 backdrop-blur-md animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs font-bold underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Hero & Profile Completeness Grid */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr] mb-8">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-purple-950/50 to-slate-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-purple-950/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                {userData?.role?.toUpperCase() || "CANDIDATE"}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Growth Companion Active
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {clerkUser?.firstName || userData?.full_name || "Learner"}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Target Direction: <strong className="text-purple-200">{targetRole}</strong>. UNNATI is tracking your skill state transitions, prerequisite gaps, and evidence-weighted readiness.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-unnati-saffron px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-950/40 hover:brightness-110 transition cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Extracting with Gemini..." : "Upload / Refresh Resume"}
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-purple-400" />
                Claim Skill Manually
              </button>
              <Link href="/roadmap">
                <button className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 px-4 py-2.5 text-xs font-semibold text-purple-200 transition cursor-pointer">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  View Roadmap
                </button>
              </Link>
            </div>
          </div>

          {/* Profile Completeness Ring Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Profile Completeness
                </span>
                <span className="text-xl font-extrabold text-white font-mono">{completeness}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-unnati-violet to-unnati-saffron transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>

              {/* Completeness Checklist */}
              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className={`h-4 w-4 ${profile?.target_role ? "text-emerald-400" : "text-slate-600"}`} />
                  <span>Target Role Configured</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className={`h-4 w-4 ${userData?.education_records?.length ? "text-emerald-400" : "text-slate-600"}`} />
                  <span>Education &amp; Credentials Added</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className={`h-4 w-4 ${documents.length > 0 ? "text-emerald-400" : "text-slate-600"}`} />
                  <span>Resume Ingested for AI Extraction</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className={`h-4 w-4 ${skills.length >= 5 ? "text-emerald-400" : "text-slate-600"}`} />
                  <span>5+ Core Capabilities Mapped ({skills.length}/5)</span>
                </div>
              </div>
            </div>

            {completeness < 100 && (
              <Link
                href="/onboarding"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-purple-200 hover:bg-white/10 transition"
              >
                Complete Remaining Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card hoverEffect className="p-5 glass-panel border-white/10">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Capabilities</span>
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-white font-mono">{skills.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">Across {new Set(skills.map(s => s.category)).size} domains</p>
          </Card>

          <Card hoverEffect className="p-5 glass-panel border-white/10">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Evidence Backed</span>
              <FileCheck2 className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-sky-400 font-mono">
              {skills.filter(s => s.state !== "CLAIMED").length}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Inferred or Assessed skills</p>
          </Card>

          <Card hoverEffect className="p-5 glass-panel border-white/10">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Readiness</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-400 font-mono">
              {skills.length > 0 ? Math.min(95, Math.round((skills.length / 10) * 80)) : 20}%
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Benchmark against target role</p>
          </Card>

          <Card hoverEffect className="p-5 glass-panel border-white/10">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Documents Ingested</span>
              <FileText className="h-4 w-4 text-unnati-saffron" />
            </div>
            <p className="mt-2 text-2xl font-black text-white font-mono">{documents.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">Verified by parsing engine</p>
          </Card>
        </section>

        {/* Bayesian Skills Inventory Section */}
        <section id="skills" className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="violet" className="text-[10px]">
                  Algorithm A Belief State Machine
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Bayesian 4-Tier Progression
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">Your Skills Inventory</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSkillModal(true)}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Capability
            </Button>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center backdrop-blur-md">
              <Zap className="mx-auto h-8 w-8 text-unnati-saffron animate-bounce" />
              <h3 className="mt-3 text-lg font-bold text-white">No Capabilities Mapped Yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">
                Upload your resume or claim your baseline competencies to activate Algorithm B gap analysis and custom learning roadmaps.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="saffron"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload Resume (Fastest)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSkillModal(true)}
                  className="text-xs"
                >
                  Claim Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => {
                const tier = SKILL_STATE_CONFIG[s.state] || SKILL_STATE_CONFIG.CLAIMED;
                const profPercent = Math.round(s.proficiency * 100);
                return (
                  <Card
                    key={s.id}
                    hoverEffect
                    className="p-5 glass-panel border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{s.skill_name}</span>
                        <Badge variant={tier.variant} className="text-[10px]">
                          {tier.label}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 capitalize">{s.category}</p>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Proficiency</span>
                        <span className="font-bold text-purple-300 font-mono">{profPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-unnati-violet"
                          style={{ width: `${profPercent}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Confidence: {Math.round(s.confidence * 100)}%</span>
                        <span>{s.evidence_count} source{s.evidence_count !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Documents Ingestion Hub */}
        <section id="documents" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Evidence Verification Hub</p>
              <h2 className="font-heading text-xl font-bold text-white">Ingested Documents &amp; Resumes</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1 text-purple-400" />
              Upload PDF
            </Button>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5">
            {documents.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">
                No documents uploaded yet. Upload a resume to automatically extract verified skills, education, and experience.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">{doc.filename}</p>
                        <p className="text-[11px] text-slate-400">
                          {Math.round(doc.file_size_bytes / 1024)} KB • Ingested {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={doc.status === "PARSED" ? "success" : "warning"} className="text-[10px]">
                        {doc.status}
                      </Badge>
                      <button
                        onClick={async () => {
                          const token = await getClerkApiToken(getToken);
                          if (token) {
                            const details = await api.getDocumentDetails(token, doc.id);
                            setActiveParsedDoc(details);
                            setShowDocModal(true);
                          }
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
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

        {/* Recommended Actions Row */}
        <section className="mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-unnati-saffron">Actionable Guidance</p>
          <h2 className="font-heading text-xl font-bold text-white mb-6">Recommended Next Steps</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Card hoverEffect className="p-6 glass-panel border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-unnati-saffron border border-orange-500/20">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-white text-sm">Prerequisite Gap Analysis</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Compare your {skills.length} claimed/inferred capabilities against market requirements for {targetRole}.
                </p>
              </div>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300">
                Analyze Skill Gaps <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 glass-panel border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-white text-sm">Topological Roadmap</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Synthesize an optimized milestone DAG with curated learning modules, milestones, and project sprints.
                </p>
              </div>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-purple-200">
                View Roadmap <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 glass-panel border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-white text-sm">Diagnostic Assessment</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Upgrade your skills from CLAIMED to ASSESSED through formative non-evaluative skill challenges.
                </p>
              </div>
              <Link href="/assessments" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                Start Practice Quiz <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </section>

      </main>

      {/* Claim Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-lg font-bold text-white">Claim a Capability</h3>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Add a skill to your baseline inventory with your self-rated proficiency.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Python, PostgreSQL, Docker..."
                  value={skillQuery}
                  onChange={(e) => {
                    setSkillQuery(e.target.value);
                    setSelectedSkillName(e.target.value);
                  }}
                  className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                />

                {searchResults.length > 0 && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-1 shadow-lg">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkillName(item.name);
                          setSkillQuery(item.name);
                          setSearchResults([]);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs hover:bg-white/10 text-slate-200"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                        Math.abs(selectedProficiency - tier.val) < 0.1
                          ? "bg-purple-600 text-white shadow-glow-violet"
                          : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkillModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="saffron"
                size="sm"
                disabled={!selectedSkillName.trim() || claiming}
                onClick={handleClaimSkill}
                className="text-xs"
              >
                {claiming ? "Saving..." : "Add to Inventory"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Resume Modal */}
      {showDocModal && activeParsedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-950 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="success" className="text-[10px] mb-1">
                  Gemini 2.5 Flash Extraction Verified
                </Badge>
                <h3 className="font-heading text-lg font-bold text-white">{activeParsedDoc.filename}</h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {activeParsedDoc.parsed_payload?.headline && (
                <div>
                  <strong className="block text-slate-400 uppercase font-bold text-[10px]">Detected Headline</strong>
                  <p className="text-white mt-0.5">{activeParsedDoc.parsed_payload.headline}</p>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.education && activeParsedDoc.parsed_payload.education.length > 0 && (
                <div>
                  <strong className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Education Detected</strong>
                  <div className="space-y-1.5">
                    {activeParsedDoc.parsed_payload.education.map((edu, idx) => (
                      <div key={idx} className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-slate-200">
                        <strong>{edu.institution_name}</strong> — {edu.degree} ({edu.field_of_study || "General"})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.skills && activeParsedDoc.parsed_payload.skills.length > 0 && (
                <div>
                  <strong className="block text-slate-400 uppercase font-bold text-[10px] mb-1.5">
                    Inferred Skills ({activeParsedDoc.parsed_payload.skills.length})
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {activeParsedDoc.parsed_payload.skills.map((sk, idx) => (
                      <span key={idx} className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-purple-300 font-semibold text-[11px]">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-[11px] text-slate-400">
                Applying updates will promote skills to <strong>INFERRED (0.65)</strong> tier.
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocModal(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="saffron"
                  size="sm"
                  disabled={applyingDoc}
                  onClick={handleApplyDocument}
                  className="text-xs"
                >
                  {applyingDoc ? "Applying..." : "Apply to Profile & Inventory"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global AI Companion Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
