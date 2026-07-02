/**
 * The couple's crest pressed as a raised wax seal. Uses the real crest artwork
 * (background removed) and adds 3D depth purely in CSS: a cast drop-shadow, a
 * top-left specular gloss and a bottom-right shading pass — both masked to the
 * seal's own scalloped silhouette so the lighting only lands on the wax.
 *
 * `monogram` is accepted for backwards-compatibility but no longer rendered
 * (the crest already carries the couple's emblem).
 */
const SEAL_SRC = "/textures/seal-crest.png";

const sealMask = {
  WebkitMaskImage: `url('${SEAL_SRC}')`,
  maskImage: `url('${SEAL_SRC}')`,
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as const;

export default function WaxSeal({ monogram: _monogram }: { monogram?: string }) {
  return (
    <div className="relative aspect-square w-48 select-none sm:w-56">
      {/* the crest itself, lifted off the hide with a soft cast shadow */}
      <img
        src={SEAL_SRC}
        alt=""
        draggable={false}
        className="h-full w-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)]"
      />

      {/* specular gloss — light raking from the top-left */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          ...sealMask,
          background:
            "radial-gradient(60% 55% at 32% 26%, rgba(255,247,224,0.55), rgba(255,247,224,0) 62%)",
          mixBlendMode: "screen",
        }}
      />

      {/* contact shading — depth on the bottom-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          ...sealMask,
          background:
            "radial-gradient(65% 60% at 74% 82%, rgba(20,5,8,0.5), rgba(20,5,8,0) 60%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* tight rim highlight to read as a pressed, beveled edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          ...sealMask,
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 78%, rgba(255,240,210,0.35) 90%, rgba(0,0,0,0) 97%)",
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
}
