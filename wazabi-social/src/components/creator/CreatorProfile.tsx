"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReputationBadge } from "./ReputationBadge";
import { ReputationBreakdown } from "./ReputationBreakdown";
import { truncateAddress, formatCompact } from "@/lib/utils";
import { CHAIN_CONFIG } from "@/lib/constants";
import { useFollow } from "@/hooks/useCreator";
import { useAuth } from "@/hooks/useAuth";
import type { CreatorProfile as CreatorProfileType } from "@/types";

interface CreatorProfileProps {
  profile: CreatorProfileType;
}

export function CreatorProfileCard({ profile }: CreatorProfileProps) {
  const { isAuthenticated } = useAuth();
  const followMutation = useFollow();
  const chainConfig = CHAIN_CONFIG[profile.chain];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar
          src={profile.avatarUrl}
          alt={profile.displayName || profile.walletAddress}
          size="xl"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              {profile.displayName || truncateAddress(profile.walletAddress)}
            </h1>
            <ReputationBadge score={profile.reputation.totalScore} size="md" />
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-mono">{truncateAddress(profile.walletAddress, 6)}</span>
            <Badge variant="chain" className="text-[10px]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: chainConfig.color }}
              />
              {chainConfig.label}
            </Badge>
          </div>

          {profile.bio && (
            <p className="mt-2 text-sm text-zinc-300">{profile.bio}</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-zinc-400">
              <span className="font-medium text-white">{formatCompact(profile.followerCount)}</span>{" "}
              followers
            </span>
            <span className="text-zinc-400">
              <span className="font-medium text-white">{formatCompact(profile.followingCount)}</span>{" "}
              following
            </span>
            <span className="text-zinc-400">
              <span className="font-medium text-white">{profile.totalLaunches}</span>{" "}
              launches
            </span>
          </div>

          {/* Social links */}
          <div className="mt-2 flex items-center gap-3">
            {profile.twitterHandle && (
              <a
                href={`https://x.com/${profile.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                @{profile.twitterHandle}
              </a>
            )}
            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                github/{profile.githubUsername}
              </a>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <Button
            variant={profile.isFollowing ? "secondary" : "primary"}
            size="sm"
            loading={followMutation.isPending}
            onClick={() =>
              followMutation.mutate({
                address: profile.walletAddress,
                follow: !profile.isFollowing,
              })
            }
          >
            {profile.isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {/* Reputation breakdown */}
      <div className="rounded-xl border border-zinc-800 bg-surface-1 p-5">
        <ReputationBreakdown reputation={profile.reputation} />
      </div>
    </div>
  );
}
