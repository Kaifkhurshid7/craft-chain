import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Craft-Chain palette
        paper: "#F7F4EE",
        sand: "#EDE7DC",
        ink: "#1F2421",
        forest: "#21483B",
        brass: "#B18A52",
        // Legacy names used by the mint / record-step / batch pages
        primary: "#21483B",
        secondary: "#EDE7DC",
        accent: "#B18A52",
        danger: "#B4432F",
        success: "#21483B",
        warning: "#B18A52",
        info: "#21483B",
        dark: "#1F2421",
        light: "#F7F4EE",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
