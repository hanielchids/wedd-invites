import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

/** Vertical timeline of the day, hairline-ruled. */
export default function Schedule() {
  const { schedule } = wedding;

  return (
    <section id="schedule" className="bg-parchment px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-content">
        <Reveal className="text-center">
          <p className="eyebrow">{schedule.eyebrow}</p>
          <div className="hairline" />
          <h2 className="display-md mt-6">{schedule.title}</h2>
        </Reveal>

        <ol className="mx-auto mt-16 max-w-xl">
          {schedule.items.map((item, i) => (
            <li key={item.time}>
              <Reveal
                delay={i * 120}
                className="grid grid-cols-[5rem_1px_1fr] gap-6 py-8 sm:grid-cols-[6rem_1px_1fr] sm:gap-10"
              >
                <p className="pt-1 text-right font-sans text-[0.78rem] tracking-[0.2em] text-fern">
                  {item.time}
                </p>
                <div className="bg-champagne/60" />
                <div>
                  <h3 className="font-display text-2xl font-normal text-charcoal sm:text-3xl">
                    {item.title}
                  </h3>
                  {item.detail && (
                    <p className="mt-2 font-body text-[1.02rem] leading-relaxed text-charcoal/70">
                      {item.detail}
                    </p>
                  )}
                </div>
              </Reveal>
              {i < schedule.items.length - 1 && (
                <div className="mx-auto h-px w-full max-w-xl bg-champagne/25" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
