"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Botanical from "./Botanical";

type Status = "idle" | "submitting" | "success" | "error";

const SUBMITTED_KEY = "glRsvpSubmitted";

/**
 * The page's one inverted moment: deep forest green, ivory serif, bare
 * bottom-border fields. Posts JSON to /api/rsvp.
 */
export default function RSVPForm() {
  const { rsvp } = wedding;
  const [attending, setAttending] = useState<"accept" | "decline" | null>(null);
  const [diet, setDiet] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const renderedAt = useRef(0); // for the bot fill-time heuristic

  // One entry per browser: returning guests see their confirmation.
  useEffect(() => {
    renderedAt.current = Date.now();
    try {
      if (localStorage.getItem(SUBMITTED_KEY)) setStatus("success");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDiet = (item: string) =>
    setDiet((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!attending) {
      setErrorMsg("Please tell us whether you'll attend.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      attending,
      dietary: diet,
      message: fd.get("message"),
      website: fd.get("website"), // honeypot — empty for humans
      formAge: Date.now() - renderedAt.current,
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Request failed");
      }
      try {
        localStorage.setItem(SUBMITTED_KEY, "1");
      } catch {
        /* ignore */
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : null);
      setStatus("error");
    }
  }

  return (
    <section id="rsvp" className="bg-forest px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-prose">
        <Reveal className="text-center">
          <p className="eyebrow !text-champagne-light">{rsvp.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6 !text-ivory">{rsvp.heading}</h2>
          <p className="mt-4 font-body text-lg italic text-ivory/70">{rsvp.intro}</p>
          <p className="mt-8 font-sans text-[0.66rem] uppercase tracking-[0.26em] text-champagne-light">
            {rsvp.deadlineLabel}
          </p>
          <p className="mx-auto mt-6 max-w-md border border-ivory/25 px-6 py-4 font-body text-sm italic leading-relaxed text-ivory/75">
            {rsvp.entryNote}
          </p>
        </Reveal>

        {status === "success" ? (
          <Reveal className="mt-14 text-center">
            <Botanical stroke="#D6C4A4" />
            <p className="mt-6 font-display text-3xl font-light italic text-ivory">
              {rsvp.successMessage}
            </p>
          </Reveal>
        ) : (
          <Reveal>
            <form onSubmit={handleSubmit} className="mt-14 space-y-9">
              {/* honeypot — invisible to humans, irresistible to bots */}
              <div
                className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                aria-hidden
              >
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="field-label-dark">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="field-dark"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid gap-9 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label htmlFor="email" className="field-label-dark">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="field-dark"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="field-label-dark">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="field-dark"
                    placeholder="0…"
                  />
                </div>
              </div>

              <div>
                <span className="field-label-dark">Will you attend? *</span>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["accept", rsvp.acceptLabel],
                      ["decline", rsvp.declineLabel],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAttending(value)}
                      aria-pressed={attending === value}
                      className={`border px-4 py-4 font-sans text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                        attending === value
                          ? "border-champagne bg-ivory text-forest"
                          : "border-ivory/40 text-ivory/75 hover:border-champagne"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="field-label-dark">Dietary Requirements</span>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {rsvp.dietaryOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDiet(item)}
                      aria-pressed={diet.includes(item)}
                      className={`border px-4 py-3 font-sans text-[0.62rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                        diet.includes(item)
                          ? "border-champagne bg-ivory/10 text-champagne-light"
                          : "border-ivory/30 text-ivory/60 hover:border-champagne"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="field-label-dark">
                  A note for the couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="field-dark resize-none"
                  placeholder="Share your blessings…"
                />
              </div>

              {status === "error" && (
                <p className="font-body text-sm text-champagne-light">
                  {errorMsg ?? "Something went wrong sending your RSVP. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-ghost-light w-full disabled:opacity-50"
              >
                <span>{status === "submitting" ? "Sending…" : rsvp.submitLabel}</span>
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
