import { subscribeToNewLaunches, type LaunchCallback } from "./mcp-db";
import { prisma } from "./prisma";
import { computeReputation, vestingTierToValue } from "./reputation";
import { computeTrendingScore } from "./feed-ranking";
import type { McpLaunch } from "@/types";

/**
 * Handles a newly finalized launch:
 * 1. Ensures the creator has a User record (auto-registers from wallet)
 * 2. Updates creator reputation stats
 * 3. Creates initial LaunchSocialStats entry
 * 4. Notifies followers of the creator
 */
async function onNewLaunch(launch: McpLaunch) {
  try {
    console.log(`[launch-listener] New launch detected: ${launch.token_name} ($${launch.token_symbol}) on ${launch.chain}`);

    // 1. Upsert creator as a User
    const user = await prisma.user.upsert({
      where: { walletAddress: launch.creator_address },
      update: {},
      create: {
        walletAddress: launch.creator_address,
        walletChain: launch.chain as any,
        displayName: null,
      },
    });

    // 2. Recalculate creator reputation
    const existingRep = await prisma.creatorReputation.findUnique({
      where: { userId: user.id },
    });

    const newTotalLaunches = (existingRep?.totalLaunches ?? 0) + 1;
    const tierValue = vestingTierToValue(launch.vesting_tier);
    const newAvgVesting = existingRep
      ? (existingRep.avgVestingTier * existingRep.totalLaunches + tierValue) / newTotalLaunches
      : tierValue;
    const newVerified = (existingRep?.verifiedLaunches ?? 0) + (launch.creator_verified ? 1 : 0);
    const newLpUsd = (existingRep?.totalLpLockedUsd ?? 0) + (launch.fee_amount_usd ?? 0);
    const firstLaunchAt = existingRep?.firstLaunchAt ?? new Date(launch.created_at);

    const repInput = {
      firstLaunchAt,
      totalLaunches: newTotalLaunches,
      avgVestingTier: newAvgVesting,
      fullyVestedCount: existingRep?.fullyVestedCount ?? 0,
      totalLpLockedUsd: newLpUsd,
      verifiedLaunches: newVerified,
    };
    const reputation = computeReputation(repInput);

    await prisma.creatorReputation.upsert({
      where: { userId: user.id },
      update: {
        totalLaunches: newTotalLaunches,
        avgVestingTier: newAvgVesting,
        verifiedLaunches: newVerified,
        totalLpLockedUsd: newLpUsd,
        reputationScore: reputation.totalScore,
      },
      create: {
        userId: user.id,
        walletAddress: launch.creator_address,
        totalLaunches: newTotalLaunches,
        avgVestingTier: newAvgVesting,
        fullyVestedCount: 0,
        verifiedLaunches: newVerified,
        totalLpLockedUsd: newLpUsd,
        firstLaunchAt,
        reputationScore: reputation.totalScore,
      },
    });

    // 3. Create initial social stats for this launch
    const trendingScore = computeTrendingScore({
      convictionTotalUsd: 0,
      creatorReputationScore: reputation.totalScore,
      commentCount: 0,
      createdAt: new Date(launch.created_at),
    });

    await prisma.launchSocialStats.upsert({
      where: { tokenAddress: launch.token_address },
      update: { trendingScore },
      create: {
        tokenAddress: launch.token_address,
        upvoteCount: 0,
        commentCount: 0,
        convictionTotal: 0,
        trendingScore,
      },
    });

    // 4. Notify followers
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map((f) => ({
          userId: f.followerId,
          type: "new_launch" as const,
          payload: {
            tokenAddress: launch.token_address,
            tokenName: launch.token_name,
            tokenSymbol: launch.token_symbol,
            chain: launch.chain,
            creatorAddress: launch.creator_address,
            imageUrl: launch.image_url,
          },
        })),
      });
    }

    console.log(`[launch-listener] Processed launch ${launch.token_symbol} — creator rep: ${reputation.totalScore}, notified ${followers.length} followers`);
  } catch (error) {
    console.error("[launch-listener] Error processing new launch:", error);
  }
}

// ─── Start / Stop ───────────────────────────────────────────────────────────

let unsubscribe: (() => void) | null = null;

export function startLaunchListener() {
  if (unsubscribe) {
    console.log("[launch-listener] Already running");
    return;
  }

  console.log("[launch-listener] Starting Supabase Realtime subscription...");
  unsubscribe = subscribeToNewLaunches(onNewLaunch);
}

export function stopLaunchListener() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log("[launch-listener] Stopped");
  }
}
