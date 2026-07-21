"use client";

import Image from "next/image";
import {
  Home,
  LayoutGrid,
  Package,
  ReceiptIndianRupee,
  HandCoins,
  Images,
  Mail,
  ScrollText,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Donations", url: "/admin/donations", icon: ReceiptIndianRupee },
  { title: "Manual Donations", url: "/admin/manual-donations", icon: HandCoins },
  { title: "Categories", url: "/admin/categories", icon: LayoutGrid },
  { title: "Packages", url: "/admin/packages", icon: Package },
  { title: "Gallery", url: "/admin/gallery", icon: Images },
  { title: "Messages", url: "/admin/messages", icon: Mail },
  { title: "Audit Logs", url: "/admin/logs", icon: ScrollText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/admin/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="Mangal Guruji Foundation"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-contain bg-white"
          />
          <div className="leading-tight">
            <div className="font-bold text-sm">Mangal Guruji</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Admin
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    onClick={() => router.push(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => window.open("/", "_blank")}>
              <ExternalLink />
              <span>View Site</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
