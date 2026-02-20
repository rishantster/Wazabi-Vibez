/**
 * Next.js Instrumentation — runs once on server startup.
 * Starts the Supabase Realtime listener for new launches.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on the server (not during build or client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startLaunchListener } = await import("./lib/launch-listener");
    startLaunchListener();
  }
}
