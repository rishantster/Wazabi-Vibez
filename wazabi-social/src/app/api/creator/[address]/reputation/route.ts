import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeReputation } from "@/lib/reputation";

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  const user = await prisma.user.findFirst({
    where: { walletAddress: address },
    include: { reputationStats: true },
  });

  if (!user || !user.reputationStats) {
    return NextResponse.json({
      walletAddress: address,
      reputation: computeReputation({
        firstLaunchAt: null,
        totalLaunches: 0,
        avgVestingTier: 0,
        fullyVestedCount: 0,
        totalLpLockedUsd: 0,
        verifiedLaunches: 0,
      }),
    });
  }

  const reputation = computeReputation({
    firstLaunchAt: user.reputationStats.firstLaunchAt,
    totalLaunches: user.reputationStats.totalLaunches,
    avgVestingTier: user.reputationStats.avgVestingTier,
    fullyVestedCount: user.reputationStats.fullyVestedCount,
    totalLpLockedUsd: user.reputationStats.totalLpLockedUsd,
    verifiedLaunches: user.reputationStats.verifiedLaunches,
  });

  return NextResponse.json({
    walletAddress: address,
    reputation,
    stats: {
      totalLaunches: user.reputationStats.totalLaunches,
      avgVestingTier: user.reputationStats.avgVestingTier,
      fullyVestedCount: user.reputationStats.fullyVestedCount,
      totalLpLockedUsd: user.reputationStats.totalLpLockedUsd,
      verifiedLaunches: user.reputationStats.verifiedLaunches,
      firstLaunchAt: user.reputationStats.firstLaunchAt?.toISOString() ?? null,
    },
  });
}
