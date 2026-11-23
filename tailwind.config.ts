import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1ffef",
          100: "#60ff99",
          500: "#00ff88",
          600: "#00e479",
          700: "#007139",
          900: "#003919",
        },
        gh: {
          bg: "#111317",
          lowest: "#0c0e11",
          low: "#1a1c1f",
          container: "#1e2023",
          high: "#282a2d",
          highest: "#333538",
          bright: "#37393d",
          primary: "#00ff88",
          primaryFixed: "#60ff99",
          onPrimary: "#003919",
          secondary: "#00e5ff",
          secondaryFixed: "#9cf0ff",
          tertiary: "#7000ff",
          text: "#e2e2e6",
          muted: "#b9cbb9",
          outline: "#3b4b3d",
        },
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui() as any],
};

export default config;
