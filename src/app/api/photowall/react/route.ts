import { NextRequest, NextResponse } from "next/server";
import { photowallAdmin } from "@/lib/photowall-server";

export const runtime = "nodejs";

/** POST /api/photowall/react  { uploadId, deviceId, on } — toggle a heart. */
export async function POST(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) return NextResponse.json({ configured: false }, { status: 503 });

  const { uploadId, deviceId, on } = await req.json().catch(() => ({}));
  if (typeof uploadId !== "string" || typeof deviceId !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const { error } = on
    ? await admin.from("reactions").upsert({ upload_id: uploadId, device_id: deviceId })
    : await admin.from("reactions").delete().match({ upload_id: uploadId, device_id: deviceId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
