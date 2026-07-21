"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format";
import { User, Shield, Mail, Clock, MapPin } from "lucide-react";

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground w-40">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => setMe(j.data))
      .catch(() => {});
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Password updated");
        setPw({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(json.error || "Failed to update password");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Row icon={User} label="Username" value={me?.username || "—"} />
          <Row icon={Shield} label="Role" value={me?.role || "—"} />
          {me?.name && <Row icon={User} label="Name" value={me.name} />}
          {me?.email && <Row icon={Mail} label="Email" value={me.email} />}
          <Row
            icon={Clock}
            label="Last login"
            value={me?.lastLoginAt ? formatDateTime(me.lastLoginAt) : "—"}
          />
          <Row
            icon={MapPin}
            label="Last login location"
            value={me?.lastLoginLocation || me?.lastLoginIp || "—"}
          />
          <Row
            icon={Clock}
            label="Member since"
            value={me?.createdAt ? formatDateTime(me.createdAt) : "—"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                required
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                required
                minLength={8}
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
