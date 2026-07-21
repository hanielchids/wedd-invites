import { wedding } from "@/config/wedding";

type MonogramProps = {
  className?: string;
  /** Stroke/text colour, defaults to champagne. */
  color?: string;
};

/**
 * Interlocked initials inside a thin-stroke arch — the site's "brand".
 * Appears in the preloader, sticky header and footer.
 */
export default function Monogram({ className = "", color = "#9E9A92" }: MonogramProps) {
  const [a, b] = [
    wedding.couple.partnerA.firstName[0],
    wedding.couple.partnerB.firstName[0],
  ];
  return (
    <svg viewBox="0 0 64 80" fill="none" aria-hidden className={className}>
      <path
        d="M4 76 V 34 C 4 15, 16 4, 32 4 C 48 4, 60 15, 60 34 V 76"
        stroke={color}
        strokeWidth="1"
      />
      <text
        x="24"
        y="52"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontSize="30"
        fill={color}
      >
        {a}
      </text>
      <text
        x="40"
        y="60"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontSize="30"
        fill={color}
      >
        {b}
      </text>
    </svg>
  );
}
