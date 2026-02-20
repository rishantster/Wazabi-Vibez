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
    <div className="space-y-3">
      {/* Sort tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-1 p-1">
        {sorts.map((s) => (
          <button
            key={s.value}
            onClick={() => onSortChange(s.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              sort === s.value
                ? "bg-surface-2 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chain filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          label="All Chains"
          active={!chain}
          onClick={() => onChainChange(undefined)}
        />
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

      {/* Artifact type filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          label="All Types"
          active={!artifactType}
          onClick={() => onArtifactTypeChange(undefined)}
        />
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-wazabi-500/50 bg-wazabi-500/10 text-wazabi-400"
          : "border-zinc-800 bg-surface-1 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
      )}
    >
      {dotColor && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {label}
    </button>
  );
}
