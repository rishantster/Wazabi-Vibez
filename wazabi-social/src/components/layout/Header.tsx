"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/lib/utils";
import { signIn, signOut } from "next-auth/react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-500/20 bg-slate-950/65 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200/30 bg-gradient-to-br from-teal-300 to-cyan-400 text-sm font-bold text-slate-950 shadow-[0_10px_24px_rgba(45,212,191,0.28)]">
            W
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-100">Wazabi Vibez</p>
            <p className="-mt-0.5 hidden text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:block">
              Agentic Social Layer
            </p>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 rounded-xl border border-slate-500/20 bg-slate-900/45 p-1 sm:flex">
          <NavLink href="/">Feed</NavLink>
          <NavLink href="/feed/top">Top</NavLink>
        </nav>

        <div className="flex-1" />

        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-700/40" />
        ) : isAuthenticated && user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={user.walletAddress ? `/creator/${user.walletAddress}` : "/settings"}
              className="group rounded-xl border border-slate-500/20 bg-slate-900/45 px-2 py-1.5 transition-colors hover:border-teal-300/35"
            >
              <div className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} alt={user.displayName || "User"} size="sm" />
                <span className="hidden text-sm text-slate-200 sm:block">
                  {user.displayName || (user.walletAddress ? truncateAddress(user.walletAddress) : "Profile")}
                </span>
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="hidden sm:inline-flex" onClick={() => signIn("github")}>
              GitHub
            </Button>
            <Button size="sm" onClick={() => signIn("wallet-evm")}>
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/35 hover:text-white"
    >
      {children}
    </Link>
  );
}
