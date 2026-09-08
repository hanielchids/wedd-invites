import { NextRequest, NextResponse } from "next/server";
import { photowallAdmin, BUCKET } from "@/lib/photowall-server";

export const runtime = "nodejs";

/**
 * POST /api/photowall/sign  { contentType }
 * Returns a signed upload URL so the phone uploads straight to storage —
 * never through this function (Vercel caps request bodies at 4.5 MB).
 */
export async function POST(req: NextRequest) {
  const admin = photowallAdmin();
  if (!admin) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  const { contentType } = await req.json().catch(() => ({}));
  if (typeof contentType !== "string" || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "images only" }, { status: 400 });
  }
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const key = `wall/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(key);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "sign failed" }, { status: 500 });
  }
  return NextResponse.json({ key, url: data.signedUrl, token: data.token });
}
