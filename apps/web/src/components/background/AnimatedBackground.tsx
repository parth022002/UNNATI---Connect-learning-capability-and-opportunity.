"use client";

import React, { useEffect, useState } from "react";
import { BackgroundProps } from "./types";
import { GradientOrbs } from "./GradientOrbs";
import { GeometricGrid } from "./GeometricGrid";
import { FloatingParticles } from "./FloatingParticles";
import { ConnectionPaths } from "./ConnectionPaths";

/**
 * AnimatedBackground
 * 
 * Master website-wide animated background system for UNNATI.
 * Features:
 * - Multi-layered depth architecture (Geometric grid, Ambient gradient orbs, Floating particles, Learning trajectory paths)
 * - Page-specific variants (landing, auth, onboarding, dashboard, explore, assessments, roadmap, privacy, not-found)
 * - Smooth scroll-aware parallax with requestAnimationFrame throttling
 * - Full reduced-motion accessibility support
 * - Non-blocking pointer-events-none and zero horizontal overflow
 */
export const AnimatedBackground: React.FC<BackgroundProps> = ({
  variant = "default",
  intensity = "normal",
  showParticles = true,
  showGrid = true,
  showPaths = true,
  className = "",
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden max-w-full w-full z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Layer 1: Geometric Grid & Trajectory Rings */}
      {showGrid && <GeometricGrid variant={variant} />}

      {/* Layer 2: Ambient Gradient Orbs with Organic Drift & Scroll Parallax */}
      <GradientOrbs
        variant={variant}
        intensity={intensity}
        scrollY={scrollY}
      />

      {/* Layer 3: Career Progression & Trajectory Wave Lines */}
      {showPaths && <ConnectionPaths variant={variant} />}

      {/* Layer 4: Organic Floating Micro-Particles */}
      {showParticles && (
        <FloatingParticles variant={variant} intensity={intensity} />
      )}
    </div>
  );
};

