"use client";

import React from "react";
import { BackgroundVariant } from "./types";

interface ConnectionPathsProps {
  variant?: BackgroundVariant;
  className?: string;
}

export const ConnectionPaths: React.FC<ConnectionPathsProps> = ({
  variant = "default",
  className = "",
}) => {
  if (
    variant !== "roadmap" &&
    variant !== "explore" &&
    variant !== "landing" &&
    variant !== "onboarding"
  ) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12] motion-reduce:hidden"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#EA580C" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Primary Progression Wave Line (Discover -> Understand -> Build -> Demonstrate -> Grow) */}
        <path
          d="M -100 220 C 350 140, 500 380, 850 260 C 1150 160, 1300 340, 1550 280"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          className="animate-flow-dash"
        />

        {/* Secondary Lower Counter-Wave */}
        <path
          d="M -50 680 C 400 780, 650 560, 1000 680 C 1250 750, 1380 620, 1550 700"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="1.2"
          strokeDasharray="6 10"
          style={{ animationDuration: "35s" }}
          className="animate-flow-dash"
        />
      </svg>
    </div>
  );
};

