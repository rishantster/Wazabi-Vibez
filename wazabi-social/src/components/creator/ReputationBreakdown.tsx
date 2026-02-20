"use client";

import type { ReputationBreakdown as ReputationType } from "@/types";
import { REPUTATION_WEIGHTS } from "@/lib/constants";

interface ReputationBreakdownProps {
  reputation: ReputationType;
}

const categories = [
  { key: "vestingPoints" as const, label: "Vesting Conviction", max: REPUTATION_WEIGHTS.VESTING_MAX, color: "bg-emerald-500" },
  { key: "completionPoints" as const, label: "Follow-Through", max: REPUTATION_WEIGHTS.COMPLETION_MAX, color: "bg-blue-500" },
  { key: "lpPoints" as const, label: "LP Commitment", max: REPUTATION_WEIGHTS.LP_MAX, color: "bg-purple-500" },
  { key: "launchCountPoints" as const, label: "Launch History", max: REPUTATION_WEIGHTS.LAUNCH_COUNT_MAX, color: "bg-amber-500" },
  { key: "verificationPoints" as const, label: "Verification", max: REPUTATION_WEIGHTS.VERIFICATION_MAX, color: "bg-cyan-500" },
  { key: "tenurePoints" as const, label: "Tenure", max: REPUTATION_WEIGHTS.TENURE_MAX, color: "bg-pink-500" },
];

export function ReputationBreakdown({ reputation }: ReputationBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-300">Reputation Score</span>
        <span className="text-2xl font-bold text-white">{reputation.totalScore}</span>
      </div>

      <div className="space-y-2">
        {categories.map(({ key, label, max, color }) => {
          const value = reputation[key];
          const pct = max > 0 ? (value / max) * 100 : 0;

          return (
            <div key={key}>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{label}</span>
                <span className="text-zinc-300">
                  {value}/{max}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${color} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
