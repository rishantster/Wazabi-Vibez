"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReputationBadge } from "@/components/creator/ReputationBadge";
import { VestingCountdown } from "./VestingCountdown";
import { ConvictionPanel } from "./ConvictionPanel";
import { CommentsSection } from "./CommentsSection";
import { truncateAddress, formatUsd } from "@/lib/utils";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG, VESTING_TIER_CONFIG } from "@/lib/constants";
import { useFollow } from "@/hooks/useCreator";
import { useAuth } from "@/hooks/useAuth";
import type { FeedLaunch } from "@/types";

interface LaunchDetailProps {
  launch: FeedLaunch;
}

export function LaunchDetail({ launch }: LaunchDetailProps) {
  const { isAuthenticated } = useAuth();
  const followMutation = useFollow();
  const chainConfig = CHAIN_CONFIG[launch.chain];
  const artifactConfig = launch.artifact_type
    ? ARTIFACT_TYPE_CONFIG[launch.artifact_type]
    : null;
  const vestingConfig = launch.vesting_tier
    ? VESTING_TIER_CONFIG[launch.vesting_tier as keyof typeof VESTING_TIER_CONFIG]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {launch.image_url && (
          <Image
            src={launch.image_url}
            alt={launch.token_name}
            width={80}
            height={80}
            className="rounded-xl"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{launch.token_name}</h1>
            <span className="text-lg font-mono text-zinc-400">${launch.token_symbol}</span>
          </div>

          {launch.description && (
            <p className="mt-2 text-zinc-300">{launch.description}</p>
          )}

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="chain">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: chainConfig.color }}
              />
              {chainConfig.label}
            </Badge>
            {artifactConfig && <Badge variant="info">{artifactConfig.label}</Badge>}
            {vestingConfig && <Badge variant="success" dot>{vestingConfig.label} vesting</Badge>}
            {launch.creator_verified && <Badge variant="success">Creator Verified</Badge>}
          </div>
        </div>
      </div>

      {/* Creator card */}
      <div className="rounded-xl border border-zinc-800 bg-surface-1 p-4">
        <div className="flex items-center gap-3">
          <Link href={`/creator/${launch.creator_address}`}>
            <Avatar
              src={launch.creator.avatarUrl}
              alt={launch.creator.displayName || launch.creator_address}
              size="lg"
            />
          </Link>
          <div className="flex-1">
            <Link
              href={`/creator/${launch.creator_address}`}
              className="flex items-center gap-2 hover:underline"
            >
              <span className="font-medium text-white">
                {launch.creator.displayName || truncateAddress(launch.creator_address, 6)}
              </span>
              <ReputationBadge score={launch.creator.reputationScore} size="sm" showLabel />
            </Link>
            <div className="text-xs text-zinc-500">
              {launch.creator.totalLaunches} launches
            </div>
          </div>
          {isAuthenticated && (
            <Button
              variant={launch.creator.isFollowing ? "secondary" : "primary"}
              size="sm"
              loading={followMutation.isPending}
              onClick={() =>
                followMutation.mutate({
                  address: launch.creator_address,
                  follow: !launch.creator.isFollowing,
                })
              }
            >
              {launch.creator.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Conviction"
          value={launch.social.convictionTotalUsd > 0 ? formatUsd(launch.social.convictionTotalUsd) : "--"}
        />
        <StatCard label="Backers" value={String(launch.social.upvoteCount)} />
        <StatCard label="Comments" value={String(launch.social.commentCount)} />
        <StatCard
          label="LP Locked"
          value={launch.lp_native_amount ? `${launch.lp_native_amount} ${chainConfig.nativeSymbol}` : "--"}
        />
      </div>

      {/* Vesting countdown */}
      <VestingCountdown
        vestingTier={launch.vesting_tier}
        lpLockUntil={launch.lp_lock_until}
        finalizedAt={launch.finalized_at}
      />

      {/* Links */}
      {(launch.website_url || launch.twitter_url || launch.telegram_url || launch.github_repo_url || launch.app_url) && (
        <div className="flex flex-wrap gap-2">
          {launch.website_url && (
            <LinkBadge href={launch.website_url} label="Website" />
          )}
          {launch.app_url && (
            <LinkBadge href={launch.app_url} label="App" />
          )}
          {launch.twitter_url && (
            <LinkBadge href={launch.twitter_url} label="Twitter" />
          )}
          {launch.telegram_url && (
            <LinkBadge href={launch.telegram_url} label="Telegram" />
          )}
          {launch.github_repo_url && (
            <LinkBadge href={launch.github_repo_url} label="GitHub" />
          )}
        </div>
      )}

      {/* Conviction voting */}
      <ConvictionPanel
        tokenAddress={launch.token_address}
        chain={launch.chain}
        tokenSymbol={launch.token_symbol}
      />

      {/* Comments */}
      <CommentsSection tokenAddress={launch.token_address} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-surface-1 p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function LinkBadge({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-surface-1 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors"
    >
      {label}
    </a>
  );
}
