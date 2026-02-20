"use client";

import { cn } from "@/lib/utils";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG } from "@/lib/constants";
import type { FeedSort, Chain, ArtifactType } from "@/types";

interface FeedFiltersProps {
  sort: FeedSort;
  chain?: Chain;
  artifactType?: ArtifactType;
  onSortChange: (sort: FeedSort) => void;
  onChainChange: (chain?: Chain) => void;
  onArtifactTypeChange: (type?: ArtifactType) => void;
}

const sorts: { value: FeedSort; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
];

export function FeedFilters({
  sort,
  chain,
  artifactType,
  onSortChange,
  onChainChange,
  onArtifactTypeChange,
}: FeedFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-500/20 bg-slate-900/40 p-3 backdrop-blur-md sm:p-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950/55 p-1">
        {sorts.map((s) => (
          <button
            key={s.value}
            onClick={() => onSortChange(s.value)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all",
              sort === s.value
                ? "neon-ring bg-slate-800/80 text-slate-100"
                : "text-slate-400 hover:bg-slate-700/35 hover:text-slate-200"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Chain</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All Chains" active={!chain} onClick={() => onChainChange(undefined)} />
          {(Object.keys(CHAIN_CONFIG) as Chain[]).map((c) => (
            <FilterChip
              key={c}
              label={CHAIN_CONFIG[c].label}
              active={chain === c}
              onClick={() => onChainChange(chain === c ? undefined : c)}
              dotColor={CHAIN_CONFIG[c].color}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Artifact Type</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All Types" active={!artifactType} onClick={() => onArtifactTypeChange(undefined)} />
          {(Object.keys(ARTIFACT_TYPE_CONFIG) as ArtifactType[]).map((t) => (
            <FilterChip
              key={t}
              label={ARTIFACT_TYPE_CONFIG[t].label}
              active={artifactType === t}
              onClick={() => onArtifactTypeChange(artifactType === t ? undefined : t)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  dotColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? "border-teal-300/40 bg-teal-400/14 text-teal-100"
          : "border-slate-500/30 bg-slate-800/55 text-slate-300 hover:border-slate-300/40 hover:text-slate-100"
      )}
    >
      {dotColor && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}
      {label}
    </button>
  );
}
