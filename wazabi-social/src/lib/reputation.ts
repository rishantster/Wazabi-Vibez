import type { ReputationBreakdown } from "@/types";
import {
  REPUTATION_WEIGHTS,
  TENURE_DAYS_PER_POINT,
  LAUNCH_COUNT_LOG_MULTIPLIER,
  VESTING_TIER_VALUES,
} from "./constants";

interface ReputationInput {
  firstLaunchAt: Date | null;
  totalLaunches: number;
  avgVestingTier: number; // 0-4 (mapped from tier values)
  fullyVestedCount: number;
  totalLpLockedUsd: number;
  verifiedLaunches: number;
}

/**
 * Computes the 0-100 reputation score with full breakdown.
 *
 * Weights:
 * - Tenure:        10pts  (1pt per 30 days since first launch)
 * - Launch count:  15pts  (log2(launches) * 5)
 * - Vesting avg:   25pts  (avg tier value / 4 * 25)
 * - Completion:    25pts  (fully vested / total * 25)
 * - LP locked:     15pts  (log10(USD) * 3, capped)
 * - Verification:  10pts  (any verified launch = 10)
 */
export function computeReputation(input: ReputationInput): ReputationBreakdown {
  const {
    firstLaunchAt,
    totalLaunches,
    avgVestingTier,
    fullyVestedCount,
    totalLpLockedUsd,
    verifiedLaunches,
  } = input;

  // Tenure: days since first launch / 30, capped at max
  let tenurePoints = 0;
  if (firstLaunchAt) {
    const daysSinceFirst = Math.floor(
      (Date.now() - firstLaunchAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    tenurePoints = Math.min(
      Math.floor(daysSinceFirst / TENURE_DAYS_PER_POINT),
      REPUTATION_WEIGHTS.TENURE_MAX
    );
  }

  // Launch count: log2(n) * multiplier, capped
  let launchCountPoints = 0;
  if (totalLaunches > 0) {
    launchCountPoints = Math.min(
      Math.floor(Math.log2(totalLaunches + 1) * LAUNCH_COUNT_LOG_MULTIPLIER),
      REPUTATION_WEIGHTS.LAUNCH_COUNT_MAX
    );
  }

  // Vesting conviction: avg tier value (1-4) mapped to 0-25
  const vestingPoints = Math.min(
    Math.round((avgVestingTier / 4) * REPUTATION_WEIGHTS.VESTING_MAX),
    REPUTATION_WEIGHTS.VESTING_MAX
  );

  // Completion: ratio of fully vested to total launches
  let completionPoints = 0;
  if (totalLaunches > 0) {
    completionPoints = Math.min(
      Math.round((fullyVestedCount / totalLaunches) * REPUTATION_WEIGHTS.COMPLETION_MAX),
      REPUTATION_WEIGHTS.COMPLETION_MAX
    );
  }

  // LP locked: log10(USD) * 3, capped
  let lpPoints = 0;
  if (totalLpLockedUsd > 0) {
    lpPoints = Math.min(
      Math.round(Math.log10(totalLpLockedUsd + 1) * 3),
      REPUTATION_WEIGHTS.LP_MAX
    );
  }

  // Verification: binary — any verified = full points
  const verificationPoints = verifiedLaunches > 0 ? REPUTATION_WEIGHTS.VERIFICATION_MAX : 0;

  const totalScore =
    tenurePoints +
    launchCountPoints +
    vestingPoints +
    completionPoints +
    lpPoints +
    verificationPoints;

  return {
    tenurePoints,
    launchCountPoints,
    vestingPoints,
    completionPoints,
    lpPoints,
    verificationPoints,
    totalScore: Math.min(totalScore, 100),
  };
}

/**
 * Maps a vesting tier string (e.g. "tier_90") to its numeric value.
 */
export function vestingTierToValue(tier: string | null): number {
  if (!tier) return 0;
  return VESTING_TIER_VALUES[tier] ?? 0;
}

/**
 * Returns a reputation label and CSS class based on score.
 */
export function reputationLabel(score: number): { label: string; level: "high" | "medium" | "low" | "new" } {
  if (score >= 70) return { label: "High Trust", level: "high" };
  if (score >= 40) return { label: "Established", level: "medium" };
  if (score >= 15) return { label: "Emerging", level: "low" };
  return { label: "New", level: "new" };
}
