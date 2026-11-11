"use client";

import React, { useMemo } from "react";
import { BackgroundVariant, AnimationIntensity } from "./types";

interface FloatingParticlesProps {
  variant?: BackgroundVariant;
  intensity?: AnimationIntensity;
}

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  color: string;
  blur: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  variant = "default",
  intensity = "normal",
}) => {
  // Deterministic particle generation per variant to prevent hydration mismatches
  const particles = useMemo<Particle[]>(() => {
    const count =
      intensity === "subtle" ? 10 : intensity === "rich" ? 22 : 16;

    // Palette based on variant
    const palettes: Record<string, string[]> = {
      landing: [
        "rgba(109, 40, 217, 0.45)", // violet
        "rgba(234, 88, 12, 0.4)",   // saffron
        "rgba(167, 139, 250, 0.5)", // lavender
        "rgba(20, 184, 166, 0.35)", // teal
        "rgba(255, 138, 0, 0.4)",   // amber
      ],
      auth: [
        "rgba(167, 139, 250, 0.35)",
        "rgba(234, 88, 12, 0.25)",
        "rgba(109, 40, 217, 0.3)",
      ],
      onboarding: [
        "rgba(124, 58, 237, 0.4)",
        "rgba(234, 88, 12, 0.35)",
        "rgba(16, 185, 129, 0.35)",
      ],
      dashboard: [
        "rgba(109, 40, 217, 0.35)",
        "rgba(20, 184, 166, 0.35)",
        "rgba(167, 139, 250, 0.4)",
      ],
      explore: [
        "rgba(109, 40, 217, 0.45)",
        "rgba(20, 184, 166, 0.4)",
        "rgba(234, 88, 12, 0.35)",
        "rgba(99, 102, 241, 0.4)",
      ],
      assessments: [
        "rgba(109, 40, 217, 0.4)",
        "rgba(16, 185, 129, 0.35)",
        "rgba(167, 139, 250, 0.35)",
      ],
      roadmap: [
        "rgba(109, 40, 217, 0.45)",
        "rgba(234, 88, 12, 0.45)",
        "rgba(16, 185, 129, 0.4)",
        "rgba(217, 70, 239, 0.35)",
      ],
      privacy: [
        "rgba(167, 139, 250, 0.25)",
        "rgba(100, 116, 139, 0.25)",
        "rgba(16, 185, 129, 0.2)",
      ],
      "not-found": [
        "rgba(167, 139, 250, 0.4)",
        "rgba(234, 88, 12, 0.35)",
        "rgba(109, 40, 217, 0.35)",
      ],
    };

    const palette = palettes[variant] || palettes.landing;

    // Stable seed coordinates distributed across viewport
    const coords = [
      { top: "8%", left: "12%" },
      { top: "14%", left: "84%" },
      { top: "22%", left: "45%" },
      { top: "28%", left: "20%" },
      { top: "35%", left: "75%" },
      { top: "42%", left: "8%" },
      { top: "48%", left: "90%" },
      { top: "54%", left: "32%" },
      { top: "62%", left: "68%" },
      { top: "68%", left: "15%" },
      { top: "75%", left: "82%" },
      { top: "82%", left: "40%" },
      { top: "88%", left: "62%" },
      { top: "92%", left: "24%" },
      { top: "18%", left: "60%" },
      { top: "58%", left: "50%" },
      { top: "25%", left: "88%" },
      { top: "72%", left: "4%" },
      { top: "85%", left: "92%" },
      { top: "12%", left: "35%" },
      { top: "40%", left: "62%" },
      { top: "65%", left: "85%" },
    ];

    return coords.slice(0, count).map((coord, idx) => ({
      id: idx,
      top: coord.top,
      left: coord.left,
      size: (idx % 3 === 0 ? 5 : idx % 2 === 0 ? 4 : 3),
      color: palette[idx % palette.length],
      blur: idx % 2 === 0 ? 1 : 0.5,
      duration: 14 + (idx % 5) * 3, // 14s to 26s
      delay: (idx * 0.75) % 6,
      opacity: 0.35 + (idx % 4) * 0.12,
    }));
  }, [variant, intensity]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full motion-reduce:animate-none"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            filter: `blur(${p.blur}px)`,
            opacity: p.opacity,
            animation: `ambientParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
};

