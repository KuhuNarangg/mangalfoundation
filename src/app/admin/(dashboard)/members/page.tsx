"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Plus, Users } from "lucide-react";
import { IDCardGenerator } from "@/components/admin/IDCardGenerator";
import { AppointmentLetterGenerator } from "@/components/admin/AppointmentLetterGenerator";
import { formatDate } from "@/lib/format";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "Volunteer",
    bloodGroup: "O+",
    password: ""
  });

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch (e) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Member created successfully!");
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", phone: "", designation: "Volunteer", bloodGroup: "O+", password: "" });
        loadMembers();
      } else {
        toast.error(json.error || "Failed to create member");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        loadMembers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this member?")) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Member deleted");
        loadMembers();
      } else {
        toast.error("Failed to delete member");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Add volunteers and staff, and generate their official PDFs.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={v => setFormData({...formData, bloodGroup: v ?? ""})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Login Password *</Label>
                <Input id="password" type="text" required placeholder="Will be used for member login" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <Button type="submit" className="w-full mt-4">Create Member</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Info</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">PDFs</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading members...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-3 opacity-20" />
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{member.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{member.memberId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{member.designation}</div>
                    <div className="text-xs text-red-600 font-bold">{member.bloodGroup}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{member.phone}</div>
                    <div className="text-xs text-muted-foreground">{member.email || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <Select value={member.status} onValueChange={(v) => updateStatus(member._id, v)}>
                      <SelectTrigger className={`w-[110px] h-8 text-xs font-medium ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(member.joiningDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <IDCardGenerator member={member} />
                      <AppointmentLetterGenerator member={member} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteMember(member._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
