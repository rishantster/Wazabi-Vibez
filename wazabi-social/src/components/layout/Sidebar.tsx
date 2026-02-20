"use client";

import Link from "next/link";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG } from "@/lib/constants";
import type { Chain, ArtifactType } from "@/types";

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 space-y-6">
      {/* Quick links */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Browse
        </h4>
        <nav className="space-y-0.5">
          <SidebarLink href="/?sort=trending" label="Trending" />
          <SidebarLink href="/?sort=new" label="New Launches" />
          <SidebarLink href="/?sort=top" label="Top All Time" />
        </nav>
      </div>

      {/* Chains */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Chains
        </h4>
        <nav className="space-y-0.5">
          {(Object.entries(CHAIN_CONFIG) as [Chain, typeof CHAIN_CONFIG[Chain]][]).map(
            ([chain, config]) => (
              <SidebarLink
                key={chain}
                href={`/feed/${chain}`}
                label={config.label}
                dot={config.color}
              />
            )
          )}
        </nav>
      </div>

      {/* Types */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Categories
        </h4>
        <nav className="space-y-0.5">
          {(Object.entries(ARTIFACT_TYPE_CONFIG) as [ArtifactType, typeof ARTIFACT_TYPE_CONFIG[ArtifactType]][]).map(
            ([type, config]) => (
              <SidebarLink
                key={type}
                href={`/feed/${type}`}
                label={config.label}
              />
            )
          )}
        </nav>
      </div>

      {/* About */}
      <div className="rounded-xl border border-zinc-800 bg-surface-1 p-4">
        <h4 className="text-sm font-semibold text-white">About Wazabi</h4>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
          A social layer for token launches. Every launch is a post, every
          creator has a reputation, and conviction votes show real commitment.
        </p>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  dot,
}: {
  href: string;
  label: string;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-surface-2 hover:text-white transition-colors"
    >
      {dot && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {label}
    </Link>
  );
}
