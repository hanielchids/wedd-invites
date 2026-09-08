import { NextRequest, NextResponse } from "next/server";
import {
  photowallAdmin,
  publicPhotoUrl,
  checkLinkToken,
  uploadsOpen,
  recentUploadCount,
  MAX_UPLOADS_PER_DEVICE_PER_HOUR,
} from "@/lib/photowall-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/photowall — the wall, newest first. 503 until Supabase env is set. */
export async function GET(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  if (!checkLinkToken(req)) {
    return NextResponse.json({ error: "invite only" }, { status: 403 });
  }
  const { data, error } = await admin
    .from("uploads")
    .select("id, storage_key, created_at, guests(first_name), reactions(device_id)")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((row) => {
    const guest = Array.isArray(row.guests) ? row.guests[0] : row.guests;
    return {
      id: row.id,
      url: publicPhotoUrl(row.storage_key),
      name: (guest as { first_name?: string } | null)?.first_name ?? "guest",
      time: new Date(row.created_at).toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      loves: Array.isArray(row.reactions) ? row.reactions.length : 0,
      lovedBy: Array.isArray(row.reactions)
        ? row.reactions.map((r) => (r as { device_id: string }).device_id)
        : [],
    };
  });
  return NextResponse.json({ items });
}

/** POST /api/photowall  { key, name, deviceId, width?, height? } — pin an uploaded photo. */
export async function POST(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) return NextResponse.json({ configured: false }, { status: 503 });
  if (!checkLinkToken(req)) {
    return NextResponse.json({ error: "invite only" }, { status: 403 });
  }
  if (!uploadsOpen()) {
    return NextResponse.json({ error: "uploads closed" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { key, name, deviceId, width, height } = body ?? {};
  if (typeof key !== "string" || !key.startsWith("wall/") || typeof deviceId !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const firstName = (typeof name === "string" && name.trim().slice(0, 40)) || "guest";

  if ((await recentUploadCount(admin, deviceId)) >= MAX_UPLOADS_PER_DEVICE_PER_HOUR) {
    return NextResponse.json({ error: "easy there — try again in a bit" }, { status: 429 });
  }

  const { data: guest, error: gErr } = await admin
    .from("guests")
    .upsert({ device_id: deviceId, first_name: firstName }, { onConflict: "device_id" })
    .select("id")
    .single();
  if (gErr || !guest) {
    return NextResponse.json({ error: gErr?.message ?? "guest failed" }, { status: 500 });
  }

  const { data: upload, error: uErr } = await admin
    .from("uploads")
    .insert({
      guest_id: guest.id,
      storage_key: key,
      width: typeof width === "number" ? width : null,
      height: typeof height === "number" ? height : null,
      status: "ready",
    })
    .select("id")
    .single();
  if (uErr || !upload) {
    return NextResponse.json({ error: uErr?.message ?? "insert failed" }, { status: 500 });
  }
  return NextResponse.json({ id: upload.id });
}

/** PATCH /api/photowall  { id, action: "hide", adminKey } — the couple's two-tap hide. */
export async function PATCH(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) return NextResponse.json({ configured: false }, { status: 503 });

  const { id, action, adminKey } = await req.json().catch(() => ({}));
  if (action !== "hide" || adminKey !== process.env.PHOTOWALL_ADMIN_KEY || !process.env.PHOTOWALL_ADMIN_KEY) {
    return NextResponse.json({ error: "nope" }, { status: 403 });
  }
  const { error } = await admin.from("uploads").update({ status: "hidden" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
