"use client";

import React from "react";
import { useInView } from "./hooks/useInView";
import { useCountUp } from "./hooks/useCountUp";

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  decimals?: number;
  className?: string;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  durationMs = 1200,
  decimals = 0,
  className = "",
}) => {
  const { ref, isInView } = useInView({ threshold: 0.2, triggerOnce: true });
  const displayValue = useCountUp(value, {
    durationMs,
    decimals,
    startWhen: isInView,
  });

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums font-mono ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

