"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatDateTime } from "@/lib/format";
import { downloadCSV } from "@/lib/export";
import { Eye, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  VOLUNTEER_STATUSES,
  VOLUNTEER_AREAS,
  AVAILABILITY_OPTIONS,
} from "@/lib/volunteer-constants";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "In Review": "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  Contacted: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  Accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[status] || ""}`}>
      {status}
    </span>
  );
}

export default function VolunteersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, areaFilter, availFilter, sort, search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25", sort });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (areaFilter !== "all") params.set("area", areaFilter);
      if (availFilter !== "all") params.set("availability", availFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/volunteers?${params}`);
      const j = await res.json();
      if (j.success) {
        setItems(j.data);
        setStats(j.stats);
        setPagination(j.pagination);
        setSelected(new Set());
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, areaFilter, availFilter, sort, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openView = (v: any) => {
    setViewing(v);
    setNotes(v.adminNotes || "");
  };

  const updateStatus = async (id: string, status: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("Status updated");
        setViewing((v: any) => (v ? { ...v, status } : v));
        load();
      } else toast.error("Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const saveNotes = async () => {
    if (!viewing) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${viewing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });
      if (res.ok) {
        toast.success("Notes saved");
        load();
      } else toast.error("Failed to save notes");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this application permanently?")) return;
    const res = await fetch(`/api/admin/volunteers/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      setViewing(null);
      load();
    } else toast.error("Delete failed");
  };

  const bulk = async (action: string) => {
    if (!selected.size) return toast.error("Select applications first");
    const label = action === "delete" ? "delete" : `mark as ${action.replace("_", " ")}`;
    if (!confirm(`Are you sure you want to ${label} ${selected.size} application(s)?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/volunteers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      const j = await res.json();
      if (res.ok) {
        toast.success(`${j.modified} application(s) updated`);
        load();
      } else toast.error(j.error || "Bulk action failed");
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    if (!items.length) return toast.error("Nothing to export");
    downloadCSV(
      "volunteers.csv",
      items.map((v) => ({
        Name: v.fullName,
        Email: v.email,
        Phone: v.phone,
        City: v.city,
        Age: v.age ?? "",
        Occupation: v.occupation,
        Organization: v.organization,
        Areas: (v.interestedAreas || []).join("; "),
        Availability: v.availability,
        Status: v.status,
        Applied: formatDate(v.createdAt),
      }))
    );
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allChecked = items.length > 0 && items.every((v) => selected.has(v._id));

  const statCards = [
    { label: "Total", value: stats.total || 0 },
    { label: "Pending", value: stats.Pending || 0 },
    { label: "In Review", value: stats["In Review"] || 0 },
    { label: "Contacted", value: stats.Contacted || 0 },
    { label: "Accepted", value: stats.Accepted || 0 },
    { label: "Rejected", value: stats.Rejected || 0 },
    { label: "This Month", value: stats.thisMonth || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Volunteer Applications</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search name, email, phone, city..." className="max-w-xs" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {VOLUNTEER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v || "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Area" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {VOLUNTEER_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={availFilter} onValueChange={(v) => setAvailFilter(v || "all")}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            {AVAILABILITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v || "newest")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue>
              {(v: any) => {
                const m: Record<string, string> = { newest: "Newest First", oldest: "Oldest First", name: "Name (A-Z)", status: "Status" };
                return m[v] || v;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-muted/60 border rounded-md p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk("accept")}>Accept</Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk("in_review")}>In Review</Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk("contacted")}>Contacted</Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk("reject")}>Reject</Button>
          <Button variant="destructive" size="sm" disabled={busy} onClick={() => bulk("delete")}>Delete</Button>
        </div>
      )}

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(c) =>
                    setSelected(c === true ? new Set(items.map((v) => v._id)) : new Set())
                  }
                />
              </TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Areas</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No volunteer applications yet.</TableCell></TableRow>
            ) : (
              items.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>
                    <Checkbox checked={selected.has(v._id)} onCheckedChange={() => toggle(v._id)} />
                  </TableCell>
                  <TableCell className="font-medium">{v.fullName}</TableCell>
                  <TableCell className="text-xs">
                    <div>{v.email}</div>
                    <div className="text-muted-foreground">{v.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm">{v.city || "—"}</TableCell>
                  <TableCell className="text-xs max-w-[160px]">
                    {(v.interestedAreas || []).slice(0, 2).join(", ")}
                    {(v.interestedAreas || []).length > 2 && ` +${v.interestedAreas.length - 2}`}
                  </TableCell>
                  <TableCell className="text-sm">{v.availability || "—"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(v.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openView(v)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => remove(v._id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewing?.fullName}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-3">
                <StatusBadge status={viewing.status} />
                <Select value={viewing.status} onValueChange={(v) => v && updateStatus(viewing._id, v)}>
                  <SelectTrigger className="w-[160px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VOLUNTEER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Group title="Contact Information">
                <Item label="Email" value={viewing.email} />
                <Item label="Phone" value={viewing.phone} />
                <Item label="City" value={viewing.city || "—"} />
              </Group>

              <Group title="Personal Information">
                <Item label="Age" value={viewing.age ? String(viewing.age) : "—"} />
                <Item label="Occupation" value={viewing.occupation || "—"} />
                <Item label="Organization" value={viewing.organization || "—"} />
                <Item label="Availability" value={viewing.availability || "—"} />
              </Group>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Areas of Interest</div>
                <div className="flex flex-wrap gap-1.5">
                  {(viewing.interestedAreas || []).length ? (
                    viewing.interestedAreas.map((a: string) => (
                      <span key={a} className="text-xs bg-muted px-2 py-1 rounded">{a}</span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              {viewing.motivation && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Motivation</div>
                  <p className="bg-muted/50 rounded p-3 whitespace-pre-wrap">{viewing.motivation}</p>
                </div>
              )}
              {viewing.previousExperience && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Previous Experience</div>
                  <p className="bg-muted/50 rounded p-3 whitespace-pre-wrap">{viewing.previousExperience}</p>
                </div>
              )}

              <Item label="Applied" value={formatDateTime(viewing.createdAt)} />

              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Internal Admin Notes (private)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes visible only to admins…" />
                <div className="flex justify-between">
                  <Button variant="destructive" size="sm" onClick={() => remove(viewing._id)}>Delete</Button>
                  <Button size="sm" disabled={busy} onClick={saveNotes}>Save Notes</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
