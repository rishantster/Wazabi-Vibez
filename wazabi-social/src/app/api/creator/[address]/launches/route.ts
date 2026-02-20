import { NextRequest, NextResponse } from "next/server";
import { getLaunchesByCreator } from "@/lib/mcp-db";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const launches = await getLaunchesByCreator(address, limit, offset);

  // Enrich with social stats
  const tokenAddresses = launches.map((l) => l.token_address);
  const stats = await prisma.launchSocialStats.findMany({
    where: { tokenAddress: { in: tokenAddresses } },
  });
  const statsMap = new Map(stats.map((s) => [s.tokenAddress, s]));

  const enriched = launches.map((launch) => {
    const s = statsMap.get(launch.token_address);
    return {
      ...launch,
      social: {
        upvoteCount: s?.upvoteCount ?? 0,
        commentCount: s?.commentCount ?? 0,
        convictionTotalUsd: s?.convictionTotal ?? 0,
        trendingScore: s?.trendingScore ?? 0,
      },
    };
  });

  return NextResponse.json({
    data: enriched,
    page,
    limit,
    hasMore: launches.length === limit,
  });
}
