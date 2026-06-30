import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "lg";
  className?: string;
};

const SIZES = {
  sm: { width: 40, height: 40, className: "h-10 w-10" },
  lg: { width: 128, height: 128, className: "h-28 w-auto" },
} as const;

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  const dim = SIZES[size];

  return (
    <Image
      src="/logo-tree.svg"
      alt="PPP infinity tree logo"
      width={dim.width}
      height={dim.height}
      priority={size === "sm"}
      className={cn(dim.className, "shrink-0 object-contain", className)}
    />
  );
}
