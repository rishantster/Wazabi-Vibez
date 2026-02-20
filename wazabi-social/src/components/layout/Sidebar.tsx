"use client";

import Link from "next/link";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG } from "@/lib/constants";
import type { Chain, ArtifactType } from "@/types";

export function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4 soft-rise">
        <Section title="Browse">
          <SidebarLink href="/?sort=trending" label="Trending" />
          <SidebarLink href="/?sort=new" label="New Launches" />
          <SidebarLink href="/?sort=top" label="Top All Time" />
        </Section>

        <Section title="Chains">
          {(Object.entries(CHAIN_CONFIG) as [Chain, typeof CHAIN_CONFIG[Chain]][]).map(([chain, config]) => (
            <SidebarLink key={chain} href={`/feed/${chain}`} label={config.label} dot={config.color} />
          ))}
        </Section>

        <Section title="Categories">
          {(Object.entries(ARTIFACT_TYPE_CONFIG) as [ArtifactType, typeof ARTIFACT_TYPE_CONFIG[ArtifactType]][]).map(
            ([type, config]) => <SidebarLink key={type} href={`/feed/${type}`} label={config.label} />
          )}
        </Section>

        <div className="glass-panel rounded-2xl p-4">
          <h4 className="font-display text-sm font-semibold text-slate-100">What You Are Seeing</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Wazabi ranks launches by realtime social commitment and creator track record to surface signal over noise.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-3">
      <h4 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</h4>
      <nav className="space-y-1">{children}</nav>
    </div>
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
      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-300 transition-all hover:bg-slate-700/35 hover:text-white"
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}
      {label}
    </Link>
  );
}
