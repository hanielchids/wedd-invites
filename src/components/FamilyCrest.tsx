import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";

/** Two family names flanking a diamond — the union of two houses. */
export default function FamilyCrest() {
  const { a, b } = wedding.families;

  return (
    <section className="bg-ivory px-5 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-content">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-10">
          <div className="text-right">
            <h2 className="display-sm text-ink">{a.surname}</h2>
          </div>
          <div className="flex flex-col items-center gap-2 text-gold">
            <span className="h-10 w-px bg-gold/50 sm:h-16" />
            <span className="text-base">&#9670;</span>
            <span className="h-10 w-px bg-gold/50 sm:h-16" />
          </div>
          <div className="text-left">
            <h2 className="display-sm text-ink">{b.surname}</h2>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
