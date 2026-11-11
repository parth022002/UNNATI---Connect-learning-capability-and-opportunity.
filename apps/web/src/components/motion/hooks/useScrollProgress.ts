"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollProgressOptions {
  offset?: ["start end" | "start start" | "start center", "end start" | "end end" | "end center"];
}

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  _options: ScrollProgressOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    const element = ref.current;
    if (!element) return;

    let ticking = false;

    const updateProgress = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start when top of element enters bottom of viewport
      // End when bottom of element leaves top of viewport
      const totalDistance = windowHeight + rect.height;
      const currentPosition = windowHeight - rect.top;

      const rawProgress = currentPosition / totalDistance;
      const clamped = Math.max(0, Math.min(1, rawProgress));

      setProgress(clamped);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Calculate initial position
    updateProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return { ref, progress };
}

