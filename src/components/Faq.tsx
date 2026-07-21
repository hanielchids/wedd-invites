"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

/** Accordion with hairline dividers — quiet answers to common questions. */
export default function Faq() {
  const { faq } = wedding;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-parchment px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-prose">
        <Reveal className="text-center">
          <p className="eyebrow">{faq.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6">{faq.title}</h2>
        </Reveal>

        <Reveal className="mt-12">
          <dl className="divide-y divide-champagne/40 border-y border-champagne/40">
            {faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <dt>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className="font-display text-xl font-normal text-charcoal sm:text-2xl">
                        {item.q}
                      </span>
                      <span
                        className={`font-display text-2xl font-light text-champagne transition-transform duration-500 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                  </dt>
                  <dd
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-7 font-body text-[1rem] leading-[1.85] text-charcoal/70">
                        {item.a}
                      </p>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
