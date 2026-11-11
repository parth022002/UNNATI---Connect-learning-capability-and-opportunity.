"use client";

import { useEffect, useState } from "react";

interface CountUpOptions {
  durationMs?: number;
  decimals?: number;
  startWhen?: boolean;
}

export function useCountUp(
  targetValue: number,
  options: CountUpOptions = {}
) {
  const { durationMs = 1200, decimals = 0, startWhen = true } = options;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhen) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(targetValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(progress);

      const currentVal = eased * targetValue;
      setValue(Number(currentVal.toFixed(decimals)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, durationMs, decimals, startWhen]);

  return value;
}

