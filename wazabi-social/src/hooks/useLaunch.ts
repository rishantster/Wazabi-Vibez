"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FeedLaunch, CommentData, ConvictionVoteData } from "@/types";

export function useLaunch(tokenAddress: string) {
  return useQuery({
    queryKey: ["launch", tokenAddress],
    queryFn: async (): Promise<FeedLaunch> => {
      const res = await fetch(`/api/launch/${tokenAddress}`);
      if (!res.ok) throw new Error("Failed to fetch launch");
      return res.json();
    },
    enabled: !!tokenAddress,
  });
}

export function useComments(tokenAddress: string, page = 1) {
  return useQuery({
    queryKey: ["comments", tokenAddress, page],
    queryFn: async () => {
      const res = await fetch(`/api/launch/${tokenAddress}/comments?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json() as Promise<{ data: CommentData[]; total: number; hasMore: boolean }>;
    },
    enabled: !!tokenAddress,
  });
}

export function usePostComment(tokenAddress: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, parentCommentId }: { text: string; parentCommentId?: string }) => {
      const res = await fetch(`/api/launch/${tokenAddress}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentCommentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }
      return res.json() as Promise<CommentData>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", tokenAddress] });
      queryClient.invalidateQueries({ queryKey: ["launch", tokenAddress] });
    },
  });
}

export function useConvictions(tokenAddress: string) {
  return useQuery({
    queryKey: ["convictions", tokenAddress],
    queryFn: async () => {
      const res = await fetch(`/api/launch/${tokenAddress}/convictions`);
      if (!res.ok) throw new Error("Failed to fetch convictions");
      return res.json() as Promise<{ data: ConvictionVoteData[] }>;
    },
    enabled: !!tokenAddress,
  });
}

export function usePostConviction(tokenAddress: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      chain: string;
      amountDeclared: string;
      amountUsd: number;
      lockDurationDays: number;
      message: string;
      signature: string;
      signerAddress: string;
    }) => {
      const res = await fetch(`/api/launch/${tokenAddress}/convictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post conviction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convictions", tokenAddress] });
      queryClient.invalidateQueries({ queryKey: ["launch", tokenAddress] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
