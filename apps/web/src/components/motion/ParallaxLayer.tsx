"use client";

import React, { useEffect, useRef, useState } from "react";

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.1 to 0.15
  className?: string;
  direction?: "vertical" | "horizontal";
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.08,
  className = "",
  direction = "vertical",
}) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const elementCenter = rect.top + rect.height / 2;
            const distance = elementCenter - viewportCenter;
            const calculated = distance * speed;
            // Restrain max offset to prevent wild layout deviations
            const clamped = Math.max(-60, Math.min(60, calculated));
            setOffset(clamped);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  const transformStyle =
    direction === "vertical"
      ? `translate3d(0, ${offset.toFixed(1)}px, 0)`
      : `translate3d(${offset.toFixed(1)}px, 0, 0)`;

  return (
    <div
      ref={ref}
      style={{
        transform: transformStyle,
      }}
      className={`transition-transform duration-150 ease-out motion-reduce:transform-none will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

