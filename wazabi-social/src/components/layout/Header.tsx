"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ReputationBadge } from "@/components/creator/ReputationBadge";
import { truncateAddress } from "@/lib/utils";
import { signIn, signOut } from "next-auth/react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-surface-0/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wazabi-500 text-sm font-bold text-white">
            W
          </div>
          <span className="text-lg font-bold text-white">Wazabi</span>
        </Link>

        {/* Nav */}
        <nav className="ml-6 hidden items-center gap-1 sm:flex">
          <NavLink href="/">Feed</NavLink>
          <NavLink href="/feed/top">Top</NavLink>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth */}
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-2" />
        ) : isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative text-zinc-400 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            <Link href={user.walletAddress ? `/creator/${user.walletAddress}` : "/settings"}>
              <div className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} alt={user.displayName || "User"} size="sm" />
                <span className="hidden text-sm text-zinc-300 sm:block">
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
            <Button size="sm" variant="secondary" onClick={() => signIn("github")}>
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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 hover:bg-surface-2 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
