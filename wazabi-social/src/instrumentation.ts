/**
 * Next.js Instrumentation — runs once on server startup.
 * Starts the Supabase Realtime listener for new launches.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on the server (not during build or client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn(
        "[launch-listener] Skipped startup: missing NEXT_PUBLIC_SUPABASE_URL and/or Supabase key"
      );
      return;
    }

    try {
      const { startLaunchListener } = await import("./lib/launch-listener");
      startLaunchListener();
    } catch (error) {
      console.error("[launch-listener] Failed to start listener:", error);
    }
  }
}
