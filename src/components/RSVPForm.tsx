"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

type Status = "idle" | "submitting" | "success" | "error";

/** Blush RSVP form. Posts JSON to /api/rsvp and shows an inline success state. */
export default function RSVPForm() {
  const { rsvp } = wedding;
  const [attending, setAttending] = useState<"accept" | "decline" | null>(null);
  const [diet, setDiet] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const toggleDiet = (item: string) =>
    setDiet((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      attending,
      guests: fd.get("guests"),
      meal: fd.get("meal"),
      dietary: diet,
      message: fd.get("message"),
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="rsvp" className="bg-sand px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-prose">
        <Reveal className="text-center">
          <p className="eyebrow text-wine">{rsvp.eyebrow}</p>
          <h2 className="display-sm mt-4 text-ink">{rsvp.heading}</h2>
          <p className="mt-3 font-body text-lg italic text-ink/60">{rsvp.intro}</p>
          <div className="mt-8">
            <Ornament />
          </div>
          <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ink/55">
            {rsvp.deadlineLabel}
          </p>
          <p className="mt-1 font-body text-sm italic text-ink/55">{rsvp.dressNote}</p>
        </Reveal>

        {status === "success" ? (
          <Reveal className="mt-12 border border-gold/40 bg-ivory px-8 py-12 text-center">
            <p className="font-script text-4xl text-wine">{rsvp.successMessage}</p>
          </Reveal>
        ) : (
          <Reveal>
            <form onSubmit={handleSubmit} className="mt-12 space-y-7">
              <div>
                <label htmlFor="fullName" className="field-label">
                  Full Name *
                </label>
                <input id="fullName" name="fullName" required className="field-input" placeholder="Your full name" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="field-label">
                    Email Address
                  </label>
                  <input id="email" name="email" type="email" className="field-input" placeholder="email@example.com" />
                </div>
                <div>
                  <label htmlFor="phone" className="field-label">
                    Phone Number
                  </label>
                  <input id="phone" name="phone" type="tel" className="field-input" placeholder="+27 ..." />
                </div>
              </div>

              <div>
                <span className="field-label">Will you attend? *</span>
                <div className="grid gap-4 sm:grid-cols-2">
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
                      className={`border px-4 py-4 font-sans text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
                        attending === value
                          ? "border-wine bg-wine text-ivory"
                          : "border-ink/25 text-ink/70 hover:border-wine"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="guests" className="field-label">
                    Number of Guests
                  </label>
                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="field-input"
                  />
                </div>
                <div>
                  <label htmlFor="meal" className="field-label">
                    Meal Preference
                  </label>
                  <select id="meal" name="meal" className="field-input" defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    {rsvp.mealOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="field-label">Dietary Restrictions</span>
                <div className="grid grid-cols-2 gap-4">
                  {rsvp.dietaryOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDiet(item)}
                      aria-pressed={diet.includes(item)}
                      className={`border px-4 py-3 font-sans text-[0.65rem] uppercase tracking-[0.18em] transition-colors ${
                        diet.includes(item)
                          ? "border-wine bg-wine/10 text-wine"
                          : "border-ink/25 text-ink/60 hover:border-wine"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="field-label">
                  Message to the Couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="field-input resize-none"
                  placeholder="Share your blessings…"
                />
              </div>

              {status === "error" && (
                <p className="font-body text-sm text-wine">
                  Something went wrong sending your RSVP. Please try again.
                </p>
              )}

              <button type="submit" disabled={status === "submitting"} className="btn-primary w-full disabled:opacity-60">
                {status === "submitting" ? "Sending…" : `${rsvp.submitLabel} ◆`}
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
