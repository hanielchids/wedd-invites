"use client";

import { useEffect, useRef, useState } from "react";

type BotanicalProps = {
  className?: string;
  /** Stroke colour — defaults to fern green. */
  stroke?: string;
};

/**
 * Single-weight eucalyptus sprig, drawn with a stroke-dashoffset animation
 * the first time it scrolls into view. Used as a section divider ornament.
 */
export default function Botanical({ className = "", stroke = "#8B8B85" }: BotanicalProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pathStyle = {
    strokeDasharray: 260,
    strokeDashoffset: drawn ? 0 : 260,
    transition: "stroke-dashoffset 2.4s cubic-bezier(0.22, 1, 0.36, 1)",
  } as const;

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
      className={`mx-auto h-10 w-[7.5rem] ${className}`}
    >
      {/* Central stem */}
      <path
        d="M10 32 C 40 26, 80 26, 110 20"
        stroke={stroke}
        strokeWidth="1.1"
        strokeLinecap="round"
        style={pathStyle}
      />
      {/* Leaf pairs along the stem */}
      {[
        "M28 28.5 C 26 22, 30 16, 35 14 C 35 21, 33 26, 28 28.5",
        "M46 27 C 44 20, 48 14, 53 12 C 53 19, 51 24, 46 27",
        "M64 25.5 C 62 19, 66 13, 71 11 C 71 18, 69 23, 64 25.5",
        "M82 24 C 80 17, 84 11, 89 9 C 89 16, 87 21, 82 24",
        "M38 30 C 41 34, 47 35, 52 33 C 48 29, 42 28.5, 38 30",
        "M56 28.5 C 59 32.5, 65 33.5, 70 31.5 C 66 27.5, 60 27, 56 28.5",
        "M74 27 C 77 31, 83 32, 88 30 C 84 26, 78 25.5, 74 27",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          style={{ ...pathStyle, transitionDelay: `${0.2 + i * 0.12}s` }}
        />
      ))}
    </svg>
  );
}
