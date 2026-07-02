"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { wedding } from "@/config/wedding";
import WaxSeal from "./WaxSeal";

const SESSION_KEY = "envelopeOpened";
const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 100%)";
const EASE = [0.22, 1, 0.36, 1] as const;

const DRAG_PX = 240; // how far you lift the seal for a full open
const OPEN_THRESHOLD = 0.42; // release past this → it finishes opening
const TAP_SLOP = 10; // px of movement below which a press counts as a tap
const DISSOLVE_MS = 1900; // fade-to-site once the letter is open

type Seg = { x1: number; y1: number; x2: number; y2: number };

/**
 * Generates realistic saddle-stitching along each seam segment: a row of
 * punched holes (dark recess + lit rim) joined by waxed-thread stitches that
 * lean diagonally, each with a sheen highlight and a soft drop shadow. Geometry
 * is built in real pixels so angles and spacing stay true and responsive.
 */
function buildStitches(
  segments: Seg[],
  opts: { inset: number; period: number; lean: number; key: string },
) {
  const { inset, period, lean, key } = opts;
  const ca = Math.cos(lean);
  const sa = Math.sin(lean);
  const holes: JSX.Element[] = [];
  const threads: JSX.Element[] = [];
  let hi = 0;
  let ti = 0;

  for (const s of segments) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const L = Math.hypot(dx, dy);
    const usable = L - 2 * inset;
    if (usable < period) continue;

    const ux = dx / L;
    const uy = dy / L;
    const nx = -uy; // unit normal (for the highlight offset)
    const ny = ux;
    const vx = ux * ca - uy * sa; // thread direction, leaned off the seam
    const vy = ux * sa + uy * ca;

    const n = Math.max(2, Math.round(usable / period));
    const step = usable / n;

    for (let i = 0; i <= n; i++) {
      const d = inset + i * step;
      holes.push(
        <circle
          key={`h${key}${hi++}`}
          cx={s.x1 + ux * d}
          cy={s.y1 + uy * d}
          r={1}
          fill="#1b0e09"
          fillOpacity={0.55}
        />,
      );
    }

    const tl = step * 0.72;
    for (let i = 0; i < n; i++) {
      const dm = inset + (i + 0.5) * step;
      const mx = s.x1 + ux * dm;
      const my = s.y1 + uy * dm;
      const ax = mx - (vx * tl) / 2;
      const ay = my - (vy * tl) / 2;
      const bx = mx + (vx * tl) / 2;
      const by = my + (vy * tl) / 2;
      threads.push(
        <line
          key={`t${key}${ti}`}
          x1={ax}
          y1={ay}
          x2={bx}
          y2={by}
          stroke="#D8C494"
          strokeWidth={1.4}
          strokeOpacity={0.9}
          strokeLinecap="round"
        />,
        <line
          key={`tl${key}${ti}`}
          x1={ax + nx * -0.4}
          y1={ay + ny * -0.4}
          x2={bx + nx * -0.4}
          y2={by + ny * -0.4}
          stroke="#F3E6BE"
          strokeWidth={0.5}
          strokeOpacity={0.4}
          strokeLinecap="round"
        />,
      );
      ti++;
    }
  }

  return (
    <>
      <defs>
        <filter id={`stitchSh-${key}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      <g>{holes}</g>
      <g filter={`url(#stitchSh-${key})`}>{threads}</g>
    </>
  );
}

/**
 * First-load intro letter. The whole screen is a cowhide envelope sealed with
 * the couple's wax crest, centred. It opens ONLY by interaction, animated like
 * a real letter:
 *   • Desktop — click, hold and LIFT the seal; the flap follows your drag.
 *     Release past the threshold (or just click) and it finishes opening.
 *   • Mobile  — tap.
 * Once open it dissolves to reveal the invitation. Real 3D via CSS perspective
 * + spring physics. Skipped for returning visitors and reduced-motion users.
 */
export default function EnvelopeGate() {
  const { couple, envelope } = wedding;
  const [show, setShow] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [coarse, setCoarse] = useState(false); // touch device → "tap" copy
  const [entering, setEntering] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 }); // viewport px, for stitch geometry

  const progress = useMotionValue(0); // 0 = sealed, 1 = fully open
  const drag = useRef({ active: false, startY: 0, moved: 0, done: false });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // motion-value-driven visuals (follow the drag in real time)
  const flapRotate = useTransform(progress, [0, 1], [0, -180]);
  const sealY = useTransform(progress, [0, 1], [0, -72]);
  const sealScale = useTransform(progress, [0, 1], [1, 1.32]);
  const sealRotate = useTransform(progress, [0, 1], [0, -14]);
  const sealOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  const bloomOpacity = useTransform(progress, [0, 0.5, 1], [0, 0.8, 0.12]);
  const bloomScale = useTransform(progress, [0, 1], [0.6, 1.9]);
  const foldShadow = useTransform(progress, [0, 0.18, 1], [0, 0.45, 0.7]);
  const hintOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isCoarse =
      typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    const seen =
      typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

    setReduce(!!prefersReduced);
    setCoarse(!!isCoarse);
    if (!envelope.enabled || prefersReduced || seen) {
      setShow(false);
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    const captured = timers.current;
    return () => {
      document.body.style.overflow = "";
      captured.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    document.body.style.overflow = "";
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }, []);

  const completeOpen = useCallback(() => {
    if (drag.current.done) return;
    drag.current.done = true;
    animate(progress, 1, {
      ...(reduce ? { duration: 0.45 } : { type: "spring", stiffness: 48, damping: 13, mass: 1 }),
      onComplete: () => {
        setEntering(true);
        timers.current.push(setTimeout(finish, DISSOLVE_MS));
      },
    });
  }, [progress, reduce, finish]);

  const cancelOpen = useCallback(() => {
    animate(progress, 0, { type: "spring", stiffness: 150, damping: 18 });
  }, [progress]);

  // keep stitch geometry in sync with the viewport
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // stitches along the flap's two folded edges (apex pinned to screen centre)
  const flapStitches = useMemo(() => {
    const { w, h } = dims;
    if (!w) return null;
    const fh = h / 2;
    return buildStitches(
      [
        { x1: 0, y1: 0, x2: w / 2, y2: fh },
        { x1: w, y1: 0, x2: w / 2, y2: fh },
      ],
      { inset: 34, period: 13, lean: 0.26, key: "flap" },
    );
  }, [dims]);

  // stitches binding the outer edge of the whole letter
  const frameStitches = useMemo(() => {
    const { w, h } = dims;
    if (!w) return null;
    const M = 18;
    return buildStitches(
      [
        { x1: M, y1: M, x2: w - M, y2: M },
        { x1: w - M, y1: M, x2: w - M, y2: h - M },
        { x1: w - M, y1: h - M, x2: M, y2: h - M },
        { x1: M, y1: h - M, x2: M, y2: M },
      ],
      { inset: 26, period: 13, lean: 0.26, key: "frame" },
    );
  }, [dims]);

  // ── pointer = unified mouse + touch. Tap opens; drag lifts the flap ──
  const onPointerDown = (e: React.PointerEvent) => {
    if (drag.current.done) return;
    drag.current.active = true;
    drag.current.startY = e.clientY;
    drag.current.moved = 0;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dy = drag.current.startY - e.clientY; // up = positive
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dy));
    progress.set(Math.min(Math.max(dy / DRAG_PX, 0), 1));
  };
  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const wasTap = drag.current.moved < TAP_SLOP;
    if (wasTap || progress.get() > OPEN_THRESHOLD) completeOpen();
    else cancelOpen();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="gate"
          role="button"
          tabIndex={0}
          aria-label="Open your invitation"
          className="fixed inset-0 z-[80] h-[100dvh] w-screen touch-none select-none overflow-hidden"
          style={{ perspective: 1800 }}
          initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          animate={
            entering
              ? { opacity: 0, scale: 1.18, filter: "blur(12px)" }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          transition={{ duration: DISSOLVE_MS / 1000, ease: EASE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && completeOpen()}
        >
          {/* the cowhide letter fills the whole screen */}
          <div className="absolute inset-0 bg-cowhide bg-cover bg-center" aria-hidden />
          {/* fine hair/fur grain so the hide reads as real skin */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              backgroundImage: "url('/textures/fur.png')",
              backgroundSize: "340px",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-ink/22" aria-hidden />
          <div
            className="absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(0,0,0,0.5)]"
            aria-hidden
          />

          {/* saddle-stitched leather binding around the whole letter */}
          {frameStitches && (
            <svg
              className="pointer-events-none absolute inset-0 z-[12] h-full w-full"
              viewBox={`0 0 ${dims.w} ${dims.h}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              {frameStitches}
            </svg>
          )}

          {/* couple's name on the interior, revealed as the flap lifts */}
          <div className="absolute inset-x-0 top-[66%] flex justify-center" aria-hidden>
            <span className="font-script text-4xl text-gold/70 sm:text-6xl">
              {couple.scriptName}
            </span>
          </div>

          {/* warm light blooming from the fold */}
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,232,200,0.45)_0%,rgba(197,165,114,0.14)_42%,transparent_72%)]"
              style={{ opacity: bloomOpacity, scale: bloomScale }}
              aria-hidden
            />
          )}

          {/* FULL-SCREEN flap — apex at screen centre so the crest sits dead-middle */}
          <motion.div
            className="absolute inset-x-0 top-0 z-20 origin-top"
            style={{
              height: "50vh",
              transformStyle: "preserve-3d",
              transformOrigin: "top center",
              rotateX: flapRotate,
            }}
          >
            <div
              className="h-full w-full bg-cowhide bg-cover bg-center"
              style={{ clipPath: FLAP_CLIP, backfaceVisibility: "hidden" }}
            />
            {/* matching fur grain on the flap */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-soft-light"
              style={{
                clipPath: FLAP_CLIP,
                backgroundImage: "url('/textures/fur.png')",
                backgroundSize: "340px",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-ink/5 via-ink/15 to-ink/55"
              style={{ clipPath: FLAP_CLIP }}
              aria-hidden
            />
            {/* gold trim tracing the two folded edges */}
            <svg
              className="absolute inset-0 h-full w-full drop-shadow-[0_0_6px_rgba(197,165,114,0.45)]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <polygon
                points="0,0 100,0 50,100"
                fill="none"
                stroke="#C5A572"
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* realistic saddle-stitching just inside the gold edge */}
            {flapStitches && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 ${dims.w} ${dims.h / 2}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                {flapStitches}
              </svg>
            )}
          </motion.div>

          {/* shadow cast under the fold as the flap lifts */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-[50vh]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.55), transparent 60%)",
              opacity: foldShadow,
            }}
            aria-hidden
          />

          {/* wax crest — its centre pinned to the flap's apex (50vh), so it sits
              dead-on the tip of the triangle. Positioning lives on this wrapper;
              the drag animation lives on the inner motion.div so framer-motion's
              transform never clobbers the centring translate. */}
          <div className="pointer-events-none absolute left-1/2 top-[50vh] z-30 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className={`pointer-events-auto ${
                coarse ? "" : "cursor-grab active:cursor-grabbing"
              }`}
              style={{ y: sealY, scale: sealScale, rotate: sealRotate, opacity: sealOpacity }}
            >
              <WaxSeal monogram={couple.monogram} />
            </motion.div>
          </div>

          {/* lift hint (fades out as you drag) */}
          <motion.div
            className="absolute inset-x-0 bottom-[9%] z-30 flex flex-col items-center gap-3"
            style={{ opacity: hintOpacity }}
          >
            {!coarse && !reduce && (
              <motion.span
                className="text-gold-light/80"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              >
                &#8593;
              </motion.span>
            )}
            <motion.span
              className="font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ivory drop-shadow"
              animate={reduce ? {} : { opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {coarse ? "Tap the seal to open" : "Hold & lift the seal to open"}
            </motion.span>
            <span className="h-6 w-px bg-ivory/50" aria-hidden />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
