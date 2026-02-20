"use client";

import { useSession } from "next-auth/react";
import type { AuthUser } from "@/types";

export function useAuth() {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id,
        walletAddress: (session.user as any).walletAddress ?? null,
        walletChain: (session.user as any).walletChain ?? null,
        displayName: (session.user as any).displayName ?? session.user.name ?? null,
        avatarUrl: (session.user as any).avatarUrl ?? session.user.image ?? null,
        githubUsername: (session.user as any).githubUsername ?? null,
        twitterHandle: (session.user as any).twitterHandle ?? null,
      }
    : null;

  return {
    user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
  };
}
