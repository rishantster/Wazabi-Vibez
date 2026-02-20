"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-surface-1 p-5",
        hover && "cursor-pointer transition-colors hover:border-zinc-700 hover:bg-surface-2",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
