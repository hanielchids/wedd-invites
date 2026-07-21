import { wedding } from "@/config/wedding";
import Monogram from "./Monogram";

export default function Footer() {
  const { couple, dateLabel, footer, venue } = wedding;

  return (
    <footer className="bg-forest-deep px-5 py-20 text-center">
      <Monogram className="mx-auto h-20 w-auto" />
      <p className="mt-8 font-display text-3xl font-light italic text-ivory">
        {couple.names}
      </p>
      <p className="mt-3 font-sans text-[0.66rem] uppercase tracking-[0.3em] text-ivory/60">
        {dateLabel} · {venue.name}
      </p>
      <p className="mt-8 font-body italic text-ivory/70">{footer.closing}</p>
      <p className="mt-10 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-ivory/35">
        {footer.families} · {footer.thanks}
      </p>
    </footer>
  );
}
