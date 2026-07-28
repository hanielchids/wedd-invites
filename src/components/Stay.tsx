import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

/** Accommodation suggestions — hairline cards, no shadows. */
export default function Stay() {
  const { stay } = wedding;

  return (
    <section id="stay" className="bg-ivory px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <Reveal className="text-center">
          <p className="eyebrow">{stay.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6">{stay.title}</h2>
          <p className="measure mt-7">{stay.intro}</p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {stay.options.map((option, i) => (
            <Reveal key={option.name} delay={i * 120}>
              <article className="flex h-full flex-col border border-champagne/40 px-8 py-9">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-fern">
                  {option.tier}
                </p>
                <h3 className="mt-3 font-display text-2xl font-normal text-charcoal">
                  {option.name}
                </h3>
                <p className="mt-1 font-body text-sm italic text-charcoal/55">
                  {option.address}
                </p>
                <p className="mt-4 flex-1 font-body text-[0.98rem] leading-relaxed text-charcoal/70">
                  {option.blurb}
                </p>
                <div className="mt-5 flex items-center gap-6">
                  {option.websiteUrl && (
                    <a
                      href={option.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-[0.64rem] uppercase tracking-[0.24em] text-forest underline-offset-4 hover:underline"
                    >
                      Visit Website
                    </a>
                  )}
                  <a
                    href={option.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-[0.64rem] uppercase tracking-[0.24em] text-charcoal/60 underline-offset-4 hover:text-forest hover:underline"
                  >
                    View on Maps
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
