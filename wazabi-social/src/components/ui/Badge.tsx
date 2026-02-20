"use client";

import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "chain";

const variantStyles: Record<Variant, string> = {
  default: "bg-surface-2 text-zinc-300",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  chain: "bg-surface-2 text-zinc-300 border-zinc-600",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

export function Badge({ children, variant = "default", className, dot, dotColor }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")}
        />
      )}
      {children}
    </span>
  );
}
