"use client";

import React from "react";

/**
 * 21hrs-inspired Ambient Background Atmosphere.
 * Multi-layer blurred gradient orbs with subtle organic drift, designed to guide the eye
 * down the page journey through gentle color shifts without compromising text legibility or performance.
 *
 * Storytelling Progression:
 * 1. Hero: Soft lavender & warm peach ambient cone
 * 2. Audience: Warm neutral sand & soft violet accents
 * 3. Career Journey: Subtle moving light & connecting paths
 * 4. Product Showcase: Soft lavender & peach glow
 * 5. Diagnostic: Soft purple glow
 * 6. Trust & Privacy: Seamless blend into deep midnight
 * 7. FAQ & CTA: Gentle purple gradient & calm neutral footer
 */
export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-full w-full z-0" aria-hidden="true">
      {/* 1. Hero Ambient Halo (Soft Lavender & Delicate Peach) */}
      <div 
        className="absolute -top-[16%] left-1/2 -translate-x-1/2 w-[1150px] h-[700px] bg-gradient-to-b from-purple-100/55 via-orange-50/40 to-transparent blur-[95px] opacity-80 motion-reduce:animate-none" 
      />

      {/* 2. Top-Left Floating Animated Lavender Orb (Subtle Organic Drift) */}
      <div 
        className="absolute -top-20 -left-24 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-200/28 via-violet-200/18 to-transparent blur-[85px] animate-ambient-drift-1 motion-reduce:animate-none" 
      />

      {/* 3. Top-Right Floating Animated Warm Saffron/Peach Orb */}
      <div 
        className="absolute top-[6%] -right-20 w-[540px] h-[540px] rounded-full bg-gradient-to-bl from-orange-200/22 via-amber-100/18 to-transparent blur-[90px] animate-ambient-drift-2 motion-reduce:animate-none" 
        style={{ animationDelay: "2.5s" }}
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

      {/* 6. Diagnostic Section Soft Purple Atmosphere (Lower Mid-Page) */}
      <div 
        className="absolute top-[68%] -left-28 w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-purple-200/20 via-indigo-100/15 to-transparent blur-[95px] animate-ambient-drift-2 motion-reduce:animate-none"
        style={{ animationDelay: "10s" }}
      />

      {/* 7. CTA & Pre-Footer Warm Saffron Horizon */}
      <div 
        className="absolute top-[88%] -right-28 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-orange-100/22 via-purple-100/15 to-transparent blur-[100px] animate-ambient-drift-1 motion-reduce:animate-none"
        style={{ animationDelay: "12.5s" }}
      />

      {/* 8. Technical Subtle Precision Grid Overlay with Radial Vignette */}
      <div 
        className="absolute inset-0 bg-grid-soft opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" 
      />
    </div>
  );
};
