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
        "glass-panel rounded-2xl p-5",
        hover &&
          "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300/25 hover:shadow-[0_24px_48px_rgba(9,14,34,0.5)]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
