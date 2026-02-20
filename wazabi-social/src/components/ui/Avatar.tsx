"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-lg",
};

const pixelMap = { sm: 24, md: 32, lg: 40, xl: 64 };

export function Avatar({ src, alt = "User", size = "md", className }: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={pixelMap[size]}
        height={pixelMap[size]}
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-wazabi-500/20 font-medium text-wazabi-400",
        sizeMap[size],
        className
      )}
    >
      {initials || "?"}
    </div>
  );
}
