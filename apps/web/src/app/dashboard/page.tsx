"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
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
  MapPin,
  X,
  Compass,
  PieChart
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
    label: "Self-Reported",
    variant: "default",
    desc: "Baseline added by you",
    weight: 0.45
  },
  INFERRED: {
    label: "Extracted from Resume",
    variant: "sky",
    desc: "Identified via AI resume extraction",
    weight: 0.65
  },
  ASSESSED: {
    label: "Diagnostic Verified",
    variant: "violet",
    desc: "Verified via practice challenge",
    weight: 0.85
  },
  VERIFIED: {
    label: "Certified / Production",
    variant: "success",
    desc: "Verified through real-world work / cert",
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
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Loading your Growth Companion dashboard...</p>
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
          <h1 className="font-heading text-2xl font-black text-slate-900">Sign in to UNNATI</h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Access your personalized learning roadmap, verified skills inventory, and AI Career Companion.
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
  const targetRole = profile?.target_role || "Associate Product Manager / Data Analyst";

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

        {/* Top Hero & Profile Completeness Grid */}
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr] mb-8">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-white/20 border border-white/25 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                {userData?.role?.toUpperCase() || "LEARNER"}
              </span>
              <span className="text-xs text-emerald-300 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Growth Companion Active
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {clerkUser?.firstName || userData?.full_name || "Learner"}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
              Target Direction: <strong className="text-orange-300">{targetRole}</strong>. UNNATI is tracking your verified skills, milestone roadmaps, and opportunity matches.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Extracting with AI..." : "Upload / Refresh Resume"}
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
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-orange-300" />
                Add Skill
              </button>
              <Link href="/roadmap">
                <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer">
                  <MapPin className="h-4 w-4 text-orange-300" />
                  View Roadmap
                </button>
              </Link>
            </div>
          </div>

          {/* Profile Completeness Ring Card */}
          <div className="clean-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Completeness
                </span>
                <span className="text-xl font-extrabold text-slate-900 font-mono">{completeness}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-800 to-orange-500 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>

              {/* Completeness Checklist */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${profile?.target_role ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Target Direction Chosen</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${userData?.education_records?.length ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Education &amp; Background Added</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${documents.length > 0 ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Resume Ingested for Skill Verification</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={`h-4 w-4 ${skills.length >= 5 ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>5+ Core Capabilities Mapped ({skills.length}/5)</span>
                </div>
              </div>
            </div>

            {completeness < 100 && (
              <Link
                href="/onboarding"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/70 py-2 text-xs font-semibold text-purple-900 hover:bg-purple-100 transition"
              >
                Complete Remaining Profile Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card hoverEffect className="p-5 clean-card">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Capabilities</span>
              <Layers className="h-4 w-4 text-purple-700" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{skills.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Across {new Set(skills.map(s => s.category)).size} domains</p>
          </Card>

          <Card hoverEffect className="p-5 clean-card">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Evidence Backed</span>
              <FileCheck2 className="h-4 w-4 text-sky-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-sky-700 font-mono">
              {skills.filter(s => s.state !== "CLAIMED").length}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Resume extracted or assessed</p>
          </Card>

          <Card hoverEffect className="p-5 clean-card">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Readiness</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-700 font-mono">
              {skills.length > 0 ? Math.min(95, Math.round((skills.length / 10) * 80)) : 25}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Benchmark against target career</p>
          </Card>

          <Card hoverEffect className="p-5 clean-card">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Documents Ingested</span>
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 font-mono">{documents.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Processed by AI parser</p>
          </Card>
        </section>

        {/* Skills Inventory Section */}
        <section id="skills" className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="violet" className="text-[10px] font-semibold">
                  Multi-Tier Evidence Ledger
                </Badge>
                <span className="text-xs text-slate-700 font-medium">
                  Self-Reported to Verified
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-slate-900">Your Skills Inventory</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSkillModal(true)}
              className="text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Capability
            </Button>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
              <Zap className="mx-auto h-8 w-8 text-orange-500 animate-bounce" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">No Capabilities Mapped Yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-600 leading-relaxed">
                Upload your resume or claim your baseline skills to activate your personalized learning roadmap and skill gap analysis.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="saffron"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold"
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload Resume (Fastest)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSkillModal(true)}
                  className="text-xs font-semibold"
                >
                  Add Manually
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
                    className="p-5 clean-card rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{s.skill_name}</span>
                        <Badge variant={tier.variant} className="text-[10px]">
                          {tier.label}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 capitalize">{s.category}</p>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">Proficiency</span>
                        <span className="font-bold text-purple-900 font-mono">{profPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-800 to-orange-500"
                          style={{ width: `${profPercent}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
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
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Evidence Verification Hub</p>
              <h2 className="font-heading text-xl font-bold text-slate-900">Ingested Documents &amp; Resumes</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1 text-purple-700" />
              Upload PDF
            </Button>
          </div>

          <div className="clean-card rounded-2xl p-5">
            {documents.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">
                No documents uploaded yet. Upload a resume to automatically extract verified skills, education, and experience.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold border border-purple-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{doc.filename}</p>
                        <p className="text-[11px] text-slate-500">
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
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
          <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Actionable Guidance</p>
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-6">Recommended Next Steps</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Card hoverEffect className="p-6 clean-card flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 border border-orange-200">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 text-sm">Skill Gap Analysis</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Compare your {skills.length} verified capabilities against real-world job requirements for {targetRole}.
                </p>
              </div>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700">
                Analyze Skill Gaps <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 clean-card flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 text-sm">Step-by-Step Learning Roadmap</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Follow a structured, progressive learning sequence with practical projects and curated resources.
                </p>
              </div>
              <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-950">
                View Roadmap <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 clean-card flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 text-sm">Practice Challenge</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Upgrade your skills to Diagnostic Verified through non-evaluative practice challenges and formative feedback.
                </p>
              </div>
              <Link href="/assessments" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                Start Practice Quiz <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </section>

      </main>

      {/* Claim Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">Add a Capability</h3>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Add a skill to your baseline inventory with your self-rated proficiency.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Strategy, SQL, Financial Modeling, Python..."
                  value={skillQuery}
                  onChange={(e) => {
                    setSkillQuery(e.target.value);
                    setSelectedSkillName(e.target.value);
                  }}
                  className="w-full rounded-xl clean-input px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                />

                {searchResults.length > 0 && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkillName(item.name);
                          setSkillQuery(item.name);
                          setSearchResults([]);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-800"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{item.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                          ? "bg-purple-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkillModal(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="saffron"
                size="sm"
                disabled={!selectedSkillName.trim() || claiming}
                onClick={handleClaimSkill}
                className="text-xs font-bold"
              >
                {claiming ? "Saving..." : "Add to Inventory"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Resume Modal */}
      {showDocModal && activeParsedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <Badge variant="success" className="text-[10px] mb-1">
                  AI Extraction Verified
                </Badge>
                <h3 className="font-heading text-lg font-bold text-slate-900">{activeParsedDoc.filename}</h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {activeParsedDoc.parsed_payload?.headline && (
                <div>
                  <strong className="block text-slate-500 uppercase font-bold text-[10px]">Detected Headline</strong>
                  <p className="text-slate-900 mt-0.5 font-medium">{activeParsedDoc.parsed_payload.headline}</p>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.education && activeParsedDoc.parsed_payload.education.length > 0 && (
                <div>
                  <strong className="block text-slate-500 uppercase font-bold text-[10px] mb-1">Education Detected</strong>
                  <div className="space-y-1.5">
                    {activeParsedDoc.parsed_payload.education.map((edu, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800">
                        <strong>{edu.institution_name}</strong> — {edu.degree} ({edu.field_of_study || "General"})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeParsedDoc.parsed_payload?.skills && activeParsedDoc.parsed_payload.skills.length > 0 && (
                <div>
                  <strong className="block text-slate-500 uppercase font-bold text-[10px] mb-1.5">
                    Inferred Skills ({activeParsedDoc.parsed_payload.skills.length})
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {activeParsedDoc.parsed_payload.skills.map((sk, idx) => (
                      <span key={idx} className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-purple-900 font-semibold text-[11px]">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-500">
                Applying updates will promote skills to <strong>Extracted from Resume</strong> tier.
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
                  className="text-xs font-bold"
                >
                  {applyingDoc ? "Applying..." : "Apply to Profile & Inventory"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Global AI Companion Drawer */}
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
