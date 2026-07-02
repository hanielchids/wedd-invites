"use client";

import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/config/wedding";
import WaxSeal from "./WaxSeal";
import Ornament from "./Ornament";

/**
 * Full-viewport hero. Black-and-white cowhide fills the screen; an inked,
 * gold-framed panel holds the wax seal, names and CTA. On wide screens the
 * panel is centred and the hide breathes in the margins.
 */
export default function Cover() {
  const reduce = useReducedMotion();
  const { couple, hero, dateLabel } = wedding;

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-cowhide bg-cover bg-center px-5 py-20"
    >
      {/* Darkening wash so text stays legible over the hide */}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/80" />

      <motion.div
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, scale: 0.96 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 1, ease: "easeOut" },
            })}
        className="relative mx-auto w-full max-w-xl"
      >
        <div className="relative border border-gold/40 bg-ink/35 px-6 py-12 text-center backdrop-blur-[2px] sm:px-12 sm:py-16">
          {/* corner ticks */}
          <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-gold/60" />
          <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-gold/60" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-gold/60" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold/60" />

          <motion.div {...rise(0.15)} className="flex justify-center">
            <WaxSeal monogram={couple.monogram} />
          </motion.div>

          <motion.p {...rise(0.35)} className="eyebrow mt-8 text-gold-light">
            {hero.eyebrow}
          </motion.p>

          <motion.h1 {...rise(0.5)} className="display mt-3 text-ivory">
            {couple.partnerA.firstName}
            <span className="my-1 block font-script text-3xl font-normal text-gold sm:text-4xl">
              &
            </span>
            {couple.partnerB.firstName}
          </motion.h1>

          <motion.div {...rise(0.7)} className="mt-7">
            <Ornament />
          </motion.div>

          <motion.p {...rise(0.85)} className="mt-6 font-sans text-sm uppercase tracking-[0.3em] text-ivory/85">
            {dateLabel}
          </motion.p>
          <motion.p {...rise(0.95)} className="mt-2 font-body text-base italic text-ivory/70">
            {hero.celebrationType}
          </motion.p>
          <motion.p {...rise(1.05)} className="mt-1 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-gold-light/80">
            {hero.tagline}
          </motion.p>

          <motion.a {...rise(1.2)} href="#rsvp" className="btn-primary mt-9">
            {hero.ctaLabel}
          </motion.a>
        </div>
      </motion.div>

      {/* scroll hint */}
      {!reduce && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold-light/70"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        </motion.div>
      )}
    </section>
  );
}
