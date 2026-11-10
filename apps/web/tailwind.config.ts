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
          saffron: "#EA580C",
          "saffron-bright": "#FF8A00",
          teal: "#14B8A6",
          midnight: "#0F172A",
          cloud: "#F8FAFC"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Poppins", "sans-serif"]
      }
      }
    }
  },
  plugins: []
};
export default config;
