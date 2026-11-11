"use client";

import React from "react";
import { BackgroundVariant } from "./types";

interface GeometricGridProps {
  variant?: BackgroundVariant;
  className?: string;
}

export const GeometricGrid: React.FC<GeometricGridProps> = ({
  variant = "default",
  className = "",
}) => {
  // Variations in grid scale and opacity based on context
  const gridOpacity =
    variant === "auth" || variant === "privacy"
      ? "opacity-20"
      : variant === "dashboard" || variant === "assessments"
      ? "opacity-28"
      : "opacity-35";

  const showTrajectoryRings =
    variant === "landing" || variant === "explore" || variant === "roadmap";

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Precision Technical Grid with Radial Vignette */}
      <div
        className={`absolute inset-0 bg-grid-soft ${gridOpacity} [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]`}
      />

      {/* 2. Optional Ambient Geometry & Trajectory Rings */}
      {showTrajectoryRings && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] motion-reduce:hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#EA580C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Top-Right Ambient Orbit Ring */}
          <circle
            cx="85%"
            cy="18%"
            r="280"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="1"
            strokeDasharray="6 8"
          />

          {/* Mid-Left Exploration Trajectory Ring */}
          <circle
            cx="15%"
            cy="52%"
            r="380"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Lower Center Arc */}
          <circle
            cx="50%"
            cy="85%"
            r="440"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="1"
            strokeDasharray="8 10"
          />
        </svg>
      )}
    </div>
  );
};

