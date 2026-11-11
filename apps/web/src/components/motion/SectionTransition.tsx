"use client";

import React from "react";

interface SectionTransitionProps {
  fromColor?: string;
  toColor?: string;
  heightPx?: number;
  pattern?: "glow" | "wave" | "line" | "none";
  className?: string;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  fromColor = "transparent",
  toColor = "transparent",
  heightPx = 32,
  pattern = "line",
  className = "",
}) => {
  return (
    <div
      className={`w-full relative pointer-events-none overflow-hidden ${className}`}
      style={{ height: `${heightPx}px` }}
      aria-hidden="true"
    >
      {/* Background Gradient Blend */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
        }}
      />

      {/* Decorative Hairline Accent */}
      {pattern === "line" && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
      )}

      {/* Subtle Glow Beam */}
      {pattern === "glow" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-6 bg-purple-200/30 blur-md rounded-full" />
      )}
    </div>
  );
};

