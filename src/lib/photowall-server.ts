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
