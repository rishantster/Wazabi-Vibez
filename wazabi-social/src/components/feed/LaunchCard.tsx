"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ReputationBadge } from "@/components/creator/ReputationBadge";
import { truncateAddress, formatUsd, timeAgo } from "@/lib/utils";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG, VESTING_TIER_CONFIG } from "@/lib/constants";
import type { FeedLaunch } from "@/types";

interface LaunchCardProps {
  launch: FeedLaunch;
}

export function LaunchCard({ launch }: LaunchCardProps) {
  const chainConfig = CHAIN_CONFIG[launch.chain];
  const artifactConfig = launch.artifact_type
    ? ARTIFACT_TYPE_CONFIG[launch.artifact_type]
    : null;
  const vestingConfig = launch.vesting_tier
    ? VESTING_TIER_CONFIG[launch.vesting_tier]
    : null;

  return (
    <Card hover>
      <Link href={`/launch/${launch.token_address}`} className="block">
        {/* Creator row */}
        <div className="flex items-center gap-2">
          <Avatar
            src={launch.creator.avatarUrl}
            alt={launch.creator.displayName || launch.creator_address}
            size="sm"
          />
          <span className="text-sm font-medium text-zinc-300">
            {launch.creator.displayName || truncateAddress(launch.creator_address)}
          </span>
          <ReputationBadge score={launch.creator.reputationScore} size="sm" />
          <span className="ml-auto text-xs text-zinc-500">
            {timeAgo(launch.created_at)}
          </span>
        </div>

        {/* Token info */}
        <div className="mt-3 flex items-start gap-3">
          {launch.image_url && (
            <Image
              src={launch.image_url}
              alt={launch.token_name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate">
                {launch.token_name}
              </h3>
              <span className="text-sm font-mono text-zinc-400">${launch.token_symbol}</span>
            </div>

            {launch.description && (
              <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                {launch.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="chain">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: chainConfig.color }}
            />
            {chainConfig.label}
          </Badge>

          {artifactConfig && (
            <Badge variant="info">{artifactConfig.label}</Badge>
          )}

          {vestingConfig && (
            <Badge variant="success" dot>
              {vestingConfig.label} vesting
            </Badge>
          )}

          {launch.lp_lock_days && (
            <Badge variant="warning">
              LP locked {launch.lp_lock_days}d
            </Badge>
          )}

          {launch.creator_verified && (
            <Badge variant="success">Verified</Badge>
          )}
        </div>

        {/* Social stats row */}
        <div className="mt-4 flex items-center gap-6 border-t border-zinc-800 pt-3">
          <Stat
            label="Conviction"
            value={launch.social.convictionTotalUsd > 0 ? formatUsd(launch.social.convictionTotalUsd) : "--"}
          />
          <Stat
            label="Comments"
            value={launch.social.commentCount > 0 ? String(launch.social.commentCount) : "--"}
          />
          <Stat
            label="Backers"
            value={launch.social.upvoteCount > 0 ? String(launch.social.upvoteCount) : "--"}
          />

          {launch.source_client && (
            <span className="ml-auto text-xs text-zinc-600">
              via {launch.source_client}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold text-white">{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
