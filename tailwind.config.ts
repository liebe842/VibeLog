import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2ea043",
        "background-dark": "#0d1117",
        "surface-dark": "#161b22",
        "border-dark": "#30363d",
        "text-primary": "#e6edf3",
        "text-secondary": "#8b949e",
        "github-bg": "#21262d",
        "link-blue": "#58a6ff",
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
