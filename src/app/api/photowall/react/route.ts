import { NextRequest, NextResponse } from "next/server";
import {
  photowallAdmin,
  checkLinkToken,
  MAX_REACTIONS_PER_DEVICE,
} from "@/lib/photowall-server";

export const runtime = "nodejs";

/** POST /api/photowall/react  { uploadId, deviceId, on } — toggle a heart. */
export async function POST(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) return NextResponse.json({ configured: false }, { status: 503 });
  if (!checkLinkToken(req)) {
    return NextResponse.json({ error: "invite only" }, { status: 403 });
  }

  const { uploadId, deviceId, on } = await req.json().catch(() => ({}));
  if (typeof uploadId !== "string" || typeof deviceId !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (on) {
    const { count } = await admin
      .from("reactions")
      .select("*", { count: "exact", head: true })
      .eq("device_id", deviceId);
    if ((count ?? 0) >= MAX_REACTIONS_PER_DEVICE) {
      return NextResponse.json({ error: "that's a lot of love" }, { status: 429 });
    }
  }
  const { error } = on
    ? await admin.from("reactions").upsert({ upload_id: uploadId, device_id: deviceId })
    : await admin.from("reactions").delete().match({ upload_id: uploadId, device_id: deviceId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
