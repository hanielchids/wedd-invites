import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Botanical from "./Botanical";

/** Registry — a quiet word about gifts, with the link behind one button. */
export default function Registry() {
  const { registry } = wedding;

  return (
    <section id="registry" className="bg-parchment px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-content text-center">
        <Reveal>
          <p className="eyebrow">{registry.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mx-auto mt-6 max-w-2xl italic">
            {registry.heading}
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="measure mt-7">{registry.body}</p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10">
            <a
              href={registry.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <span>{registry.buttonLabel}</span>
            </a>
          </div>
          <p className="mt-8 font-body italic text-charcoal/60">
            {registry.closing}
          </p>
          <Botanical className="mt-8" />
        </Reveal>
      </div>
    </section>
  );
}
