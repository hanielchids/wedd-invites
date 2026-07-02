import { wedding } from "@/config/wedding";

/** Dark, cowhide-washed sign-off. */
export default function Footer() {
  const { couple, footer } = wedding;

  return (
    <footer className="relative overflow-hidden bg-ink px-5 py-20 text-center">
      <div className="absolute inset-0 bg-cowhide bg-cover bg-center opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-content">
        <p className="font-script text-4xl text-gold sm:text-5xl">{couple.scriptName}</p>
        <p className="mt-4 font-sans text-[0.7rem] uppercase tracking-[0.32em] text-ivory/60">
          {footer.families}
        </p>
        <p className="mt-10 font-script text-3xl text-ivory/90">{footer.thanksZu}</p>
        <p className="mt-1 font-body text-sm italic text-ivory/50">{footer.thanksEn}</p>
      </div>
    </footer>
  );
}
