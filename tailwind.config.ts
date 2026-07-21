import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Ink & Porcelain" — monochrome editorial palette. Token names kept
        // from the original garden palette so components restyle in one place.
        ivory: "#F7F5F1",
        parchment: "#EFECE6",
        fern: "#8B8B85",
        forest: "#1C1C1A",
        "forest-deep": "#121211",
        champagne: "#9E9A92",
        "champagne-light": "#C9C5BD",
        charcoal: "#1F1F1D",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "EB Garamond", "serif"],
        script: ["var(--font-script)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.32em",
      },
      maxWidth: {
        content: "68.75rem", // 1100px
        prose: "34rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.2deg)" },
          "50%": { transform: "rotate(1.2deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        sway: "sway 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
