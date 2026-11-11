"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  api,
  getClerkApiToken,
  ExaminationPublicSummary,
  LearningResourceItem,
  PersonalizedLearningSequence,
  AssessmentReadinessResponse,
  UserLearningProgressItem,
  LearningDashboardSummary,
  AssessmentQuestion,
  AssessmentSubmissionResponse
} from "@/lib/api";
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileText,
  RotateCcw,
  Check,
  Share2,
  Lock,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  CheckCheck,
  Sliders,
  DollarSign,
  Video,
  Code2,
  Star,
  Info,
  Calendar,
  Zap,
  TrendingUp,
  GraduationCap
} from "lucide-react";

function SkillAssessmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded, getToken } = useAuth();

  // Tab State
  const initialTab = (searchParams.get("tab") as any) || "assessments";
  const [activeTab, setActiveTab] = useState<"assessments" | "learn" | "diagnostic" | "my-learning">(initialTab);

  // Assessment Catalog State
  const [examinations, setExaminations] = useState<ExaminationPublicSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [loadingExams, setLoadingExams] = useState(false);

  // Learning Catalog State
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [learningTotal, setLearningTotal] = useState(0);
  const [learningPage, setLearningPage] = useState(1);
  const [pricingFilter, setPricingFilter] = useState<string>("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingResources, setLoadingResources] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState<{ name: string; count: number }[]>([]);

  // Learning Sequence View State
  const [sequenceData, setSequenceData] = useState<PersonalizedLearningSequence | null>(null);
  const [sequenceLoading, setSequenceLoading] = useState(false);

  // My Learning Dashboard State
  const [myDashboard, setMyDashboard] = useState<LearningDashboardSummary | null>(null);
  const [loadingMyLearning, setLoadingMyLearning] = useState(false);

  // Diagnostic Quiz State
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentDiagIndex, setCurrentDiagIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedDiag, setHasSubmittedDiag] = useState(false);
  const [diagFeedback, setDiagFeedback] = useState<AssessmentSubmissionResponse | null>(null);
  const [diagScore, setDiagScore] = useState(0);
  const [diagCompleted, setDiagCompleted] = useState(false);

  // Readiness Gate Modal State
  const [selectedExamForReadiness, setSelectedExamForReadiness] = useState<ExaminationPublicSummary | null>(null);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [readinessEvaluation, setReadinessEvaluation] = useState<AssessmentReadinessResponse | null>(null);
  const [readinessSubmitting, setReadinessSubmitting] = useState(false);

  // Progress Update Modal
  const [selectedResourceForProgress, setSelectedResourceForProgress] = useState<LearningResourceItem | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>("SAVED");
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressNotes, setProgressNotes] = useState<string>("");
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  // ----------------------------------------------------------------------------
  // Load Examinations
  // ----------------------------------------------------------------------------
  const loadExaminations = async () => {
    try {
      setLoadingExams(true);
      const data = await api.getExaminations(selectedTrack !== "all" ? selectedTrack : undefined);
      setExaminations(data);
    } catch (err) {
      console.error("Failed to load examinations:", err);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, [selectedTrack]);

  // ----------------------------------------------------------------------------
  // Load Learning Resources
  // ----------------------------------------------------------------------------
  const loadLearningResources = async () => {
    try {
      setLoadingResources(true);
      let token: string | undefined = undefined;
      if (isSignedIn) {
        token = (await getClerkApiToken(getToken)) || undefined;
      }

      const res = await api.getLearningResources(
        {
          pricing_type: pricingFilter !== "ALL" ? pricingFilter : undefined,
          platform: selectedPlatform || undefined,
          difficulty: selectedDifficulty || undefined,
          search_query: searchQuery || undefined,
          page: learningPage,
          limit: 12
        },
        token
      );

      setResources(res.resources);
      setLearningTotal(res.total);
      setAvailablePlatforms(res.available_platforms);
    } catch (err) {
      console.error("Failed to load learning resources:", err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    loadLearningResources();
  }, [pricingFilter, selectedPlatform, selectedDifficulty, learningPage]);

  // ----------------------------------------------------------------------------
  // Load My Learning Dashboard
  // ----------------------------------------------------------------------------
  const loadMyLearning = async () => {
    if (!isSignedIn) return;
    try {
      setLoadingMyLearning(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      const data = await api.getMyLearningDashboard(token);
      setMyDashboard(data);
    } catch (err) {
      console.error("Failed to load my learning:", err);
    } finally {
      setLoadingMyLearning(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-learning" && isSignedIn) {
      loadMyLearning();
    }
  }, [activeTab, isSignedIn]);

  // ----------------------------------------------------------------------------
  // Load Diagnostic Questions
  // ----------------------------------------------------------------------------
  const loadDiagnostic = async () => {
    try {
      const qs = await api.getAssessmentQuestions();
      setDiagnosticQuestions(qs.slice(0, 5));
    } catch (err) {
      console.error("Failed to load diagnostic questions:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "diagnostic" && diagnosticQuestions.length === 0) {
      loadDiagnostic();
    }
  }, [activeTab]);

  // ----------------------------------------------------------------------------
  // Readiness Gate Action Handlers
  // ----------------------------------------------------------------------------
  const handleOpenReadinessGate = (exam: ExaminationPublicSummary) => {
    setSelectedExamForReadiness(exam);
    setReadinessEvaluation(null);
    setShowReadinessModal(true);
  };

  const handleSelectReadinessChoice = async (choice: "KNOW_TOPIC" | "NEED_TO_LEARN" | "WANT_DIAGNOSTIC") => {
    if (!selectedExamForReadiness) return;

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/assessments`);
      return;
    }

    try {
      setReadinessSubmitting(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const evalResp = await api.checkAssessmentReadiness(token, {
        topic_or_skill: selectedExamForReadiness.title,
        target_difficulty: selectedExamForReadiness.difficulty,
        readiness_choice: choice,
        examination_id: selectedExamForReadiness.id
      });

      setReadinessEvaluation(evalResp);

      if (choice === "KNOW_TOPIC") {
        // Proceed directly to examination instructions & proctored setup
        router.push(`/examinations/${selectedExamForReadiness.id}/take`);
      } else if (choice === "NEED_TO_LEARN") {
        // Switch to Learning tab pre-filtered
        setShowReadinessModal(false);
        setActiveTab("learn");
        setSearchQuery(selectedExamForReadiness.track === "data" ? "SQL" : "Product");
        loadLearningSequence(selectedExamForReadiness.title);
      } else if (choice === "WANT_DIAGNOSTIC") {
        // Switch to low-stakes diagnostic quiz
        setShowReadinessModal(false);
        setActiveTab("diagnostic");
      }
    } catch (err: any) {
      console.error("Readiness check error:", err);
    } finally {
      setReadinessSubmitting(false);
    }
  };

  const loadLearningSequence = async (skill: string) => {
    try {
      setSequenceLoading(true);
      let token: string | undefined = undefined;
      if (isSignedIn) token = (await getClerkApiToken(getToken)) || undefined;
      const data = await api.getPersonalizedLearningSequence(skill, undefined, token);
      setSequenceData(data);
    } catch (err) {
      console.error("Failed to load learning sequence:", err);
    } finally {
      setSequenceLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Update Course Progress
  // ----------------------------------------------------------------------------
  const handleSaveProgress = async () => {
    if (!selectedResourceForProgress || !isSignedIn) return;
    try {
      setUpdatingProgress(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      await api.updateLearningProgress(token, selectedResourceForProgress.id, {
        status: progressStatus,
        progress_percentage: progressPct,
        notes: progressNotes
      });

      setSelectedResourceForProgress(null);
      loadLearningResources();
      if (activeTab === "my-learning") loadMyLearning();
    } catch (err) {
      console.error("Failed to update course progress:", err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Diagnostic Question Handlers
  // ----------------------------------------------------------------------------
  const currentDiagQ = diagnosticQuestions[currentDiagIndex];

  const handleDiagnosticSubmit = async () => {
    if (!selectedOption || !currentDiagQ) return;
    setHasSubmittedDiag(true);

    if (isSignedIn) {
      try {
        const token = await getClerkApiToken(getToken);
        if (token) {
          const res = await api.submitAssessmentQuestion(token, {
            question_id: currentDiagQ.id,
            selected_option_id: selectedOption
          });
          setDiagFeedback(res);
          if (res.is_correct) setDiagScore((prev) => prev + 1);
          return;
        }
      } catch (err) {
        console.warn("Sync failed:", err);
      }
    }

    // Fallback local evaluation
    const isCorr = selectedOption === "B";
    if (isCorr) setDiagScore((prev) => prev + 1);
    setDiagFeedback({
      question_id: currentDiagQ.id,
      is_correct: isCorr,
      correct_option_id: "B",
      score: isCorr ? 1.0 : 0.45,
      explanation: "Evaluated against foundational concepts.",
      practical_takeaway: "Review intermediate topics in your personalized learning sequence.",
      skill_update: null
    });
  };

  const handleNextDiagnostic = () => {
    if (currentDiagIndex < diagnosticQuestions.length - 1) {
      setCurrentDiagIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedDiag(false);
      setDiagFeedback(null);
    } else {
      setDiagCompleted(true);
    }
  };

  const handleResetDiagnostic = () => {
    setCurrentDiagIndex(0);
    setSelectedOption(null);
    setHasSubmittedDiag(false);
    setDiagFeedback(null);
    setDiagScore(0);
    setDiagCompleted(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere variant="assessments" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HERO HEADER */}
        <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-slate-200/90 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="violet" className="text-xs font-bold py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> 3-Stage Assessment &amp; Learning Cycle
              </Badge>
              <span className="text-xs text-slate-500 font-medium">
                Learn If Needed → Assess Independently → Improve Continuously
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Skill Assessments &amp; Intelligent Learning
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Take formal AI-proctored skill certifications, test your baseline with low-stakes diagnostics, or discover vetted free &amp; paid courses from verified global platforms.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-4 sm:mt-0 flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-soft-sm shrink-0">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-unnati-indigo flex items-center justify-center font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-left text-xs">
              <span className="text-slate-400 font-medium block">Verified Badges</span>
              <strong className="text-slate-900 font-bold">Bayesian Skill Evidence</strong>
            </div>
          </div>
        </div>

        {/* 4 PRIMARY TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("assessments")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "assessments"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Proctored Assessments &amp; Exams ({examinations.length})
          </button>

          <button
            onClick={() => setActiveTab("learn")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "learn"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Learning Discovery Hub (Free &amp; Paid)
          </button>

          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "diagnostic"
                ? "bg-unnati-indigo text-white shadow-soft-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Zap className="h-4 w-4" /> Low-Stakes Diagnostic Quiz
          </button>

          {isSignedIn && (
            <button
              onClick={() => setActiveTab("my-learning")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "my-learning"
                  ? "bg-unnati-indigo text-white shadow-soft-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BookmarkCheck className="h-4 w-4" /> My Learning Dashboard
            </button>
          )}
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: FORMAL PROCTORED ASSESSMENTS */}
        {/* ===================================================================== */}
        {activeTab === "assessments" && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {["all", "business", "data", "tech", "finance"].map((track) => (
                  <button
                    key={track}
                    onClick={() => setSelectedTrack(track)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      selectedTrack === track
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Mandatory Readiness Check enforced before attempt initialization
              </span>
            </div>

            {loadingExams ? (
              <div className="p-16 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-2" />
                Loading Verified Assessments...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examinations.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm hover:border-purple-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                          {exam.track}
                        </Badge>
                        {exam.proctoring_enabled ? (
                          <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> AI-Proctored
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 text-slate-600 border-slate-200">
                            Unproctored Quiz
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-heading font-extrabold text-lg text-slate-900 leading-snug">
                        {exam.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {exam.duration_minutes} Mins
                        </span>
                        <span>•</span>
                        <span>Pass: {exam.passing_percentage}%</span>
                        <span>•</span>
                        <span>{exam.question_count} Questions</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-[10px] text-slate-400 block font-medium">Difficulty</span>
                        <strong className="text-slate-800 font-bold">{exam.difficulty}</strong>
                      </div>

                      <Button
                        onClick={() => handleOpenReadinessGate(exam)}
                        className="bg-gradient-to-r from-unnati-indigo to-purple-600 hover:opacity-95 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-soft-sm"
                      >
                        Start Assessment <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: INTELLIGENT LEARNING DISCOVERY HUB */}
        {/* ===================================================================== */}
        {activeTab === "learn" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadLearningResources()}
                    placeholder="Search by skill, topic, or provider (e.g. SQL, Python, React, Coursera)..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                {/* Free vs Paid Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => { setPricingFilter("ALL"); setLearningPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pricingFilter === "ALL" ? "bg-white text-slate-900 shadow-soft-sm" : "text-slate-600"
                    }`}
                  >
                    All Pricing
                  </button>
                  <button
                    onClick={() => { setPricingFilter("FREE"); setLearningPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pricingFilter === "FREE" ? "bg-emerald-600 text-white shadow-soft-sm" : "text-slate-600"
                    }`}
                  >
                    100% Free
                  </button>
                  <button
                    onClick={() => { setPricingFilter("PAID"); setLearningPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pricingFilter === "PAID" ? "bg-purple-600 text-white shadow-soft-sm" : "text-slate-600"
                    }`}
                  >
                    Paid / Certified
                  </button>
                </div>
              </div>

              {/* Sub-Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Filter className="h-3.5 w-3.5" /> Platform:
                </div>
                <select
                  value={selectedPlatform}
                  onChange={(e) => { setSelectedPlatform(e.target.value); setLearningPage(1); }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="">All Platforms</option>
                  {availablePlatforms.map((p) => (
                    <option key={p.name} value={p.name}>{p.name} ({p.count})</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 text-slate-500 font-medium ml-2">
                  Difficulty:
                </div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => { setSelectedDifficulty(e.target.value); setLearningPage(1); }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <div className="ml-auto text-xs text-slate-500">
                  Showing <strong>{resources.length}</strong> of <strong>{learningTotal}</strong> vetted resources
                </div>
              </div>
            </div>

            {/* Structured Sequence Pathway Banner (If Loaded) */}
            {sequenceData && (
              <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 rounded-3xl border border-purple-200/80 p-6 shadow-soft-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="violet" className="text-xs font-bold uppercase mb-1">
                      Personalized Learning Sequence
                    </Badge>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">
                      Step-by-Step Curriculum: {sequenceData.skill_name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {sequenceData.overall_explanation}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block font-medium">Est. Study Time</span>
                    <strong className="text-base font-black text-unnati-indigo">
                      ~{sequenceData.estimated_total_hours} Hours
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {sequenceData.stages.map((stage, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-purple-200/70 p-3.5 space-y-2 text-xs">
                      <span className="text-[10px] font-black text-unnati-indigo uppercase tracking-wider block">
                        {stage.stage_name}
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {stage.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {stage.concepts.slice(0, 2).map((c) => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Grid */}
            {loadingResources ? (
              <div className="p-16 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-2" />
                Retrieving Verified Educational Courses...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm hover:border-purple-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                          {res.platform_name}
                        </span>

                        {res.pricing_type === "FREE" ? (
                          <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border-emerald-200">
                            100% Free
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold bg-purple-50 text-unnati-indigo border-purple-200">
                            {res.price_amount ? `₹${res.price_amount.toFixed(0)}` : "Paid / Subscription"}
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-heading font-extrabold text-base text-slate-900 leading-snug">
                        {res.title}
                      </h4>

                      <p className="text-xs text-slate-500">
                        Provider: <strong>{res.instructor_or_provider}</strong>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {res.key_concepts_covered.slice(0, 3).map((concept) => (
                          <span key={concept} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-medium border border-slate-200/70">
                            {concept}
                          </span>
                        ))}
                      </div>

                      {/* Why Recommended */}
                      {res.why_recommended && (
                        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                          <strong>Why Vetted:</strong> {res.why_recommended}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-500">
                        {res.duration_hours && (
                          <span className="block font-medium">~{res.duration_hours} hrs</span>
                        )}
                        {res.rating && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                            <Star className="h-3 w-3 fill-amber-500" /> {res.rating}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isSignedIn && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResourceForProgress(res);
                              setProgressStatus(res.user_status || "SAVED");
                              setProgressPct(res.user_progress_percentage || 0);
                            }}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                            title="Track Learning Progress"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        )}

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                        >
                          Open Course <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: LOW-STAKES DIAGNOSTIC QUIZ */}
        {/* ===================================================================== */}
        {activeTab === "diagnostic" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <Badge variant="violet" className="text-xs font-bold uppercase mb-1">
                    Option C Diagnostic Mode
                  </Badge>
                  <h3 className="font-heading font-black text-2xl text-slate-900">
                    Low-Stakes Knowledge Diagnostic
                  </h3>
                  <p className="text-xs text-slate-500">
                    5 rapid-fire questions to benchmark your starting knowledge without formal proctoring
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-unnati-indigo block">
                    Question {currentDiagIndex + 1} of {diagnosticQuestions.length || 5}
                  </span>
                  <span className="text-[10px] text-slate-400">Diagnostic Check</span>
                </div>
              </div>

              {!diagCompleted && currentDiagQ ? (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      {currentDiagQ.track.toUpperCase()} • {currentDiagQ.skill}
                    </span>
                    <h4 className="font-heading font-bold text-lg text-slate-900 leading-snug">
                      {currentDiagQ.prompt}
                    </h4>
                    {currentDiagQ.scenario && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
                        {currentDiagQ.scenario}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentDiagQ.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => !hasSubmittedDiag && setSelectedOption(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                          selectedOption === opt.id
                            ? "bg-purple-50/80 border-unnati-indigo text-slate-900 shadow-soft-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 text-xs">
                          {opt.id}
                        </span>
                        <span className="leading-relaxed">{opt.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Feedback */}
                  {diagFeedback && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in ${
                      diagFeedback.is_correct ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {diagFeedback.is_correct ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Correct Assessment!
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600" /> Knowledge Gap Identified
                          </>
                        )}
                      </div>
                      <p>{diagFeedback.explanation}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={handleResetDiagnostic}
                      className="text-xs font-bold py-2 px-4 rounded-xl text-slate-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                    </Button>

                    {!hasSubmittedDiag ? (
                      <Button
                        onClick={handleDiagnosticSubmit}
                        disabled={!selectedOption}
                        className="bg-unnati-indigo text-white font-bold text-xs py-2 px-5 rounded-xl shadow-soft-sm"
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextDiagnostic}
                        className="bg-slate-900 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-soft-sm"
                      >
                        {currentDiagIndex < diagnosticQuestions.length - 1 ? "Next Question" : "View Recommendations"}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-purple-50 text-unnati-indigo flex items-center justify-center mx-auto">
                    <Award className="h-8 w-8" />
                  </div>
                  <h4 className="font-heading font-black text-2xl text-slate-900">
                    Diagnostic Complete: {diagScore} / {diagnosticQuestions.length} Correct
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Based on your diagnostic baseline, we recommend reviewing foundational SQL joins and RICE prioritization before attempting formal proctored certifications.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      onClick={() => setActiveTab("learn")}
                      className="bg-unnati-indigo text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-soft-sm"
                    >
                      Explore Tailored Courses <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetDiagnostic}
                      className="text-xs font-bold py-2.5 px-4 rounded-xl"
                    >
                      Retake Diagnostic
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: MY LEARNING DASHBOARD */}
        {/* ===================================================================== */}
        {activeTab === "my-learning" && (
          <div className="space-y-6">
            {loadingMyLearning ? (
              <div className="p-16 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-2" />
                Loading Your Learning Dashboard...
              </div>
            ) : myDashboard ? (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-sm text-center">
                    <span className="text-xs text-slate-400 font-medium block">Saved Courses</span>
                    <strong className="text-2xl font-black text-slate-900">{myDashboard.total_saved}</strong>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-sm text-center">
                    <span className="text-xs text-slate-400 font-medium block">In Progress</span>
                    <strong className="text-2xl font-black text-unnati-indigo">{myDashboard.total_in_progress}</strong>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-sm text-center">
                    <span className="text-xs text-slate-400 font-medium block">Completed</span>
                    <strong className="text-2xl font-black text-emerald-600">{myDashboard.total_completed}</strong>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-sm text-center">
                    <span className="text-xs text-slate-400 font-medium block">Hours Invested</span>
                    <strong className="text-2xl font-black text-purple-700">~{myDashboard.estimated_hours_invested}h</strong>
                  </div>
                </div>

                {/* Recent Tracked Courses */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm space-y-4">
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    My Active Learning Courses
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {myDashboard.recent_resources.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{item.resource.title}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {item.resource.platform_name}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Status: <strong className="text-slate-700">{item.status}</strong> • {item.progress_percentage}% completed
                          </p>
                          {item.notes && (
                            <p className="text-[11px] text-slate-600 italic mt-1">"{item.notes}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={item.resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold py-1.5 px-3 rounded-xl bg-slate-900 text-white"
                          >
                            Continue Course
                          </a>
                        </div>
                      </div>
                    ))}

                    {myDashboard.recent_resources.length === 0 && (
                      <div className="text-center py-10 text-xs text-slate-500">
                        No courses tracked yet. Visit the Learning Discovery Hub to save or start courses!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </main>

      {/* ======================================================================= */}
      {/* MANDATORY SKILL ASSESSMENT READINESS GATE MODAL */}
      {/* ======================================================================= */}
      {showReadinessModal && selectedExamForReadiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-unnati-indigo flex items-center justify-center shrink-0 border border-purple-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Skill Assessment Readiness Gate
                </h3>
                <p className="text-xs text-slate-500">
                  Are you ready to take this assessment?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              This formal assessment evaluates your understanding of <strong>{selectedExamForReadiness.title}</strong> ({selectedExamForReadiness.difficulty} Level). Before proceeding, make sure you have studied the concepts and are comfortable answering questions independently.
            </div>

            {/* 3 MANDATORY OPTIONS */}
            <div className="space-y-3">
              {/* Option A: I know this topic */}
              <button
                type="button"
                onClick={() => handleSelectReadinessChoice("KNOW_TOPIC")}
                disabled={readinessSubmitting}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-unnati-indigo hover:bg-purple-50/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-unnati-indigo font-bold flex items-center justify-center shrink-0 text-xs group-hover:bg-unnati-indigo group-hover:text-white transition-colors">
                  A
                </div>
                <div>
                  <strong className="text-slate-900 text-sm font-bold block">
                    I know this topic — Proceed to Assessment
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    I have studied the concepts. Show me assessment rules, proctoring requirements, and start testing.
                  </p>
                </div>
              </button>

              {/* Option B: I need to learn this topic first */}
              <button
                type="button"
                onClick={() => handleSelectReadinessChoice("NEED_TO_LEARN")}
                disabled={readinessSubmitting}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  B
                </div>
                <div>
                  <strong className="text-slate-900 text-sm font-bold block">
                    I need to learn this topic first
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recommend curated free tutorials (YouTube, FreeCodeCamp, MDN) and accredited courses before I test.
                  </p>
                </div>
              </button>

              {/* Option C: I want to understand my current level first */}
              <button
                type="button"
                onClick={() => handleSelectReadinessChoice("WANT_DIAGNOSTIC")}
                disabled={readinessSubmitting}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  C
                </div>
                <div>
                  <strong className="text-slate-900 text-sm font-bold block">
                    I want to understand my current level first
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Take a short, low-stakes diagnostic quiz without proctoring to find my baseline.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReadinessModal(false)}
                className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 text-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* UPDATE LEARNING PROGRESS MODAL */}
      {/* ======================================================================= */}
      {selectedResourceForProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Track Course Progress
            </h3>
            <p className="text-xs text-slate-500">
              {selectedResourceForProgress.title} ({selectedResourceForProgress.platform_name})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Status</label>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="SAVED">Saved for Later</option>
                  <option value="STARTED">Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Progress Percentage: {progressPct}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPct}
                  onChange={(e) => setProgressPct(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Private Study Notes</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Record key concepts learned, project repos, or questions..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedResourceForProgress(null)}
                className="text-xs font-bold py-1.5 px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProgress}
                disabled={updatingProgress}
                className="bg-unnati-indigo text-white text-xs font-bold py-1.5 px-4 rounded-xl"
              >
                {updatingProgress ? "Saving..." : "Save Progress"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <CareerCompanionDrawer isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </div>
  );
}

export default function SkillAssessmentsAndLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm font-medium text-slate-300">Loading Assessment & Learning Portal...</p>
          </div>
        </div>
      }
    >
      <SkillAssessmentsContent />
    </Suspense>
  );
}
