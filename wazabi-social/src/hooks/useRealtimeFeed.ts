"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { McpLaunch } from "@/types";

/**
 * Subscribes to Supabase Realtime for new finalized launches.
 * When a new launch appears, invalidates the feed cache and shows a toast.
 */
export function useRealtimeFeed() {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserSupabase>["channel"]> | null>(null);
  const [newLaunchAlert, setNewLaunchAlert] = useState<McpLaunch | null>(null);

  const dismissAlert = useCallback(() => setNewLaunchAlert(null), []);

  useEffect(() => {
    const supabase = createBrowserSupabase();

    channelRef.current = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "launches",
          filter: "status=eq.finalized",
        },
        (payload) => {
          const launch = payload.new as McpLaunch;
          // Show alert banner
          setNewLaunchAlert(launch);
          // Invalidate feed queries so next fetch gets the new launch
          queryClient.invalidateQueries({ queryKey: ["feed"] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);

  return { newLaunchAlert, dismissAlert };
}
