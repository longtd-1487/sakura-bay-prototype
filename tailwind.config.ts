import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        harbor: { 900: "#0F2A3F", 800: "#163A55", 700: "#1F4D6E", 100: "#DCE7EE", 50: "#F1F6F8" },
        buoy: { 600: "#D9521F", 500: "#F2622E", 100: "#FDE5DA" },
        kelp: { 600: "#2E7D5B", 100: "#DDF1E6" },
        coral: { 600: "#C63D2F", 100: "#F9E0DC" },
        sand: { 100: "#FBF7EF" },
        ink: { 900: "#1F2933", 600: "#52606D", 400: "#9AA5B1" },
      },
      fontFamily: { sans: ["Noto Sans JP", "Hiragino Sans", "Segoe UI", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
