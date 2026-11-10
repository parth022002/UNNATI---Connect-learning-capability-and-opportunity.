"use client";

import React from "react";

export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top Ambient Glow with Brand Tint */}
      <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-purple-100/40 via-orange-50/30 to-transparent blur-3xl opacity-70" />

      {/* Floating Animated Violet Ambient Glow */}
      <div 
        className="ambient-glow-violet w-[500px] h-[500px] -top-20 -left-20 animate-pulse-slow" 
      />

      {/* Floating Animated Saffron Ambient Glow */}
      <div 
        className="ambient-glow-saffron w-[450px] h-[450px] top-[10%] -right-20 animate-pulse-slow" 
        style={{ animationDelay: "2.5s" }}
      />

      {/* Subtle Warm Grid Pattern with Fade Vignette */}
      <div 
        className="absolute inset-0 bg-grid-soft opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" 
      />
    </div>
  );
};
