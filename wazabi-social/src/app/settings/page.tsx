"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ReputationBadge } from "@/components/creator/ReputationBadge";
import { truncateAddress } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: { displayName: string; bio: string }) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="animate-pulse h-64 rounded-xl bg-surface-1" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <Card>
          <p className="text-center text-zinc-400 py-8">
            Connect your wallet or sign in to access settings.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile section */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={profile?.avatarUrl}
            alt={profile?.displayName || "User"}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                {profile?.displayName || "Anonymous"}
              </span>
              {profile?.reputationScore !== undefined && (
                <ReputationBadge score={profile.reputationScore} size="sm" showLabel />
              )}
            </div>
            {user?.walletAddress && (
              <span className="text-sm font-mono text-zinc-400">
                {truncateAddress(user.walletAddress, 6)}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Your display name"
              className="w-full rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-wazabi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-wazabi-500 focus:outline-none resize-none"
            />
            <span className="text-xs text-zinc-500">{bio.length}/500</span>
          </div>

          <Button
            loading={updateProfile.isPending}
            onClick={() => updateProfile.mutate({ displayName, bio })}
          >
            Save Changes
          </Button>

          {updateProfile.isSuccess && (
            <p className="text-sm text-emerald-400">Profile updated.</p>
          )}
        </div>
      </Card>

      {/* Connected accounts */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Connected Accounts</h2>

        <div className="space-y-3">
          <AccountRow
            label="Wallet"
            value={user?.walletAddress ? truncateAddress(user.walletAddress, 6) : null}
            connected={!!user?.walletAddress}
          />
          <AccountRow
            label="GitHub"
            value={user?.githubUsername ? `@${user.githubUsername}` : null}
            connected={!!user?.githubUsername}
          />
          <AccountRow
            label="Twitter/X"
            value={user?.twitterHandle ? `@${user.twitterHandle}` : null}
            connected={!!user?.twitterHandle}
          />
        </div>
      </Card>

      {/* Stats */}
      {profile && (
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{profile.followerCount}</div>
              <div className="text-xs text-zinc-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{profile.followingCount}</div>
              <div className="text-xs text-zinc-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{profile.reputationScore}</div>
              <div className="text-xs text-zinc-500">Reputation</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function AccountRow({
  label,
  value,
  connected,
}: {
  label: string;
  value: string | null;
  connected: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-surface-0 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        {value && <div className="text-xs text-zinc-400 font-mono">{value}</div>}
      </div>
      <Badge variant={connected ? "success" : "default"}>
        {connected ? "Connected" : "Not connected"}
      </Badge>
    </div>
  );
}
