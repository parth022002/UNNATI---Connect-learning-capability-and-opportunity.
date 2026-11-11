"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  FileText,
  Upload,
  Plus,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Copy,
  Trash2,
  Edit3,
  Target,
  BarChart2,
  Layers,
  Briefcase,
  Search,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { api, getClerkApiToken, ResumeListItem } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

export default function ResumesDashboardPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("My Software Engineer Resume");
  const [newTargetRole, setNewTargetRole] = useState("Software Engineer");
  const [importProfile, setImportProfile] = useState(true);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      const data = await api.getResumes(token);
      setResumes(data);
    } catch (err: any) {
      console.error("Failed to load resumes:", err);
      setError(err.message || "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchResumes();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 10MB.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication required.");

      const title = file.name.replace(/\.[^/.]+$/, "") + " Resume";
      await api.uploadAndParseResume(token, file, title, "Software Engineer");
      await fetchResumes();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload and parse resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateResume = async () => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      await api.createResume(token, {
        title: newTitle.trim(),
        target_role: newTargetRole.trim(),
        template_id: "classic_professional",
        import_from_profile: importProfile,
      });

      setShowCreateModal(false);
      await fetchResumes();
    } catch (err: any) {
      console.error("Create error:", err);
      setError(err.message || "Failed to create resume.");
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (resumeId: string) => {
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      await api.duplicateResume(token, resumeId);
      await fetchResumes();
    } catch (err: any) {
      setError(err.message || "Failed to duplicate resume.");
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      await api.deleteResume(token, resumeId);
      await fetchResumes();
    } catch (err: any) {
      setError(err.message || "Failed to delete resume.");
    }
  };

  const avgAtsScore = resumes.length
    ? Math.round(
        resumes.reduce((acc, r) => acc + (r.latest_ats_score || 75), 0) / resumes.length
      )
    : 78;

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 pb-20">
      <BackgroundAtmosphere variant="dashboard" />

      {/* Header Banner */}
      <section className="relative z-10 pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-purple-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>AI Resume Intelligence & ATS Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Resume Studio & ATS Optimizer
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Build machine-readable, ATS-friendly resumes tailored to target job descriptions. Eliminate formatting traps, optimize keywords, and verify skill alignment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              size="md"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-purple-300 hover:bg-purple-50 text-purple-950 font-bold"
            >
              <Upload className="w-4 h-4 mr-2 text-purple-700" />
              {uploading ? "Extracting..." : "Upload Resume (PDF/DOCX)"}
            </Button>

            <Button
              variant="saffron"
              size="md"
              onClick={() => setShowCreateModal(true)}
              className="font-bold shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Resume
            </Button>
          </div>
        </div>

        {/* KPI Scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Resumes</span>
              <div className="p-2 bg-purple-50 rounded-xl text-purple-800">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{resumes.length}</span>
              <span className="text-xs text-slate-500">Managed versions</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Average ATS Score</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800">{avgAtsScore}%</span>
              <span className="text-xs font-medium text-emerald-700">Competitive Tier</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Templates Ready</span>
              <div className="p-2 bg-orange-50 rounded-xl text-orange-800">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">5</span>
              <span className="text-xs text-slate-500">ATS machine-readable</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">AI Enhancer</span>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-800">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">STAR</span>
              <span className="text-xs text-slate-500">Metric-focused rewrites</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold underline text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Resumes List Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Your Managed Resumes</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-semibold">
                {resumes.length}
              </span>
            </h2>

            <button
              onClick={fetchResumes}
              className="text-xs font-semibold text-purple-900 hover:text-purple-950 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-purple-800 border-t-transparent" />
              <p className="text-xs font-semibold text-purple-900">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-purple-300 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No resumes created yet</h3>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Create a professional ATS-friendly resume from scratch or import your verified UNNATI profile and skills in seconds.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="saffron"
                  size="md"
                  onClick={() => setShowCreateModal(true)}
                  className="font-bold shadow-md"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create from Profile
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-purple-300 text-purple-900 font-bold"
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  Upload Existing Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => {
                const score = resume.latest_ats_score || 78;
                const scoreColor =
                  score >= 85
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : score >= 70
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : "text-amber-700 bg-amber-50 border-amber-200";

                return (
                  <div
                    key={resume.id}
                    className="bg-white/95 backdrop-blur-md rounded-3xl border border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-900 transition-colors line-clamp-1">
                              {resume.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              Target: {resume.target_role || "General"}
                            </p>
                          </div>
                        </div>

                        {resume.is_primary && (
                          <Badge variant="saffron">
                            Primary
                          </Badge>
                        )}
                      </div>

                      {/* ATS Score Indicator */}
                      <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">ATS Readiness:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${scoreColor}`}>
                            {score}%
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {resume.version_count} {resume.version_count === 1 ? "Version" : "Versions"}
                        </span>
                      </div>

                      <div className="mt-3 text-[11px] text-slate-500">
                        Updated {new Date(resume.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="px-6 py-4 bg-slate-50/80 border-t border-purple-50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/resumes/${resume.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-bold border-purple-200 hover:bg-purple-100 text-purple-950">
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </Link>

                        <Link href={`/resumes/${resume.id}/ats`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-bold border-emerald-200 hover:bg-emerald-50 text-emerald-800">
                            <BarChart2 className="w-3.5 h-3.5 mr-1" />
                            ATS Check
                          </Button>
                        </Link>

                        <Link href={`/resumes/${resume.id}/match`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-bold border-orange-200 hover:bg-orange-50 text-orange-900">
                            <Target className="w-3.5 h-3.5 mr-1" />
                            Match JD
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={api.getResumeExportUrl(resume.id, "pdf")}
                          download
                          title="Download ATS PDF"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-900 hover:bg-purple-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDuplicate(resume.id)}
                          title="Duplicate Resume"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-900 hover:bg-purple-100 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(resume.id)}
                          title="Delete Resume"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Create Resume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-800" />
                <span>Create New Resume</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resume Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Associate Product Manager Resume"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Role / Career Specialization
                </label>
                <input
                  type="text"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Business Analyst"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="importProfileCheck"
                  checked={importProfile}
                  onChange={(e) => setImportProfile(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-purple-800 focus:ring-purple-700"
                />
                <label htmlFor="importProfileCheck" className="text-xs text-purple-950 font-medium leading-relaxed">
                  <strong>Import from UNNATI profile:</strong> Pre-populate education records, internships, projects, and verified candidate skills automatically.
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="saffron"
                size="md"
                onClick={handleCreateResume}
                disabled={creating || !newTitle.trim()}
                className="font-bold"
              >
                {creating ? "Creating..." : "Create Resume"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
