import { NextResponse } from "next/server";

/**
 * RSVP endpoint.
 *
 * Right now it validates the payload and logs it to the server console so the
 * scaffold runs with zero external setup. To make it real, pick ONE:
 *
 *   1. Email   — add `resend` (or nodemailer) and email the couple here.
 *   2. Database — insert a row into Supabase / Postgres / a Google Sheet.
 *   3. No-code  — change the form's fetch URL to a Formspree / Getform endpoint
 *                 and delete this route entirely.
 *
 * Store secrets in .env.local (see README), never in this file.
 */

type RSVPPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  attending?: "accept" | "decline" | null;
  guests?: string;
  meal?: string;
  dietary?: string[];
  message?: string;
};

export async function POST(request: Request) {
  let data: RSVPPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.fullName || data.fullName.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 422 });
  }
  if (!data.attending) {
    return NextResponse.json(
      { ok: false, error: "Please tell us whether you'll attend" },
      { status: 422 }
    );
  }

  // --- Persist / notify here (see comment above). For now: log it. ---
  console.log("📨 New RSVP:", JSON.stringify(data, null, 2));

  return NextResponse.json({ ok: true });
}
