import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        unnati: {
          indigo: "#4C1D95",
          violet: "#7C3AED",
          saffron: "#FF8A00",
          teal: "#14B8A6",
          midnight: "#17152D",
          cloud: "#F8FAFC"
        }
      }
    }
  },
  plugins: []
};
export default config;
