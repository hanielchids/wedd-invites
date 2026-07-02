import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

/**
 * "Where to stay" section. Four suggested stays for travelling guests,
 * spanning budget-friendly to luxury, as gold-trimmed cards on ivory.
 */
export default function Accommodations() {
  const { stay } = wedding;

  return (
    <section id="stay" className="bg-ivory px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <Reveal className="text-center">
          <p className="eyebrow text-wine">{stay.eyebrow}</p>
          <h2 className="display-sm mt-4 text-ink">{stay.titleEn}</h2>
          <p className="mx-auto mt-3 max-w-prose font-body text-base italic text-ink/55">
            {stay.intro}
          </p>
          <div className="mt-8">
            <Ornament />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {stay.options.map((place, i) => (
            <Reveal key={place.name} delay={i * 0.08}>
              <div className="flex h-full flex-col border border-gold/30 bg-sand px-7 py-8 text-center sm:text-left">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-wine">
                  {place.tier}
                </p>
                <h3 className="mt-3 font-display text-xl text-ink">{place.name}</h3>
                <p className="mt-1 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ink/50">
                  {place.address}
                </p>
                <p className="mt-4 flex-1 font-body text-base text-ink/70">{place.blurb}</p>
                <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  {place.priceGuide ? (
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ink/60">
                      {place.priceGuide}
                    </span>
                  ) : (
                    <span aria-hidden />
                  )}
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-wine underline-offset-4 hover:underline"
                  >
                    Open in Maps &#9670;
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
