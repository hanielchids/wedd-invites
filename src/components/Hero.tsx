"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { wedding } from "@/config/wedding";

/**
 * Full-viewport hero: names in high-contrast serif with a script ampersand,
 * beside an arch-masked couple photo with a champagne echo outline.
 * The photo drifts gently with scroll (subtle parallax, rAF-throttled).
 */
export default function Hero() {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (photoRef.current) {
          photoRef.current.style.transform = `translateY(${window.scrollY * 0.12}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const { couple, hero, dateLabel, dayOfWeek, venue } = wedding;

  return (
    <section id="top" className="relative overflow-hidden bg-ivory px-5 pb-24 pt-20 sm:pt-24">
      {/* Faint leaf shadow, as if light through greenhouse glass. */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] opacity-[0.07] blur-[2px] animate-sway">
        <svg viewBox="0 0 200 200" fill="#3E5D46" aria-hidden className="h-full w-full">
          <path d="M100 10 C 60 50, 50 120, 100 190 C 150 120, 140 50, 100 10 Z" />
          <path d="M30 60 C 55 75, 75 110, 70 160 C 30 130, 20 90, 30 60 Z" />
          <path d="M170 60 C 145 75, 125 110, 130 160 C 170 130, 180 90, 170 60 Z" />
        </svg>
      </div>

      <div className="mx-auto grid max-w-content items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <p className="eyebrow animate-fade-up opacity-0" style={{ animationDelay: "1.5s" }}>
            {hero.eyebrow}
          </p>
          <h1 className="display mt-6 animate-fade-up opacity-0" style={{ animationDelay: "1.7s" }}>
            {couple.partnerA.firstName}
            <span className="mx-3 font-script text-[0.55em] text-champagne">&amp;</span>
            {couple.partnerB.firstName}
          </h1>
          <div
            className="mt-8 animate-fade-up opacity-0"
            style={{ animationDelay: "1.9s" }}
          >
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-charcoal/60">
              {dayOfWeek} · {dateLabel}
            </p>
            <p className="mt-2 font-sans text-[0.72rem] uppercase tracking-[0.3em] text-fern">
              {venue.name} · {venue.area}
            </p>
          </div>
          <div
            className="mt-10 animate-fade-up opacity-0"
            style={{ animationDelay: "2.1s" }}
          >
            <a href="#rsvp" className="btn-ghost">
              <span>{hero.ctaLabel}</span>
            </a>
          </div>
        </div>

        <div
          ref={photoRef}
          className="relative mx-auto w-full max-w-sm animate-fade-up opacity-0"
          style={{ animationDelay: "1.6s" }}
        >
          <div className="arch-echo" />
          <div className="arch relative aspect-[3/4]">
            <Image
              src="/images/couple-1.jpg"
              alt={`${couple.partnerA.firstName} and ${couple.partnerB.firstName}`}
              fill
              priority
              sizes="(min-width: 1024px) 24rem, 90vw"
              className="photo-classic object-cover"
            />
            <div className="photo-veil" />
          </div>
        </div>
      </div>
    </section>
  );
}
