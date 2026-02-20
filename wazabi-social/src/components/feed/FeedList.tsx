"use client";

import { useState } from "react";
import { LaunchCard } from "./LaunchCard";
import { FeedFilters } from "./FeedFilters";
import { LaunchCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useFeed } from "@/hooks/useFeed";
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

  return (
    <div className="space-y-4">
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
