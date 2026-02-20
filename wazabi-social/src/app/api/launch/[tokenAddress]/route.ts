import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLaunchByToken } from "@/lib/mcp-db";
import type { FeedLaunch } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  const { tokenAddress } = params;

  const launch = await getLaunchByToken(tokenAddress);
  if (!launch) {
    return NextResponse.json({ error: "Launch not found" }, { status: 404 });
  }

  // Get social stats
  const stats = await prisma.launchSocialStats.findUnique({
    where: { tokenAddress },
  });

  // Get creator info
  const creator = await prisma.user.findFirst({
    where: { walletAddress: launch.creator_address },
    include: { reputationStats: true },
  });

  // Check following status
  let isFollowing = false;
  const session = await getServerSession(authOptions);
  if (session?.user && creator) {
    const userId = (session.user as any).id;
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: creator.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const feedLaunch: FeedLaunch = {
    ...launch,
    social: {
      upvoteCount: stats?.upvoteCount ?? 0,
      commentCount: stats?.commentCount ?? 0,
      convictionTotalUsd: stats?.convictionTotal ?? 0,
      trendingScore: stats?.trendingScore ?? 0,
    },
    creator: {
      displayName: creator?.displayName ?? null,
      avatarUrl: creator?.avatarUrl ?? null,
      reputationScore: creator?.reputationStats?.reputationScore ?? 0,
      totalLaunches: creator?.reputationStats?.totalLaunches ?? 0,
      isFollowing,
    },
  };

  return NextResponse.json(feedLaunch);
}
