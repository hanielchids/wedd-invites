import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochrome cowhide base + warm wedding accents
        ivory: "#F6F1E9",
        cream: "#EFE7DB",
        sand: "#E4D9C8",
        ink: "#141011",
        charcoal: "#211A1B",
        wine: "#6E1A22",
        "wine-dark": "#4A1018",
        gold: "#C5A572",
        "gold-light": "#E4CFA1",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "EB Garamond", "serif"],
        script: ["var(--font-script)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.42em",
      },
      maxWidth: {
        content: "62rem",
        prose: "44rem",
      },
      backgroundImage: {
        // Real Holstein cowhide photo (Pexels, free licence). The procedural
        // SVG remains at /textures/cowhide.svg as a zero-dependency fallback.
        cowhide: "url('/textures/cowhide.jpg')",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
