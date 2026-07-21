"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

const EMPTY_ADMIN = { username: "", password: "", name: "", email: "", role: "admin" };

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [newAdmin, setNewAdmin] = useState({ ...EMPTY_ADMIN });
  const [busy, setBusy] = useState(false);

  const loadAdmins = async () => {
    const res = await fetch("/api/admin/admins");
    const json = await res.json();
    if (json.success) setAdmins(json.data);
  };

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => {
        setMe(j.data);
        if (j.data?.role === "super_admin") loadAdmins();
      });
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

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Admin created");
        setNewAdmin({ ...EMPTY_ADMIN });
        loadAdmins();
      } else {
        toast.error(json.error || "Failed to create admin");
      }
    } finally {
      setBusy(false);
    }
  };

  const updateRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success("Role updated");
      loadAdmins();
    } else {
      toast.error((await res.json()).error || "Failed");
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Admin deleted");
      loadAdmins();
    } else {
      toast.error((await res.json()).error || "Failed");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Signed in as <span className="font-medium text-foreground">{me?.username}</span>{" "}
            {me?.role && <span className="text-xs uppercase tracking-wide">({me.role})</span>}
          </p>
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
            <Button type="submit" disabled={busy}>Change Password</Button>
          </form>
        </CardContent>
      </Card>

      {me?.role === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={createAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Username" required value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} />
              <Input placeholder="Password (min 8)" type="password" required minLength={8} value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
              <Input placeholder="Name (optional)" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
              <Input placeholder="Email (optional)" type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
              <Select value={newAdmin.role} onValueChange={(v) => setNewAdmin({ ...newAdmin, role: v || "admin" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={busy}>Add Admin</Button>
            </form>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium">
                        {a.username}
                        {a._id === me?.id && <span className="text-xs text-muted-foreground"> (you)</span>}
                      </TableCell>
                      <TableCell>
                        <Select value={a.role} onValueChange={(v) => updateRole(a._id, v)} disabled={a._id === me?.id}>
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {a._id !== me?.id && (
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteAdmin(a._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
