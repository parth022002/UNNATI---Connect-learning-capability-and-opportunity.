"use client";

import React, { useState } from "react";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { 
  Compass, 
  Layers, 
  Target, 
  MapPin, 
  Award, 
  RefreshCw, 
  Check, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export interface JourneyStage {
  num: string;
  title: string;
  tag: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  accentBorder: string;
  pillColor: string;
}

const STAGES: JourneyStage[] = [
  {
    num: "01",
    title: "Discover Direction",
    tag: "Path Exploration",
    desc: "Explore 20+ pathways across Business, Analytics, Finance, Design, and Tech with real compensation benchmarks.",
    icon: Compass,
    color: "text-purple-600",
    bg: "bg-purple-50",
    accentBorder: "border-purple-300",
    pillColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    num: "02",
    title: "Ingest Baseline",
    tag: "4-Tier Ledger",
    desc: "Extract coursework, projects, and skills into verified ledger: Self-Reported, Resume, Assessed, and Verified.",
    icon: Layers,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    accentBorder: "border-indigo-300",
    pillColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    num: "03",
    title: "Pinpoint Gaps",
    tag: "Bayesian Delta",
    desc: "Compare your profile against target role benchmarks to pinpoint high-impact capability gaps with precision.",
    icon: Target,
    color: "text-orange-600",
    bg: "bg-orange-50",
    accentBorder: "border-orange-300",
    pillColor: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    num: "04",
    title: "Build Roadmap",
    tag: "Topological DAG",
    desc: "Follow an ordered 3-phase milestone curriculum tailored to your weekly schedule so foundations precede advanced work.",
    icon: MapPin,
    color: "text-violet-600",
    bg: "bg-violet-50",
    accentBorder: "border-violet-300",
    pillColor: "bg-violet-100 text-violet-800 border-violet-200",
  },
  {
    num: "05",
    title: "Demonstrate",
    tag: "Proof of Work",
    desc: "Build hands-on capstones and complete 10-minute diagnostic checks to earn Verified competency status.",
    icon: Award,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    accentBorder: "border-emerald-300",
    pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    num: "06",
    title: "Grow & Reassess",
    tag: "Continuous Loop ↻",
    desc: "Your readiness dynamically updates. Lock in milestone achievements, unlock senior specializations, and loop seamlessly.",
    icon: RefreshCw,
    color: "text-amber-600",
    bg: "bg-amber-50",
    accentBorder: "border-amber-300",
    pillColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

export const JourneyTimelineProgress: React.FC = () => {
  const { ref: containerRef, progress } = useScrollProgress<HTMLDivElement>();
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  // Map progress (0 to 1) into active stage thresholds
  // 0.0 - 0.18: Stage 0 (Stage 1 in UI)
  // 0.18 - 0.35: Stage 1
  // 0.35 - 0.52: Stage 2
  // 0.52 - 0.69: Stage 3
  // 0.69 - 0.86: Stage 4
  // 0.86 - 1.00: Stage 5
  const getActiveStageIndex = (): number => {
    if (progress >= 0.86) return 5;
    if (progress >= 0.69) return 4;
    if (progress >= 0.52) return 3;
    if (progress >= 0.35) return 2;
    if (progress >= 0.18) return 1;
    return 0;
  };

  const activeIndex = hoveredStage !== null ? hoveredStage : getActiveStageIndex();

  // Normalized progress percentage for the connecting line (0% to 100%)
  const linePercent = Math.max(0, Math.min(100, Math.round(((progress - 0.1) / 0.8) * 100)));

  return (
    <div ref={containerRef} className="w-full relative">
      {/* ========================================================
          DESKTOP PROGRESSION SPINE (Horizontal Layout)
          ======================================================== */}
      <div className="hidden lg:block mb-10 relative">
        {/* Background Inactive Track */}
        <div className="absolute top-[18px] left-[7%] right-[7%] h-[3px] bg-slate-200/90 z-0 rounded-full" />

        {/* Animated Active Gradient Line */}
        <div
          className="absolute top-[18px] left-[7%] h-[3px] bg-gradient-to-r from-purple-600 via-orange-500 to-emerald-500 z-0 rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${(linePercent * 0.86).toFixed(1)}%` }}
        />

        {/* 6 Milestone Nodes */}
        <div className="grid grid-cols-6 gap-5 relative z-10">
          {STAGES.map((stage, i) => {
            const isReached = i <= activeIndex;
            const isCurrent = i === activeIndex;

            return (
              <button
                key={stage.num}
                type="button"
                onClick={() => setHoveredStage(i)}
                onMouseEnter={() => setHoveredStage(i)}
                onMouseLeave={() => setHoveredStage(null)}
                className="flex flex-col items-center group cursor-pointer text-left focus:outline-none"
                aria-label={`Milestone ${stage.num}: ${stage.title}`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-soft-sm transition-all duration-300 ${
                    isCurrent
                      ? "bg-purple-900 border-unnati-saffron text-white ring-4 ring-orange-200 scale-110 shadow-glow-violet"
                      : isReached
                      ? "bg-purple-700 border-purple-500 text-white"
                      : "bg-white border-slate-300 text-slate-500 group-hover:border-purple-300"
                  }`}
                >
                  {isReached && !isCurrent ? (
                    <Check className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <span>{stage.num}</span>
                  )}
                </div>

                <span
                  className={`text-[11px] font-bold uppercase tracking-wider mt-2 transition-colors duration-200 ${
                    isCurrent
                      ? "text-purple-900 font-extrabold"
                      : isReached
                      ? "text-purple-700"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                >
                  {stage.title.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          DESKTOP & TABLET CARDS GRID (1 Col Mobile, 3 Col Tablet, 6 Col Desktop)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 relative z-10">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isReached = i <= activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div
              key={stage.num}
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
              className={`clean-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                isCurrent
                  ? "border-purple-400 shadow-soft-lg ring-2 ring-purple-100 bg-white -translate-y-1.5"
                  : isReached
                  ? "border-slate-200/90 bg-white/95 hover:border-purple-200"
                  : "border-slate-200/60 bg-white/80 opacity-90 hover:opacity-100 hover:border-slate-300"
              }`}
            >
              {/* Active Indicator Top Tag */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-orange-400 animate-pulse" />
                  Active
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-transform duration-300 ${stage.bg} ${
                      isCurrent ? "scale-110 shadow-sm" : "group-hover:scale-105"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${stage.color}`} />
                  </div>
                  <span
                    className={`font-mono text-xs font-bold transition-colors ${
                      isCurrent ? "text-purple-900" : "text-slate-400"
                    }`}
                  >
                    {stage.num}
                  </span>
                </div>

                <div className="mb-2">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${stage.pillColor}`}
                  >
                    {stage.tag}
                  </span>
                </div>

                <h3 className="font-heading text-sm font-bold text-slate-900 tracking-tight mb-1.5">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {/* Step Flow Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className={isCurrent ? "text-purple-900" : "text-slate-400"}>
                  {isReached ? "Stage Reached" : "Pending"}
                </span>
                <ArrowRight
                  className={`h-3 w-3 transition-transform ${
                    isCurrent ? "translate-x-0.5 text-orange-600" : "text-slate-400"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

