"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";

/** RSVP drops out of the nav once responses have closed. */
const LINKS: [string, string][] = [
  ["The Day", "#schedule"],
  ["Venue", "#venue"],
  ...(wedding.rsvp.closed
    ? []
    : ([["RSVP", "#rsvp"]] as [string, string][])),
  ["Stay", "#stay"],
];

/** Slim ivory bar that appears once the guest scrolls past the hero. */
export default function StickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-champagne/30 bg-ivory/90 backdrop-blur-sm transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3">
        <a
          href="#top"
          className="font-display text-xl font-medium italic text-forest"
        >
          {wedding.couple.monogram}
        </a>
        <nav className="flex items-center gap-5 sm:gap-8">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-charcoal/70 transition-colors hover:text-forest sm:text-[0.68rem]"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
