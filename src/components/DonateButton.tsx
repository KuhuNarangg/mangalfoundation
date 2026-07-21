import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type DonateButtonProps = {
  children?: React.ReactNode;
  href?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
};

const sizeClasses: Record<NonNullable<DonateButtonProps["size"]>, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-8 py-3.5 text-base",
  lg: "px-10 py-5 text-lg",
};

/**
 * The site-wide donation call to action: a high-contrast, gently glowing,
 * gradient pill. Used for every prominent "Donate" button.
 */
export function DonateButton({
  children = "Donate Now",
  href = "/donate",
  size = "md",
  showIcon = true,
  className,
}: DonateButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide text-white",
        "bg-gradient-to-r from-rose-500 to-orange-500",
        "animate-donate-glow transition-transform duration-300 hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/40",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Heart
          className="w-5 h-5 transition-transform group-hover:scale-110"
          fill="currentColor"
        />
      )}
      {children}
    </Link>
  );
}
