"use client";

import { useCreator, useCreatorLaunches } from "@/hooks/useCreator";
import { CreatorProfileCard } from "@/components/creator/CreatorProfile";
import { LaunchCard } from "@/components/feed/LaunchCard";
import { Skeleton, LaunchCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";

export default function CreatorPage({
  params,
}: {
  params: { address: string };
}) {
  const { data: profile, isLoading: profileLoading, error } = useCreator(params.address);
  const [page, setPage] = useState(1);
  const { data: launchesData, isLoading: launchesLoading } = useCreatorLaunches(
    params.address,
    page
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Feed
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">Creator</span>
      </nav>

      {profileLoading && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-400">Creator Not Found</h2>
          <p className="mt-1 text-sm text-zinc-400">
            No creator profile found for this address.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-wazabi-400 hover:underline"
          >
            Back to Feed
          </Link>
        </div>
      )}

      {profile && (
        <div className="space-y-8">
          <CreatorProfileCard profile={profile} />

          {/* Creator's launches */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Launches ({profile.totalLaunches})
            </h2>

            <div className="space-y-3">
              {launchesLoading && (
                <>
                  <LaunchCardSkeleton />
                  <LaunchCardSkeleton />
                </>
              )}

              {launchesData?.data.map((launch: any) => (
                <LaunchCard
                  key={launch.token_address}
                  launch={{
                    ...launch,
                    creator: {
                      displayName: profile.displayName,
                      avatarUrl: profile.avatarUrl,
                      reputationScore: profile.reputation.totalScore,
                      totalLaunches: profile.totalLaunches,
                      isFollowing: profile.isFollowing,
                    },
                  }}
                />
              ))}

              {launchesData?.data.length === 0 && !launchesLoading && (
                <p className="text-center text-sm text-zinc-500 py-6">
                  No launches yet.
                </p>
              )}
            </div>

            {launchesData?.hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
