"use client";

import React from "react";
import { AnimatedBackground, BackgroundProps } from "@/components/background";

/**
 * BackgroundAtmosphere
 * 
 * Re-exports the unified website-wide AnimatedBackground system for backwards compatibility.
 * Accepts optional variant, intensity, and layer flags.
 */
export const BackgroundAtmosphere: React.FC<BackgroundProps> = (props) => {
  return <AnimatedBackground {...props} />;
};

export default BackgroundAtmosphere;
