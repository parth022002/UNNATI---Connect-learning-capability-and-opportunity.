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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulseGlow 5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite"
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
