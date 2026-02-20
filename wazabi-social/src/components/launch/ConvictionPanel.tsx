"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { useConvictions, usePostConviction } from "@/hooks/useLaunch";
import { useAuth } from "@/hooks/useAuth";
import { formatUsd, timeAgo, truncateAddress } from "@/lib/utils";
import { CONVICTION_LOCK_OPTIONS, CHAIN_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Chain } from "@/types";

interface ConvictionPanelProps {
  tokenAddress: string;
  chain: Chain;
  tokenSymbol: string;
}

export function ConvictionPanel({ tokenAddress, chain, tokenSymbol }: ConvictionPanelProps) {
  const { isAuthenticated } = useAuth();
  const { data: convictions, isLoading } = useConvictions(tokenAddress);
  const postConviction = usePostConviction(tokenAddress);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [lockDays, setLockDays] = useState<number>(30);

  const chainConfig = CHAIN_CONFIG[chain];

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    // In a real implementation, this would:
    // 1. Prompt the wallet to sign a structured message
    // 2. Send the signature to the API
    // For now, we show the flow structure
    const amountUsd = parseFloat(amount) * 100; // placeholder conversion
    const message = `I back ${tokenAddress} with ${amount} ${chainConfig.nativeSymbol} conviction for ${lockDays} days`;

    postConviction.mutate({
      chain,
      amountDeclared: amount,
      amountUsd,
      lockDurationDays: lockDays,
      message,
      signature: "0x...", // Would come from wallet signing
      signerAddress: "0x...", // Would come from connected wallet
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Conviction Votes</h3>
        {isAuthenticated && (
          <Button
            size="sm"
            variant={showForm ? "secondary" : "primary"}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Back This Launch"}
          </Button>
        )}
      </div>

      {/* Conviction form */}
      {showForm && (
        <Card className="space-y-4 border-wazabi-500/20">
          <p className="text-sm text-zinc-400">
            Signal your conviction by declaring how much you&apos;d back this
            launch. Sign a message to prove your commitment — no gas required.
          </p>

          <div>
            <label className="text-xs font-medium text-zinc-400">
              Amount ({chainConfig.nativeSymbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-wazabi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Lock Duration</label>
            <div className="mt-1 flex gap-2">
              {CONVICTION_LOCK_OPTIONS.map((days) => (
                <button
                  key={days}
                  onClick={() => setLockDays(days)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    lockDays === days
                      ? "border-wazabi-500 bg-wazabi-500/10 text-wazabi-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            loading={postConviction.isPending}
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Sign Conviction
          </Button>
        </Card>
      )}

      {/* Conviction list */}
      {isLoading && (
        <div className="text-sm text-zinc-400">Loading convictions...</div>
      )}

      {convictions?.data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-surface-1 p-6 text-center">
          <p className="text-sm text-zinc-500">No conviction votes yet. Be the first to back this launch.</p>
        </div>
      )}

      <div className="space-y-2">
        {convictions?.data.map((vote) => (
          <div
            key={vote.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-surface-1 px-4 py-3"
          >
            <Avatar
              src={vote.avatarUrl}
              alt={vote.displayName || "User"}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-zinc-200">
                {vote.displayName || truncateAddress(vote.userId)}
              </span>
              <span className="ml-2 text-xs text-zinc-500">{timeAgo(vote.createdAt)}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-wazabi-400">
                {vote.amountDeclared} {chainConfig.nativeSymbol}
              </div>
              <div className="text-[10px] text-zinc-500">
                locked {vote.lockDurationDays}d
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
