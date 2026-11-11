"use client";

import React from "react";
import { BackgroundVariant, AnimationIntensity } from "./types";

interface GradientOrbsProps {
  variant?: BackgroundVariant;
  intensity?: AnimationIntensity;
  scrollY?: number;
}

export const GradientOrbs: React.FC<GradientOrbsProps> = ({
  variant = "default",
  intensity = "normal",
  scrollY = 0,
}) => {
  // Parallax subtle offset calculation (dampened, GPU translate)
  const parallaxOffset = Math.min(scrollY * 0.08, 120);

  // Opacity multiplier based on intensity
  const opacityClass =
    intensity === "subtle"
      ? "opacity-60"
      : intensity === "rich"
      ? "opacity-100"
      : "opacity-80";

  switch (variant) {
    case "landing":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* 1. Hero Ambient Halo (Soft Lavender & Peach) */}
          <div
            className="absolute -top-[16%] left-1/2 -translate-x-1/2 w-[1150px] h-[700px] bg-gradient-to-b from-purple-100/55 via-orange-50/40 to-transparent blur-[95px] motion-reduce:animate-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(-50%, ${-parallaxOffset * 0.4}px, 0)`,
            }}
          />

          {/* 2. Top-Left Floating Animated Lavender Orb */}
          <div
            className="absolute -top-20 -left-24 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-200/28 via-violet-200/18 to-transparent blur-[85px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.2}px, 0)`,
            }}
          />

          {/* 3. Top-Right Floating Animated Warm Saffron/Peach Orb */}
          <div
            className="absolute top-[6%] -right-20 w-[540px] h-[540px] rounded-full bg-gradient-to-bl from-orange-200/22 via-amber-100/18 to-transparent blur-[90px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{
              animationDelay: "2.5s",
              transform: `translate3d(0, ${parallaxOffset * 0.3}px, 0)`,
            }}
          />

          {/* 4. Audience Stage Gentle Neutral Glow (Mid-Top) */}
          <div
            className="absolute top-[26%] -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-r from-purple-100/22 via-orange-50/15 to-transparent blur-[100px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "5s" }}
          />

          {/* 5. Career Journey Moving Light Beam (Mid-Page) */}
          <div
            className="absolute top-[48%] -right-32 w-[680px] h-[680px] rounded-full bg-gradient-to-l from-violet-100/25 via-amber-50/15 to-transparent blur-[105px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{ animationDelay: "7.5s" }}
          />

          {/* 6. Diagnostic Section Soft Purple Atmosphere */}
          <div
            className="absolute top-[68%] -left-28 w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-purple-200/20 via-indigo-100/15 to-transparent blur-[95px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "10s" }}
          />

          {/* 7. CTA & Pre-Footer Warm Saffron Horizon */}
          <div
            className="absolute top-[88%] -right-28 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-orange-100/22 via-purple-100/15 to-transparent blur-[100px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{ animationDelay: "12.5s" }}
          />
        </div>
      );

    case "auth":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Top-Left Soft Lavender Orb */}
          <div className="absolute top-[10%] -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-200/25 via-violet-100/15 to-transparent blur-[80px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Bottom-Right Warm Saffron Orb */}
          <div
            className="absolute bottom-[10%] -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-orange-100/22 via-amber-50/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "3s" }}
          />
        </div>
      );

    case "onboarding":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Top Center Growth Halo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-purple-100/40 via-orange-50/30 to-transparent blur-[80px]" />
          {/* Left Milestone Orb */}
          <div className="absolute top-[30%] -left-24 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-200/20 via-violet-100/15 to-transparent blur-[80px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Right Advance Orb */}
          <div
            className="absolute top-[60%] -right-24 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-emerald-100/20 via-orange-100/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "4s" }}
          />
        </div>
      );

    case "dashboard":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Subtle Top-Left Competency Glow */}
          <div className="absolute -top-10 left-[10%] w-[550px] h-[450px] rounded-full bg-gradient-to-tr from-purple-100/25 via-violet-50/15 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Center-Right Study Hours Glow */}
          <div
            className="absolute top-[35%] -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-teal-100/20 via-purple-100/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "3.5s" }}
          />
          {/* Bottom Left Roadmap Track Glow */}
          <div
            className="absolute bottom-10 left-[5%] w-[480px] h-[400px] rounded-full bg-gradient-to-tr from-orange-100/18 via-purple-50/12 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{ animationDelay: "7s" }}
          />
        </div>
      );

    case "explore":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Top Discovery Nebula (Violet + Teal) */}
          <div className="absolute -top-16 left-[20%] w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-violet-200/24 via-teal-100/18 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Mid Comparison Engine Glow */}
          <div
            className="absolute top-[40%] -left-20 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-purple-200/20 via-amber-100/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "4s" }}
          />
          {/* Bottom Right Opportunities Glow */}
          <div
            className="absolute bottom-20 -right-20 w-[560px] h-[560px] rounded-full bg-gradient-to-bl from-orange-100/22 via-indigo-100/15 to-transparent blur-[95px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{ animationDelay: "8s" }}
          />
        </div>
      );

    case "assessments":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Top Analytical Focus Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-purple-100/35 via-violet-50/20 to-transparent blur-[85px]" />
          {/* Left Verification Glow */}
          <div className="absolute top-[35%] -left-20 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-emerald-100/22 via-purple-100/15 to-transparent blur-[80px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Right Precision Glow */}
          <div
            className="absolute bottom-[20%] -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-purple-200/20 via-orange-100/12 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "3s" }}
          />
        </div>
      );

    case "roadmap":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Stage 1 Foundations Glow (Top Left) */}
          <div className="absolute top-[5%] -left-20 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-purple-200/25 via-indigo-100/18 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none" />
          {/* Stage 2 Core Milestone Glow (Mid Right) */}
          <div
            className="absolute top-[35%] -right-24 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-orange-200/22 via-amber-100/15 to-transparent blur-[95px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "3.5s" }}
          />
          {/* Stage 3 Specialization Glow (Mid Left) */}
          <div
            className="absolute top-[65%] -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-emerald-100/24 via-purple-100/15 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none"
            style={{ animationDelay: "7s" }}
          />
          {/* Stage 4 Verified Growth Glow (Bottom Right) */}
          <div
            className="absolute bottom-[5%] -right-20 w-[560px] h-[560px] rounded-full bg-gradient-to-tl from-purple-200/22 via-fuchsia-100/15 to-transparent blur-[95px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "10.5s" }}
          />
        </div>
      );

    case "privacy":
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          {/* Calm, Trustworthy Top Halo */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-b from-purple-100/25 via-slate-100/20 to-transparent blur-[80px]" />
          {/* Subdued Emerald Compliance Glow */}
          <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-emerald-100/18 via-purple-50/10 to-transparent blur-[85px]" />
        </div>
      );

    case "not-found":
    default:
      return (
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${opacityClass}`}
          aria-hidden="true"
        >
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-purple-200/28 via-orange-100/18 to-transparent blur-[90px] animate-ambient-drift-1 motion-reduce:animate-none" />
          <div
            className="absolute bottom-[15%] left-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-violet-200/20 via-amber-100/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none"
            style={{ animationDelay: "4s" }}
          />
        </div>
      );
  }
};

