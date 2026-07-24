"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MemberDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Member Portal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Member Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This area is currently under construction. Soon, you will be able to download your ID card, view your appointment letter, and update your profile information.
          </p>
          <Button variant="outline" onClick={handleLogout}>Log Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
