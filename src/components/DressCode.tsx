import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

/** One quiet line about attire, with palette swatch dots. */
export default function DressCode() {
  const { dressCode } = wedding;

  return (
    <section className="bg-parchment px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-content text-center">
        <Reveal>
          <p className="eyebrow">{dressCode.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6 italic">{dressCode.title}</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="measure mt-7">{dressCode.body}</p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex items-center justify-center gap-4">
            {dressCode.palette.map((hex) => (
              <span
                key={hex}
                title={hex}
                className="h-6 w-6 rounded-full border border-charcoal/10"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
