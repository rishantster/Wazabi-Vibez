import { TRENDING_WEIGHTS, TRENDING_HALF_LIFE_HOURS } from "./constants";

interface TrendingInput {
  convictionTotalUsd: number;
  creatorReputationScore: number; // 0-100
  commentCount: number;
  createdAt: Date;
}

/**
 * Computes the trending score for a launch.
 *
 * trending_score = (
 *   conviction_usd_normalized * 0.4
 *   + creator_reputation_normalized * 0.2
 *   + engagement_normalized * 0.1
 *   + time_decay * 0.3
 * )
 *
 * Time decay uses exponential decay with a 12-hour half-life.
 * All components are normalized to 0-1 before weighting.
 */
export function computeTrendingScore(input: TrendingInput): number {
  const { convictionTotalUsd, creatorReputationScore, commentCount, createdAt } = input;

  // Conviction: log scale, soft cap at $100k
  const convictionNorm = Math.min(
    Math.log10(convictionTotalUsd + 1) / Math.log10(100_001),
    1
  );

  // Reputation: already 0-100, normalize to 0-1
  const reputationNorm = creatorReputationScore / 100;

  // Engagement: log scale, soft cap at 100 comments
  const engagementNorm = Math.min(
    Math.log10(commentCount + 1) / Math.log10(101),
    1
  );

  // Time decay: exponential, half-life = 12 hours
  const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.pow(0.5, hoursAgo / TRENDING_HALF_LIFE_HOURS);

  const score =
    convictionNorm * TRENDING_WEIGHTS.CONVICTION +
    reputationNorm * TRENDING_WEIGHTS.REPUTATION +
    engagementNorm * TRENDING_WEIGHTS.ENGAGEMENT +
    timeDecay * TRENDING_WEIGHTS.RECENCY;

  // Return score scaled to 0-1000 for better integer precision in DB
  return Math.round(score * 1000);
}

/**
 * Computes the "top" score (reputation + conviction weighted, no time decay).
 * Used for the "Top" feed view that shows all-time best launches.
 */
export function computeTopScore(input: Omit<TrendingInput, "createdAt">): number {
  const { convictionTotalUsd, creatorReputationScore, commentCount } = input;

  const convictionNorm = Math.min(
    Math.log10(convictionTotalUsd + 1) / Math.log10(100_001),
    1
  );
  const reputationNorm = creatorReputationScore / 100;
  const engagementNorm = Math.min(
    Math.log10(commentCount + 1) / Math.log10(101),
    1
  );

  const score =
    convictionNorm * 0.5 +
    reputationNorm * 0.3 +
    engagementNorm * 0.2;

  return Math.round(score * 1000);
}
