"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "down" | "none";
}

/**
 * Accessible Scroll-Triggered Reveal Component.
 * Automatically respects `prefers-reduced-motion` and provides smooth GPU-accelerated reveals.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delayMs = 0,
  direction = "up"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user prefers reduced motion, show immediately without animation
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  const getTransformStyle = () => {
    if (isVisible) return "opacity-100 translate-y-0 scale-100";
    if (direction === "up") return "opacity-0 translate-y-6 scale-[0.99]";
    if (direction === "down") return "opacity-0 -translate-y-6 scale-[0.99]";
    return "opacity-0";
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: `${delayMs}ms`,
        transitionDuration: "650ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className={`transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${getTransformStyle()} ${className}`}
    >
      {children}
    </div>
  );
};

