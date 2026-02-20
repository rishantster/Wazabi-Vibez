import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeReputation } from "@/lib/reputation";
import type { CreatorProfile } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  const user = await prisma.user.findFirst({
    where: { walletAddress: address },
    include: {
      reputationStats: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  // Compute full reputation breakdown
  const repInput = {
    firstLaunchAt: user.reputationStats?.firstLaunchAt ?? null,
    totalLaunches: user.reputationStats?.totalLaunches ?? 0,
    avgVestingTier: user.reputationStats?.avgVestingTier ?? 0,
    fullyVestedCount: user.reputationStats?.fullyVestedCount ?? 0,
    totalLpLockedUsd: user.reputationStats?.totalLpLockedUsd ?? 0,
    verifiedLaunches: user.reputationStats?.verifiedLaunches ?? 0,
  };
  const reputation = computeReputation(repInput);

  // Check if current user follows this creator
  let isFollowing = false;
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const currentUserId = (session.user as any).id;
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const profile: CreatorProfile = {
    walletAddress: user.walletAddress!,
    chain: (user.walletChain as any) ?? "ethereum",
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    githubUsername: user.githubUsername,
    twitterHandle: user.twitterHandle,
    reputation,
    totalLaunches: user.reputationStats?.totalLaunches ?? 0,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
    joinedAt: user.createdAt.toISOString(),
  };

  return NextResponse.json(profile);
}
