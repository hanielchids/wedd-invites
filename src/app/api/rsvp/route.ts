import { NextResponse } from "next/server";
import { wedding } from "@/config/wedding";

/**
 * RSVP endpoint.
 *
 * Validates the payload, then forwards it as a Google Forms response so every
 * RSVP lands in this event's OWN linked Google Sheet — no database needed.
 *
 * This event uses its own form (separate from the traditional-wedding site).
 * Set the ids below once the form exists — see README "RSVP setup", or run
 * `npm run form:entries -- <form url>` to print the entry ids automatically.
 * Env vars override the constants, e.g. per environment.
 */

const FORM_ID =
  process.env.GOOGLE_FORM_ID ??
  "1FAIpQLSezJznA2e_wtl__X7ppgdfoNXUNyftpQ6HbPXp35jZbbb_N-g";

const ENTRY = {
  name: process.env.GOOGLE_FORM_ENTRY_NAME ?? "entry.236954274",
  email: process.env.GOOGLE_FORM_ENTRY_EMAIL ?? "entry.1117287134",
  phone: process.env.GOOGLE_FORM_ENTRY_PHONE ?? "entry.275815979",
  attending: process.env.GOOGLE_FORM_ENTRY_ATTENDING ?? "entry.1354076483",
  dietary: process.env.GOOGLE_FORM_ENTRY_DIETARY ?? "entry.667799553",
  message: process.env.GOOGLE_FORM_ENTRY_MESSAGE ?? "entry.900882754",
};

type RSVPPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  attending?: "accept" | "decline" | null;
  dietary?: string[];
  message?: string;
  /** Honeypot — rendered invisibly on the form; humans leave it empty. */
  website?: string;
  /** Milliseconds between the form rendering and being submitted. */
  formAge?: number;
};

/**
 * Anti-bot + duplicate guards. In-memory, so they reset on redeploy/cold
 * start — a best-effort layer. The Google Sheet is the source of truth;
 * dedupe there for certainty (Data → Data clean-up → Remove duplicates).
 */
const MIN_FORM_AGE_MS = 2500;
const RATE_LIMIT = 5; // submissions per IP…
const RATE_WINDOW_MS = 60 * 60 * 1000; // …per hour

const seenEmails = new Set<string>();
const hitsByIp = new Map<string, number[]>();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (hitsByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  hitsByIp.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

/** Builds the Google Forms formResponse POST from the validated payload. */
async function forwardToGoogleForm(data: RSVPPayload): Promise<boolean> {
  const params = new URLSearchParams();
  const entries: [string, string][] = [
    [ENTRY.name, data.fullName ?? ""],
    [ENTRY.email, data.email ?? ""],
    [ENTRY.phone, data.phone ?? ""],
    // The form's "Will you attend?" is multiple-choice with exactly Yes / No.
    [ENTRY.attending, data.attending === "accept" ? "Yes" : "No"],
    [ENTRY.dietary, (data.dietary ?? []).join(", ")],
    [ENTRY.message, data.message ?? ""],
  ];
  for (const [key, value] of entries) {
    if (key && value) params.append(key, value);
  }

  const res = await fetch(
    `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );
  return res.ok;
}

export async function POST(request: Request) {
  // Responses have closed — refuse here too, so a stale page or a direct
  // POST can't drop a late entry into the sheet.
  if (wedding.rsvp.closed) {
    return NextResponse.json(
      { ok: false, error: wedding.rsvp.closedHeading },
      { status: 410 }
    );
  }

  let data: RSVPPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Bots: honeypot filled, or the form submitted inhumanly fast. Pretend
  // success so they don't adapt; record nothing.
  if (data.website || typeof data.formAge !== "number" || data.formAge < MIN_FORM_AGE_MS) {
    console.warn("RSVP dropped (bot heuristics):", clientIp(request));
    return NextResponse.json({ ok: true });
  }

  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — please try again later." },
      { status: 429 }
    );
  }

  if (!data.fullName || data.fullName.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 422 });
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email address is required" },
      { status: 422 }
    );
  }
  if (!data.attending) {
    return NextResponse.json(
      { ok: false, error: "Please tell us whether you'll attend" },
      { status: 422 }
    );
  }

  if (!FORM_ID) {
    console.error("RSVP not configured: GOOGLE_FORM_ID is empty. See README.");
    return NextResponse.json(
      { ok: false, error: "RSVPs are not open yet — please try again soon." },
      { status: 503 }
    );
  }

  // One email, one entry (best-effort — see note above).
  const emailKey = data.email.trim().toLowerCase();
  if (seenEmails.has(emailKey)) {
    return NextResponse.json(
      { ok: false, error: "An RSVP has already been received for this email address." },
      { status: 409 }
    );
  }

  try {
    const forwarded = await forwardToGoogleForm(data);
    if (!forwarded) throw new Error("Google Forms rejected the submission");
  } catch (err) {
    console.error("RSVP forward failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not record RSVP" },
      { status: 502 }
    );
  }

  seenEmails.add(emailKey);
  return NextResponse.json({ ok: true });
}
