"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  api,
  getClerkApiToken,
  ExamSessionResponse,
  ExamQuestionItem,
  SavedAnswerState
} from "@/lib/api";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Camera,
  Maximize2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  X
} from "lucide-react";

export default function ActiveExaminationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const initialAttemptId = searchParams.get("attemptId");

  const { isSignedIn, isLoaded, getToken } = useAuth();

  const [session, setSession] = useState<ExamSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active question index
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Local answer states: questionId -> { selected_options, text_response, is_marked_for_review }
  const [answers, setAnswers] = useState<Record<string, {
    selected_options: string[];
    text_response: string;
    is_marked_for_review: boolean;
  }>>({});

  // Countdown timer in seconds (synced with server expires_at)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Proctoring telemetry warnings & modals
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningToast, setShowWarningToast] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Local webcam stream
  const videoPipRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Initialize or Resume Examination Session
  useEffect(() => {
    async function initSession() {
      if (!isLoaded || !isSignedIn) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getClerkApiToken(getToken);
        if (!token) throw new Error("Authentication required.");

        const sessionData = await api.startExamination(token, examId, {
          proctoring_consent: true,
          device_info: { client_reconnect: true }
        });
        setSession(sessionData);
        setSecondsRemaining(sessionData.time_remaining_seconds);

        // Populate initial answer states
        const initialAnswers: Record<string, any> = {};
        sessionData.questions.forEach((q) => {
          const saved = sessionData.saved_answers[q.id];
          initialAnswers[q.id] = {
            selected_options: saved?.selected_options || [],
            text_response: saved?.text_response || "",
            is_marked_for_review: saved?.is_marked_for_review || false
          };
        });
        setAnswers(initialAnswers);

        // Start local video PIP if proctoring requires webcam
        if (sessionData.proctoring_enabled && sessionData.proctoring_config?.require_webcam) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
            streamRef.current = stream;
            if (videoPipRef.current) {
              videoPipRef.current.srcObject = stream;
            }
          } catch (e) {
            console.warn("Could not start local PIP stream:", e);
          }
        }
      } catch (err: any) {
        console.error("Failed to load session:", err);
        setError(err.message || "Failed to initialize examination.");
      } finally {
        setLoading(false);
      }
    }

    initSession();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [examId, isLoaded, isSignedIn]);

  // 2. Server-Authoritative Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0 && session) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time expires!
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, session]);

  const handleAutoSubmitOnExpiry = async () => {
    if (!session || submitting) return;
    try {
      const token = await getClerkApiToken(getToken);
      if (token) {
        await api.submitExamination(token, session.attempt_id, "Auto-submitted on time expiration");
      }
      router.push(`/examinations/${examId}/results/${session.attempt_id}`);
    } catch (e) {
      console.error("Error auto-submitting expired exam:", e);
    }
  };

  // 3. Proctoring Telemetry Listeners (Tab Switch, Window Blur, Fullscreen Exit, Copy/Paste)
  const sendProctoringEvent = useCallback(async (eventType: string, severity: string = "INFO", meta: any = {}) => {
    if (!session || !session.proctoring_enabled) return;
    try {
      const token = await getClerkApiToken(getToken);
      if (token) {
        await api.recordProctoringEvent(token, session.attempt_id, {
          event_type: eventType,
          severity,
          metadata_payload: meta
        });
      }
    } catch (e) {
      console.warn("Telemetry ingestion error:", e);
    }
  }, [session, getToken]);

  useEffect(() => {
    if (!session || !session.proctoring_enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        sendProctoringEvent("TAB_SWITCH", "WARNING", {
          instance: tabSwitchCount + 1,
          blurred_at: new Date().toISOString()
        });
        setShowWarningToast("Window focus lost! Focus changes are recorded in your examination telemetry.");
      }
    };

    const handleWindowBlur = () => {
      sendProctoringEvent("WINDOW_BLUR", "INFO");
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (session.proctoring_config?.block_copy_paste) {
        e.preventDefault();
        sendProctoringEvent("COPY_ATTEMPT", "WARNING", { type: e.type });
        setShowWarningToast("Copy/paste is disabled for examination integrity.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (session.proctoring_config?.block_copy_paste) {
        e.preventDefault();
        sendProctoringEvent("RIGHT_CLICK", "INFO");
      }
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        sendProctoringEvent("FULLSCREEN_EXIT", "WARNING");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [session, tabSwitchCount, sendProctoringEvent]);

  // Request fullscreen
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // 4. Autosave Handler
  const saveAnswerToServer = async (questionId: string, currentAnswer: any) => {
    if (!session) return;
    setSaveStatus("saving");
    try {
      const token = await getClerkApiToken(getToken);
      if (token) {
        await api.saveExamAnswer(token, session.attempt_id, {
          question_id: questionId,
          selected_options: currentAnswer.selected_options,
          text_response: currentAnswer.text_response,
          is_marked_for_review: currentAnswer.is_marked_for_review
        });
        setSaveStatus("saved");
      }
    } catch (e) {
      console.error("Autosave error:", e);
      setSaveStatus("error");
    }
  };

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    const existing = answers[questionId] || { selected_options: [], text_response: "", is_marked_for_review: false };
    let newSelected: string[] = [];

    if (isMulti) {
      if (existing.selected_options.includes(optionId)) {
        newSelected = existing.selected_options.filter(id => id !== optionId);
      } else {
        newSelected = [...existing.selected_options, optionId];
      }
    } else {
      newSelected = [optionId];
    }

    const updated = { ...existing, selected_options: newSelected };
    setAnswers(prev => ({ ...prev, [questionId]: updated }));
    saveAnswerToServer(questionId, updated);
  };

  const handleTextChange = (questionId: string, text: string) => {
    const existing = answers[questionId] || { selected_options: [], text_response: "", is_marked_for_review: false };
    const updated = { ...existing, text_response: text };
    setAnswers(prev => ({ ...prev, [questionId]: updated }));
  };

  const handleTextBlur = (questionId: string) => {
    const existing = answers[questionId];
    if (existing) {
      saveAnswerToServer(questionId, existing);
    }
  };

  const handleToggleMarkReview = (questionId: string) => {
    const existing = answers[questionId] || { selected_options: [], text_response: "", is_marked_for_review: false };
    const updated = { ...existing, is_marked_for_review: !existing.is_marked_for_review };
    setAnswers(prev => ({ ...prev, [questionId]: updated }));
    saveAnswerToServer(questionId, updated);
  };

  // 5. Final Submission Handler
  const handleFinalSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) throw new Error("Authentication token required.");

      const result = await api.submitExamination(token, session.attempt_id, "Submitted by candidate");

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      router.push(`/examinations/${examId}/results/${session.attempt_id}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit examination.");
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Format time (MM:SS)
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-10 w-10 text-unnati-saffron animate-spin mb-4" />
        <h2 className="text-lg font-bold">Connecting to Examination Engine...</h2>
        <p className="text-xs text-slate-400 mt-1">Establishing secure, tamper-evident examination session.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center space-y-4 bg-slate-800 border border-slate-700 text-white">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold">Examination Session Error</h2>
          <p className="text-xs text-slate-400">{error || "Could not connect to session."}</p>
          <Link href={`/examinations/${examId}`}>
            <Button variant="outline" size="sm" className="text-white border-slate-600">
              Return to Instructions
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentQ = session.questions[currentQIndex];
  const currentAnswer = answers[currentQ?.id] || { selected_options: [], text_response: "", is_marked_for_review: false };
  const totalQuestions = session.questions.length;

  const answeredCount = Object.values(answers).filter(
    a => a.selected_options.length > 0 || (a.text_response && a.text_response.trim().length > 0)
  ).length;
  const markedCount = Object.values(answers).filter(a => a.is_marked_for_review).length;
  const unansweredCount = totalQuestions - answeredCount;

  const isTimerLow = secondsRemaining < 300; // < 5 mins
  const isTimerWarning = secondsRemaining < 600 && secondsRemaining >= 300; // < 10 mins

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">

      {/* ========================================================
          EXAMINATION HEADER (Minimal Distractions, High Clarity)
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-800/80 p-1 shrink-0">
            <Image src="/logo.png" alt="UNNATI" width={28} height={28} className="object-contain" priority />
          </div>
          <div>
            <h1 className="font-heading text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{session.examination_title}</span>
              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline text-xs font-semibold text-purple-300">{session.course_name}</span>
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>Attempt #{session.attempt_number}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Autosave Active</span>
              {tabSwitchCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">Focus Changes: {tabSwitchCount}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Timer & Proctoring Monitor */}
        <div className="flex items-center gap-3 sm:gap-4">
          {session.proctoring_enabled && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 text-xs font-bold">
              <Camera className="h-3.5 w-3.5 text-unnati-saffron animate-pulse" />
              <span>AI Proctoring Telemetry</span>
            </div>
          )}

          {/* Server-Authoritative Timer Display */}
          <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-sm sm:text-base font-extrabold ${
            isTimerLow
              ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
              : isTimerWarning
              ? "bg-amber-950/80 border-amber-500 text-amber-300"
              : "bg-slate-800/90 border-slate-700 text-white"
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <Button
            variant="saffron"
            size="sm"
            onClick={() => setShowSubmitModal(true)}
            className="font-bold text-xs h-9 px-4 rounded-xl text-white shadow-glow-saffron"
          >
            <span>Submit</span>
          </Button>
        </div>
      </header>

      {/* Floating Warning Toast */}
      {showWarningToast && (
        <div className="fixed top-18 right-6 z-50 bg-amber-950/90 border border-amber-500 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{showWarningToast}</span>
          <button onClick={() => setShowWarningToast(null)} className="text-amber-400 hover:text-white cursor-pointer ml-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          MAIN EXAMINATION WORKSPACE
         ======================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Question Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-6 sm:p-8 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-6">
            
            {/* Question Header & Review Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-heading text-lg font-black text-white">
                  Question {currentQ.question_number} of {totalQuestions}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-700 text-slate-300">
                  {currentQ.question_type}
                </Badge>
                <span className="text-xs text-purple-300 font-semibold">
                  [{currentQ.marks} Marks]
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleMarkReview(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentAnswer.is_marked_for_review
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/60"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${currentAnswer.is_marked_for_review ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{currentAnswer.is_marked_for_review ? "Marked for Review" : "Mark for Review"}</span>
              </button>
            </div>

            {/* Scenario Box (if present) */}
            {currentQ.scenario && (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/60 text-xs sm:text-[13px] text-purple-200 leading-relaxed space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-unnati-saffron block">
                  Scenario Context
                </span>
                <p>{currentQ.scenario}</p>
              </div>
            )}

            {/* Code Snippet (if present) */}
            {currentQ.code_snippet && (
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <pre>{currentQ.code_snippet}</pre>
              </div>
            )}

            {/* Question Prompt */}
            <div className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
              {currentQ.prompt}
            </div>

            {/* Options or Text Area */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer.selected_options.includes(opt.id);
                  const isMulti = currentQ.question_type === "MULTIPLE_SELECT";

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id, isMulti)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? "bg-purple-950/60 border-unnati-violet text-white shadow-soft-sm ring-1 ring-purple-500"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-unnati-indigo text-white ring-2 ring-purple-400"
                          : "bg-slate-700 text-slate-300"
                      }`}>
                        {opt.id}
                      </span>
                      <span className="leading-relaxed mt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-400">
                  Your Response (Auto-evaluated against rubric):
                </label>
                <textarea
                  rows={7}
                  value={currentAnswer.text_response || ""}
                  onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
                  onBlur={() => handleTextBlur(currentQ.id)}
                  placeholder="Type your structured solution or SQL/code here..."
                  className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-unnati-violet leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-500">
                  Click outside or navigate to automatically save your response.
                </span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                {currentQIndex < totalQuestions - 1 ? (
                  <Button
                    variant="saffron"
                    size="sm"
                    onClick={() => setCurrentQIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    className="font-bold text-xs h-9 px-4 rounded-xl text-white shadow-glow-saffron"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="saffron"
                    size="sm"
                    onClick={() => setShowSubmitModal(true)}
                    className="font-bold text-xs h-9 px-5 rounded-xl text-white shadow-glow-saffron"
                  >
                    <span>Review &amp; Submit</span>
                    <Send className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

          </Card>
        </div>

        {/* Right Column: Question Navigator & Local Camera PIP (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Question Navigator Grid */}
          <Card className="p-5 bg-slate-900 border border-slate-800 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-heading text-sm font-bold text-white">Question Navigator</span>
              <span className="text-xs font-semibold text-purple-300">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2">
              {session.questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = ans && (ans.selected_options.length > 0 || (ans.text_response && ans.text_response.trim().length > 0));
                const isMarked = ans && ans.is_marked_for_review;
                const isCurrent = idx === currentQIndex;

                let btnClass = "bg-slate-800 text-slate-400 hover:text-white border-slate-700";
                if (isCurrent) {
                  btnClass = "ring-2 ring-purple-400 bg-purple-900 text-white font-black";
                } else if (isMarked) {
                  btnClass = "bg-amber-900/60 border-amber-600 text-amber-200 font-bold";
                } else if (isAnswered) {
                  btnClass = "bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-emerald-950 border border-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-amber-900/60 border border-amber-600" />
                <span>Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-slate-800 border border-slate-700" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md ring-2 ring-purple-400 bg-purple-900" />
                <span>Current</span>
              </div>
            </div>
          </Card>

          {/* Privacy-Preserving Local Webcam Monitor PIP */}
          {session.proctoring_enabled && session.proctoring_config?.require_webcam && (
            <Card className="p-4 bg-slate-900 border border-purple-900/60 text-white rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Camera className="h-3.5 w-3.5 text-unnati-saffron" />
                  <span>Proctor Monitor PIP</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Feed Active</span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-700">
                <video
                  ref={videoPipRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9.5px] text-purple-200">
                  Local Feed • Zero Cloud Storage
                </div>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Privacy guarantee: Frames are analyzed locally. Raw video is never stored or transmitted.
              </p>
            </Card>
          )}

        </div>

      </div>

      {/* ========================================================
          SUBMISSION CONFIRMATION MODAL
         ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-unnati-saffron" />
                <span>Submit Examination?</span>
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Are you ready to submit your attempt? Once submitted, your answers will be automatically evaluated, skills updated, and proctoring telemetry processed.
            </p>

            {/* Stats Summary */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Answered</span>
                <span className="font-bold text-emerald-400 text-sm mt-0.5">{answeredCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Unanswered</span>
                <span className="font-bold text-rose-400 text-sm mt-0.5">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">In Review</span>
                <span className="font-bold text-amber-400 text-sm mt-0.5">{markedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-300 font-medium">
                ⚠️ You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}. You can return and complete them before submitting.
              </p>
            )}

            {error && (
              <p className="text-xs text-rose-400 font-medium">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-300 hover:text-white"
              >
                Back to Exam
              </Button>
              <Button
                variant="saffron"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="font-bold text-xs h-10 px-5 rounded-xl text-white shadow-glow-saffron"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Grading &amp; Evaluating...</span>
                  </>
                ) : (
                  <span>Confirm Submission</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
