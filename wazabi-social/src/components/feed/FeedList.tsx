"use client";

import { useState } from "react";
import Link from "next/link";
import { LaunchCard } from "./LaunchCard";
import { FeedFilters } from "./FeedFilters";
import { LaunchCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useFeed } from "@/hooks/useFeed";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { FeedSort, Chain, ArtifactType } from "@/types";

export function FeedList() {
  const [sort, setSort] = useState<FeedSort>("trending");
  const [chain, setChain] = useState<Chain | undefined>();
  const [artifactType, setArtifactType] = useState<ArtifactType | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useFeed({
    sort,
    chain,
    artifactType,
    page,
  });

  // Realtime: listen for new launches via Supabase
  const { newLaunchAlert, dismissAlert } = useRealtimeFeed();

  return (
    <div className="space-y-4">
      {/* Realtime new launch banner */}
      {newLaunchAlert && (
        <div className="flex items-center gap-3 rounded-xl border border-wazabi-500/30 bg-wazabi-500/5 px-4 py-3 animate-in fade-in slide-in-from-top-2">
          <span className="h-2 w-2 rounded-full bg-wazabi-500 animate-pulse" />
          <p className="flex-1 text-sm text-wazabi-300">
            New launch:{" "}
            <Link
              href={`/launch/${newLaunchAlert.token_address}`}
              className="font-semibold text-wazabi-400 hover:underline"
            >
              {newLaunchAlert.token_name} (${newLaunchAlert.token_symbol})
            </Link>{" "}
            just went live on {newLaunchAlert.chain}
          </p>
          <button
            onClick={dismissAlert}
            className="text-zinc-500 hover:text-zinc-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <FeedFilters
        sort={sort}
        chain={chain}
        artifactType={artifactType}
        onSortChange={(s) => { setSort(s); setPage(1); }}
        onChainChange={(c) => { setChain(c); setPage(1); }}
        onArtifactTypeChange={(t) => { setArtifactType(t); setPage(1); }}
      />

      {/* Feed content */}
      <div className="space-y-3">
        {isLoading && (
          <>
            <LaunchCardSkeleton />
            <LaunchCardSkeleton />
            <LaunchCardSkeleton />
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-red-400">Failed to load feed. Try refreshing.</p>
          </div>
        )}

        {data?.data.map((launch) => (
          <LaunchCard key={launch.token_address} launch={launch} />
        ))}

        {data && data.data.length === 0 && !isLoading && (
          <div className="rounded-xl border border-zinc-800 bg-surface-1 p-12 text-center">
            <p className="text-zinc-400">No launches found with these filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.hasMore && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-zinc-400">
            Page {page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={!data.hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
