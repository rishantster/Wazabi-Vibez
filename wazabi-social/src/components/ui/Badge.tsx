"use client";

import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "chain";

const variantStyles: Record<Variant, string> = {
  default: "border-slate-500/30 bg-slate-700/35 text-slate-200",
  success: "border-teal-300/30 bg-teal-400/12 text-teal-200",
  warning: "border-amber-300/30 bg-amber-400/12 text-amber-200",
  danger: "border-rose-300/30 bg-rose-400/12 text-rose-200",
  info: "border-sky-300/30 bg-sky-400/12 text-sky-200",
  chain: "border-slate-400/30 bg-slate-700/28 text-slate-100",
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
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")} />}
      {children}
    </span>
  );
}
