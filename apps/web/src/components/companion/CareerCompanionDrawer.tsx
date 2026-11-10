"use client";

import React, { useEffect } from "react";
export { CareerCompanionWidget } from "./CareerCompanionWidget";

interface CareerCompanionDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Backward-compatible wrapper for the UNNATI AI Career Companion.
 * The primary widget is mounted globally at the bottom-right corner of the application.
 */
export const CareerCompanionDrawer: React.FC<CareerCompanionDrawerProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
  }, [isOpen]);

  return null;
};
