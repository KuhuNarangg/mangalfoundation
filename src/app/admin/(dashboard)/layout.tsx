import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full min-h-screen bg-muted/30 flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
          <SidebarTrigger />
          <div className="font-semibold text-lg">Admin Panel</div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
