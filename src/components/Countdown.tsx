"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

type Parts = { d: number; h: number; m: number; s: number } | null;

function partsUntil(target: number): Parts {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1_000) % 60,
  };
}

/** Bare numbers in light serif — no boxes, no borders. */
export default function Countdown() {
  const { countdown, dateISO } = wedding;
  const target = new Date(dateISO).getTime();
  // Render em-dashes on the server; hydrate to live values client-side.
  const [parts, setParts] = useState<Parts | "pending">("pending");

  useEffect(() => {
    setParts(partsUntil(target));
    const tick = setInterval(() => setParts(partsUntil(target)), 1000);
    return () => clearInterval(tick);
  }, [target]);

  const values =
    parts === "pending" || parts === null
      ? ["—", "—", "—", "—"]
      : [parts.d, parts.h, parts.m, parts.s].map((n) =>
          String(n).padStart(2, "0")
        );

  return (
    <section className="bg-parchment px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-content text-center">
        <Reveal>
          <p className="eyebrow">{countdown.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6 italic">{countdown.title}</h2>
        </Reveal>

        {parts === null ? (
          <Reveal className="mt-12">
            <p className="font-display text-3xl font-light italic text-forest">
              {countdown.finishedMessage}
            </p>
          </Reveal>
        ) : (
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-4 gap-2 sm:gap-8">
            {countdown.labels.map((label, i) => (
              <Reveal key={label} delay={i * 120}>
                <p className="font-display text-5xl font-light text-charcoal sm:text-7xl">
                  {values[i]}
                </p>
                <p className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-fern sm:text-[0.68rem]">
                  {label}
                </p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
