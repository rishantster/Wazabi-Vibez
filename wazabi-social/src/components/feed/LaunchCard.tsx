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
  const chainConfig =
    CHAIN_CONFIG[launch.chain as keyof typeof CHAIN_CONFIG] ??
    { label: launch.chain, nativeSymbol: "", color: "#94a3b8", explorerUrl: "#" };
  const artifactConfig = launch.artifact_type ? ARTIFACT_TYPE_CONFIG[launch.artifact_type] : null;
  const vestingConfig = launch.vesting_tier ? VESTING_TIER_CONFIG[launch.vesting_tier] : null;

  return (
    <Card hover>
      <Link href={`/launch/${launch.token_address}`} className="block">
        <div className="flex items-center gap-2">
          <Avatar src={launch.creator.avatarUrl} alt={launch.creator.displayName || launch.creator_address} size="sm" />
          <span className="text-sm font-medium text-slate-200">
            {launch.creator.displayName || truncateAddress(launch.creator_address)}
          </span>
          <ReputationBadge score={launch.creator.reputationScore} size="sm" />
          <span className="ml-auto text-xs text-slate-400">{timeAgo(launch.created_at)}</span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          {launch.image_url && (
            <Image
              src={launch.image_url}
              alt={launch.token_name}
              width={50}
              height={50}
              className="rounded-xl border border-slate-500/25 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-lg font-semibold text-slate-100">{launch.token_name}</h3>
              <span className="rounded-full border border-slate-500/25 bg-slate-800/45 px-2 py-0.5 text-xs font-mono text-slate-300">
                ${launch.token_symbol}
              </span>
            </div>

            {launch.description && <p className="mt-1 line-clamp-2 text-sm text-slate-300">{launch.description}</p>}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="chain">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: chainConfig.color }} />
            {chainConfig.label}
          </Badge>

          {artifactConfig && <Badge variant="info">{artifactConfig.label}</Badge>}

          {vestingConfig && (
            <Badge variant="success" dot>
              {vestingConfig.label} vesting
            </Badge>
          )}

          {launch.lp_lock_days && <Badge variant="warning">LP {launch.lp_lock_days}d</Badge>}

          {launch.creator_verified && <Badge variant="success">Verified</Badge>}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-500/20 pt-3 sm:flex sm:items-center sm:gap-6">
          <Stat
            label="Conviction"
            value={launch.social.convictionTotalUsd > 0 ? formatUsd(launch.social.convictionTotalUsd) : "--"}
          />
          <Stat label="Comments" value={launch.social.commentCount > 0 ? String(launch.social.commentCount) : "--"} />
          <Stat label="Backers" value={launch.social.upvoteCount > 0 ? String(launch.social.upvoteCount) : "--"} />

          {launch.source_client && (
            <span className="col-span-3 mt-1 text-xs text-slate-500 sm:col-span-1 sm:ml-auto sm:mt-0">
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
    <div className="text-center sm:text-left">
      <div className="text-sm font-semibold text-slate-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
