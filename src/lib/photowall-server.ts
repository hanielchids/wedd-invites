import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client for the photowall API routes.
 * Returns null until the env vars are set (Vercel → Settings → Env):
 *   SUPABASE_URL                — project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — service role secret (server only, never NEXT_PUBLIC)
 * Optional:
 *   PHOTOWALL_ADMIN_KEY         — secret for hiding photos
 */
let cached: SupabaseClient | null | undefined;

export function photowallAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

export function publicPhotoUrl(storageKey: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/photos/${storageKey}`;
}

export const BUCKET = "photos";

/**
 * Link-token gate: the page URL carries ?t=… (baked into the QR code);
 * every API call must present it. Unset env = open (local dev convenience).
 */
export function checkLinkToken(req: Request): boolean {
  const expected = process.env.PHOTOWALL_LINK_TOKEN;
  if (!expected) return true;
  const fromHeader = req.headers.get("x-photowall-token");
  const fromQuery = new URL(req.url).searchParams.get("t");
  return fromHeader === expected || fromQuery === expected;
}

/** Writes only accepted in the wedding window; reads stay open to token holders. */
export function uploadsOpen(): boolean {
  const now = Date.now();
  return (
    now >= Date.parse("2026-09-01T00:00:00Z") &&
    now <= Date.parse("2026-10-05T00:00:00Z")
  );
}

/** Uploads by this device in the last hour (0 if the guest doesn't exist yet). */
export async function recentUploadCount(
  admin: SupabaseClient,
  deviceId: string,
): Promise<number> {
  const { data: guest } = await admin
    .from("guests")
    .select("id")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (!guest) return 0;
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guest.id)
    .gte("created_at", since);
  return count ?? 0;
}

export const MAX_UPLOADS_PER_DEVICE_PER_HOUR = 30;
export const MAX_WALL_PHOTOS = 2000;
export const MAX_REACTIONS_PER_DEVICE = 500;
