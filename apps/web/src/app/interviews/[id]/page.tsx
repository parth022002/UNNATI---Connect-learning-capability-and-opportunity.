"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Layers,
  ShieldAlert,
  FastForward,
  Check,
  X
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  InterviewSessionDetail,
  InterviewQuestionItem,
  InterviewTurnItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

export default function ActiveInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [session, setSession] = useState<InterviewSessionDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio / Speech State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [timerActive, setTimerActive] = useState(true);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Current turn result
  const [currentTurn, setCurrentTurn] = useState<InterviewTurnItem | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showIdealRefinement, setShowIdealRefinement] = useState(false);

  // Load session data
  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const data = await api.getInterviewSession(token, sessionId);
      setSession(data);

      if (data.status === "COMPLETED") {
        router.push(`/interviews/${sessionId}/report`);
        return;
      }

      // Find first unanswered question
      const unansweredIdx = data.questions.findIndex((q) => !q.is_answered);
      if (unansweredIdx !== -1) {
        setCurrentQuestionIndex(unansweredIdx);
        // check if question has a turn already
        const existingTurns = data.questions[unansweredIdx].turns;
        if (existingTurns && existingTurns.length > 0) {
          setCurrentTurn(existingTurns[existingTurns.length - 1]);
        } else {
          setCurrentTurn(null);
        }
      } else {
        // all answered
        setCurrentQuestionIndex(data.questions.length - 1);
        const lastQ = data.questions[data.questions.length - 1];
        if (lastQ.turns && lastQ.turns.length > 0) {
          setCurrentTurn(lastQ.turns[lastQ.turns.length - 1]);
        }
      }

      // Initialize timer based on target duration
      setSecondsRemaining((data.target_duration_minutes || 25) * 60);
      questionStartTimeRef.current = Date.now();
    } catch (err: any) {
      console.error("Failed to load interview session:", err);
      setError(err.message || "Failed to load interview simulation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && sessionId) {
      loadSession();
    }
  }, [isLoaded, isSignedIn, sessionId]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  // Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interim = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setCandidateResponse((prev) => (prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()));
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice toggle
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  // Text to Speech for question prompt
  const speakQuestion = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  const currentQuestion = session?.questions[currentQuestionIndex];

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!candidateResponse.trim() || !session || !currentQuestion) return;
    try {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      setEvaluating(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const durationSeconds = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

      const turn = await api.submitInterviewAnswer(token, session.id, currentQuestion.id, {
        candidate_response: candidateResponse.trim(),
        turn_type: "INITIAL_ANSWER",
        input_mode: isListening ? "VOICE" : "TEXT",
        response_duration_seconds: durationSeconds
      });

      setCurrentTurn(turn);
      setShowIdealRefinement(false);

      // Refresh question list
      const updated = await api.getInterviewSession(token, session.id);
      setSession(updated);
    } catch (err: any) {
      console.error("Failed to evaluate answer:", err);
      setError(err.message || "Failed to evaluate candidate response.");
    } finally {
      setEvaluating(false);
    }
  };

  // Submit Follow-Up Answer
  const handleSubmitFollowUp = async () => {
    if (!followUpResponse.trim() || !session || !currentQuestion) return;
    try {
      setEvaluating(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const turn = await api.submitInterviewAnswer(token, session.id, currentQuestion.id, {
        candidate_response: followUpResponse.trim(),
        turn_type: "FOLLOW_UP_ANSWER",
        input_mode: "TEXT",
        response_duration_seconds: 60
      });

      setCurrentTurn(turn);
      setFollowUpResponse("");

      const updated = await api.getInterviewSession(token, session.id);
      setSession(updated);
    } catch (err: any) {
      console.error("Failed to submit follow up:", err);
      setError(err.message || "Failed to submit follow up response.");
    } finally {
      setEvaluating(false);
    }
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    if (!session) return;
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < session.questions.length) {
      setCurrentQuestionIndex(nextIdx);
      setCandidateResponse("");
      setFollowUpResponse("");
      setCurrentTurn(null);
      setShowHints(false);
      setShowIdealRefinement(false);
      questionStartTimeRef.current = Date.now();
    } else {
      handleFinishSimulation();
    }
  };

  // Finish Simulation
  const handleFinishSimulation = async () => {
    if (!session) return;
    try {
      setFinishing(true);
      const token = await getClerkApiToken(getToken);
      if (!token) return;
      await api.finishInterviewSession(token, session.id);
      router.push(`/interviews/${session.id}/report`);
    } catch (err: any) {
      console.error("Failed to finish simulation:", err);
      alert("Error generating performance report: " + err.message);
      setFinishing(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-unnati-indigo mb-3" />
          <p className="text-slate-600 font-medium">Entering simulation room...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Session Not Available</h2>
          <p className="text-sm text-slate-500 mt-1">{error || "Interview questions could not be loaded."}</p>
          <Link href="/interviews" className="mt-4 inline-block">
            <Button variant="outline">Return to Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = candidateResponse.trim() ? candidateResponse.trim().split(/\s+/).length : 0;
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;

  return (
    <div className="relative min-h-screen text-slate-900 pb-20 bg-slate-50/70">
      <BackgroundAtmosphere />

      {/* ========================================================
          SIMULATION TOP BAR & HUD
         ======================================================== */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-soft-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-unnati-indigo flex items-center justify-center font-bold text-sm">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                  {session.target_role}
                </span>
                <Badge variant="violet" className="text-[10px]">
                  {session.interview_mode.replace("_", " ")}
                </Badge>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Question {currentQuestionIndex + 1} of {session.questions.length} • {session.difficulty_level}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
                secondsRemaining < 180
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Conclude this interview simulation early and compute your performance evaluation?")) {
                  handleFinishSimulation();
                }
              }}
              disabled={finishing}
              className="text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-300"
            >
              {finishing ? "Generating Report..." : "Conclude Early"}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-8 space-y-6">
        {/* ========================================================
            INTERVIEWER QUESTION CARD
           ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-unnati-indigo to-purple-600 text-white flex items-center justify-center font-bold shadow-soft-sm shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-slate-900 text-sm">
                    UNNATI AI Senior Interviewer
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] text-slate-500">
                    {currentQuestion.category}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-unnati-indigo">
                    Target: {currentQuestion.target_competency}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Text-to-Speech Button */}
            <button
              type="button"
              onClick={() => speakQuestion(currentQuestion.question_text)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSpeakingQuestion
                  ? "bg-purple-100 border-unnati-indigo text-unnati-indigo shadow-soft-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title={isSpeakingQuestion ? "Mute audio" : "Listen to question"}
            >
              {isSpeakingQuestion ? <Volume2 className="h-4 w-4 animate-bounce" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Question Text Prompt */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Strategy & Ideal Approach Hints (Collapsible) */}
          {currentQuestion.ideal_approach && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-unnati-indigo transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showHints ? "Hide Interview Strategy Hints" : "View Interview Strategy Hints"}</span>
                {showHints ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showHints && (
                <div className="mt-2.5 rounded-2xl bg-purple-50/70 border border-purple-200 p-4 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Recommended Approach:</strong>
                  {currentQuestion.ideal_approach}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            CANDIDATE RESPONSE SECTION
           ======================================================== */}
        {!currentTurn ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="font-heading text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4 text-unnati-indigo" />
                Your Structured Response
              </label>

              {/* Voice recognition mic toggle */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isListening
                      ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse shadow-soft-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {isListening ? (
                    <>
                      <Mic className="h-3.5 w-3.5 text-rose-600 animate-ping" />
                      Listening... Click to stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-slate-600" />
                      Voice Input (Speech-to-Text)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Candidate Response Textarea */}
            <div className="relative">
              <textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder="Structure your answer clearly. Detail the Situation, the exact Task, the Actions you implemented, and the quantifiable Results/Metrics achieved..."
                rows={8}
                className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 focus:border-unnati-indigo focus:outline-none focus:ring-2 focus:ring-purple-200 leading-relaxed font-sans"
              />
            </div>

            {/* Word count & STAR Guide hints */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
                <span>•</span>
                <span>Recommended: 80 – 300 words</span>
              </div>

              {/* Quick STAR Checklist Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                <span className="text-slate-400">STAR Checklist:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">Situation</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">Task</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">Action</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-unnati-saffron">Metric Result</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Submit Response Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={evaluating || !candidateResponse.trim()}
                className="py-2.5 px-6 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-soft-md"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating Against 0–5 Rubric...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Response for Evaluation
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ========================================================
              POST-TURN EVALUATION & ADAPTIVE PROBING DRAWER
             ======================================================== */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Rubric Evaluation Result
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">
                    {currentTurn.score ? currentTurn.score.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                  <Badge
                    variant={
                      (currentTurn.score || 0) >= 4.0
                        ? "success"
                        : (currentTurn.score || 0) >= 3.0
                        ? "violet"
                        : "warning"
                    }
                    className="ml-2"
                  >
                    {(currentTurn.score || 0) >= 4.0
                      ? "Excellent Response"
                      : (currentTurn.score || 0) >= 3.0
                      ? "Proficient"
                      : "Needs Depth"}
                  </Badge>
                </div>
              </div>

              {/* STAR Completeness Indicators */}
              {currentTurn.star_analysis && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-bold">
                  <span className="text-slate-500 mr-1">STAR Check:</span>
                  <span className={`inline-flex items-center gap-1 ${currentTurn.star_analysis.situation_present ? "text-emerald-700" : "text-slate-400"}`}>
                    S {currentTurn.star_analysis.situation_present ? "✓" : "✗"}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${currentTurn.star_analysis.task_present ? "text-emerald-700" : "text-slate-400"}`}>
                    T {currentTurn.star_analysis.task_present ? "✓" : "✗"}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${currentTurn.star_analysis.action_present ? "text-emerald-700" : "text-slate-400"}`}>
                    A {currentTurn.star_analysis.action_present ? "✓" : "✗"}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${currentTurn.star_analysis.result_quantified ? "text-emerald-700" : "text-rose-600 font-black"}`}>
                    R {currentTurn.star_analysis.result_quantified ? "✓" : "✗"}
                  </span>
                </div>
              )}
            </div>

            {/* Evaluator Rationale */}
            {currentTurn.score_rationale && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Evaluator Feedback:</strong>
                {currentTurn.score_rationale}
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTurn.strengths && currentTurn.strengths.length > 0 && (
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Key Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentTurn.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentTurn.improvement_areas && currentTurn.improvement_areas.length > 0 && (
                <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    Priority Growth Focus
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentTurn.improvement_areas.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ========================================================
                ADAPTIVE INTERVIEWER FOLLOW-UP PROBE
               ======================================================== */}
            {currentTurn.suggested_follow_up && (
              <div className="rounded-2xl bg-purple-50/70 border-2 border-unnati-indigo/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="violet" className="text-xs font-bold">
                    <Bot className="h-3.5 w-3.5 mr-1" />
                    Interviewer Probing Follow-Up
                  </Badge>
                  <span className="text-xs text-slate-500">The interviewer is digging deeper into your answer</span>
                </div>
                <p className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                  "{currentTurn.suggested_follow_up}"
                </p>

                <div className="pt-2">
                  <textarea
                    value={followUpResponse}
                    onChange={(e) => setFollowUpResponse(e.target.value)}
                    placeholder="Address the interviewer's specific follow-up inquiry here..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 focus:border-unnati-indigo focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Provide concrete technical trade-offs or metrics.</span>
                    <Button
                      variant="primary"
                      onClick={handleSubmitFollowUp}
                      disabled={evaluating || !followUpResponse.trim()}
                      className="text-xs py-1.5 px-4 font-bold"
                    >
                      {evaluating ? "Evaluating Follow-Up..." : "Answer Follow-Up"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Ideal Answer Refinement */}
            {currentTurn.ideal_refinement && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowIdealRefinement(!showIdealRefinement)}
                  className="text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                  <span>{showIdealRefinement ? "Hide Benchmark Model Response" : "View Benchmark Model Response (Top 1% Candidate)"}</span>
                  {showIdealRefinement ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {showIdealRefinement && (
                  <div className="mt-2.5 rounded-2xl bg-slate-900 text-slate-200 p-5 text-xs sm:text-sm leading-relaxed border border-slate-800">
                    <div className="text-unnati-saffron font-bold text-xs uppercase mb-2">
                      Exemplar Answer Architecture:
                    </div>
                    {currentTurn.ideal_refinement}
                  </div>
                )}
              </div>
            )}

            {/* Proceed to Next Question / Finish Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Completed question {currentQuestionIndex + 1} of {session.questions.length}
              </span>

              <Button
                variant="primary"
                onClick={handleNextQuestion}
                disabled={finishing}
                className="py-2.5 px-6 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-soft-md"
              >
                {isLastQuestion ? (
                  <>
                    <Award className="h-4 w-4" /> Finish &amp; Generate Performance Report
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

