import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLaunches } from "@/lib/mcp-db";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import type { FeedLaunch, FeedSort, PaginatedResponse } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sort = (searchParams.get("sort") as FeedSort) || "trending";
  const chain = searchParams.get("chain") || undefined;
  const artifactType = searchParams.get("type") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || String(FEED_PAGE_SIZE), 10));

  // Check cache
  const cacheKey = CACHE_KEYS.feed(sort, chain, artifactType, page);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch {
    // Redis down — proceed without cache
  }

  const offset = (page - 1) * limit;

  // Determine ordering
  let orderBy = "created_at DESC";
  if (sort === "trending") {
    // We'll sort by social stats after joining
    orderBy = "created_at DESC"; // initial fetch, re-sorted below
  } else if (sort === "top") {
    orderBy = "created_at DESC"; // initial fetch, re-sorted below
  }

  // Fetch launches from MCP database
  const { launches, total } = await getLaunches({
    chain,
    artifactType,
    limit: sort === "new" ? limit : limit * 3, // over-fetch for re-ranking
    offset: sort === "new" ? offset : 0,
    orderBy,
  });

  if (launches.length === 0) {
    const empty: PaginatedResponse<FeedLaunch> = {
      data: [],
      page,
      limit,
      total: 0,
      hasMore: false,
    };
    return NextResponse.json(empty);
  }

  // Get social stats for these launches
  const tokenAddresses = launches.map((l) => l.token_address);
  const socialStats = await prisma.launchSocialStats.findMany({
    where: { tokenAddress: { in: tokenAddresses } },
  });
  const statsMap = new Map(socialStats.map((s) => [s.tokenAddress, s]));

  // Get creator info
  const creatorAddresses = Array.from(new Set(launches.map((l) => l.creator_address)));
  const creators = await prisma.user.findMany({
    where: { walletAddress: { in: creatorAddresses } },
    include: { reputationStats: true },
  });
  const creatorMap = new Map(creators.map((c) => [c.walletAddress!, c]));

  // Check following status for authenticated user
  let followingSet = new Set<string>();
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const userId = (session.user as any).id;
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingUserIds = follows.map((f) => f.followingId);
    const followingUsers = await prisma.user.findMany({
      where: { id: { in: followingUserIds } },
      select: { walletAddress: true },
    });
    followingSet = new Set(followingUsers.map((u) => u.walletAddress!).filter(Boolean));
  }

  // Assemble feed items
  let feedItems: FeedLaunch[] = launches.map((launch) => {
    const stats = statsMap.get(launch.token_address);
    const creator = creatorMap.get(launch.creator_address);

    return {
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
        isFollowing: followingSet.has(launch.creator_address),
      },
    };
  });

  // Apply sort
  if (sort === "trending") {
    feedItems.sort((a, b) => b.social.trendingScore - a.social.trendingScore);
    feedItems = feedItems.slice(offset, offset + limit);
  } else if (sort === "top") {
    feedItems.sort((a, b) => {
      const scoreA = b.social.convictionTotalUsd * 0.5 + b.creator.reputationScore * 0.3 + b.social.commentCount * 0.2;
      const scoreB = a.social.convictionTotalUsd * 0.5 + a.creator.reputationScore * 0.3 + a.social.commentCount * 0.2;
      return scoreA - scoreB;
    });
    feedItems = feedItems.slice(offset, offset + limit);
  }

  const response: PaginatedResponse<FeedLaunch> = {
    data: feedItems,
    page,
    limit,
    total,
    hasMore: offset + limit < total,
  };

  // Cache the result
  try {
    await redis.setex(cacheKey, CACHE_TTL.FEED, JSON.stringify(response));
  } catch {
    // Redis down — skip caching
  }

  return NextResponse.json(response);
}
