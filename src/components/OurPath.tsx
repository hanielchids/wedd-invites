import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Ornament from "./Ornament";

/** Renders *word* spans in a step body as <em>, e.g. isiZulu terms. */
function emphasize(text: string) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      part
    )
  );
}

/** "Indlela Yethu" — numbered steps of the traditional journey. */
export default function OurPath() {
  const { story } = wedding;

  return (
    <section id="story" className="bg-cream px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <Reveal className="text-center">
          <p className="eyebrow text-wine">{story.eyebrow}</p>
          <h2 className="display mt-4 text-ink">{story.titleZu}</h2>
          <p className="mt-3 font-body text-base italic text-ink/55">{story.titleEn}</p>
          <div className="mt-8">
            <Ornament />
          </div>
        </Reveal>

        <ol className="mx-auto mt-16 max-w-3xl">
          {story.steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.05}>
              <li className="relative border-t border-gold/30 py-10 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-8 sm:py-12">
                {/* ghost number */}
                <span
                  className="pointer-events-none select-none font-display text-6xl font-medium leading-none text-wine/15 sm:text-7xl"
                  aria-hidden
                >
                  {step.number}
                </span>
                <div className="mt-2 sm:mt-0">
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink sm:text-3xl">
                    {step.titleZu}
                  </h3>
                  <p className="mt-1 font-body text-sm italic text-wine/80">{step.titleEn}</p>
                  <span className="mt-4 block h-px w-12 bg-gold/60" />
                  {step.body.split("\n\n").map((para, p) => (
                    <p key={p} className="mt-4 font-body text-lg leading-relaxed text-ink/75">
                      {emphasize(para)}
                    </p>
                  ))}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
