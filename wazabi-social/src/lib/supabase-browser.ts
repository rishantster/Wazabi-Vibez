import { createClient } from "@supabase/supabase-js";

// Client-side Supabase instance (uses anon key, respects RLS)
// Used for realtime subscriptions in the browser
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key, {
    auth: { persistSession: false },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}
