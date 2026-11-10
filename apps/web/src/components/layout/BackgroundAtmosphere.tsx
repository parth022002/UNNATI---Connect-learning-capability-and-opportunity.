"use client";

import React from "react";

export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top Ambient Glow / Hero Glow */}
      <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] hero-glow opacity-80" />

      {/* Floating Animated Violet Orb */}
      <div 
        className="glow-orb-violet w-[550px] h-[550px] -top-24 -left-28 animate-pulse-slow" 
      />

      {/* Floating Animated Saffron Orb */}
      <div 
        className="glow-orb-saffron w-[500px] h-[500px] top-[15%] -right-28 animate-pulse-slow" 
        style={{ animationDelay: "2s" }}
      />

      {/* Deep Violet Center Core */}
      <div 
        className="glow-orb-violet w-[700px] h-[450px] top-[45%] left-1/3 -translate-x-1/2 opacity-30" 
      />

      {/* Subtle Tech Grid Pattern with Radial Vignette */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" 
      />

      {/* Diagonal Light Beam Accent */}
      <div 
        className="absolute top-0 right-1/4 w-[1px] h-[600px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent transform -rotate-12 pointer-events-none" 
      />
      <div 
        className="absolute top-1/3 left-1/5 w-[1px] h-[500px] bg-gradient-to-b from-transparent via-orange-500/15 to-transparent transform rotate-45 pointer-events-none" 
      />
    </div>
  );
};
