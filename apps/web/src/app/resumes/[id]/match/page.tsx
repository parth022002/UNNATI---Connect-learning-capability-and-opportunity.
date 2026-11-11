"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Target,
  ArrowLeft,
  Upload,
  Plus,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Code,
  BookOpen,
  ArrowRight,
  BarChart2,
  Table,
  Briefcase
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  ResumeDetail,
  JobDescriptionItem,
  ResumeJDMatchData,
  ResumeCompareMatrixData
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeJDMatchPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.id;
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [jds, setJds] = useState<JobDescriptionItem[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<ResumeJDMatchData | null>(null);
  const [compareMatrix, setCompareMatrix] = useState<ResumeCompareMatrixData | null>(null);

  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "saved" | "matrix">("paste");
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual JD inputs
  const [jdTitle, setJdTitle] = useState("Full Stack Software Engineer");
  const [jdCompany, setJdCompany] = useState("Razorpay");
  const [jdText, setJdText] = useState(
    `Looking for a Software Engineer with strong background in Python, React, PostgreSQL, REST APIs, and Docker. Experience with distributed systems and CI/CD pipelines preferred. 2+ years experience.`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const resumeData = await api.getResumeDetail(token, resumeId);
      setResume(resumeData);

      const savedJds = await api.getJobDescriptions(token);
      setJds(savedJds);

      if (savedJds.length > 0) {
        setSelectedJdId(savedJds[0].id);
        // Pre-run or fetch match for first JD
        const initialMatch = await api.matchResumeWithJD(token, resumeId, savedJds[0].id);
        setMatchData(initialMatch);
      }
    } catch (err: any) {
      console.error("Failed to load matching data:", err);
      setError(err.message || "Failed to load matching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadData();
    }
  }, [isLoaded, isSignedIn, resumeId]);

  const handleCreateAndMatch = async () => {
    if (!jdText.trim() || !jdTitle.trim()) return;
    try {
      setMatching(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const newJd = await api.createJobDescription(token, {
        title: jdTitle.trim(),
        company: jdCompany.trim(),
        raw_text: jdText.trim(),
      });

      setJds([newJd, ...jds]);
      setSelectedJdId(newJd.id);

      const result = await api.matchResumeWithJD(token, resumeId, newJd.id);
      setMatchData(result);
      setActiveTab("saved");
    } catch (err: any) {
      setError(err.message || "Failed to analyze and match Job Description.");
    } finally {
      setMatching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMatching(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const title = file.name.replace(/\.[^/.]+$/, "") + " Target Role";
      const uploadedJd = await api.uploadJobDescription(token, file, title);

      setJds([uploadedJd, ...jds]);
      setSelectedJdId(uploadedJd.id);

      const result = await api.matchResumeWithJD(token, resumeId, uploadedJd.id);
      setMatchData(result);
      setActiveTab("saved");
    } catch (err: any) {
      setError(err.message || "Failed to upload and match JD.");
    } finally {
      setMatching(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectSavedJd = async (jdId: string) => {
    try {
      setMatching(true);
      setSelectedJdId(jdId);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const result = await api.matchResumeWithJD(token, resumeId, jdId);
      setMatchData(result);
    } catch (err: any) {
      setError(err.message || "Failed to match with selected JD.");
    } finally {
      setMatching(false);
    }
  };

  const handleLoadCompareMatrix = async () => {
    try {
      setActiveTab("matrix");
      setMatching(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const matrix = await api.compareResumeMultipleJDs(token, resumeId);
      setCompareMatrix(matrix);
    } catch (err: any) {
      setError(err.message || "Failed to generate comparison matrix.");
    } finally {
      setMatching(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere variant="dashboard" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Initializing Semantic Match Engine...</p>
        </div>
      </div>
    );
  }

  const overallScore = matchData?.overall_match_score || 78;

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 pb-20">
      <BackgroundAtmosphere variant="dashboard" />

      {/* Header */}
      <section className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                  AI Job Description Matcher
                </h1>
                <Badge variant="saffron">
                  {resume?.title || "My Resume"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Evidence-backed alignment scoring, gap identification, and learning roadmap integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/resumes/${resumeId}/edit`}>
              <Button variant="outline" size="sm" className="font-bold border-purple-300 text-purple-950">
                Edit in Builder
              </Button>
            </Link>

            <Button
              variant={activeTab === "matrix" ? "saffron" : "outline"}
              size="sm"
              onClick={handleLoadCompareMatrix}
              className="font-bold border-purple-300"
            >
              <Table className="w-3.5 h-3.5 mr-1.5" />
              Compare Multiple JDs
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold underline text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Input Methods Tabs */}
        {activeTab !== "matrix" && (
          <div className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <button
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "paste"
                    ? "bg-purple-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Paste / Write JD
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "upload"
                    ? "bg-purple-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Upload JD (PDF/DOCX)
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === "saved"
                    ? "bg-purple-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Saved JDs ({jds.length})
              </button>
            </div>

            {/* Option A: Paste or Manual Editor */}
            {activeTab === "paste" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={jdTitle}
                      onChange={(e) => setJdTitle(e.target.value)}
                      placeholder="e.g. Associate Product Manager, Backend Engineer"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company (Optional)</label>
                    <input
                      type="text"
                      value={jdCompany}
                      onChange={(e) => setJdCompany(e.target.value)}
                      placeholder="e.g. Razorpay, Swiggy, Google"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complete Job Description Text</label>
                  <textarea
                    rows={4}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description including responsibilities and requirements..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="saffron"
                    size="sm"
                    disabled={matching || !jdText.trim()}
                    onClick={handleCreateAndMatch}
                    className="font-bold shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {matching ? "Analyzing & Matching..." : "Run Match Analysis"}
                  </Button>
                </div>
              </div>
            )}

            {/* Option B: Upload JD */}
            {activeTab === "upload" && (
              <div className="p-8 text-center border-2 border-dashed border-purple-200 rounded-2xl">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-purple-700 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-900">Upload Job Description Document</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Upload a PDF, DOCX, or TXT file of the job posting to extract requirements automatically.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={matching}
                  className="mt-4 font-bold border-purple-300 text-purple-950"
                >
                  {matching ? "Extracting..." : "Choose File"}
                </Button>
              </div>
            )}

            {/* Option C: Saved JDs Dropdown/Picker */}
            {activeTab === "saved" && (
              <div className="flex flex-wrap items-center gap-2">
                {jds.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => handleSelectSavedJd(j.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      selectedJdId === j.id
                        ? "bg-purple-900 text-white border-purple-950 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{j.title} {j.company ? `(${j.company})` : ""}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-JD Comparison Matrix Tab */}
        {activeTab === "matrix" && (
          <div className="mt-6 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Multi-Job Description Comparison Matrix</h3>
                <p className="text-xs text-slate-500">Compare this resume against all your target career roles</p>
              </div>
              <button
                onClick={() => setActiveTab("saved")}
                className="text-xs font-bold text-purple-900 hover:underline"
              >
                ← Back to Single Match
              </button>
            </div>

            {compareMatrix?.comparisons && compareMatrix.comparisons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3">Target Role</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Match Score</th>
                      <th className="p-3">Strongest Dimension</th>
                      <th className="p-3">Primary Requirement Gap</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareMatrix.comparisons.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-purple-50/50">
                        <td className="p-3 font-bold text-slate-900">{c.job_title}</td>
                        <td className="p-3 text-slate-600">{c.company || "General"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                            c.overall_match_score >= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {c.overall_match_score}%
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{c.strongest_area}</td>
                        <td className="p-3 text-rose-700">{c.main_gap}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedJdId(c.job_id);
                              setActiveTab("saved");
                              handleSelectSavedJd(c.job_id);
                            }}
                            className="text-purple-900 font-bold hover:underline"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                No saved job descriptions found. Create or upload multiple JDs to compare them.
              </div>
            )}
          </div>
        )}

        {/* Detailed Match Report (Single JD) */}
        {activeTab !== "matrix" && matchData && (
          <div className="mt-8 space-y-8">
            {/* Top Match Gauge Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-white/10 border-4 border-amber-400/40">
                  <span className="text-3xl sm:text-4xl font-black text-amber-300">
                    {overallScore}%
                  </span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-2">
                    <Target className="w-3.5 h-3.5 text-amber-300" />
                    <span>Target: {matchData.job_title}</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {overallScore >= 80 ? "High Role Alignment" : "Competitive Match with Learnable Gaps"}
                  </h2>
                  <p className="mt-1 text-xs text-purple-100 max-w-xl leading-relaxed">
                    Transparent weighted scoring: Skills (35%), Experience (25%), Projects (15%), Education (15%), Keyword Coverage (10%).
                  </p>
                </div>
              </div>

              {/* Dimension Mini Bars */}
              <div className="w-full md:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-purple-200 text-[11px]">
                  <span>Skill Alignment</span>
                  <span>{matchData.skill_alignment_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${matchData.skill_alignment_score}%` }} />
                </div>

                <div className="flex justify-between text-purple-200 text-[11px]">
                  <span>Experience Alignment</span>
                  <span>{matchData.experience_alignment_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${matchData.experience_alignment_score}%` }} />
                </div>

                <div className="flex justify-between text-purple-200 text-[11px]">
                  <span>Project Relevance</span>
                  <span>{matchData.project_relevance_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${matchData.project_relevance_score}%` }} />
                </div>
              </div>
            </div>

            {/* Matched vs Missing Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matched Skills with Evidence Traceability */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Verified & Matched Skills ({matchData.matched_skills.length})</span>
                </h3>

                <div className="space-y-2.5">
                  {matchData.matched_skills.map((s, i) => {
                    const badgeBg =
                      s.evidence_type === "DIRECT_EXPERIENCE"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : s.evidence_type === "PROJECT"
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-amber-50 text-amber-900 border-amber-200";

                    return (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{s.name}</span>
                          {s.is_mandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${badgeBg}`}>
                          {s.evidence_label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Requirements & Learning Roadmap Integration */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-800" />
                  <span>Missing Gaps & Learning Pathways</span>
                </h3>

                {matchData.learning_recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {matchData.learning_recommendations.map((rec, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-purple-950 font-extrabold text-sm">{rec.skill}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                            {rec.urgency}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800">
                          Recommended Module: {rec.module_name} ({rec.estimated_hours} hrs)
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{rec.roadmap_action}</p>
                        <div className="mt-2 flex justify-end">
                          <Link href="/roadmap" className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-900 hover:underline">
                            Open Career Roadmap <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-500">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    No major skill gaps identified for this role!
                  </div>
                )}
              </div>
            </div>

            {/* Side-by-Side Tailoring Suggestions */}
            {matchData.improvement_suggestions.length > 0 && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Targeted Side-by-Side Resume Improvements</span>
                </h3>

                <div className="space-y-4">
                  {matchData.improvement_suggestions.map((sug, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-900 uppercase tracking-wide">
                          Section: {sug.section} {sug.context ? `(${sug.context})` : ""}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {sug.expected_impact}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">ORIGINAL CONTENT</span>
                          {sug.original}
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-medium">
                          <span className="text-[10px] font-bold text-emerald-700 block mb-1">TAILORED SUGGESTION</span>
                          {sug.suggested}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        <strong>Reason:</strong> {sug.reason}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Link href={`/resumes/${resumeId}/edit`}>
                    <Button variant="saffron" size="sm" className="font-bold">
                      Open Resume Builder to Apply <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
