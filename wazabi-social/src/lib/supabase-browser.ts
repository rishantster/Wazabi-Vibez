import { createClient } from "@supabase/supabase-js";

// Client-side Supabase instance (uses anon key, respects RLS)
// Used for realtime subscriptions in the browser
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(
      "[supabase-browser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY; realtime disabled"
    );
    return null;
  }

  try {
    return createClient(url, key, {
      auth: { persistSession: false },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.error("[supabase-browser] Failed to initialize client:", error);
    return null;
  }
}
