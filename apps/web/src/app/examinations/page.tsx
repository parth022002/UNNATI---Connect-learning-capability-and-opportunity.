"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StaggerContainer, StaggerItem, CountUpNumber } from "@/components/motion";
import {
  api,
  getClerkApiToken,
  ExaminationSummary
} from "@/lib/api";
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  FileText,
  Lock,
  Eye,
  Check,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Compass,
  GraduationCap
} from "lucide-react";

export default function ExaminationsHubPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [examinations, setExaminations] = useState<ExaminationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      try {
        let token: string | null = null;
        if (isSignedIn) {
          token = await getClerkApiToken(getToken);
        }
        const data = await api.getExaminations(selectedTrack, selectedCategory, token);
        setExaminations(data);
      } catch (err) {
        console.error("Failed to load examinations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, [selectedTrack, selectedCategory, isSignedIn]);

  const filteredExams = examinations.filter((exam) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      exam.title.toLowerCase().includes(q) ||
      exam.course_name.toLowerCase().includes(q) ||
      exam.module_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere variant="explore" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

          {/* ========================================================
              PAGE HERO & REPUTATION BANNER
             ======================================================== */}
          <div className="rounded-3xl bg-gradient-to-r from-unnati-indigo via-[#2A0E5C] to-unnati-indigo p-8 sm:p-12 text-white shadow-soft-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-bold text-purple-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>AI-Assisted Assessment &amp; Proctoring Integrity</span>
                <span className="h-1.5 w-1.5 rounded-full bg-unnati-saffron animate-pulse" />
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Upskilling Examination Hub &amp; Verifiable Certifications
              </h1>
              <p className="text-sm sm:text-base text-purple-100 leading-relaxed max-w-2xl">
                Validate your real-world capabilities. Take unproctored formative practice quizzes or formal, timed proctored examinations. Every assessment is grounded in verified industry competency benchmarks.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-purple-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Configurable Proctoring (Never forced on quizzes)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-unnati-saffron shrink-0" />
                  <span>Privacy-Preserving Telemetry (DPDP Act 2026)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>Verifiable Cryptographic Certificates</span>
                </span>
              </div>
            </div>

            {/* Admin Dashboard Quick Link for authorized reviewers */}
            <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-purple-300 font-medium">
                Faculty, Academic Reviewers &amp; Examination Admins:
              </span>
              <Link href="/examinations/admin">
                <Button variant="outline" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs font-bold rounded-xl h-9">
                  <span>Proctoring Audit Dashboard &rarr;</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* ========================================================
              KEY ASSESSMENT METRICS STRIP
             ======================================================== */}
          <StaggerContainer delayStepMs={75} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem index={0} direction="up">
              <Card className="p-5 clean-card bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Available Examinations</span>
                <p className="font-heading text-3xl font-black text-slate-900 mt-1">
                  <CountUpNumber value={examinations.length || 4} />
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Across 4 major disciplines</span>
              </Card>
            </StaggerItem>
            <StaggerItem index={1} direction="up">
              <Card className="p-5 clean-card bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proctored Certifications</span>
                <p className="font-heading text-3xl font-black text-unnati-indigo mt-1">
                  <CountUpNumber value={examinations.filter(e => e.proctoring_enabled).length || 3} />
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Timed with integrity telemetry</span>
              </Card>
            </StaggerItem>
            <StaggerItem index={2} direction="up">
              <Card className="p-5 clean-card bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Passing Score Standard</span>
                <p className="font-heading text-3xl font-black text-emerald-600 mt-1">
                  70%
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Industry competency benchmark</span>
              </Card>
            </StaggerItem>
            <StaggerItem index={3} direction="up">
              <Card className="p-5 clean-card bg-white border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Human-In-The-Loop AI</span>
                <p className="font-heading text-3xl font-black text-unnati-saffron mt-1">
                  100%
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Never auto-fails on AI score alone</span>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* ========================================================
              FILTER & SEARCH CONTROL BAR
             ======================================================== */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by exam title, course, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-unnati-violet text-slate-800"
              />
            </div>

            {/* Category / Mode Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Track:
              </span>
              {[
                { id: "all", label: "All Tracks" },
                { id: "business", label: "Business" },
                { id: "data", label: "Data & SQL" },
                { id: "tech", label: "Tech & APIs" },
                { id: "finance", label: "Finance" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTrack === t.id
                      ? "bg-unnati-indigo text-white shadow-soft-sm"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              EXAMINATION CARDS CATALOG
             ======================================================== */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-unnati-indigo animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Loading verified examinations catalog...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-slate-800">No examinations match your criteria</h3>
              <p className="text-sm text-slate-500">Try adjusting your track filter or search query.</p>
              <Button variant="outline" size="sm" onClick={() => { setSelectedTrack("all"); setSelectedCategory("all"); setSearchQuery(""); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <StaggerContainer delayStepMs={85} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExams.map((exam, idx) => {
                const isProctored = exam.proctoring_enabled;
                const hasPassed = exam.user_has_passed;
                const bestScore = exam.user_best_score;
                const attemptsTaken = exam.user_attempts_count || 0;

                return (
                  <StaggerItem key={exam.id} index={idx} direction="up">
                    <Card className="clean-card h-full p-6 sm:p-7 bg-white border border-slate-200/90 shadow-soft-sm flex flex-col justify-between hover:border-purple-300 transition-all group">
                      <div>
                        {/* Card Header: Category & Track Pill */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                            isProctored
                              ? "bg-purple-100 text-unnati-indigo border border-purple-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}>
                            {isProctored ? (
                              <>
                                <Camera className="h-3.5 w-3.5 text-unnati-saffron" />
                                <span>AI-Proctored Exam</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Unproctored Practice Quiz</span>
                              </>
                            )}
                          </span>

                          <Badge variant="outline" className="text-[10px] font-bold">
                            {exam.track.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Title and Module */}
                        <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-unnati-indigo transition-colors">
                          {exam.title}
                        </h3>
                        <p className="text-xs font-bold text-unnati-saffron mt-1">
                          {exam.course_name} • {exam.module_name}
                        </p>
                        <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
                          {exam.description}
                        </p>

                        {/* Exam Specs Strip */}
                        <div className="grid grid-cols-3 gap-2.5 my-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3.5 w-3.5 text-purple-600" />
                              <span>{exam.duration_minutes} Mins</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Mark</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                              <Award className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{exam.passing_percentage}% ({Math.round(exam.total_marks * exam.passing_percentage / 100)}/{exam.total_marks})</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                              <FileText className="h-3.5 w-3.5 text-amber-600" />
                              <span>{exam.question_count} Qs</span>
                            </span>
                          </div>
                        </div>

                        {/* Proctoring Specifications */}
                        <div className="space-y-1.5 text-xs text-slate-500 pb-2">
                          {isProctored ? (
                            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md">✓ Web Camera Verification</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md">✓ Fullscreen Mode</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md">✓ Browser Focus Lock</span>
                            </div>
                          ) : (
                            <p className="text-[11.5px] text-emerald-700 font-medium">
                              ✓ Open practice mode. No device monitoring or camera required.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {hasPassed ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Passed ({bestScore}%)</span>
                            </span>
                          ) : attemptsTaken > 0 ? (
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                              Attempts: {attemptsTaken}/{exam.max_attempts}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              Not Attempted
                            </span>
                          )}
                        </div>

                        <Link href={`/examinations/${exam.id}`}>
                          <Button variant={hasPassed ? "outline" : "saffron"} size="sm" className="font-bold text-xs h-10 px-4 rounded-xl">
                            <span>{hasPassed ? "View Certificate / Review" : "Start Examination"}</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          {/* ========================================================
              RESPONSIBLE AI & DPDP PRIVACY PLEDGE
             ======================================================== */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h4 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Responsible AI &amp; Privacy-First Assessment Guarantee</span>
              </h4>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                UNNATI does not perform continuous facial recognition, biometric identity recording, emotion analysis, or demographic classification. All device checks require your explicit permission. Telemetry records only event timestamps (e.g. window blur), which are automatically deleted within 72 hours under India&apos;s DPDP Act.
              </p>
            </div>
            <Link href="/privacy" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs font-bold h-10 px-4 rounded-xl">
                <span>Data Protection Policy</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
      <CareerCompanionDrawer isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </div>
  );
}
