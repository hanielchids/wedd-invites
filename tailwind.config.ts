import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Fern & Champagne" — garden-luxury palette for Green Leaves.
        ivory: "#F7F1E6",
        parchment: "#F2E9DA",
        fern: "#6F8F73",
        forest: "#3E5D46",
        "forest-deep": "#2F4735",
        champagne: "#B9A07A",
        "champagne-light": "#D6C4A4",
        charcoal: "#2F3A2F",
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
