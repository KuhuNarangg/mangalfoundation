"use client";

import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function MemberHeader({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/public/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle could go here */}
        <h2 className="text-lg font-semibold md:hidden">Member Portal</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hidden md:flex text-sm font-medium">
          Log out
        </Button>
        <Link href="/member/profile">
          <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gray-100 hover:ring-2 hover:ring-primary/20 transition-all p-0 overflow-hidden">
            {user.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePicture}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-600 md:hidden h-10 w-10 rounded-full bg-red-50 hover:bg-red-100 hover:text-red-700">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
