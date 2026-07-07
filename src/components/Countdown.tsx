"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";
import Ornament from "./Ornament";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return [
    Math.floor(s / 86400), // days
    Math.floor((s % 86400) / 3600), // hours
    Math.floor((s % 3600) / 60), // minutes
    s % 60, // seconds
  ];
}

/** Oxblood, cowhide-washed live countdown to the ceremony. */
export default function Countdown() {
  const { countdown, dateISO } = wedding;
  const target = new Date(dateISO).getTime();

  // Start null to avoid a server/client hydration mismatch on the ticking values.
  const [parts, setParts] = useState<number[] | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const finished = parts !== null && parts.every((p) => p === 0);

  return (
    <section className="relative overflow-hidden bg-wine px-5 py-24 text-center sm:py-32">
      <div className="absolute inset-0 bg-countdown bg-cover bg-center" aria-hidden />
      <div className="absolute inset-0 bg-wine-dark/80" aria-hidden />
      <div className="absolute inset-0 bg-cowhide bg-cover bg-center opacity-[0.07]" aria-hidden />
      <div className="relative mx-auto max-w-content">
        <p className="eyebrow text-gold-light">{countdown.eyebrow}</p>
        <h2 className="display-sm mt-4 text-ivory">{countdown.titleZu}</h2>
        <p className="mt-3 font-body text-base italic text-ivory/70">{countdown.titleEn}</p>
        <div className="mt-8">
          <Ornament />
        </div>

        {finished ? (
          <p className="mt-12 font-script text-4xl text-gold-light sm:text-5xl">
            {countdown.finishedMessage}
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
            {countdown.labels.map((label, i) => (
              <div key={label.en}>
                <div className="font-display text-5xl font-medium text-ivory tabular-nums sm:text-6xl">
                  {parts ? String(parts[i]).padStart(2, "0") : "––"}
                </div>
                <div className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-gold-light/90">
                  {label.zu}
                </div>
                <div className="font-sans text-[0.55rem] uppercase tracking-[0.28em] text-ivory/45">
                  {label.en}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
