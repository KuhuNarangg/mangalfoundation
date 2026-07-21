"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Always-available floating donate action. Appears after a little scrolling,
 * and hides itself on the admin area and the dedicated donate page.
 */
export function FloatingDonate() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/donate") return null;

  return (
    <Link
      href="/donate"
      aria-label="Donate now"
      className={cn(
        "fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full",
        "bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3.5 font-bold text-white shadow-2xl",
        "animate-donate-glow transition-all duration-300 hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/40",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Heart className="w-5 h-5" fill="currentColor" />
      <span className="hidden sm:inline">Donate</span>
    </Link>
  );
}
