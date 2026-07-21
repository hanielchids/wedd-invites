import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Botanical from "./Botanical";

/**
 * Venue section — arch-masked photo (falls back to a styled botanical panel
 * until /public/images/venue.jpg is added), address and directions.
 */
export default function Venue() {
  const { venue } = wedding;
  const hasImage =
    !!venue.image && existsSync(join(process.cwd(), "public", venue.image));

  return (
    <section id="venue" className="bg-ivory px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-content items-center gap-14 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <Reveal>
            <p className="eyebrow">{venue.eyebrow}</p>
            <div className="hairline lg:mx-0" />
            <h2 className="display-md mt-6">{venue.title}</h2>
            <p className="mt-3 font-sans text-[0.7rem] uppercase tracking-[0.26em] text-charcoal/55">
              {venue.area}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <p className="measure mt-7 lg:mx-0">{venue.description}</p>
          </Reveal>
          <Reveal delay={250}>
            <ul className="mx-auto mt-8 max-w-prose space-y-3 text-left lg:mx-0">
              {venue.directions.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 font-body text-[0.98rem] leading-relaxed text-charcoal/70"
                >
                  <span className="mt-[0.65em] h-px w-4 shrink-0 bg-champagne" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-10">
              <a
                href={venue.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <span>Get Directions</span>
              </a>
              <p className="mt-4 font-body text-sm italic text-charcoal/55">
                {venue.address}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="relative mx-auto w-full max-w-sm">
          <div className="arch-echo" />
          <div className="arch relative aspect-[3/4] bg-forest">
            {hasImage ? (
              <Image
                src={venue.image!}
                alt={venue.name}
                fill
                sizes="(min-width: 1024px) 24rem, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
                <Botanical stroke="#C9C5BD" />
                <p className="font-display text-3xl font-light italic text-ivory">
                  {venue.name}
                </p>
                <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ivory/60">
                  {venue.area}
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
