"use client";

import { useLaunch } from "@/hooks/useLaunch";
import { LaunchDetail } from "@/components/launch/LaunchDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function LaunchPage({
  params,
}: {
  params: { tokenAddress: string };
}) {
  const { data: launch, isLoading, error } = useLaunch(params.tokenAddress);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Feed
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">
          {launch?.token_name || params.tokenAddress.slice(0, 8) + "..."}
        </span>
      </nav>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-400">Launch Not Found</h2>
          <p className="mt-1 text-sm text-zinc-400">
            This token address doesn&apos;t match any finalized launch.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-wazabi-400 hover:underline"
          >
            Back to Feed
          </Link>
        </div>
      )}

      {launch && <LaunchDetail launch={launch} />}
    </div>
  );
}
