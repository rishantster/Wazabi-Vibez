import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { McpLaunch } from "@/types";

// ─── Supabase Client (reads MCP tables + Realtime) ──────────────────────────

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
};

export function getSupabase(): SupabaseClient {
  if (!globalForSupabase.supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    globalForSupabase.supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return globalForSupabase.supabase;
}

// ─── Read MCP Launches ──────────────────────────────────────────────────────

export async function getLaunches(options: {
  chain?: string;
  artifactType?: string;
  creatorAddress?: string;
  limit: number;
  offset: number;
  orderBy?: string;
}): Promise<{ launches: McpLaunch[]; total: number }> {
  const supabase = getSupabase();

  let query = supabase
    .from("launches")
    .select("*", { count: "exact" })
    .eq("status", "finalized");

  if (options.chain) {
    query = query.eq("chain", options.chain);
  }
  if (options.artifactType) {
    query = query.eq("artifact_type", options.artifactType);
  }
  if (options.creatorAddress) {
    query = query.eq("creator_address", options.creatorAddress);
  }

  // Ordering
  const orderField = options.orderBy?.split(" ")[0] || "created_at";
  const ascending = options.orderBy?.includes("ASC") ?? false;
  query = query.order(orderField, { ascending });

  // Pagination
  query = query.range(options.offset, options.offset + options.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase getLaunches error:", error);
    return { launches: [], total: 0 };
  }

  return {
    launches: (data as McpLaunch[]) ?? [],
    total: count ?? 0,
  };
}

export async function getLaunchByToken(tokenAddress: string): Promise<McpLaunch | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("launches")
    .select("*")
    .eq("token_address", tokenAddress)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase getLaunchByToken error:", error);
    return null;
  }

  return data as McpLaunch | null;
}

export async function getLaunchesByCreator(
  creatorAddress: string,
  limit = 50,
  offset = 0
): Promise<McpLaunch[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("launches")
    .select("*")
    .eq("creator_address", creatorAddress)
    .eq("status", "finalized")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Supabase getLaunchesByCreator error:", error);
    return [];
  }

  return (data as McpLaunch[]) ?? [];
}

// ─── Pending launches (for "coming soon" feed section) ──────────────────────

export async function getPendingLaunches(limit = 10): Promise<McpLaunch[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("pending_launches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase getPendingLaunches error:", error);
    return [];
  }

  return (data as McpLaunch[]) ?? [];
}

// ─── Realtime: Subscribe to new finalized launches ──────────────────────────

export type LaunchCallback = (launch: McpLaunch) => void;

let realtimeChannel: RealtimeChannel | null = null;

export function subscribeToNewLaunches(callback: LaunchCallback): () => void {
  const supabase = getSupabase();

  // Listen for INSERT and UPDATE events on launches table
  // When a launch status changes to 'finalized', it's a new public launch
  realtimeChannel = supabase
    .channel("launches-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "launches",
        filter: "status=eq.finalized",
      },
      (payload) => {
        callback(payload.new as McpLaunch);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "launches",
      },
      (payload) => {
        // Only trigger when status just changed to finalized
        const newStatus = (payload.new as any)?.status;
        const oldStatus = (payload.old as any)?.status;
        if (newStatus === "finalized" && oldStatus !== "finalized") {
          callback(payload.new as McpLaunch);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}

// ─── Fee data (for analytics) ───────────────────────────────────────────────

export async function getLaunchFeeData(tokenAddress: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("fee_intents")
    .select("*")
    .eq("token_address", tokenAddress)
    .maybeSingle();

  if (error) return null;
  return data;
}
