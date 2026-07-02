"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";

const NAV = [
  { href: "#story", label: "Story" },
  { href: "#venue", label: "Venue" },
  { href: "#rsvp", label: "RSVP" },
];

/**
 * Pinned monogram bar. Hidden over the hero, slides in once the user scrolls
 * past it. Desktop also gets quiet anchor navigation on the right.
 */
export default function StickyHeader() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-cream/85 backdrop-blur-md transition-all duration-500 ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" className="font-script text-2xl leading-none text-wine sm:text-3xl">
          {wedding.couple.scriptName}
        </a>
        <nav className="hidden gap-8 sm:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 transition-colors hover:text-wine"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
