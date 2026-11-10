import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        unnati: {
          indigo: "#4C1D95",
          "indigo-dark": "#310F68",
          "indigo-light": "#5B21B6",
          violet: "#6D28D9",
          "violet-light": "#7C3AED",
          "violet-soft": "#EDE9FE",
          "violet-tint": "#F5F3FF",
          saffron: "#EA580C",
          "saffron-bright": "#FF8A00",
          "saffron-soft": "#FFF7ED",
          "saffron-tint": "#FFEDD5",
          teal: "#14B8A6",
          midnight: "#0F172A",
          dark: "#1E1B4B",
          card: "#FFFFFF",
          cloud: "#F8FAFC",
          sand: "#FDFBF7",
          border: "#E2E8F0"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1.5deg)" }
        },
        ambientDrift1: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(40px, -30px) scale(1.08)" },
          "66%": { transform: "translate(-30px, 35px) scale(0.95)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        ambientDrift2: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-45px, 35px) scale(1.06)" },
          "66%": { transform: "translate(35px, -25px) scale(0.94)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.04)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "ambient-drift-1": "ambientDrift1 26s ease-in-out infinite",
        "ambient-drift-2": "ambientDrift2 32s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        shimmer: "shimmer 3.5s linear infinite",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      },
      boxShadow: {
        "soft-sm": "0 2px 4px 0 rgba(15, 23, 42, 0.04)",
        "soft-md": "0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        "soft-lg": "0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
        "soft-xl": "0 20px 35px -5px rgba(76, 29, 149, 0.1), 0 10px 15px -3px rgba(15, 23, 42, 0.05)",
        "glow-saffron": "0 10px 25px -5px rgba(234, 88, 12, 0.35)",
        "glow-violet": "0 10px 25px -5px rgba(109, 40, 217, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
