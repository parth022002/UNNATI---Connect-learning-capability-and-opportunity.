import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "saffron" | "soft";
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
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-unnati-violet disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer tracking-tight";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5 shadow-soft-sm",
  };

  const variantStyles = {
    primary: "bg-unnati-indigo hover:bg-unnati-indigo-dark text-white shadow-soft-md shadow-purple-950/20 active:scale-[0.98]",
    secondary: "bg-unnati-violet-soft text-unnati-indigo hover:bg-purple-100 border border-purple-200 active:scale-[0.98]",
    outline: "border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 shadow-soft-sm active:scale-[0.98]",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    saffron: "bg-gradient-to-r from-orange-600 to-unnati-saffron text-white hover:brightness-105 shadow-glow-saffron border border-orange-500/20 active:scale-[0.98]",
    soft: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
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
