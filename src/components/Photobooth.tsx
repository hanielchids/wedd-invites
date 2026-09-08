"use client";

/**
 * /photobooth — "The Wall"
 * The playful guest photo page: live camera → polaroid develop → share/save,
 * plus camera-roll uploads and a pin-board wall.
 *
 * Phase 1: everything runs client-side (wall is local state).
 * Phase 2 wires saves + the shared wall to Supabase — see src/lib/photowallStore.ts.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Schoolbell, Caveat } from "next/font/google";
import Monogram from "@/components/Monogram";

const schoolbell = Schoolbell({ weight: "400", subsets: ["latin"] });
const caveat = Caveat({ weight: "700", subsets: ["latin"] });

type WallItem = {
  id: string;
  name: string;
  time: string;
  src: string; // object URL / data URL / public storage URL of the (unframed) photo
  loves: number;
  loved?: boolean;
  isNew?: boolean;
  local?: boolean; // created on this device, may not be synced yet
};

type ServerItem = {
  id: string;
  url: string;
  name: string;
  time: string;
  loves: number;
  lovedBy?: string[];
};

const MISSIONS = [
  "someone who speaks a language you don't",
  "the dance floor at its absolute worst",
  "your whole table, all of you, no hiding",
  "golden hour vs the Magalies — go",
  "the couple, caught off guard",
];

function now() {
  return new Date().toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Compose the branded polaroid (frame + chin + crest + caption) for sharing. */
async function composePolaroid(photoSrc: string, name: string): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("photo load failed"));
    img.src = photoSrc;
  });
  const seal = new Image();
  await new Promise<void>((res) => {
    seal.onload = () => res();
    seal.onerror = () => res(); // crest is decorative — never block the share
    seal.src = "/images/eland-seal.png";
  });

  const W = 720, PAD = 28, PHOTO = W - PAD * 2, CHIN = 150;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = PAD + PHOTO + CHIN;
  const x = c.getContext("2d")!;
  x.fillStyle = "#FFFEF9";
  x.fillRect(0, 0, c.width, c.height);

  const s = Math.max(PHOTO / img.naturalWidth, PHOTO / img.naturalHeight);
  x.save();
  x.beginPath();
  x.rect(PAD, PAD, PHOTO, PHOTO);
  x.clip();
  x.drawImage(
    img,
    PAD + (PHOTO - img.naturalWidth * s) / 2,
    PAD + (PHOTO - img.naturalHeight * s) / 2,
    img.naturalWidth * s,
    img.naturalHeight * s,
  );
  x.restore();

  // chin: crest lockup left, guest name centred
  const chinY = PAD + PHOTO;
  if (seal.naturalWidth) x.drawImage(seal, PAD + 4, chinY + 26, 64, 64);
  x.fillStyle = "#3A382F";
  x.font = "italic 26px 'Cormorant Garamond', Georgia, serif";
  x.textAlign = "left";
  x.fillText("Haniel & Zenzi", PAD + 76, chinY + 62);
  x.fillStyle = "#8F8A79";
  x.font = "13px system-ui, sans-serif";
  x.fillText("1 7  S E P T E M B E R  2 0 2 6", PAD + 76, chinY + 84);
  x.fillStyle = "#3A382F";
  x.font = `44px ${caveat.style.fontFamily}, cursive`;
  x.textAlign = "center";
  x.fillText(name, W / 2, chinY + 128);

  return new Promise((res) =>
    c.toBlob((b) => res(b as Blob), "image/jpeg", 0.92),
  );
}

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const streamRef = useRef<MediaStream | null>(null);
  const remoteRef = useRef<"unknown" | "on" | "off">("unknown");
  const deviceIdRef = useRef<string>("");
  const idMapRef = useRef<Map<string, string>>(new Map()); // local id -> server id
  const [fresh, setFresh] = useState<WallItem | null>(null);
  const [developing, setDeveloping] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [wall, setWall] = useState<WallItem[]>([]);
  const [missionsDone, setMissionsDone] = useState<boolean[]>(
    MISSIONS.map(() => false),
  );
  const [name, setName] = useState("");
  const [askName, setAskName] = useState(false);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(""), 2600);
  }, []);

  // identity + remote wall (poll every 15s; falls back to local-only until Supabase env is set)
  useEffect(() => {
    setName(localStorage.getItem("hz-guest-name") ?? "");
    let d = localStorage.getItem("hz-device-id");
    if (!d) {
      d = crypto.randomUUID();
      localStorage.setItem("hz-device-id", d);
    }
    deviceIdRef.current = d;

    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/api/photowall", { cache: "no-store" });
        if (res.status === 503) {
          remoteRef.current = "off";
          return;
        }
        if (!res.ok) return;
        remoteRef.current = "on";
        const { items } = (await res.json()) as { items: ServerItem[] };
        if (dead) return;
        setWall((w) => {
          const mapped: WallItem[] = items.map((s) => ({
            id: s.id,
            name: s.name,
            time: s.time,
            src: s.url,
            loves: s.loves,
            loved: s.lovedBy?.includes(deviceIdRef.current),
          }));
          const serverIds = new Set(mapped.map((m) => m.id));
          const keepLocal = w.filter(
            (p) => p.local && !serverIds.has(idMapRef.current.get(p.id) ?? ""),
          );
          return [...keepLocal, ...mapped];
        });
      } catch {
        /* offline — keep whatever we have */
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      dead = true;
      clearInterval(timer);
    };
  }, []);

  // camera lifecycle — restarts when the user flips front/back
  useEffect(() => {
    let cancelled = false;
    (async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraOn(true);
      } catch {
        if (!cancelled) setCameraOn((on) => on ?? false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [facing]);
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  /** Upload one photo to storage via signed URL, then pin its metadata row. */
  const persist = useCallback(
    async (item: WallItem, blob: Blob) => {
      if (remoteRef.current === "off") return;
      try {
        const signRes = await fetch("/api/photowall/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contentType: blob.type || "image/jpeg" }),
        });
        if (!signRes.ok) throw new Error();
        const { key, url } = (await signRes.json()) as { key: string; url: string };
        const put = await fetch(url, {
          method: "PUT",
          headers: { "content-type": blob.type || "image/jpeg" },
          body: blob,
        });
        if (!put.ok) throw new Error();
        const meta = await fetch("/api/photowall", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, name: item.name, deviceId: deviceIdRef.current }),
        });
        if (!meta.ok) throw new Error();
        const { id } = (await meta.json()) as { id: string };
        idMapRef.current.set(item.id, id);
      } catch {
        if (remoteRef.current === "on")
          say("couldn't reach the wall — kept on your phone for now");
      }
    },
    [say],
  );

  const guestName = () => name.trim() || "guest";

  const pinToWall = useCallback((item: WallItem) => {
    setWall((w) => [item, ...w.map((p) => ({ ...p, isNew: false }))]);
  }, []);

  const snap = useCallback(() => {
    const v = videoRef.current;
    if (!cameraOn || !v || !v.videoWidth) {
      fileRef.current?.click();
      return;
    }
    setFlash((f) => f + 1);
    const side = Math.min(v.videoWidth, v.videoHeight);
    const c = document.createElement("canvas");
    c.width = c.height = 900;
    const ctx = c.getContext("2d")!;
    if (facing === "user") {
      // selfies save the way the mirrored preview showed them
      ctx.translate(900, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      v,
      (v.videoWidth - side) / 2,
      (v.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      900,
      900,
    );
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const item: WallItem = {
          id: crypto.randomUUID(),
          name: guestName(),
          time: now(),
          src: URL.createObjectURL(blob),
          loves: 0,
          isNew: true,
          local: true,
        };
        setFresh(item);
        setDeveloping(true);
        setSavedNote(false);
        if (!localStorage.getItem("hz-guest-name")) setAskName(true);
        setTimeout(
          () => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
          50,
        );
        setTimeout(() => {
          setSavedNote(true);
          pinToWall(item);
          persist(item, blob);
        }, 2400);
      },
      "image/jpeg",
      0.9,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, facing, name, pinToWall, persist]);

  const retake = useCallback(() => {
    if (fresh) setWall((w) => w.filter((p) => p.id !== fresh.id));
    setFresh(null);
    setDeveloping(false);
    setSavedNote(false);
    say("gone. the wall never saw it.");
  }, [fresh, say]);

  const share = useCallback(async () => {
    if (!fresh) return;
    try {
      const blob = await composePolaroid(fresh.src, fresh.name);
      const file = new File([blob], "hz-polaroid.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "H&Z — the wall",
          text: "my polaroid from Haniel & Zenzi's wedding 📸",
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "hz-polaroid.jpg";
        a.click();
        say("saved the polaroid to your downloads");
      }
    } catch {
      /* user cancelled the share sheet */
    }
  }, [fresh, say]);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      if (!localStorage.getItem("hz-guest-name")) setAskName(true);
      Array.from(files)
        .slice(0, 6)
        .forEach((f, i) => {
          const item: WallItem = {
            id: crypto.randomUUID(),
            name: guestName(),
            time: now(),
            src: URL.createObjectURL(f),
            loves: 0,
            isNew: i === 0,
            local: true,
          };
          pinToWall(item);
          persist(item, f);
        });
      say(files.length > 1 ? `${Math.min(files.length, 6)} polaroids on the wall ✓` : "on the wall ✓");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [name, pinToWall, say],
  );

  const saveName = () => {
    const n = name.trim();
    if (!n) return;
    localStorage.setItem("hz-guest-name", n);
    setAskName(false);
    setFresh((f) => (f ? { ...f, name: n } : f));
    setWall((w) => w.map((p) => (p.name === "guest" ? { ...p, name: n } : p)));
  };

  return (
    <div className={`${schoolbell.className} pb-booth min-h-screen bg-ivory text-charcoal`}>
      {/* raw injection — plain {PB_CSS} children get entity-escaped in SSR and break hydration */}
      <style dangerouslySetInnerHTML={{ __html: PB_CSS }} />

      {/* hero leaf motif, same as the site's first section */}
      <div className="pb-leaf" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="#3E5D46">
          <path d="M100 10 C 60 50, 50 120, 100 190 C 150 120, 140 50, 100 10 Z" />
          <path d="M30 60 C 55 75, 75 110, 70 160 C 30 130, 20 90, 30 60 Z" />
          <path d="M170 60 C 145 75, 125 110, 130 160 C 170 130, 180 90, 170 60 Z" />
        </svg>
      </div>

      <div key={flash} className={flash ? "pb-flash go" : "pb-flash"} />

      <main className="relative z-10 mx-auto max-w-[520px] px-[18px] pb-20 pt-5">
        <header className="flex flex-col items-center gap-0.5 pb-1 pt-6 text-center">
          <Monogram className="h-20 w-16 -rotate-2" />
          <div className="font-display text-3xl italic">
            Haniel <span className="text-fern">&amp;</span> Zenzi
          </div>
          <h1 className="pb-h1">
            <span className="pb-under">
              the wall
              <svg className="pb-scrawl" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true">
                <path className="pb-doodle" d="M4 12 C 40 4, 70 16, 105 9 S 170 5, 196 11" strokeWidth="3.5" />
              </svg>
            </span>
          </h1>
          <p className="mt-4 max-w-[34ch] rotate-[0.4deg] text-lg text-charcoal/60">
            everyone&apos;s photos, one wall
            <br />
            <span className="text-fern">17 Sept 2026</span> · Green Leaves
          </p>
        </header>

        {/* camera */}
        <div className="pb-wonky relative mt-6 rotate-[0.5deg] bg-[#FBF7EE] p-4 pb-[18px] shadow-[5px_6px_0_rgba(47,58,47,0.16)]">
          <div className="pb-tape" aria-hidden="true" />
          <div className="pb-viewfinder">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
            />
            {cameraOn && (
              <button
                className="pb-flip"
                onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
                aria-label="flip between front and back camera"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path className="pb-doodle" d="M19 12 C 19.4 8, 16.4 5, 12.4 5 C 9 5, 6.4 7.4, 5.6 10" />
                  <path className="pb-doodle" d="M5.2 5.6 L 5.4 10.2 L 9.8 9.6" />
                  <path className="pb-doodle" d="M5 13.6 C 5.4 17.4, 8.4 19.6, 12 19.6 C 15 19.6, 17.6 17.8, 18.6 15" />
                  <path className="pb-doodle" d="M18.9 18.5 L 18.6 14.2 L 14.2 14.7" />
                </svg>
              </button>
            )}
            {cameraOn === false && (
              <div className="pb-vfnote">
                <span>camera&apos;s shy — no problem</span>
                <small>use &ldquo;add yours&rdquo; below instead</small>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="max-w-[120px] -rotate-2 text-[15px] text-charcoal/60">
              tap it — the polaroid does the rest
              <svg className="h-[34px] w-11 text-fern" viewBox="0 0 44 34" aria-hidden="true">
                <path className="pb-doodle" d="M4 6 C 16 22, 26 26, 38 24" />
                <path className="pb-doodle" d="M31 18 L 39 24 L 30 28" />
              </svg>
            </div>
            <button className="pb-shutter" onClick={snap} aria-label="take a photo">
              <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
                <path className="pb-doodle" d="M6 13 C 5 11, 7 10, 9 10 L 13 10 L 16 6.5 L 25 6.5 L 28 10 L 32 10 C 34 10, 35.5 11, 35 13 L 35 29 C 35 31, 34 32.5, 31.5 32.5 L 8.5 32.5 C 6.5 32.5, 5.5 31, 5.8 29 Z" />
                <circle className="pb-doodle" cx="20.5" cy="21" r="6.4" />
              </svg>
            </button>
          </div>

          {fresh && (
            <div ref={stageRef} className="mt-5 flex flex-col items-center gap-3.5">
              {askName && (
                <div className="flex items-center gap-2 text-[17px]">
                  <label htmlFor="pb-name">sign it:</label>
                  <input
                    id="pb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    placeholder="your first name"
                    className="pb-wonky-b w-40 bg-white px-3 py-1 text-center outline-none focus:border-champagne"
                  />
                  <button className="pb-sketchbtn !px-3 !py-1 text-[15px]" onClick={saveName}>
                    ok
                  </button>
                </div>
              )}
              <div className={`pb-polaroid relative -rotate-2 ${developing ? "pb-developing" : ""}`}>
                <div className="pb-tape2" aria-hidden="true" />
                <div className="pb-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fresh.src} alt="your fresh polaroid" />
                </div>
                <PolaroidChin name={askName ? name.trim() || "you" : fresh.name} sub="just now" />
              </div>
              <div className={`pb-savednote ${savedNote ? "pb-show" : ""}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path className="pb-doodle" d="M4 13 C 7 16, 9 18, 10 19 C 13 13, 17 8, 21 5" />
                </svg>
                it&apos;s on the wall — no takebacks (ok, one)
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="pb-sketchbtn pb-wonky !bg-fern !text-ivory" onClick={share}>
                  share it
                </button>
                <button className="pb-sketchbtn pb-wonky-b" onClick={retake}>
                  retake
                </button>
              </div>
            </div>
          )}
        </div>

        {/* missions */}
        <section className="mt-12">
          <div className="flex -rotate-[0.8deg] items-baseline gap-2.5">
            <h2 className="text-3xl">missions</h2>
            <span className="text-[15px] text-charcoal/60">snap these &amp; the wall fills itself</span>
          </div>
          <div className="pb-missions">
            {MISSIONS.map((m, i) => (
              <button
                key={m}
                className={`pb-mission ${i % 2 ? "pb-wonky-b" : "pb-wonky"} ${missionsDone[i] ? "pb-done" : ""}`}
                onClick={() =>
                  setMissionsDone((d) => d.map((v, j) => (j === i ? !v : v)))
                }
              >
                {m}
                <span className="pb-go">
                  {missionsDone[i] ? "got it ✓" : "tap when you got it →"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* wall */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h2 className="-rotate-[0.8deg] text-3xl">fresh off the wall</h2>
            <button className="pb-sketchbtn pb-wonky" onClick={() => fileRef.current?.click()}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path className="pb-doodle" d="M12 16 L 12 4.6" />
                <path className="pb-doodle" d="M7.4 9 L 12 4.4 L 16.6 9" />
                <path className="pb-doodle" d="M4.6 15.6 L 4.6 19.6 L 19.5 19.4 L 19.4 15.4" />
              </svg>
              add yours
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {wall.length === 0 ? (
            <p className="mt-8 rotate-[-1deg] text-center text-lg text-charcoal/50">
              nothing here yet — be the first one on the wall
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-6">
              {wall.map((p, i) => (
                // descending z-index: earlier cards paint above later neighbours,
                // so the top-right heart stays tappable despite rotated overlaps
                <div key={p.id} className="relative" style={{ zIndex: wall.length - i }}>
                  <div className="pb-pin" aria-hidden="true" />
                  <div className={`pb-polaroid w-full !p-2 !pb-0 ${["-rotate-[1.4deg]", "rotate-[1.1deg]", "rotate-[1.6deg]", "-rotate-[0.8deg]"][i % 4]}`}>
                    <div className="pb-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={`polaroid by ${p.name}`} />
                    </div>
                    <PolaroidChin small name={p.name} sub={p.time} />
                    <button
                      className={`pb-heart ${p.loved ? "pb-loved" : ""}`}
                      aria-label="love this photo"
                      onClick={() => {
                        const on = !p.loved;
                        setWall((w) =>
                          w.map((q) =>
                            q.id === p.id
                              ? { ...q, loved: on, loves: q.loves + (on ? 1 : -1) }
                              : q,
                          ),
                        );
                        const sid = p.local ? idMapRef.current.get(p.id) : p.id;
                        if (remoteRef.current === "on" && sid) {
                          fetch("/api/photowall/react", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                              uploadId: sid,
                              deviceId: deviceIdRef.current,
                              on,
                            }),
                          }).catch(() => {});
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20 C 5 15, 3 10.5, 4.5 7.5 C 6 4.8, 9.6 4.8, 12 8 C 14.4 4.8, 18 4.8, 19.5 7.5 C 21 10.5, 19 15, 12 20 Z" />
                      </svg>
                      <span>{p.loves}</span>
                    </button>
                    {p.isNew && <div className="pb-newbadge">just landed</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 text-center text-[15px] text-charcoal/60">
          <div className="font-display text-lg italic text-charcoal">
            part of hanielandzenzi.co.za — but this page gets to be silly
          </div>
        </footer>
      </main>

      <div className={`pb-toast ${toast ? "pb-show" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}

function PolaroidChin({ name, sub, small }: { name: string; sub: string; small?: boolean }) {
  return (
    <div className={`pb-chin ${small ? "pb-chin-sm" : ""}`}>
      <div className="pb-chinlogo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/eland-seal.png" alt="" />
        <span className="pb-ln1">Haniel &amp; Zenzi</span>
        <span className="pb-ln2">17 September</span>
      </div>
      <div className={`pb-cap ${caveat.className}`}>
        {name}
        <small>{sub}</small>
      </div>
    </div>
  );
}

const PB_CSS = `
.pb-booth{overflow-x:hidden}
.pb-leaf{position:fixed; right:-120px; top:-120px; width:440px; height:440px; opacity:.07; filter:blur(2px); pointer-events:none; z-index:0}
.pb-doodle{stroke:currentColor; fill:none; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round}
.pb-wonky{border:2.5px solid #2F3A2F; border-radius:255px 18px 225px 18px / 18px 225px 18px 255px}
.pb-wonky-b{border:2.5px solid #2F3A2F; border-radius:18px 225px 18px 255px / 255px 18px 225px 18px}
.pb-h1{font-size:52px; font-weight:400; margin-top:2px; line-height:1; transform:rotate(-1.4deg)}
.pb-under{position:relative; display:inline-block}
.pb-scrawl{position:absolute; left:-4%; bottom:-12px; width:108%; height:18px; color:#B9A07A}
.pb-tape{position:absolute; top:-14px; left:50%; width:110px; height:30px; transform:translateX(-50%) rotate(-2deg); background:rgba(214,196,164,.6); box-shadow:0 1px 2px rgba(0,0,0,.08)}
.pb-tape2{position:absolute; top:-12px; left:26px; width:84px; height:26px; background:rgba(214,196,164,.6); transform:rotate(-5deg)}
.pb-viewfinder{position:relative; aspect-ratio:4/4.6; overflow:hidden; border:2.5px solid #2F3A2F; border-radius:16px 200px 14px 220px / 220px 14px 200px 16px; background:#F2E9DA}
.pb-vfnote{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; color:#2F3A2F; font-size:20px; text-align:center; padding:0 20px}
.pb-vfnote small{font-size:14px; opacity:.7}
.pb-flip{position:absolute; right:10px; bottom:10px; width:46px; height:46px; border-radius:50% 46% 52% 48% / 48% 52% 46% 50%; border:2.5px solid #2F3A2F; background:rgba(255,254,249,.88); display:grid; place-items:center; color:#2F3A2F; z-index:3; cursor:pointer}
.pb-flip:active{transform:scale(.92)}
.pb-shutter{width:84px; height:84px; border-radius:50% 46% 52% 48% / 48% 52% 46% 50%; border:3px solid #2F3A2F; background:#B9A07A; display:grid; place-items:center; box-shadow:4px 5px 0 rgba(47,58,47,.16); transition:transform .1s ease; color:#2F3A2F}
.pb-shutter:active{transform:scale(.92)}
.pb-flash{position:fixed; inset:0; background:#fff; opacity:0; pointer-events:none; z-index:60}
.pb-flash.go{animation:pbflash .45s ease-out}
@keyframes pbflash{0%{opacity:0}12%{opacity:.95}100%{opacity:0}}
.pb-sketchbtn{display:inline-flex; align-items:center; gap:9px; background:#FBF7EE; padding:10px 18px; box-shadow:3px 4px 0 rgba(47,58,47,.16); transform:rotate(-.6deg); transition:transform .12s ease; font-size:19px}
.pb-sketchbtn:hover{transform:rotate(0) translateY(-2px)}
.pb-sketchbtn:active{transform:translateY(2px); box-shadow:1px 2px 0 rgba(47,58,47,.16)}
.pb-polaroid{background:#FFFEF9; padding:11px 11px 0; width:260px; box-shadow:0 10px 22px rgba(47,58,47,.16); color:#3A382F}
.pb-photo{aspect-ratio:1/1; background:#111; overflow:hidden}
.pb-photo img{width:100%; height:100%; object-fit:cover; display:block}
.pb-developing .pb-photo img{animation:pbdevelop 2.6s ease forwards}
@keyframes pbdevelop{0%{filter:brightness(3.2) contrast(.15) saturate(.1) blur(6px)}60%{filter:brightness(1.5) contrast(.6) saturate(.5) blur(2px)}100%{filter:none}}
.pb-chin{position:relative; min-height:62px; padding:9px 70px 11px; text-align:center; display:block}
.pb-chin-sm{min-height:56px; padding:7px 58px 9px}
.pb-chinlogo{position:absolute; left:9px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; align-items:flex-start; gap:2px; width:66px}
.pb-chin-sm .pb-chinlogo{left:7px; width:54px}
.pb-chinlogo img{width:26px; height:26px; filter:drop-shadow(0 1px 1px rgba(47,58,47,.25))}
.pb-chin-sm .pb-chinlogo img{width:21px; height:21px}
.pb-ln1{font-family:var(--font-display), 'Cormorant Garamond', serif; font-style:italic; font-size:10.5px; line-height:1; color:#3A382F; white-space:nowrap}
.pb-chin-sm .pb-ln1{font-size:9px}
.pb-ln2{font-size:6.8px; letter-spacing:.14em; text-transform:uppercase; color:#8F8A79; font-family:system-ui,sans-serif; white-space:nowrap}
.pb-chin-sm .pb-ln2{font-size:5.8px}
.pb-cap{font-size:21px; line-height:1.05; color:#3A382F}
.pb-chin-sm .pb-cap{font-size:18px}
.pb-cap small{font-size:14px; color:#8F8A79; display:block}
.pb-savednote{display:flex; align-items:center; gap:8px; font-size:18px; color:#6F8F73; opacity:0; transition:opacity .4s ease .2s}
.pb-savednote.pb-show{opacity:1}
.pb-missions{display:flex; gap:14px; overflow-x:auto; padding:18px 4px 22px; scroll-snap-type:x mandatory}
.pb-missions::-webkit-scrollbar{display:none}
.pb-mission{min-width:186px; scroll-snap-align:start; background:#FBF7EE; padding:14px 14px 12px; font-size:18px; line-height:1.3; box-shadow:3px 4px 0 rgba(47,58,47,.16); display:flex; flex-direction:column; gap:8px; text-align:left}
.pb-mission:nth-child(odd){transform:rotate(-1.3deg)}
.pb-mission:nth-child(even){transform:rotate(1.1deg)}
.pb-go{font-size:14px; color:#B9A07A; margin-top:auto}
.pb-done{outline:3px solid #6F8F73; outline-offset:-3px}
.pb-done .pb-go{color:#6F8F73}
.pb-pin{position:absolute; top:-9px; left:50%; transform:translateX(-50%); width:16px; height:16px; border-radius:50%; background:#B9A07A; border:2px solid #2F3A2F; z-index:2}
.pb-heart{position:absolute; left:6px; top:6px; z-index:4; border:none; background:#FFFEF9; border-radius:10px 60px 10px 60px/60px 10px 60px 10px; box-shadow:0 2px 6px rgba(0,0,0,.25); display:flex; align-items:center; gap:4px; padding:8px 10px; font-size:17px; color:#8F8A79; cursor:pointer}
.pb-heart svg{width:22px; height:22px; color:#C25B4E; fill:none; stroke:currentColor; stroke-width:2.4}
.pb-loved svg{fill:#C25B4E; animation:pbpop .35s ease}
.pb-loved{color:#C25B4E}
@keyframes pbpop{0%{transform:scale(1)}40%{transform:scale(1.45) rotate(-8deg)}100%{transform:scale(1)}}
.pb-newbadge{position:absolute; top:6px; right:-6px; transform:rotate(6deg); background:#B9A07A; color:#2F3A2F; font-size:13px; padding:2px 8px; border:2px solid #2F3A2F; border-radius:100px 8px 100px 8px/8px 100px 8px 100px; z-index:2}
.pb-toast{position:fixed; left:50%; bottom:26px; transform:translateX(-50%) translateY(80px); background:#2F3A2F; color:#F7F1E6; padding:10px 20px; font-size:17px; border-radius:14px 120px 14px 120px/120px 14px 120px 14px; transition:transform .3s ease; z-index:70; max-width:88vw; text-align:center}
.pb-toast.pb-show{transform:translateX(-50%) translateY(0)}
@media (prefers-reduced-motion: reduce){
  .pb-developing .pb-photo img,.pb-flash.go,.pb-loved svg{animation:none}
}
`;
