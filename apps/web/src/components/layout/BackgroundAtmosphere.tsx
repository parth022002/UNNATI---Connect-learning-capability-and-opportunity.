"use client";

import React from "react";

/**
 * Animated Ambient Background Atmosphere.
 * Multi-layer blurred gradient orbs with slow-moving drift that transition subtly
 * without compromising text contrast or performance.
 */
export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* 1. Top Soft Lavender & Peach Ambient Cone */}
      <div 
        className="absolute -top-[18%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-purple-100/50 via-orange-50/35 to-transparent blur-[90px] opacity-75 motion-reduce:animate-none" 
      />

      {/* 2. Floating Animated Lavender Orb (Top-Left) */}
      <div 
        className="absolute -top-24 -left-28 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-purple-200/25 via-violet-200/15 to-transparent blur-[80px] animate-ambient-drift-1 motion-reduce:animate-none" 
      />

      {/* 3. Floating Animated Warm Peach Orb (Top-Right) */}
      <div 
        className="absolute top-[8%] -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-orange-200/20 via-amber-100/15 to-transparent blur-[85px] animate-ambient-drift-2 motion-reduce:animate-none" 
        style={{ animationDelay: "3s" }}
      />

      {/* 4. Mid-Page Gentle Violet Ambient Glow */}
      <div 
        className="absolute top-[42%] -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-100/20 to-transparent blur-[95px] animate-ambient-drift-2 motion-reduce:animate-none"
        style={{ animationDelay: "6s" }}
      />

      {/* 5. Lower-Page Warm Saffron Ambient Glow */}
      <div 
        className="absolute top-[70%] -right-32 w-[620px] h-[620px] rounded-full bg-gradient-to-l from-orange-100/20 via-purple-50/15 to-transparent blur-[100px] animate-ambient-drift-1 motion-reduce:animate-none"
        style={{ animationDelay: "9s" }}
      />

      {/* 6. Subtle Warm Technical Grid Overlay with Radial Vignette Mask */}
      <div 
        className="absolute inset-0 bg-grid-soft opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" 
      />
    </div>
  );
};
