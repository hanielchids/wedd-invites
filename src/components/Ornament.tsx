/** A thin gold rule with a centered diamond — used as a section divider. */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament-rule ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gold/60" />
      <span className="text-[0.7rem] leading-none">&#9670;</span>
      <span className="h-px w-12 bg-gold/60" />
    </div>
  );
}
