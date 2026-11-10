import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        unnati: {
          indigo: "#4C1D95",
          violet: "#6D28D9",
          "violet-light": "#7C3AED",
          "violet-dark": "#2E1065",
          saffron: "#EA580C",
          "saffron-bright": "#FF8A00",
          "saffron-light": "#FFF7ED",
          teal: "#14B8A6",
          midnight: "#0F172A",
          dark: "#090D16",
          card: "#131C31",
          cloud: "#F8FAFC"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Poppins", "sans-serif"]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        glow: {
          "0%": { opacity: "0.4", filter: "blur(20px)" },
          "100%": { opacity: "0.8", filter: "blur(32px)" }
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 3s linear infinite",
        glow: "glow 4s ease-in-out infinite alternate",
        aurora: "aurora 15s ease infinite"
      },
      boxShadow: {
        "glow-violet": "0 0 30px -5px rgba(109, 40, 217, 0.5)",
        "glow-saffron": "0 0 30px -5px rgba(234, 88, 12, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      }
    }
  },
  plugins: []
};

export default config;
