import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

/**
 * Venue section. Single column on mobile (image over details); split layout
 * on desktop. If no image is configured, a styled cowhide panel stands in.
 */
export default function Venue() {
  const { venue } = wedding;

  return (
    <section id="venue" className="bg-ivory px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <Reveal className="text-center">
          <p className="eyebrow text-wine">{venue.eyebrow}</p>
          <h2 className="display-sm mt-4 text-ink">The Venue</h2>
          <p className="mt-3 font-body text-base italic text-ink/55">Where we celebrate</p>
          <div className="mt-8">
            <Ornament />
          </div>
        </Reveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden border border-gold/30">
              {venue.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cowhide bg-cover bg-center">
                  <div className="absolute inset-0 bg-ink/40" />
                  <span className="relative font-script text-3xl text-ivory">{venue.name}</span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="text-center lg:text-left">
            <p className="eyebrow text-ink/50">{venue.area}</p>
            <h3 className="display-sm mt-3 text-ink">{venue.name}</h3>
            <p className="mx-auto mt-4 max-w-sm font-body text-lg text-ink/70 lg:mx-0">
              {venue.address}
            </p>
            <p className="mt-5 font-sans text-[0.7rem] uppercase tracking-[0.25em] text-ink/60">
              {venue.doorsOpen} &middot; {venue.ceremony}
            </p>
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-8"
            >
              Open in Maps &#9670;
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
