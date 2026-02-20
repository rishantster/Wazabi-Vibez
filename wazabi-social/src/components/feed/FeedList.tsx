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

  const { newLaunchAlert, dismissAlert } = useRealtimeFeed();

  return (
    <div className="space-y-4">
      {newLaunchAlert && (
        <div className="soft-rise glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
          <p className="flex-1 text-sm text-teal-100">
            New launch: {" "}
            <Link href={`/launch/${newLaunchAlert.token_address}`} className="font-semibold text-teal-200 hover:underline">
              {newLaunchAlert.token_name} (${newLaunchAlert.token_symbol})
            </Link>{" "}
            is live on {newLaunchAlert.chain}
          </p>
          <button onClick={dismissAlert} className="text-xs text-slate-400 hover:text-slate-200">
            Dismiss
          </button>
        </div>
      )}

      <FeedFilters
        sort={sort}
        chain={chain}
        artifactType={artifactType}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        onChainChange={(c) => {
          setChain(c);
          setPage(1);
        }}
        onArtifactTypeChange={(t) => {
          setArtifactType(t);
          setPage(1);
        }}
      />

      <div className="space-y-3">
        {isLoading && (
          <>
            <LaunchCardSkeleton />
            <LaunchCardSkeleton />
            <LaunchCardSkeleton />
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center">
            <p className="text-sm text-rose-200">Could not load feed. Try refreshing.</p>
          </div>
        )}

        {data?.data.map((launch, index) => (
          <div key={launch.token_address} className="soft-rise" style={{ animationDelay: `${index * 45}ms` }}>
            <LaunchCard launch={launch} />
          </div>
        ))}

        {data && data.data.length === 0 && !isLoading && (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="text-slate-300">No launches match this filter set.</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">Try widening chain or artifact filters</p>
          </div>
        )}
      </div>

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
          <span className="flex items-center text-sm text-slate-300">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={!data.hasMore} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
