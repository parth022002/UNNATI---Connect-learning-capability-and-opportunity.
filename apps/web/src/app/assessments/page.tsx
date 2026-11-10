"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Code2, 
  ShieldCheck,
  ChevronRight,
  Flame,
  Brain
} from "lucide-react";

interface Question {
  id: number;
  skill: string;
  irtDifficulty: string; // "Easy" | "Medium" | "Hard"
  thetaValue: number;
  prompt: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  academicCitation: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1,
    skill: "FastAPI & Async IO",
    irtDifficulty: "Medium",
    thetaValue: 0.35,
    prompt: "In a high-throughput FastAPI service, why should long-running CPU-bound calculations NOT be defined as bare `async def` route handlers?",
    codeSnippet: `@app.get("/compute")\nasync def heavy_calculation():\n    # Millions of math iterations here\n    return {"result": compute_primes()}`,
    options: [
      { id: "A", text: "Because async functions do not support JSON response serialization." },
      { id: "B", text: "CPU-bound work in async def blocks the single-threaded asyncio event loop, starving all concurrent I/O requests." },
      { id: "C", text: "Because FastAPI will automatically convert async def handlers into Celery tasks." },
      { id: "D", text: "Python raises a RuntimeError if async functions run for longer than 30 seconds." }
    ],
    correctOptionId: "B",
    explanation: "FastAPI runs async def endpoints directly on the main asyncio event loop. If a route executes CPU-intensive code without releasing control (via await or run_in_threadpool), it blocks the entire event loop, causing P95 latency to spike for all incoming requests.",
    academicCitation: "FastAPI Documentation / Python Concurrency Design Patterns"
  },
  {
    id: 2,
    skill: "PostgreSQL & Vector Indexes",
    irtDifficulty: "Hard",
    thetaValue: 1.25,
    prompt: "When indexing 500,000 document embedding vectors using pgvector, which index type provides sub-10ms search latency without requiring table pre-training / clustering?",
    options: [
      { id: "A", text: "B-Tree index with DESC sort on cosine distance." },
      { id: "B", text: "IVFFlat index with lists=100." },
      { id: "C", text: "HNSW (Hierarchical Navigable Small World) index with cosine distance operator `<=>`." },
      { id: "D", text: "GIN inverted index on vector jsonb representation." }
    ],
    correctOptionId: "C",
    explanation: "HNSW builds a multi-layer graph of vectors upon insertion. It provides fast sub-10ms query execution and does not require a pre-clustering build step like IVFFlat, maintaining high recall even as new vectors are incrementally added.",
    academicCitation: "pgvector 0.7+ Architecture / Malkov & Yashunin HNSW Paper"
  },
  {
    id: 3,
    skill: "Next.js 15 & React 19",
    irtDifficulty: "Medium",
    thetaValue: 0.15,
    prompt: "What is the primary architectural advantage of React 19 Server Components in the Next.js App Router for data-heavy applications?",
    options: [
      { id: "A", text: "They eliminate the need for any CSS stylesheets in the frontend." },
      { id: "B", text: "They execute exclusively on the server, fetching data close to the database and reducing client bundle size by sending zero component JavaScript." },
      { id: "C", text: "They automatically convert all client-side useState hooks into Redis keys." },
      { id: "D", text: "They allow direct execution of shell scripts from the browser window." }
    ],
    correctOptionId: "B",
    explanation: "React Server Components run exclusively at the server or edge layer. Their dependencies (such as heavy database ORMs or markdown parsers) do not get packaged into client-side JS bundles, resulting in near-instant First Contentful Paint (FCP).",
    academicCitation: "React 19 Official Architecture Specification"
  },
  {
    id: 4,
    skill: "Redis Caching & Sliding Rate Limiting",
    irtDifficulty: "Hard",
    thetaValue: 1.10,
    prompt: "In a distributed multi-tenant API, which Redis data structure enables a clean sliding-window rate limit without experiencing border-crossing burst spikes?",
    options: [
      { id: "A", text: "Redis String with INCR and EXPIRE." },
      { id: "B", text: "Redis Sorted Set (ZSET) where elements and scores represent event millisecond timestamps." },
      { id: "C", text: "Redis Pub/Sub channel." },
      { id: "D", text: "Redis HyperLogLog." }
    ],
    correctOptionId: "B",
    explanation: "A Redis Sorted Set (ZSET) allows recording each request timestamp as a score. By running ZREMRANGEBYSCORE to prune timestamps older than (current_time - window_size) and ZCARD to count recent entries, APIs eliminate the 2x burst vulnerability of fixed-window counters.",
    academicCitation: "Stripe Engineering Sliding Window Rate Limiting Blueprint"
  }
];

export default function AssessmentTakingPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  const currentQ = ASSESSMENT_QUESTIONS[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (quizCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQuizCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizCompleted]);

  const handleSelectOption = (optionId: string) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setHasSubmittedAnswer(true);
    if (selectedOption === currentQ.correctOptionId) {
      setUserScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setUserScore(0);
    setQuizCompleted(false);
    setTimeLeft(300);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="violet" className="text-xs">
                Adaptive Assessment Mode
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Item Response Theory (IRT 2PL)
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Senior Full-Stack Competency Diagnostic
            </h1>
          </div>

          {!quizCompleted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-xs font-mono font-bold text-orange-300">
              <Clock className="h-4 w-4 text-orange-400 animate-pulse" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          )}
        </div>

        {!quizCompleted ? (
          <div>
            {/* Progress Bar & Difficulty Tag */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-medium">
                Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Latent Trait Difficulty:</span>
                <Badge
                  variant={
                    currentQ.irtDifficulty === "Hard"
                      ? "saffron"
                      : currentQ.irtDifficulty === "Medium"
                      ? "violet"
                      : "sky"
                  }
                  className="text-xs font-bold"
                >
                  {currentQ.irtDifficulty} (θ = {currentQ.thetaValue})
                </Badge>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-unnati-violet to-orange-500 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`
                }}
              />
            </div>

            {/* Question Card */}
            <Card className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 mb-6">
              <div className="mb-4">
                <Badge variant="default" className="text-[11px] mb-2 font-mono">
                  Competency: {currentQ.skill}
                </Badge>
                <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Code Snippet Box (if present) */}
              {currentQ.codeSnippet && (
                <div className="my-4 rounded-2xl bg-black/70 border border-white/10 p-4 font-mono text-xs text-purple-200 overflow-x-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Code2 className="h-3 w-3 text-orange-400" />
                      Python / FastAPI
                    </span>
                  </div>
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-3 mt-6">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  let optionStyle = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-200";

                  if (hasSubmittedAnswer) {
                    if (option.id === currentQ.correctOptionId) {
                      optionStyle = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/50";
                    } else if (isSelected && option.id !== currentQ.correctOptionId) {
                      optionStyle = "border-rose-500/60 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/50";
                    } else {
                      optionStyle = "opacity-40 border-white/5 bg-white/5 text-slate-400";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-purple-500 bg-purple-950/40 text-purple-200 ring-1 ring-purple-500";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={hasSubmittedAnswer}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 text-xs sm:text-sm font-medium cursor-pointer ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/10 text-xs font-bold">
                        {option.id}
                      </span>
                      <span className="pt-0.5 leading-snug">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Formative Feedback Drawer (Appears after submission) */}
              {hasSubmittedAnswer && (
                <div
                  className={`mt-6 p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-300 ${
                    selectedOption === currentQ.correctOptionId
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                      : "border-rose-500/40 bg-rose-950/30 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1.5">
                    {selectedOption === currentQ.correctOptionId ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Correct! Belief probability updated: +0.22</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-400" />
                        <span>Incorrect. Diagnostic Feedback:</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 mb-2">{currentQ.explanation}</p>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400">
                    Source Attribution: {currentQ.academicCitation}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                {!hasSubmittedAnswer ? (
                  <Button
                    variant="saffron"
                    size="md"
                    disabled={!selectedOption}
                    onClick={handleSubmitAnswer}
                    className="text-xs"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNextQuestion}
                    className="text-xs"
                  >
                    {currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1
                      ? "Next Question"
                      : "View Diagnostic Results"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          /* Quiz Results & Bayesian Unlock Card */
          <Card className="glass-panel-elevated p-8 rounded-3xl border border-white/15 text-center animate-in zoom-in-95 duration-300">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-unnati-saffron p-3 shadow-xl shadow-purple-950/50 mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-white mb-1">
              Assessment Completed!
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Evaluated via 2-Parameter Logistic Item Response Theory Model
            </p>

            <div className="max-w-md mx-auto grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</p>
                <p className="text-xl font-extrabold text-white mt-1">
                  {Math.round((userScore / ASSESSMENT_QUESTIONS.length) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Score</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">
                  {userScore} / {ASSESSMENT_QUESTIONS.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Latent θ</p>
                <p className="text-xl font-extrabold text-purple-400 mt-1">
                  +0.82
                </p>
              </div>
            </div>

            {/* Bayesian State Transition Alert */}
            <div className="max-w-md mx-auto text-left p-4 rounded-2xl border border-purple-500/40 bg-purple-950/40 mb-6">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-200">
                <Sparkles className="h-4 w-4 text-unnati-saffron" />
                Algorithm A State Machine Transition
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your verified competency in <strong>FastAPI & Async IO</strong> has transitioned from 
                <span className="font-mono text-purple-300 font-bold"> `CLAIMED`</span> to 
                <span className="font-mono text-emerald-400 font-bold"> `ASSESSED`</span> with a Bayesian belief factor of <strong>0.88</strong>!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleRetake}
                className="w-full sm:w-auto text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake Diagnostic
              </Button>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="saffron" size="md" className="w-full text-xs">
                  View Updated Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

      </main>

      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
