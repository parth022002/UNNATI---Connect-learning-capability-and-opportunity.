"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  ChevronRight,
  Target,
  Briefcase,
  PieChart,
  Code2
} from "lucide-react";

interface Question {
  id: number;
  track: "business" | "data" | "tech";
  skill: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  prompt: string;
  scenario?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  practicalTakeaway: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // Business & Product Track
  {
    id: 1,
    track: "business",
    skill: "Product Prioritization",
    difficulty: "Intermediate",
    prompt: "When prioritizing features under the RICE framework, what happens if an initiative has very high Effort with moderate Reach and Impact?",
    scenario: "Your team is deciding between building an automated PDF exporter (Reach: 200, Impact: 1, Confidence: 80%, Effort: 5 person-weeks) versus a 1-click Quick Filter (Reach: 5,000, Impact: 2, Confidence: 90%, Effort: 1 person-week).",
    options: [
      { id: "A", text: "The high-effort project receives a higher RICE score because difficulty signals strategic differentiation." },
      { id: "B", text: "Effort is the denominator in RICE: higher effort drastically reduces the overall score, making quick-win high-reach items rank higher." },
      { id: "C", text: "Effort is multiplied with Reach and Impact, so higher effort increases the project score." },
      { id: "D", text: "The RICE framework does not account for development effort." }
    ],
    correctOptionId: "B",
    explanation: "In RICE = (Reach × Impact × Confidence) / Effort, Effort is in the denominator. When effort is high relative to reach and impact, the priority score drops, ensuring teams focus on maximum ROI first.",
    practicalTakeaway: "Use RICE or MoSCoW to prevent high-effort edge-case features from delaying high-impact core user value."
  },
  {
    id: 2,
    track: "business",
    skill: "Business Metrics & Analytics",
    difficulty: "Foundational",
    prompt: "If your subscription platform observes that Customer Acquisition Cost (CAC) is ₹4,500 and Customer Lifetime Value (LTV) is ₹3,000, what is the core business problem?",
    options: [
      { id: "A", text: "The platform is highly profitable because acquisition is outpacing churn." },
      { id: "B", text: "The unit economics are unsustainable (LTV:CAC < 1:1); the company loses money on every acquired customer." },
      { id: "C", text: "The platform should immediately double advertising spend to lower the LTV." },
      { id: "D", text: "LTV and CAC have no direct relationship in business financial health." }
    ],
    correctOptionId: "B",
    explanation: "Healthy unit economics generally require an LTV to CAC ratio of at least 3:1. When LTV is lower than CAC, every newly acquired customer destroys value rather than generating profit.",
    practicalTakeaway: "Focus on improving retention/expansion revenue or reducing acquisition channels before scaling customer acquisition."
  },
  // Data Track
  {
    id: 3,
    track: "data",
    skill: "Data-Driven Decision Making",
    difficulty: "Intermediate",
    prompt: "In an A/B test with 50,000 users per variant, Variant B shows a 4% lift in click-through rate with p = 0.01. What does this statistical result indicate?",
    options: [
      { id: "A", text: "There is only a 1% probability that Variant B works." },
      { id: "B", text: "The observed lift is statistically significant (p < 0.05), meaning it is very unlikely to be caused by random chance alone." },
      { id: "C", text: "All users in Variant B will unconditionally purchase the product." },
      { id: "D", text: "The test is inconclusive and must run for another year." }
    ],
    correctOptionId: "B",
    explanation: "A p-value of 0.01 (below the standard threshold of 0.05) means there is only a 1% chance the observed difference happened under the null hypothesis (random noise).",
    practicalTakeaway: "Combine statistical significance with practical significance to ensure metric lifts warrant product rollout."
  },
  // Tech & Engineering Track
  {
    id: 4,
    track: "tech",
    skill: "Web Architecture & API Design",
    difficulty: "Intermediate",
    prompt: "Why should web applications handle long-running operations (such as document processing or video rendering) via asynchronous background tasks rather than synchronous HTTP requests?",
    options: [
      { id: "A", text: "Synchronous HTTP requests block browser connections, cause gateway timeouts (504), and degrade user experience." },
      { id: "B", text: "HTTP does not allow transmitting files larger than 10 kilobytes." },
      { id: "C", text: "Because background tasks cannot be executed in cloud environments." },
      { id: "D", text: "Synchronous requests automatically crash database servers." }
    ],
    correctOptionId: "A",
    explanation: "Standard web requests expect responses within milliseconds. Long tasks block server worker threads and cause browser client timeouts. Decoupling work into background workers with task status polling or webhooks provides resilience.",
    practicalTakeaway: "Always offload jobs taking longer than 500ms to background task queues."
  }
];

export default function AssessmentTakingPage() {
  const [selectedTrack, setSelectedTrack] = useState<"all" | "business" | "data" | "tech">("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  const activeQuestions = ASSESSMENT_QUESTIONS.filter(
    (q) => selectedTrack === "all" || q.track === selectedTrack
  );

  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

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
    if (currentQuestionIndex < activeQuestions.length - 1) {
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

  const handleTrackChange = (track: "all" | "business" | "data" | "tech") => {
    setSelectedTrack(track);
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
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Track Filter Tabs */}
        {!quizCompleted && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="violet" className="text-xs font-semibold">
                  Diagnostic Self-Assessment
                </Badge>
                <span className="text-xs text-slate-700 font-medium">
                  Objective Skill Verification
                </span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                Capability Diagnostic &amp; Readiness Check
              </h1>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
              <Clock className="h-4 w-4 text-orange-600 animate-pulse" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          </div>
        )}

        {/* Track Selector */}
        {!quizCompleted && (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Disciplines", icon: Target },
              { id: "business", label: "Business & Product", icon: Briefcase },
              { id: "data", label: "Data & Analytics", icon: PieChart },
              { id: "tech", label: "Technology & Web", icon: Code2 }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTrackChange(t.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedTrack === t.id
                      ? "bg-purple-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {!quizCompleted ? (
          <div>
            {/* Progress Bar & Difficulty Tag */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-700 font-semibold">
                Question {currentQuestionIndex + 1} of {activeQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Difficulty:</span>
                <Badge
                  variant={
                    currentQ.difficulty === "Advanced"
                      ? "saffron"
                      : currentQ.difficulty === "Intermediate"
                      ? "violet"
                      : "sky"
                  }
                  className="text-xs font-semibold"
                >
                  {currentQ.difficulty}
                </Badge>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-200 mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-800 to-orange-500 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`
                }}
              />
            </div>

            {/* Question Card */}
            <Card className="clean-card p-6 sm:p-8 rounded-3xl mb-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-[11px] font-semibold bg-slate-100 text-slate-700">
                    Skill: {currentQ.skill}
                  </Badge>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Scenario Box (if present) */}
              {currentQ.scenario && (
                <div className="my-4 rounded-2xl bg-purple-50/70 border border-purple-100 p-4 text-xs text-purple-900 leading-relaxed">
                  <strong className="block text-purple-950 font-bold mb-1">Practical Scenario:</strong>
                  {currentQ.scenario}
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-3 mt-6">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";

                  if (hasSubmittedAnswer) {
                    if (option.id === currentQ.correctOptionId) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                    } else if (isSelected && option.id !== currentQ.correctOptionId) {
                      optionStyle = "border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-400/20";
                    } else {
                      optionStyle = "opacity-50 border-slate-200 bg-slate-50 text-slate-500";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-purple-600 bg-purple-50/80 text-purple-950 ring-2 ring-purple-600/20";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={hasSubmittedAnswer}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 text-xs sm:text-sm font-medium cursor-pointer shadow-sm ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                        {option.id}
                      </span>
                      <span className="pt-0.5 leading-snug">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Formative Feedback (Appears after submission) */}
              {hasSubmittedAnswer && (
                <div
                  className={`mt-6 p-5 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-300 ${
                    selectedOption === currentQ.correctOptionId
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-2">
                    {selectedOption === currentQ.correctOptionId ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-bold">Excellent! Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600" />
                        <span className="text-sm font-bold">Concept Explanation &amp; Review</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 mb-2 leading-relaxed">{currentQ.explanation}</p>
                  <div className="pt-2 border-t border-slate-200/60 font-semibold text-purple-900">
                    Key Takeaway: {currentQ.practicalTakeaway}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                {!hasSubmittedAnswer ? (
                  <Button
                    variant="saffron"
                    size="md"
                    disabled={!selectedOption}
                    onClick={handleSubmitAnswer}
                    className="text-xs font-bold"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNextQuestion}
                    className="text-xs font-bold"
                  >
                    {currentQuestionIndex < activeQuestions.length - 1
                      ? "Next Question"
                      : "View Diagnostic Results"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          /* Quiz Results & Capability Level-Up Card */
          <Card className="clean-card p-8 sm:p-10 rounded-3xl text-center animate-in zoom-in-95 duration-300">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-800 to-orange-500 p-3 shadow-md mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
              Diagnostic Assessment Complete!
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 mb-6">
              Your responses have been evaluated against verified industry competency benchmarks.
            </p>

            <div className="max-w-md mx-auto grid grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 mb-6">
              <div>
                <p className="text-[10px] text-slate-700 uppercase font-semibold">Accuracy</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {Math.round((userScore / activeQuestions.length) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-700 uppercase font-semibold">Correct</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-1">
                  {userScore} / {activeQuestions.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-700 uppercase font-semibold">Confidence</p>
                <p className="text-xl font-extrabold text-purple-900 mt-1">
                  High
                </p>
              </div>
            </div>

            {/* Profile Level-Up Alert */}
            <div className="max-w-md mx-auto text-left p-4 rounded-2xl border border-purple-200 bg-purple-50/80 mb-6">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-purple-950">
                <Sparkles className="h-4 w-4 text-orange-600" />
                Verified Skill Profile Updated
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your assessed competencies have graduated from <strong className="text-slate-900">Self-Reported</strong> to <strong className="text-purple-900">Diagnostic Verified</strong>. Your learning roadmap has dynamically updated to focus on remaining growth areas.
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

      <Footer />

      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
