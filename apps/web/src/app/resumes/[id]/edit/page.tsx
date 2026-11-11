"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  FileText,
  Save,
  ArrowLeft,
  Sparkles,
  Download,
  BarChart2,
  Target,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Award,
  Users,
  Globe
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  ResumeDetail,
  ResumeVersionData,
  PersonalInfoData,
  WorkExperienceData,
  EducationData,
  ProjectData,
  CertificationData,
  InternshipData
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeBuilderPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.id;
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "personal" | "summary" | "skills" | "experience" | "projects" | "education" | "certifications" | "achievements"
  >("personal");

  // Form states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });
  const [summary, setSummary] = useState("");
  const [headline, setHeadline] = useState("");
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [bizSkills, setBizSkills] = useState<string[]>([]);
  const [workExp, setWorkExp] = useState<WorkExperienceData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [education, setEducation] = useState<EducationData[]>([]);
  const [certifications, setCertifications] = useState<CertificationData[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("classic_professional");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newBizSkillInput, setNewBizSkillInput] = useState("");
  const [newAchievementInput, setNewAchievementInput] = useState("");

  // AI Assist modal/state
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    original: string;
    enhanced: string;
    explanation: string;
    targetField?: { type: string; index?: number; bulletIndex?: number };
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      const data = await api.getResumeDetail(token, resumeId);
      setResume(data);

      const ver = data.current_version;
      if (ver) {
        setPersonalInfo(ver.personal_info || { full_name: "", email: "", phone: "", location: "" });
        setSummary(ver.professional_summary || "");
        setHeadline(ver.headline || data.target_role || "");
        setTechSkills(ver.technical_skills || []);
        setBizSkills(ver.business_skills || []);
        setWorkExp(ver.work_experience || []);
        setProjects(ver.projects || []);
        setEducation(ver.education || []);
        setCertifications(ver.certifications || []);
        setAchievements(ver.achievements || []);
        setTemplateId(ver.template_id || "classic_professional");
      }
    } catch (err: any) {
      console.error("Failed to load resume:", err);
      setError(err.message || "Failed to load resume.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchResumeData();
    }
  }, [isLoaded, isSignedIn, resumeId]);

  const handleSaveVersion = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const payload = {
        version_label: `Updated Version ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        template_id: templateId,
        personal_info: personalInfo,
        professional_summary: summary,
        headline: headline,
        work_experience: workExp,
        education: education,
        technical_skills: techSkills,
        business_skills: bizSkills,
        projects: projects,
        internships: [],
        certifications: certifications,
        achievements: achievements,
        publications: [],
        leadership: [],
        languages: [],
        section_config: {
          order: ["summary", "skills", "experience", "projects", "education", "certifications", "achievements"],
          hidden: [],
        },
      };

      const updatedVer = await api.saveResumeVersion(token, resumeId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchResumeData();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save resume version.");
    } finally {
      setSaving(false);
    }
  };

  // AI Assist handler
  const handleAiAssist = async (
    text: string,
    actionType: "enhance_bullet" | "generate_summary",
    targetField: { type: string; index?: number; bulletIndex?: number }
  ) => {
    if (!text.trim()) return;
    try {
      setAiEnhancing(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const res = await api.getAIAssistance(token, {
        action_type: actionType,
        context_text: text,
        role_or_target: resume?.target_role || "Software Engineer",
      });

      setAiSuggestion({
        original: res.original,
        enhanced: res.enhanced,
        explanation: res.explanation,
        targetField,
      });
    } catch (err: any) {
      setError(err.message || "AI enhancement unavailable.");
    } finally {
      setAiEnhancing(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion || !aiSuggestion.targetField) return;
    const { type, index, bulletIndex } = aiSuggestion.targetField;

    if (type === "summary") {
      setSummary(aiSuggestion.enhanced);
    } else if (type === "experience" && index !== undefined && bulletIndex !== undefined) {
      const updated = [...workExp];
      updated[index].highlights[bulletIndex] = aiSuggestion.enhanced;
      setWorkExp(updated);
    } else if (type === "project" && index !== undefined && bulletIndex !== undefined) {
      const updated = [...projects];
      updated[index].highlights[bulletIndex] = aiSuggestion.enhanced;
      setProjects(updated);
    }
    setAiSuggestion(null);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere variant="dashboard" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Opening AI Resume Studio...</p>
        </div>
      </div>
    );
  }

  const atsScore = resume?.current_version?.latest_ats_score || resume?.latest_ats_score || 78;

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Application Toolbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/resumes"
            className="p-2 rounded-xl text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors"
            title="Back to Resumes Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">
                {resume?.title || "Resume Builder"}
              </h1>
              <Badge variant="saffron">
                v{resume?.current_version?.version_number || 1}.0
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Target: {resume?.target_role || "General"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* ATS Score Indicator */}
          <Link
            href={`/resumes/${resumeId}/ats`}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>ATS Score: {atsScore}%</span>
          </Link>

          <Link
            href={`/resumes/${resumeId}/match`}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold hover:bg-orange-100 transition-colors"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Match with JD</span>
          </Link>

          {/* Export Dropdown Buttons */}
          <a
            href={api.getResumeExportUrl(resumeId, "pdf")}
            download
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>

          <a
            href={api.getResumeExportUrl(resumeId, "docx")}
            download
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </a>

          <Button
            variant="saffron"
            size="sm"
            onClick={handleSaveVersion}
            disabled={saving}
            className="font-bold shadow-md h-9 px-4"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Version"}
          </Button>
        </div>
      </header>

      {/* Main Split Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Section Navigation & Forms (60% width on Desktop) */}
        <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col bg-white border-r border-slate-200 overflow-y-auto">
          {/* Section Tabs Bar */}
          <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "personal", label: "Contact", icon: Users },
              { id: "summary", label: "Summary", icon: Sparkles },
              { id: "skills", label: "Skills", icon: Code },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "certifications", label: "Certifications", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-purple-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="p-6 max-w-3xl">
            {/* 1. PERSONAL CONTACT INFO */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Personal & Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.full_name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      placeholder="+91 9876543210"
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      placeholder="City, Country"
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={personalInfo.linkedin_url || ""}
                      placeholder="https://linkedin.com/in/username"
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin_url: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Portfolio URL</label>
                    <input
                      type="url"
                      value={personalInfo.github_url || ""}
                      placeholder="https://github.com/username"
                      onChange={(e) => setPersonalInfo({ ...personalInfo, github_url: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-base text-slate-900">
                    Professional Summary & Positioning
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={aiEnhancing}
                    onClick={() => handleAiAssist(summary || "Software engineer seeking growth", "generate_summary", { type: "summary" })}
                    className="h-8 text-xs font-bold border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-950"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-500" />
                    {aiEnhancing ? "Enhancing..." : "AI Enhance Summary"}
                  </Button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Associate Product Manager | Data-Driven Product Strategy"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summary Text (Recommended: 40-75 words)
                  </label>
                  <textarea
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write a concise overview of your background, core technical strengths, and measurable impact..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                  />
                  <span className="text-[11px] text-slate-500">
                    Word count: {summary.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            )}

            {/* 3. SKILLS SECTION */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
                    Technical Skills & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {techSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-bold"
                      >
                        {sk}
                        <button
                          onClick={() => setTechSkills(techSkills.filter((_, i) => i !== idx))}
                          className="text-purple-600 hover:text-purple-950"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSkillInput.trim()) {
                          setTechSkills([...techSkills, newSkillInput.trim()]);
                          setNewSkillInput("");
                        }
                      }}
                      placeholder="Add technical skill (e.g. TypeScript, Docker, SQL) and press Enter"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newSkillInput.trim()) {
                          setTechSkills([...techSkills, newSkillInput.trim()]);
                          setNewSkillInput("");
                        }
                      }}
                      className="font-bold border-purple-300 text-purple-900"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
                    Business & Analytical Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {bizSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs font-bold"
                      >
                        {sk}
                        <button
                          onClick={() => setBizSkills(bizSkills.filter((_, i) => i !== idx))}
                          className="text-orange-600 hover:text-orange-950"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newBizSkillInput}
                      onChange={(e) => setNewBizSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newBizSkillInput.trim()) {
                          setBizSkills([...bizSkills, newBizSkillInput.trim()]);
                          setNewBizSkillInput("");
                        }
                      }}
                      placeholder="Add business skill (e.g. Stakeholder Management, A/B Testing) and press Enter"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newBizSkillInput.trim()) {
                          setBizSkills([...bizSkills, newBizSkillInput.trim()]);
                          setNewBizSkillInput("");
                        }
                      }}
                      className="font-bold border-orange-300 text-orange-900"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-base text-slate-900">Work Experience</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setWorkExp([
                        ...workExp,
                        {
                          id: Date.now().toString(),
                          company: "Company Name",
                          role: "Job Title",
                          location: "Location",
                          start_date: "2023",
                          end_date: "Present",
                          is_current: true,
                          highlights: ["Engineered scalable features driving positive user engagement."],
                        },
                      ]);
                    }}
                    className="h-8 text-xs font-bold border-purple-300 text-purple-900"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Position
                  </Button>
                </div>

                {workExp.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">Position #{idx + 1}</span>
                      <button
                        onClick={() => setWorkExp(workExp.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...workExp];
                            updated[idx].company = e.target.value;
                            setWorkExp(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...workExp];
                            updated[idx].role = e.target.value;
                            setWorkExp(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.start_date}
                          placeholder="e.g. 2022 or Jan 2022"
                          onChange={(e) => {
                            const updated = [...workExp];
                            updated[idx].start_date = e.target.value;
                            setWorkExp(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.end_date || ""}
                          placeholder="e.g. Present"
                          onChange={(e) => {
                            const updated = [...workExp];
                            updated[idx].end_date = e.target.value;
                            setWorkExp(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-600">Key Accomplishments (STAR Bullets)</label>
                        <button
                          onClick={() => {
                            const updated = [...workExp];
                            updated[idx].highlights.push("Spearheaded implementation of core feature improving latency by 20%.");
                            setWorkExp(updated);
                          }}
                          className="text-[11px] font-bold text-purple-900 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {exp.highlights.map((h, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => {
                              const updated = [...workExp];
                              updated[idx].highlights[bIdx] = e.target.value;
                              setWorkExp(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={aiEnhancing}
                            onClick={() => handleAiAssist(h, "enhance_bullet", { type: "experience", index: idx, bulletIndex: bIdx })}
                            className="h-7 px-2 text-[10px] font-bold text-purple-950 border-purple-300 hover:bg-purple-100"
                            title="AI STAR Enhancer"
                          >
                            <Sparkles className="w-3 h-3 text-orange-500 mr-1" />
                            AI
                          </Button>
                          <button
                            onClick={() => {
                              const updated = [...workExp];
                              updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== bIdx);
                              setWorkExp(updated);
                            }}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-base text-slate-900">Practical Projects</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProjects([
                        ...projects,
                        {
                          id: Date.now().toString(),
                          title: "New Project",
                          role: "Lead Developer",
                          description: "Built scalable system architecture with automated CI/CD.",
                          technologies: ["Python", "FastAPI", "Docker"],
                          link: "",
                          highlights: ["Engineered asynchronous API endpoints supporting 5,000+ req/min."],
                        },
                      ]);
                    }}
                    className="h-8 text-xs font-bold border-purple-300 text-purple-900"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                  </Button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">Project #{idx + 1}</span>
                      <button
                        onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].title = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Technologies Used (comma separated)</label>
                        <input
                          type="text"
                          value={proj.technologies.join(", ")}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].technologies = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            setProjects(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-600">Key Highlights</label>
                        <button
                          onClick={() => {
                            const updated = [...projects];
                            updated[idx].highlights.push("Designed modular system architecture reducing query latency by 30%.");
                            setProjects(updated);
                          }}
                          className="text-[11px] font-bold text-purple-900 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Highlight
                        </button>
                      </div>

                      {proj.highlights.map((h, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[idx].highlights[bIdx] = e.target.value;
                              setProjects(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={aiEnhancing}
                            onClick={() => handleAiAssist(h, "enhance_bullet", { type: "project", index: idx, bulletIndex: bIdx })}
                            className="h-7 px-2 text-[10px] font-bold text-purple-950 border-purple-300 hover:bg-purple-100"
                            title="AI STAR Enhancer"
                          >
                            <Sparkles className="w-3 h-3 text-orange-500 mr-1" />
                            AI
                          </Button>
                          <button
                            onClick={() => {
                              const updated = [...projects];
                              updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== bIdx);
                              setProjects(updated);
                            }}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-base text-slate-900">Education Records</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEducation([
                        ...education,
                        {
                          id: Date.now().toString(),
                          institution: "University / Institute",
                          degree: "Bachelor of Technology",
                          field: "Computer Science",
                          start_year: 2020,
                          end_year: 2024,
                          grade: "8.5 CGPA",
                        },
                      ]);
                    }}
                    className="h-8 text-xs font-bold border-purple-300 text-purple-900"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
                  </Button>
                </div>

                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">Education #{idx + 1}</span>
                      <button
                        onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].institution = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].field = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Graduation Year / Grade</label>
                        <input
                          type="text"
                          value={edu.grade || ""}
                          placeholder="e.g. 2024 | 8.8 CGPA"
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].grade = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-base text-slate-900">Certifications & Credentials</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCertifications([
                        ...certifications,
                        {
                          id: Date.now().toString(),
                          name: "AWS Certified Cloud Practitioner",
                          issuer: "Amazon Web Services",
                          issue_date: "2024",
                        },
                      ]);
                    }}
                    className="h-8 text-xs font-bold border-purple-300 text-purple-900"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Certification
                  </Button>
                </div>

                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900">Certification #{idx + 1}</span>
                      <button
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].name = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Issuer / Year</label>
                        <input
                          type="text"
                          value={cert.issuer || ""}
                          placeholder="e.g. AWS | 2024"
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].issuer = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live ATS-Friendly Resume Preview (45% width on Desktop) */}
        <div className="w-full lg:w-[45%] xl:w-[48%] bg-slate-200/80 p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
          {/* Template Bar */}
          <div className="w-full max-w-2xl bg-white rounded-2xl p-3 border border-slate-300 shadow-sm mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-900" />
              <span>ATS Template:</span>
            </span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-purple-700"
            >
              <option value="classic_professional">Classic Professional (Universal ATS)</option>
              <option value="modern_professional">Modern Clean</option>
              <option value="software_engineering">Software Engineering / Tech</option>
              <option value="fresher_graduate">Graduate / Fresher</option>
              <option value="business_analyst">Business & Analytical</option>
            </select>
          </div>

          {/* Machine-Readable Paper Resume Container */}
          <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8 sm:p-10 border border-slate-300 text-slate-900 font-sans leading-relaxed select-text">
            {/* Header: Name & Contact */}
            <div className="text-center border-b border-slate-300 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                {personalInfo.full_name || "YOUR FULL NAME"}
              </h2>
              <div className="mt-1 text-xs text-slate-600 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.linkedin_url && (
                  <span>
                    • <a href={personalInfo.linkedin_url} className="text-blue-700 underline">LinkedIn</a>
                  </span>
                )}
                {personalInfo.github_url && (
                  <span>
                    • <a href={personalInfo.github_url} className="text-blue-700 underline">GitHub</a>
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Summary
                </h4>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {(techSkills.length > 0 || bizSkills.length > 0) && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Core Competencies
                </h4>
                <div className="mt-1.5 text-xs text-slate-700 space-y-1">
                  {techSkills.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Technical Skills:</strong> {techSkills.join(", ")}
                    </p>
                  )}
                  {bizSkills.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Business & Functional:</strong> {bizSkills.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {workExp.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Experience
                </h4>
                <div className="mt-2 space-y-3">
                  {workExp.map((exp, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{exp.role} | {exp.company}</span>
                        <span className="text-[11px] text-slate-600 font-normal">
                          {exp.start_date} – {exp.end_date || "Present"}
                        </span>
                      </div>
                      <ul className="mt-1 list-disc list-outside ml-4 space-y-0.5 text-slate-700">
                        {exp.highlights.map((h, hi) => (
                          <li key={hi}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Projects */}
            {projects.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Key Projects
                </h4>
                <div className="mt-2 space-y-3">
                  {projects.map((proj, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>
                          {proj.title}{" "}
                          {proj.technologies?.length > 0 && (
                            <span className="font-normal text-slate-600">
                              ({proj.technologies.join(", ")})
                            </span>
                          )}
                        </span>
                      </div>
                      {proj.description && <p className="mt-0.5 text-slate-700">{proj.description}</p>}
                      <ul className="mt-1 list-disc list-outside ml-4 space-y-0.5 text-slate-700">
                        {proj.highlights.map((h, hi) => (
                          <li key={hi}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Education
                </h4>
                <div className="mt-2 space-y-2">
                  {education.map((edu, i) => (
                    <div key={i} className="text-xs flex justify-between items-baseline">
                      <div>
                        <strong className="text-slate-900">{edu.degree} in {edu.field}</strong>
                        <span className="text-slate-600"> — {edu.institution}</span>
                      </div>
                      <span className="text-[11px] text-slate-600">
                        {edu.grade || (edu.end_year ? edu.end_year.toString() : "")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Certifications
                </h4>
                <div className="mt-2 space-y-1 text-xs">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <strong className="text-slate-900">{c.name}</strong>
                      <span className="text-slate-600">{c.issuer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestion Diff / Approval Modal */}
      {aiSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">AI Accomplishment Enhancer</h3>
                  <p className="text-xs text-slate-500">STAR Method (Action + Context + Metric)</p>
                </div>
              </div>
              <button
                onClick={() => setAiSuggestion(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Original Text</span>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {aiSuggestion.original}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Suggested Improvement (ATS Optimized)
                </span>
                <div className="mt-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                  {aiSuggestion.enhanced}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 text-[11px] text-purple-900">
                <strong>Why this works:</strong> {aiSuggestion.explanation}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setAiSuggestion(null)}
                className="font-bold text-xs"
              >
                Reject Suggestion
              </Button>
              <Button
                variant="saffron"
                size="md"
                onClick={applyAiSuggestion}
                className="font-bold text-xs shadow-md"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Apply to Resume
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
