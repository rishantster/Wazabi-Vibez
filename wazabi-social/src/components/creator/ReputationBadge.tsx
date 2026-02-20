"use client";

import { cn } from "@/lib/utils";
import { reputationLabel } from "@/lib/reputation";

interface ReputationBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const levelColors = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  medium: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  low: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  new: "border-zinc-600 bg-zinc-800 text-zinc-400",
};

const sizeStyles = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-7 w-7 text-xs",
  lg: "h-9 w-9 text-sm",
};

export function ReputationBadge({ score, size = "md", showLabel }: ReputationBadgeProps) {
  const { label, level } = reputationLabel(score);

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border font-bold",
          levelColors[level],
          sizeStyles[size]
        )}
        title={`Reputation: ${score}/100 — ${label}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", levelColors[level].split(" ").pop())}>
          {label}
        </span>
      )}
    </div>
  );
}
