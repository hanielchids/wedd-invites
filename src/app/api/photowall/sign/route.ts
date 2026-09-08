import { NextRequest, NextResponse } from "next/server";
import {
  photowallAdmin,
  BUCKET,
  checkLinkToken,
  uploadsOpen,
  recentUploadCount,
  MAX_UPLOADS_PER_DEVICE_PER_HOUR,
  MAX_WALL_PHOTOS,
} from "@/lib/photowall-server";

export const runtime = "nodejs";

/**
 * POST /api/photowall/sign  { contentType, deviceId }
 * Returns a signed upload URL so the phone uploads straight to storage —
 * never through this function (Vercel caps request bodies at 4.5 MB).
 * Gated by link token, wedding window, per-device and global caps.
 */
export async function POST(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  if (!checkLinkToken(req)) {
    return NextResponse.json({ error: "invite only" }, { status: 403 });
  }
  if (!uploadsOpen()) {
    return NextResponse.json({ error: "uploads closed" }, { status: 403 });
  }
  const { contentType, deviceId } = await req.json().catch(() => ({}));
  if (typeof contentType !== "string" || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "images only" }, { status: 400 });
  }
  if (typeof deviceId !== "string" || !deviceId) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const [deviceCount, { count: total }] = await Promise.all([
    recentUploadCount(admin, deviceId),
    admin.from("uploads").select("*", { count: "exact", head: true }),
  ]);
  if (deviceCount >= MAX_UPLOADS_PER_DEVICE_PER_HOUR) {
    return NextResponse.json({ error: "easy there — try again in a bit" }, { status: 429 });
  }
  if ((total ?? 0) >= MAX_WALL_PHOTOS) {
    return NextResponse.json({ error: "the wall is full" }, { status: 429 });
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : contentType.includes("hei")
        ? "heic"
        : "jpg";
  const key = `wall/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(key);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "sign failed" }, { status: 500 });
  }
  return NextResponse.json({ key, url: data.signedUrl, token: data.token });
}
