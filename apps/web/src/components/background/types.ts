export type BackgroundVariant =
  | "landing"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "explore"
  | "assessments"
  | "roadmap"
  | "privacy"
  | "not-found"
  | "default";

export type AnimationIntensity = "subtle" | "normal" | "rich";

export interface BackgroundProps {
  variant?: BackgroundVariant;
  intensity?: AnimationIntensity;
  showParticles?: boolean;
  showGrid?: boolean;
  showPaths?: boolean;
  interactive?: boolean;
  className?: string;
}

