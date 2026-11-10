import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "violet" | "saffron" | "sky" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide border backdrop-blur-sm transition-colors";

  const variantStyles = {
    default: "bg-slate-800/80 text-slate-300 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    error: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    violet: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    saffron: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    outline: "border-white/20 text-slate-300 bg-transparent hover:bg-white/5",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
