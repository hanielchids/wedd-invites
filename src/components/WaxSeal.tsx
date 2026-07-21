import { wedding } from "@/config/wedding";

type WaxSealProps = {
  className?: string;
};

/**
 * Forest-green wax seal with the couple's embossed initials — shown while
 * the veil preloader holds, echoing the seal on the printed invitations.
 * Carries id="s22-wax-seal" so links with that fragment resolve to it.
 */
export default function WaxSeal({ className = "" }: WaxSealProps) {
  const [a, b] = [
    wedding.couple.partnerA.firstName[0],
    wedding.couple.partnerB.firstName[0],
  ];
  return (
    <svg
      id="s22-wax-seal"
      viewBox="0 0 120 120"
      aria-hidden
      className={className}
    >
      <defs>
        <radialGradient id="wax-body" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#4E7357" />
          <stop offset="55%" stopColor="#3E5D46" />
          <stop offset="100%" stopColor="#2A4232" />
        </radialGradient>
        <radialGradient id="wax-sheen" cx="35%" cy="28%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Irregular pooled-wax edge */}
      <path
        d="M60 6
           C 74 4, 88 10, 96 20
           C 105 30, 112 42, 110 56
           C 113 68, 108 82, 99 92
           C 90 103, 76 110, 62 112
           C 48 114, 34 108, 24 99
           C 14 90, 7 77, 8 63
           C 6 49, 12 35, 21 25
           C 30 14, 46 8, 60 6 Z"
        fill="url(#wax-body)"
      />
      <path
        d="M60 6
           C 74 4, 88 10, 96 20
           C 105 30, 112 42, 110 56
           C 113 68, 108 82, 99 92
           C 90 103, 76 110, 62 112
           C 48 114, 34 108, 24 99
           C 14 90, 7 77, 8 63
           C 6 49, 12 35, 21 25
           C 30 14, 46 8, 60 6 Z"
        fill="url(#wax-sheen)"
      />

      {/* Stamped inner rim */}
      <circle cx="60" cy="59" r="40" fill="none" stroke="#D6C4A4" strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="60" cy="59" r="36.5" fill="none" stroke="#D6C4A4" strokeOpacity="0.3" strokeWidth="0.6" />

      {/* Embossed initials */}
      <text
        x="46"
        y="66"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontSize="30"
        fill="#D6C4A4"
      >
        {a}
      </text>
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontFamily="var(--font-script), cursive"
        fontSize="16"
        fill="#D6C4A4"
        fillOpacity="0.85"
      >
        &amp;
      </text>
      <text
        x="75"
        y="66"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontSize="30"
        fill="#D6C4A4"
      >
        {b}
      </text>

      {/* Date around the bottom of the rim */}
      <path id="seal-arc" d="M 28 76 A 38 38 0 0 0 92 76" fill="none" />
      <text
        fontFamily="var(--font-sans), sans-serif"
        fontSize="6.5"
        letterSpacing="2.5"
        fill="#D6C4A4"
        fillOpacity="0.75"
      >
        <textPath href="#seal-arc" startOffset="50%" textAnchor="middle">
          17 · 09 · 2026
        </textPath>
      </text>
    </svg>
  );
}
