import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "lg";
  className?: string;
};

const SIZES = {
  sm: { width: 28, height: 28, className: "h-7 w-7" },
  lg: { width: 80, height: 81, className: "h-20 w-auto" },
} as const;

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  const dim = SIZES[size];

  return (
    <Image
      src="/logo-mark.png"
      alt="PPP infinity tree logo"
      width={dim.width}
      height={dim.height}
      priority={size === "sm"}
      className={cn(dim.className, "shrink-0 object-contain", className)}
    />
  );
}
