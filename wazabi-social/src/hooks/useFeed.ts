"use client";

import { useQuery } from "@tanstack/react-query";
import type { FeedLaunch, FeedSort, PaginatedResponse } from "@/types";

interface UseFeedOptions {
  sort?: FeedSort;
  chain?: string;
  artifactType?: string;
  page?: number;
  limit?: number;
}

async function fetchFeed(options: UseFeedOptions): Promise<PaginatedResponse<FeedLaunch>> {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  if (options.chain) params.set("chain", options.chain);
  if (options.artifactType) params.set("type", options.artifactType);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));

  const res = await fetch(`/api/feed?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

export function useFeed(options: UseFeedOptions = {}) {
  return useQuery({
    queryKey: ["feed", options],
    queryFn: () => fetchFeed(options),
    staleTime: 30_000, // 30 seconds
  });
}
