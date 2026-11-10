import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: "none" | "violet" | "saffron";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = false,
  glow = "none",
  ...props
}) => {
  const glowStyles = {
    none: "",
    violet: "hover:border-purple-500/40 hover:shadow-glow-violet",
    saffron: "hover:border-orange-500/40 hover:shadow-glow-saffron",
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 ${
        hoverEffect ? "hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/80" : ""
      } ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-bold tracking-tight text-white ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => (
  <p className={`text-xs text-slate-400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`pt-0 ${className}`} {...props}>
    {children}
  </div>
);
