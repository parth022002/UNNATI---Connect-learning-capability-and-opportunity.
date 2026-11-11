"use client";

import React, { createContext, useContext } from "react";
import { useInView } from "./hooks/useInView";

interface StaggerContextType {
  isInView: boolean;
  delayStepMs: number;
  durationMs: number;
}

const StaggerContext = createContext<StaggerContextType>({
  isInView: false,
  delayStepMs: 100,
  durationMs: 500,
});

interface StaggerContainerProps {
  children: React.ReactNode;
  delayStepMs?: number;
  durationMs?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  delayStepMs = 120,
  durationMs = 600,
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
  className = "",
}) => {
  const { ref, isInView } = useInView({ threshold, rootMargin, triggerOnce: true });

  return (
    <StaggerContext.Provider value={{ isInView, delayStepMs, durationMs }}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  index,
  direction = "up",
  className = "",
}) => {
  const { isInView, delayStepMs, durationMs } = useContext(StaggerContext);

  const delay = index * delayStepMs;

  const getTransform = () => {
    if (isInView) return "opacity-100 translate-x-0 translate-y-0 scale-100";
    switch (direction) {
      case "up":
        return "opacity-0 translate-y-8 scale-[0.98]";
      case "down":
        return "opacity-0 -translate-y-8 scale-[0.98]";
      case "left":
        return "opacity-0 translate-x-8 scale-[0.98]";
      case "right":
        return "opacity-0 -translate-x-8 scale-[0.98]";
      case "scale":
        return "opacity-0 scale-95";
      case "none":
      default:
        return "opacity-0";
    }
  };

  return (
    <div
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 will-change-transform ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};

