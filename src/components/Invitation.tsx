import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

/** Dark, cowhide-washed "you are invited" statement. */
export default function Invitation() {
  const { invitation, couple, dateLabel, venue } = wedding;

  return (
    <section className="relative overflow-hidden bg-ink px-5 py-24 sm:py-32">
      {/* couple photo backdrop — cropped so the couple is the centred focal point,
          faded toward the ink base so the panel stays the hero */}
      <div className="absolute inset-0 bg-invite bg-cover bg-center opacity-70" aria-hidden />
      {/* light ink wash — just enough to darken the photo */}
      <div className="absolute inset-0 bg-ink/40" aria-hidden />
      {/* faint hide texture behind the panel */}
      <div className="absolute inset-0 bg-cowhide bg-cover bg-center opacity-[0.06]" aria-hidden />

      <Reveal className="relative mx-auto max-w-prose text-center">
        <div className="border border-gold/25 bg-ink/55 px-6 py-12 backdrop-blur-[2px] sm:px-12 sm:py-16">
          <p className="eyebrow text-gold-light">{invitation.eyebrow}</p>
          <h2 className="display-sm mt-6 text-ivory">{invitation.heading}</h2>
          <p className="mx-auto mt-6 max-w-md font-body text-lg leading-relaxed text-ivory/75">
            {invitation.body}
          </p>
          <p className="mt-8 font-script text-4xl text-gold sm:text-5xl">{couple.scriptName}</p>
          <div className="mt-8">
            <Ornament />
          </div>
          <p className="mt-6 font-sans text-[0.7rem] uppercase tracking-[0.28em] text-ivory/70">
            {dateLabel} · {venue.name}, {venue.area}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
