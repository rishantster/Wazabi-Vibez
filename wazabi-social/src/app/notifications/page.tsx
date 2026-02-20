"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { NotificationData } from "@/types";

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{
        data: NotificationData[];
        unreadCount: number;
        total: number;
      }>;
    },
    enabled: isAuthenticated,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">Notifications</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-1" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">Notifications</h1>
        <Card>
          <p className="text-center text-zinc-400">
            Connect your wallet to see notifications.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">
          Notifications
          {data?.unreadCount ? (
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wazabi-500 px-1.5 text-xs font-bold text-white">
              {data.unreadCount}
            </span>
          ) : null}
        </h1>
        {data?.unreadCount ? (
          <Button
            variant="ghost"
            size="sm"
            loading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {data?.data.length === 0 && (
        <Card>
          <p className="text-center text-zinc-400 py-4">
            No notifications yet. Follow creators to get notified when they launch.
          </p>
        </Card>
      )}

      <div className="space-y-2">
        {data?.data.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: NotificationData }) {
  const { type, payload, read, createdAt } = notification;

  let message = "";
  let href = "/";

  switch (type) {
    case "new_launch":
      message = `New launch from a creator you follow: ${(payload as any).tokenName || "Unknown"}`;
      href = `/launch/${(payload as any).tokenAddress || ""}`;
      break;
    case "comment_reply":
      message = `Someone replied to your comment`;
      href = `/launch/${(payload as any).tokenAddress || ""}`;
      break;
    case "new_follower":
      message = `You have a new follower`;
      href = `/creator/${(payload as any).followerAddress || ""}`;
      break;
    case "conviction_received":
      message = `Someone backed your launch with conviction`;
      href = `/launch/${(payload as any).tokenAddress || ""}`;
      break;
    case "reputation_milestone":
      message = `Your reputation score reached ${(payload as any).score || 0}`;
      href = "/settings";
      break;
  }

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-surface-2 ${
          read
            ? "border-zinc-800 bg-surface-1"
            : "border-wazabi-500/20 bg-wazabi-500/5"
        }`}
      >
        {!read && <span className="h-2 w-2 rounded-full bg-wazabi-500 flex-shrink-0" />}
        <p className={`text-sm flex-1 ${read ? "text-zinc-400" : "text-zinc-200"}`}>
          {message}
        </p>
        <span className="text-xs text-zinc-500 flex-shrink-0">{timeAgo(createdAt)}</span>
      </div>
    </Link>
  );
}
