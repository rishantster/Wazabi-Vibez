"use client";

import { useEffect, useState } from "react";
import { VESTING_TIER_CONFIG } from "@/lib/constants";

interface VestingCountdownProps {
  vestingTier: string | null;
  lpLockUntil: string | null;
  finalizedAt: string | null;
}

export function VestingCountdown({ vestingTier, lpLockUntil, finalizedAt }: VestingCountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!vestingTier || !finalizedAt) return null;

  const config = VESTING_TIER_CONFIG[vestingTier as keyof typeof VESTING_TIER_CONFIG];
  if (!config) return null;

  const vestingEnd = new Date(finalizedAt).getTime() + config.days * 24 * 60 * 60 * 1000;
  const vestingRemaining = Math.max(0, vestingEnd - now);
  const vestingPct = Math.min(100, ((now - new Date(finalizedAt).getTime()) / (config.days * 24 * 60 * 60 * 1000)) * 100);
  const vestingComplete = vestingRemaining === 0;

  let lpRemaining = 0;
  let lpComplete = true;
  if (lpLockUntil) {
    const lpEnd = new Date(lpLockUntil).getTime();
    lpRemaining = Math.max(0, lpEnd - now);
    lpComplete = lpRemaining === 0;
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-surface-1 p-4">
      {/* Vesting countdown */}
      <div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Creator Vesting ({config.label})</span>
          <span className={vestingComplete ? "text-emerald-400" : "text-zinc-200"}>
            {vestingComplete ? "Complete" : formatCountdown(vestingRemaining)}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all ${
              vestingComplete ? "bg-emerald-500" : "bg-wazabi-500"
            }`}
            style={{ width: `${Math.min(vestingPct, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>Creator allocation: {config.allocation}</span>
          <span>{vestingPct.toFixed(1)}%</span>
        </div>
      </div>

      {/* LP Lock countdown */}
      {lpLockUntil && (
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">LP Lock</span>
            <span className={lpComplete ? "text-emerald-400" : "text-zinc-200"}>
              {lpComplete ? "Unlocked" : formatCountdown(lpRemaining)}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${
                lpComplete ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{
                width: `${lpComplete ? 100 : Math.max(0, 100 - (lpRemaining / (new Date(lpLockUntil).getTime() - new Date(finalizedAt!).getTime())) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatCountdown(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
