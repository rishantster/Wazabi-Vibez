"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatorProfile } from "@/types";

export function useCreator(address: string) {
  return useQuery({
    queryKey: ["creator", address],
    queryFn: async (): Promise<CreatorProfile> => {
      const res = await fetch(`/api/creator/${address}`);
      if (!res.ok) throw new Error("Creator not found");
      return res.json();
    },
    enabled: !!address,
  });
}

export function useCreatorLaunches(address: string, page = 1) {
  return useQuery({
    queryKey: ["creator-launches", address, page],
    queryFn: async () => {
      const res = await fetch(`/api/creator/${address}/launches?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch launches");
      return res.json();
    },
    enabled: !!address,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address, follow }: { address: string; follow: boolean }) => {
      const res = await fetch(`/api/follow/${address}`, {
        method: follow ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to update follow");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["creator", variables.address] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
