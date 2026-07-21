"use client";

import { useEffect, useState } from "react";
import Monogram from "./Monogram";

/**
 * Veil-opening reveal: two ivory panels hold for a beat over a centred
 * monogram, then slide apart like an invitation being opened.
 */
export default function Preloader() {
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Respect reduced-motion users: skip straight to the page.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const hold = setTimeout(() => setOpening(true), 900);
    const finish = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
    }, 2300);
    return () => {
      clearTimeout(hold);
      clearTimeout(finish);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  const panel =
    "fixed inset-x-0 h-[50vh] bg-ivory transition-transform duration-[1200ms] z-[60]";
  const easing = { transitionTimingFunction: "cubic-bezier(0.77, 0, 0.18, 1)" };

  return (
    <div aria-hidden>
      <div
        className={`${panel} top-0 ${opening ? "-translate-y-full" : ""}`}
        style={easing}
      />
      <div
        className={`${panel} bottom-0 ${opening ? "translate-y-full" : ""}`}
        style={easing}
      />
      <div
        className={`fixed inset-0 z-[61] flex items-center justify-center transition-opacity duration-700 ${
          opening ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Monogram className="h-24 w-auto" />
      </div>
    </div>
  );
}
