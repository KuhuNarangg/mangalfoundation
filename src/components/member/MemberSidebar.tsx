"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Clock,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  FileText
} from "lucide-react";

export function MemberSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/member", icon: LayoutDashboard },
    { name: "Profile", href: "/member/profile", icon: User },
    { name: "Attendance", href: "/member/attendance", icon: Clock },
    { name: "Tasks", href: "/member/tasks", icon: CheckSquare },
    { name: "Events", href: "/member/events", icon: Calendar },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r min-h-screen">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-heading text-primary">Mangal Guruji</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
