import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "saffron" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-unnati-indigo to-unnati-violet text-white hover:from-purple-700 hover:to-unnati-violet-light focus:ring-unnati-violet shadow-lg shadow-purple-950/40 border border-purple-500/30",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-purple-200 border border-purple-500/20 focus:ring-purple-400",
    outline: "border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-slate-200 focus:ring-slate-400 backdrop-blur-sm",
    ghost: "text-slate-300 hover:text-white hover:bg-white/5 focus:ring-slate-500",
    saffron: "bg-gradient-to-r from-orange-500 to-unnati-saffron text-white hover:brightness-110 focus:ring-orange-500 shadow-lg shadow-orange-950/30 border border-orange-400/30",
    glass: "glass-card text-white hover:bg-white/10 focus:ring-purple-500 border border-white/10 shadow-sm"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
